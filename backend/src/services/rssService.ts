import Parser from 'rss-parser';
import sanitizeHtml from 'sanitize-html';
import { prisma } from '../config/prisma.js';
import { NewsStatus, SourceStatus, LogLevel } from '@prisma/client';
import { generateSlug } from '../utils/slugify.js';

interface CustomItem {
  title?: string;
  link?: string;
  pubDate?: string;
  isoDate?: string;
  guid?: string;
  id?: string;
  content?: string;
  contentSnippet?: string;
  summary?: string;
  description?: string;
  enclosure?: {
    url?: string;
    type?: string;
  };
  'media:content'?: {
    $?: {
      url?: string;
    };
  };
  'media:thumbnail'?: {
    $?: {
      url?: string;
    };
  };
  author?: string;
  creator?: string;
}

const parser = new Parser<Record<string, unknown>, CustomItem>({
  customFields: {
    item: [
      ['media:content', 'media:content'],
      ['media:thumbnail', 'media:thumbnail'],
      ['content:encoded', 'contentEncoded'],
      ['dc:creator', 'creator'],
    ],
  },
  timeout: 15000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) BNNewsBot/1.0 (+https://bnnews.in)',
    Accept: 'application/rss+xml, application/xml, text/xml, */*',
  },
});

/**
 * Normalizes URL for duplicate checking
 */
export function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url.trim());
    // Strip common tracking query params
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'ref'];
    trackingParams.forEach((p) => parsed.searchParams.delete(p));
    // Remove trailing slash
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return url.trim().replace(/\/$/, '');
  }
}

/**
 * Extract featured image from RSS item
 */
function extractImageUrl(item: any): string | null {
  // 1. Check enclosure
  if (item.enclosure?.url && (item.enclosure.type?.includes('image') || /\.(jpg|jpeg|png|webp|gif)/i.test(item.enclosure.url))) {
    return item.enclosure.url;
  }

  // 2. Check media:content
  if (item['media:content']?.$?.url) {
    return item['media:content'].$.url;
  }

  // 3. Check media:thumbnail
  if (item['media:thumbnail']?.$?.url) {
    return item['media:thumbnail'].$.url;
  }

  // 4. Extract from HTML content or description
  const htmlToSearch = item.contentEncoded || item.content || item.description || '';
  const match = htmlToSearch.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (match && match[1]) {
    return match[1];
  }

  return null;
}

/**
 * Clean & sanitize HTML content from RSS description
 */
function cleanContent(rawHtml?: string): string {
  if (!rawHtml) return '';
  return sanitizeHtml(rawHtml, {
    allowedTags: ['p', 'b', 'i', 'strong', 'em', 'span', 'ul', 'ol', 'li', 'br', 'blockquote'],
    allowedAttributes: {},
  });
}

/**
 * Fetch and process a single RSS source
 */
export async function fetchRssSource(sourceId: string): Promise<{
  success: boolean;
  fetched: number;
  saved: number;
  message: string;
}> {
  const source = await prisma.rssSource.findUnique({
    where: { id: sourceId },
    include: { defaultCategory: true },
  });

  if (!source) {
    throw new Error(`RSS Source with ID ${sourceId} not found`);
  }

  const startTime = new Date();
  let fetchedCount = 0;
  let savedCount = 0;

  try {
    // 1. Parse feed
    const feed = await parser.parseURL(source.feedUrl);
    const items = feed.items || [];
    fetchedCount = items.length;

    // Get fallback category (default category or first active category)
    let categoryId = source.defaultCategoryId;
    if (!categoryId) {
      const firstCat = await prisma.category.findFirst({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      });
      if (firstCat) {
        categoryId = firstCat.id;
      }
    }

    if (!categoryId) {
      throw new Error('કોઈ કેટેગરી ઉપલબ્ધ નથી. કૃપા કરીને પહેલા કેટેગરી ઉમેરો.');
    }

    // 2. Process each item safely
    for (const item of items) {
      if (!item.title || (!item.link && !item.guid)) {
        continue;
      }

      const rawUrl = item.link || item.guid || '';
      const canonicalUrl = normalizeUrl(rawUrl);
      const guid = item.guid || canonicalUrl;

      // Duplicate Check 1: In Raw Source Items
      const existingItem = await prisma.newsSourceItem.findFirst({
        where: {
          OR: [
            { sourceId: source.id, sourceGuid: guid },
            { sourceUrl: canonicalUrl },
          ],
        },
      });

      if (existingItem) {
        continue; // Already collected
      }

      // Duplicate Check 2: In News articles
      const existingNews = await prisma.news.findFirst({
        where: {
          OR: [
            { sourceGuid: guid },
            { sourceUrl: canonicalUrl },
          ],
        },
      });

      if (existingNews) {
        continue; // Already processed
      }

      const title = item.title.trim();
      const rawImage = extractImageUrl(item);
      const description = item.contentSnippet || item.summary || item.description || '';
      const cleanDesc = cleanContent(description).substring(0, 500);
      const fullText = cleanContent(item.content || (item as any)['content:encoded'] || item.description || description);
      const publishedDate = item.isoDate || item.pubDate ? new Date(item.isoDate || item.pubDate!) : new Date();

      // Step A: Save raw source item for permanent audit trail
      const sourceItem = await prisma.newsSourceItem.create({
        data: {
          sourceId: source.id,
          sourceGuid: guid,
          sourceUrl: canonicalUrl,
          title,
          description: cleanDesc,
          content: fullText,
          author: item.creator || item.author || source.attributionName || source.name,
          rawImageUrl: rawImage,
          publishedDate,
          rawMetadata: {
            feedTitle: feed.title,
            rawItem: JSON.parse(JSON.stringify(item)),
          },
        },
      });

      // Step B: Save News article strictly in PENDING state (NEVER PUBLISHED AUTOMATICALLY)
      const slug = generateSlug(title);

      await prisma.news.create({
        data: {
          title,
          titleGu: title, // Initially populated with RSS title, ready for editor review
          slug,
          description: cleanDesc,
          descriptionGu: cleanDesc,
          content: fullText || `<p>${cleanDesc}</p>`,
          featuredImage: rawImage,
          categoryId,
          sourceId: source.id,
          sourceItemId: sourceItem.id,
          sourceUrl: canonicalUrl,
          sourceGuid: guid,
          status: NewsStatus.PENDING, // STRICT REQUIREMENT: ALWAYS PENDING
          isBreaking: false,
          isTrending: false,
          isFeatured: false,
          seoTitle: title.substring(0, 70),
          seoDescription: cleanDesc.substring(0, 160),
          publishedAt: null, // Only set upon manual approval
        },
      });

      savedCount++;
    }

    // 3. Update RSS Source stats
    await prisma.rssSource.update({
      where: { id: source.id },
      data: {
        lastFetchTime: startTime,
        lastSuccessTime: new Date(),
        totalArticlesCount: { increment: savedCount },
        lastError: null,
        status: SourceStatus.ACTIVE,
      },
    });

    // 4. Log collection success
    await prisma.rssLog.create({
      data: {
        sourceId: source.id,
        status: LogLevel.INFO,
        message: `સફળતાપૂર્વક ${savedCount} નવા સમાચાર સંગ્રહિત થયા (કુલ ફીડ આઇટમ્સ: ${fetchedCount})`,
        itemsFetched: fetchedCount,
        itemsSaved: savedCount,
        details: { durationMs: Date.now() - startTime.getTime() },
      },
    });

    return {
      success: true,
      fetched: fetchedCount,
      saved: savedCount,
      message: `સફળતાપૂર્વક ${savedCount} સમાચાર PENDING સ્થિતિમાં ઉમેરાયા.`,
    };
  } catch (err: any) {
    const errorMsg = err.message || 'RSS ફીડ મેળવવામાં ભૂલ થઈ';

    await prisma.rssSource.update({
      where: { id: source.id },
      data: {
        lastFetchTime: startTime,
        lastError: errorMsg,
        status: SourceStatus.ERROR,
      },
    });

    await prisma.rssLog.create({
      data: {
        sourceId: source.id,
        status: LogLevel.ERROR,
        message: `RSS ફીડ સંગ્રહ નિષ્ફળ: ${errorMsg}`,
        itemsFetched: 0,
        itemsSaved: 0,
        details: { error: errorMsg, stack: err.stack },
      },
    });

    return {
      success: false,
      fetched: 0,
      saved: 0,
      message: errorMsg,
    };
  }
}

/**
 * Fetch news from all active RSS sources sequentially without blocking
 */
export async function fetchAllActiveSources(): Promise<{ totalSources: number; totalSaved: number }> {
  const activeSources = await prisma.rssSource.findMany({
    where: { status: { in: [SourceStatus.ACTIVE, SourceStatus.ERROR] } },
  });

  let totalSaved = 0;
  for (const src of activeSources) {
    try {
      const res = await fetchRssSource(src.id);
      totalSaved += res.saved;
    } catch (err) {
      console.error(`Error processing source ${src.name}:`, err);
    }
  }

  return { totalSources: activeSources.length, totalSaved };
}
