import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_COOKIE = "oty_admin_session";

const SESSION_SECONDS = 60 * 60 * 8;

interface SessionPayload {
  exp: number;
  sub: string;
}

interface CredentialInput {
  username: string;
  password: string;
}

export function isAdminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function verifyAdminCredentials({ username, password }: CredentialInput) {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  const configuredUsername = process.env.ADMIN_USERNAME;

  if (!configuredPassword) {
    return { ok: false, message: "Admin sign-in is not configured." };
  }

  if (configuredUsername && username.trim() !== configuredUsername) {
    return { ok: false, message: "Invalid admin credentials." };
  }

  if (!safeCompare(password, configuredPassword)) {
    return { ok: false, message: "Invalid admin credentials." };
  }

  return { ok: true, message: "Signed in." };
}

export function createAdminSession(username: string) {
  const payload: SessionPayload = {
    exp: Date.now() + SESSION_SECONDS * 1000,
    sub: username.trim() || process.env.ADMIN_USERNAME || "admin",
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");

  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyAdminSession(value: string | undefined) {
  if (!value || !isAdminConfigured()) return false;

  const [encodedPayload, signature] = value.split(".");
  if (!encodedPayload || !signature || !safeCompare(signature, sign(encodedPayload))) return false;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as Partial<SessionPayload>;

    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function getSessionMaxAge() {
  return SESSION_SECONDS;
}

function sign(value: string) {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";

  return createHmac("sha256", secret).update(value).digest("base64url");
}

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}
