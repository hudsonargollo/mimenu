/** Only remote http(s), same-origin paths, and (optionally) data images may be
 * used as venue media. Blocks javascript:/protocol-relative payloads typed into
 * the admin panel. */
export function isSafeMediaUrl(value: string | undefined | null, allowDataImage = false): value is string {
  if (!value) return false;
  const url = value.trim();
  if (!url) return false;
  if (/^https?:\/\//i.test(url)) return true;
  if (url.startsWith('/') && !url.startsWith('//')) return true;
  return allowDataImage && /^data:image\//i.test(url);
}
