import type { ApiRequest, ApiResponse } from "../server/http";
import { getSessionUsername } from "../server/auth";
import { fromLeadRow, getSupabaseAdmin } from "../server/supabase";

export default async function handler(request: ApiRequest, response: ApiResponse) {
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "GET") return response.status(405).json({ error: "Method not allowed." });
  if (!getSessionUsername(request)) return response.status(401).json({ error: "CRM session expired. Sign in again." });

  try {
    const { data, error } = await getSupabaseAdmin()
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return response.status(200).json({ leads: (data ?? []).map((row) => fromLeadRow(row as Record<string, unknown>)) });
  } catch (error) {
    console.error("CRM leads read failed:", error);
    return response.status(503).json({ error: error instanceof Error ? error.message : "Unable to load leads." });
  }
}
