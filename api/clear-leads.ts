import type { ApiRequest, ApiResponse } from "../server/http";
import { parseBody, sameOriginRequest } from "../server/http";
import { getSessionUsername } from "../server/auth";
import { getSupabaseAdmin } from "../server/supabase";

const VALID_TEAMS = new Set(["Team 1 (Prajwal)", "Team 2 (Rayyan)"]);

export default async function handler(request: ApiRequest, response: ApiResponse) {
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed." });
  if (!sameOriginRequest(request)) return response.status(403).json({ error: "Cross-origin request denied." });
  if (!getSessionUsername(request)) return response.status(401).json({ error: "CRM session expired. Sign in again." });

  try {
    const body = parseBody(request.body);
    const team = typeof body.team === "string" ? body.team : "";
    if (!VALID_TEAMS.has(team) || !Array.isArray(body.ids) || body.ids.length > 5000) {
      return response.status(400).json({ error: "A valid team and lead ID list are required." });
    }
    const ids = [...new Set(body.ids.map(Number).filter((id) => Number.isSafeInteger(id) && id > 0))];
    if (ids.length === 0) return response.status(200).json({ deleted: 0 });

    const { data, error } = await getSupabaseAdmin()
      .from("leads")
      .delete()
      .in("id", ids)
      .eq("team", team)
      .select("id");
    if (error) throw error;
    return response.status(200).json({ deleted: data?.length ?? 0 });
  } catch (error) {
    console.error("Lead clear API error:", error);
    return response.status(503).json({ error: error instanceof Error ? error.message : "Unable to clear exported leads." });
  }
}
