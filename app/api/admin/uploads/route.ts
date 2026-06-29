import { mkdir, writeFile } from "node:fs/promises";
import { join, parse } from "node:path";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "../../../lib/adminAuth";
import { getGithubConfig, saveFilesToGithub } from "../../../lib/githubContent";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const uploadDirectory = "public/assets/uploads";
const allowedTypes = new Map([
  ["image/avif", "avif"],
  ["image/gif", "gif"],
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();

  if (!verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ message: "Admin sign-in required." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Choose an image to upload." }, { status: 400 });
    }

    if (!allowedTypes.has(file.type)) {
      return NextResponse.json({ message: "Upload a JPG, PNG, WebP, AVIF, or GIF image." }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ message: "Images must be 8 MB or smaller." }, { status: 400 });
    }

    const extension = allowedTypes.get(file.type) || "jpg";
    const filename = `${Date.now()}-${sanitizeFilename(file.name, extension)}`;
    const repoPath = `${uploadDirectory}/${filename}`;
    const publicPath = `/assets/uploads/${filename}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const githubConfig = getGithubConfig();

    if (githubConfig) {
      await saveFilesToGithub(
        [
          {
            content: buffer.toString("base64"),
            encoding: "base64",
            path: repoPath,
          },
        ],
        githubConfig,
        `Upload admin image ${filename}`,
      );

      return NextResponse.json({ mode: "github", path: publicPath });
    }

    if (process.env.NODE_ENV !== "production") {
      await mkdir(join(process.cwd(), uploadDirectory), { recursive: true });
      await writeFile(join(process.cwd(), repoPath), buffer);

      return NextResponse.json({ mode: "local-dev", path: publicPath });
    }

    return NextResponse.json({ message: "GitHub image uploading is not configured for this deployment." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image could not be uploaded.";

    return NextResponse.json({ message }, { status: 400 });
  }
}

function sanitizeFilename(filename: string, extension: string) {
  const baseName = parse(filename).name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 64);

  return `${baseName || "upload"}.${extension}`;
}
