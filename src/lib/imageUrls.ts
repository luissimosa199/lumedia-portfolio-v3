/**
 * Hosts that next/image is allowed to optimise - keep in sync with
 * `images.remotePatterns` in next.config.js. The admin panel refuses image
 * URLs outside this list because next/image throws at render time for an
 * unconfigured host, which would take the whole page down.
 */
export const ALLOWED_IMAGE_HOSTS = ["res.cloudinary.com"] as const;

export function isAllowedImageUrl(value: string): boolean {
  if (value.startsWith("/") && !value.startsWith("//")) {
    return true; // served from /public
  }

  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      ALLOWED_IMAGE_HOSTS.some((host) => url.hostname === host)
    );
  } catch {
    return false;
  }
}
