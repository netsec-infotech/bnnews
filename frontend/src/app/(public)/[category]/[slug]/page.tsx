import type { Metadata } from 'next';
import NewsDetailClient from '../../../../components/public/NewsDetailClient';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '')
    : 'https://api.bnnewsgujarati.com');
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bnnewsgujarati.com';

function stripHtml(html?: string | null): string {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function resolveAbsoluteImageUrl(img?: string | null): string {
  if (!img) return `${SITE_URL}/logo.png`;
  if (img.startsWith('http://') || img.startsWith('https://')) return img;
  const clean = img.startsWith('/') ? img : `/${img}`;
  if (clean.startsWith('/uploads/')) {
    return `${BACKEND_URL}${clean}`;
  }
  return `${SITE_URL}${clean}`;
}

async function fetchArticleBySlug(slug: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/news/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.success ? json : null;
  } catch {
    return null;
  }
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
      publishedTime: article.publishedAt || undefined,
      images: [
        {
          url: imageUrl,
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
      images: [imageUrl],
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
