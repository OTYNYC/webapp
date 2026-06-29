import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getEditableContent, getSaveTarget, saveEditableContent, validateEditableContent } from "../../../lib/adminContent";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "../../../lib/adminAuth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const authorized = await isAuthorized();

  if (!authorized) return unauthorized();

  return NextResponse.json({
    content: await getEditableContent(),
    saveTarget: getSaveTarget(),
  });
}

export async function PUT(request: NextRequest) {
  const authorized = await isAuthorized();

  if (!authorized) return unauthorized();

  try {
    const content = validateEditableContent(await request.json());
    const result = await saveEditableContent(content);

    return NextResponse.json({ content, ...result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save content.";

    return NextResponse.json({ message }, { status: 400 });
  }
}

async function isAuthorized() {
  const cookieStore = await cookies();

  return verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);
}

function unauthorized() {
  return NextResponse.json({ message: "Admin sign-in required." }, { status: 401 });
}
