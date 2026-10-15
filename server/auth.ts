import { createHmac, timingSafeEqual } from "node:crypto";
import type { ApiRequest, ApiResponse } from "./http";

const COOKIE_NAME = "ifixspot_crm_session";
const SESSION_SECONDS = 60 * 60 * 8;

function secret(): string {
  const value = process.env.CRM_SESSION_SECRET;
  if (!value || value.length < 32) {
    throw new Error("Set CRM_SESSION_SECRET to a random value of at least 32 characters in Vercel.");
  }
  return value;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function readCookie(request: ApiRequest): string | null {
  const cookies = request.headers.cookie?.split(";") ?? [];
  const entry = cookies.map((cookie) => cookie.trim()).find((cookie) => cookie.startsWith(`${COOKIE_NAME}=`));
  if (!entry) return null;
  try {
    return decodeURIComponent(entry.slice(COOKIE_NAME.length + 1));
  } catch {
    return null;
  }
}

export function createSessionToken(username: string): string {
  const payload = Buffer.from(JSON.stringify({
    sub: username,
    exp: Math.floor(Date.now() / 1000) + SESSION_SECONDS,
  })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function getSessionUsername(request: ApiRequest): string | null {
  const token = readCookie(request);
  if (!token) return null;
  const [payload, suppliedSignature, extra] = token.split(".");
  if (!payload || !suppliedSignature || extra) return null;
  try {
    const expected = Buffer.from(sign(payload));
    const supplied = Buffer.from(suppliedSignature);
    if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { sub?: unknown; exp?: unknown };
    if (typeof data.sub !== "string" || typeof data.exp !== "number" || data.exp <= Date.now() / 1000) return null;
    return data.sub;
  } catch {
    return null;
  }
}

export function setSessionCookie(response: ApiResponse, username: string): void {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.setHeader("Set-Cookie", `${COOKIE_NAME}=${encodeURIComponent(createSessionToken(username))}; HttpOnly; Path=/; SameSite=Strict; Max-Age=${SESSION_SECONDS}${secure}`);
}

export function clearSessionCookie(response: ApiResponse): void {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.setHeader("Set-Cookie", `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Strict; Max-Age=0${secure}`);
}

export function hasValidCredentials(username: unknown, password: unknown): boolean {
  const expectedUsername = process.env.CRM_USERNAME;
  const expectedPassword = process.env.CRM_PASSWORD;
  if (!expectedUsername || !expectedPassword) {
    throw new Error("Set CRM_USERNAME and CRM_PASSWORD in Vercel before enabling CRM login.");
  }
  if (typeof username !== "string" || typeof password !== "string") return false;
  const suppliedUser = Buffer.from(username.trim());
  const expectedUser = Buffer.from(expectedUsername);
  const suppliedPassword = Buffer.from(password);
  const expectedPass = Buffer.from(expectedPassword);
  return suppliedUser.length === expectedUser.length
    && suppliedPassword.length === expectedPass.length
    && timingSafeEqual(suppliedUser, expectedUser)
    && timingSafeEqual(suppliedPassword, expectedPass);
}
