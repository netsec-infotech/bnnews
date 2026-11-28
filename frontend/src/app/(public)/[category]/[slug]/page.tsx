import type { Metadata } from 'next';
import NewsDetailClient from '../../../../components/public/NewsDetailClient';

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')
    ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '')
    : 'https://bnnewsgujarati.com';

const PUBLIC_BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL && !process.env.NEXT_PUBLIC_BACKEND_URL.includes('localhost')
    ? process.env.NEXT_PUBLIC_BACKEND_URL.replace(/\/+$/, '')
    : 'https://bnnewsgujarati.com';

function stripHtml(html?: string | null): string {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveAbsoluteImageUrl(img?: string | null): string {
  if (!img || typeof img !== 'string') return `${SITE_URL}/logo.png`;
  
  let finalUrl = img.trim();

  // If already an absolute URL
  if (finalUrl.startsWith('http://') || finalUrl.startsWith('https://')) {
    // If it points to localhost from a local dev db, rewrite to production backend
    if (finalUrl.includes('localhost:5000/uploads/') || finalUrl.includes('localhost:5100/uploads/')) {
      finalUrl = finalUrl.replace(/http:\/\/localhost:(5000|5100)\/uploads\//, `${PUBLIC_BACKEND_URL}/uploads/`);
    }
    // Meta / Facebook requires HTTPS for og:image to render preview cards reliably
    if (finalUrl.startsWith('http://') && !finalUrl.includes('localhost')) {
      finalUrl = finalUrl.replace(/^http:\/\//, 'https://');
    }
    return finalUrl;
  }

  const clean = finalUrl.startsWith('/') ? finalUrl : `/${finalUrl}`;
  if (clean.startsWith('/uploads/')) {
    return `${PUBLIC_BACKEND_URL}${clean}`;
  }
  return `${SITE_URL}${clean}`;
}

async function fetchArticleBySlug(slug: string) {
  const candidateUrls = [
    `http://127.0.0.1:5010/api/news/${encodeURIComponent(slug)}`,
    `http://127.0.0.1:5000/api/news/${encodeURIComponent(slug)}`,
    `${(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5010/api').replace(/\/+$/, '')}/news/${encodeURIComponent(slug)}`,
    `https://bnnewsgujarati.com/api/news/${encodeURIComponent(slug)}`,
  ];

  for (const url of candidateUrls) {
    try {
      const res = await fetch(url, {
        next: { revalidate: 60 },
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.success && json?.data) return json;
      }
    } catch {
      // try next candidate
    }
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: { category: string; slug: string };
}): Promise<Metadata> {
  const result = await fetchArticleBySlug(params.slug);
  const article = result?.data;

  if (!article) {
    return {
      title: 'BN NEWS ગુજરાતી | તાજા સમાચાર',
      description: 'ગુજરાત, ભારત અને વિશ્વના તમામ તાજા અને સત્યપૂર્ણ સમાચાર.',
    };
  }

  const title = article.titleGu || article.title || 'BN NEWS ગુજરાતી';
  const rawDescription =
    article.descriptionGu ||
    stripHtml(article.content) ||
    'ગુજરાત, ભારત અને વિશ્વના તમામ તાજા અને સત્યપૂર્ણ સમાચાર.';
  const description = rawDescription.length > 500 ? `${rawDescription.slice(0, 497)}...` : rawDescription;
  const imageUrl = resolveAbsoluteImageUrl(article.featuredImage);
  const articleUrl = `${SITE_URL}/${params.category}/${params.slug}`;

  return {
    title: `${title} | BN NEWS ગુજરાતી`,
    description,
    openGraph: {
      title,
      description,
      url: articleUrl,
      siteName: 'BN NEWS ગુજરાતી',
      type: 'article',
      locale: 'gu_IN',
      publishedTime: article.publishedAt || article.createdAt || undefined,
      modifiedTime: article.updatedAt || undefined,
      authors: article.reporter?.name ? [article.reporter.name] : ['BN News Gujarati'],
      section: params.category,
      images: [
        {
          url: imageUrl,
          secureUrl: imageUrl.startsWith('http:') ? imageUrl.replace(/^http:/, 'https:') : imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: '@bnnewsgujarati',
      creator: '@bnnewsgujarati',
      images: [imageUrl],
    },
    alternates: {
      canonical: articleUrl,
    },
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: { category: string; slug: string };
}) {
  const result = await fetchArticleBySlug(params.slug);

  return (
    <NewsDetailClient
      slug={params.slug}
      categorySlug={params.category}
      initialArticle={result?.data || null}
      initialRelated={result?.related || []}
    />
  );
}
