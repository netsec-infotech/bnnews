import slugifyLib from 'slugify';

/**
 * Creates an SEO-friendly slug from Gujarati or English title
 */
export function generateSlug(title: string, suffix?: string): string {
  // Normalize whitespace and special characters
  let cleanTitle = title
    .trim()
    .replace(/[|&;$%@"<>()+,/\\#^*~`'":?!=]/g, '')
    .replace(/\s+/g, '-');

  // Slugify while maintaining unicode characters or latin characters
  let baseSlug = (slugifyLib as any)(cleanTitle, {
    replacement: '-',
    lower: true,
    strict: false,
    trim: true,
  });

  if (!baseSlug || baseSlug.length < 3) {
    baseSlug = `samachar-${Date.now().toString(36)}`;
  }

  // Truncate to reasonable SEO length (max 100 chars)
  if (baseSlug.length > 100) {
    baseSlug = baseSlug.substring(0, 100).replace(/-+$/, '');
  }

  if (suffix) {
    return `${baseSlug}-${suffix}`;
  }

  const randomSalt = Math.random().toString(36).substring(2, 6);
  return `${baseSlug}-${randomSalt}`;
}
