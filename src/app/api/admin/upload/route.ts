import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import {
  MAX_UPLOAD_BYTES,
  getCloudinaryConfig,
  uploadImageToCloudinary,
} from "@/lib/cloudinary";

// A route handler (rather than a server action) so uploads are not subject
// to the 1MB server-action body limit. `/api` is excluded from the proxy
// matcher, so the session is checked here explicitly.
export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = getCloudinaryConfig();
  if (!config) {
    return NextResponse.json(
      {
        error:
          "Image uploads are not configured. Set CLOUDINARY_URL (or the CLOUDINARY_* variables) or paste an image URL instead.",
      },
      { status: 503 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "No file received" }, { status: 400 });
  }
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Only image files are accepted" }, { status: 415 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: `Image is too large (max ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB)` },
      { status: 413 }
    );
  }

  try {
    const uploaded = await uploadImageToCloudinary(file, config);
    return NextResponse.json(uploaded);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
