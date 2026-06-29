import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "../../../lib/adminAuth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;
const allowedTypes = ["image/avif", "image/gif", "image/jpeg", "image/jpg", "image/pjpeg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ message: "Vercel Blob image uploading is not configured for this deployment." }, { status: 400 });
    }

    const body = (await request.json()) as HandleUploadBody;
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const cookieStore = await cookies();

        if (!verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
          throw new Error("Admin sign-in required.");
        }

        validateUploadPath(pathname);

        return {
          addRandomSuffix: true,
          allowedContentTypes: allowedTypes,
          cacheControlMaxAge: 31536000,
          maximumSizeInBytes: MAX_UPLOAD_BYTES,
          validUntil: Date.now() + 10 * 60 * 1000,
        };
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image could not be uploaded.";
    const status = message === "Admin sign-in required." ? 401 : 400;

    return NextResponse.json({ message }, { status });
  }
}

function validateUploadPath(pathname: string) {
  if (!/^uploads\/[a-z0-9][a-z0-9-]{0,80}\.(avif|gif|jpe?g|png|webp)$/i.test(pathname)) {
    throw new Error("Invalid upload path.");
  }

  if (pathname.includes("..") || pathname.includes("//")) {
    throw new Error("Invalid upload path.");
  }
}
