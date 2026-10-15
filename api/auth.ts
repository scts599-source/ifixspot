import type { ApiRequest, ApiResponse } from "../server/http";
import { parseBody, sameOriginRequest } from "../server/http";
import { clearSessionCookie, getSessionUsername, hasValidCredentials, setSessionCookie } from "../server/auth";

export default function handler(request: ApiRequest, response: ApiResponse) {
  response.setHeader("Cache-Control", "no-store");
  if (!sameOriginRequest(request)) return response.status(403).json({ error: "Cross-origin request denied." });

  if (request.method === "GET") {
    const username = getSessionUsername(request);
    return response.status(200).json({ authenticated: Boolean(username), username });
  }

  if (request.method === "DELETE") {
    clearSessionCookie(response);
    return response.status(200).json({ authenticated: false });
  }

  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed." });

  try {
    const body = parseBody(request.body);
    if (!hasValidCredentials(body.username, body.password)) {
      return response.status(401).json({ error: "Invalid credentials." });
    }
    setSessionCookie(response, String(body.username).trim());
    return response.status(200).json({ authenticated: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "CRM authentication is not configured.";
    const notConfigured = message.startsWith("Set CRM_");
    return response.status(notConfigured ? 503 : 400).json({ error: message });
  }
}
