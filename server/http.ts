import type { IncomingMessage, ServerResponse } from "node:http";

export type ApiRequest = IncomingMessage & {
  body?: unknown;
  method?: string;
  headers: IncomingMessage["headers"] & { cookie?: string };
};

export type ApiResponse = ServerResponse & {
  status(code: number): ApiResponse;
  json(body: unknown): ApiResponse;
};

export function parseBody(body: unknown): Record<string, unknown> {
  if (typeof body === "string") {
    try {
      const value: unknown = JSON.parse(body);
      if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
    } catch {
      throw new Error("Request body must be valid JSON.");
    }
  }
  if (body && typeof body === "object" && !Array.isArray(body)) return body as Record<string, unknown>;
  throw new Error("Request body must be a JSON object.");
}

export function sameOriginRequest(request: ApiRequest): boolean {
  const origin = request.headers.origin;
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.host;
  } catch {
    return false;
  }
}
