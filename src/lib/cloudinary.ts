import { createHash } from "node:crypto";

/**
 * Minimal signed-upload client for Cloudinary's REST API (the site already
 * serves every project image from res.cloudinary.com, see next.config.js),
 * without pulling in the SDK.
 *
 * Configure with either the standard `CLOUDINARY_URL`
 * (cloudinary://<api_key>:<api_secret>@<cloud_name>) or the three
 * separate variables CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY /
 * CLOUDINARY_API_SECRET. `CLOUDINARY_UPLOAD_FOLDER` (default "portfolio")
 * is the folder new uploads land in.
 */
export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  folder: string;
}

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export function getCloudinaryConfig(): CloudinaryConfig | null {
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER?.trim() || "portfolio";

  const fromUrl = process.env.CLOUDINARY_URL?.trim();
  if (fromUrl) {
    try {
      const parsed = new URL(fromUrl);
      if (
        parsed.protocol === "cloudinary:" &&
        parsed.username &&
        parsed.password &&
        parsed.hostname
      ) {
        return {
          cloudName: parsed.hostname,
          apiKey: decodeURIComponent(parsed.username),
          apiSecret: decodeURIComponent(parsed.password),
          folder,
        };
      }
    } catch {
      // fall through to the separate variables
    }
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  if (cloudName && apiKey && apiSecret) {
    return { cloudName, apiKey, apiSecret, folder };
  }

  return null;
}

/** Cloudinary's signature: sha1 of the sorted `k=v&k=v` params + api secret. */
export function signUploadParams(
  params: Record<string, string | number>,
  apiSecret: string
): string {
  const serialized = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(`${serialized}${apiSecret}`).digest("hex");
}

export interface UploadedImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
}

export async function uploadImageToCloudinary(
  file: File,
  config: CloudinaryConfig = getCloudinaryConfig() ?? throwNotConfigured(),
  fetchImpl: typeof fetch = fetch
): Promise<UploadedImage> {
  const timestamp = Math.floor(Date.now() / 1000);
  const params = { folder: config.folder, timestamp };
  const signature = signUploadParams(params, config.apiSecret);

  const body = new FormData();
  body.append("file", file, file.name);
  body.append("api_key", config.apiKey);
  body.append("timestamp", String(timestamp));
  body.append("folder", config.folder);
  body.append("signature", signature);

  const response = await fetchImpl(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(config.cloudName)}/image/upload`,
    { method: "POST", body }
  );

  const payload = (await response.json().catch(() => null)) as
    | {
        secure_url?: string;
        public_id?: string;
        width?: number;
        height?: number;
        error?: { message?: string };
      }
    | null;

  if (!response.ok || !payload?.secure_url || !payload.public_id) {
    throw new Error(
      payload?.error?.message ?? `Cloudinary upload failed (${response.status})`
    );
  }

  return {
    url: payload.secure_url,
    publicId: payload.public_id,
    width: payload.width ?? 0,
    height: payload.height ?? 0,
  };
}

function throwNotConfigured(): never {
  throw new Error(
    "Cloudinary is not configured: set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME/CLOUDINARY_API_KEY/CLOUDINARY_API_SECRET"
  );
}
