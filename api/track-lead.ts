import { createHash } from "node:crypto";
import type { ApiRequest, ApiResponse } from "../server/http";
import { parseBody, sameOriginRequest } from "../server/http";
import { getSessionUsername } from "../server/auth";
import { fromLeadRow, getSupabaseAdmin, toLeadRow } from "../server/supabase";

const VALID_TEAMS = new Set(["Team 1 (Prajwal)", "Team 2 (Rayyan)"]);
const VALID_SOURCES = new Set(["Website Form", "WhatsApp", "Meta Ad", "Walk-in"]);
const VALID_STATUSES = new Set(["New", "Contacted", "Visit Scheduled", "In Progress", "Converted", "Lost"]);

function normalizePhone(value: unknown): string {
  return typeof value === "string" ? value.replace(/\D/g, "") : "";
}

function cleanNewLead(payload: Record<string, unknown>, defaults: { team: string; source: string }) {
  const name = typeof payload.name === "string" ? payload.name.trim().slice(0, 120) : "";
  const phone = normalizePhone(payload.phone ?? payload.mobile);
  const device = typeof (payload.device ?? payload.deviceModel) === "string"
    ? String(payload.device ?? payload.deviceModel).trim().slice(0, 120)
    : "Unspecified";
  const issue = typeof payload.issue === "string" ? payload.issue.trim().slice(0, 500) : "Diagnostic Requested";
  if (!phone || phone.length < 10 || phone.length > 15) throw new Error("Enter a valid phone number.");
  const requestedTeam = typeof payload.team === "string" ? payload.team : "";
  const teamValue = VALID_TEAMS.has(requestedTeam) ? requestedTeam : defaults.team;
  const requestedSource = typeof payload.source === "string" ? payload.source : "";
  const sourceValue = VALID_SOURCES.has(requestedSource) ? requestedSource : defaults.source;
  const requestedStatus = typeof payload.status === "string" ? payload.status : "";
  const statusValue = VALID_STATUSES.has(requestedStatus) ? requestedStatus : "New";
  const notes = Array.isArray(payload.notes) ? payload.notes.slice(0, 100) : [];
  return {
    ...toLeadRow({
      name: name || "Website Lead",
      phone,
      device: device || "Unspecified",
      issue: issue || "Diagnostic Requested",
      source: sourceValue,
      status: statusValue,
      team: teamValue,
      notes,
      ...(payload.pincode ? { pincode: String(payload.pincode).replace(/\D/g, "").slice(0, 8) } : {}),
      ...(payload.submissionId ? { submissionId: String(payload.submissionId).slice(0, 100) } : {}),
      ...(payload.createdAt ? { createdAt: String(payload.createdAt) } : {}),
      ...(payload.visitDate ? { visitDate: String(payload.visitDate) } : {}),
      ...(payload.followUpReminder ? { followUpReminder: String(payload.followUpReminder) } : {}),
      ...(payload.estimatedCost != null && Number.isFinite(Number(payload.estimatedCost))
        ? { estimatedCost: Number(payload.estimatedCost) }
        : {}),
    }),
  };
}

export default async function handler(request: ApiRequest, response: ApiResponse) {
  response.setHeader("Cache-Control", "no-store");
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed." });
  if (!sameOriginRequest(request)) return response.status(403).json({ error: "Cross-origin request denied." });

  try {
    const body = parseBody(request.body);
    const action = typeof body.action === "string" ? body.action : "public";
    const isPublicCapture = action === "public";
    if (!isPublicCapture && !getSessionUsername(request)) {
      return response.status(401).json({ error: "CRM session expired. Sign in again." });
    }

    const supabase = getSupabaseAdmin();

    if (isPublicCapture) {
      const submissionId = typeof body.submissionId === "string" ? body.submissionId.slice(0, 100) : "";
      if (submissionId) {
        const { data: existing, error: lookupError } = await supabase
          .from("leads")
          .select("id")
          .eq("submission_id", submissionId)
          .maybeSingle();
        if (lookupError) throw lookupError;
        if (existing) return response.status(200).json({ success: true, lead_id: existing.id, duplicate: true });
      }

      const lead = cleanNewLead(
        { ...body, team: "Team 1 (Prajwal)", source: "Website Form" },
        { team: "Team 1 (Prajwal)", source: "Website Form" },
      );
      const { data, error } = await supabase.from("leads").insert(lead).select("id").single();
      if (error) throw error;
      return response.status(201).json({ success: true, lead_id: data.id });
    }

    if (action === "create") {
      if (!body.payload || typeof body.payload !== "object" || Array.isArray(body.payload)) {
        return response.status(400).json({ error: "Lead payload is required." });
      }
      const lead = cleanNewLead(body.payload as Record<string, unknown>, {
        team: VALID_TEAMS.has(String((body.payload as Record<string, unknown>).team))
          ? String((body.payload as Record<string, unknown>).team)
          : "Team 1 (Prajwal)",
        source: "Walk-in",
      });
      const { data, error } = await supabase.from("leads").insert(lead).select("*").single();
      if (error) throw error;
      return response.status(201).json({ lead: fromLeadRow(data as Record<string, unknown>) });
    }

    if (action === "update") {
      const id = Number(body.id);
      if (!Number.isSafeInteger(id) || id < 1 || !body.payload || typeof body.payload !== "object") {
        return response.status(400).json({ error: "A valid lead ID and payload are required." });
      }
      const payload = body.payload as Record<string, unknown>;
      const allowed = new Set(["name", "phone", "device", "issue", "source", "status", "team", "visitDate", "followUpReminder", "estimatedCost", "notes"]);
      const safePayload = Object.fromEntries(Object.entries(payload).filter(([key]) => allowed.has(key)));
      if (safePayload.team && !VALID_TEAMS.has(String(safePayload.team))) {
        return response.status(400).json({ error: "Invalid team." });
      }
      const { data, error } = await supabase
        .from("leads")
        .update(toLeadRow(safePayload))
        .eq("id", id)
        .select("*")
        .maybeSingle();
      if (error) throw error;
      if (!data) return response.status(404).json({ error: "Lead not found." });
      return response.status(200).json({ lead: fromLeadRow(data as Record<string, unknown>) });
    }

    if (action === "import") {
      if (!Array.isArray(body.payload) || body.payload.length > 1000) {
        return response.status(400).json({ error: "Import must contain at most 1,000 leads per request." });
      }
      const records = body.payload.map((item, index) => {
        if (!item || typeof item !== "object" || Array.isArray(item)) throw new Error(`Invalid lead at row ${index + 1}.`);
        const record = item as Record<string, unknown>;
        const normalized = cleanNewLead(record, { team: "Team 1 (Prajwal)", source: "Website Form" });
        const key = createHash("sha256")
          .update([record.id ?? "", normalized.phone, record.createdAt ?? record.created_at ?? index, normalized.name].join("|"))
          .digest("hex");
        return { ...normalized, import_key: key };
      });
      if (records.length === 0) return response.status(200).json({ imported: 0, skipped: 0 });
      const { data, error } = await supabase
        .from("leads")
        .upsert(records, { onConflict: "import_key", ignoreDuplicates: true })
        .select("id");
      if (error) throw error;
      return response.status(200).json({ imported: data?.length ?? 0, skipped: records.length - (data?.length ?? 0) });
    }

    return response.status(400).json({ error: "Unknown lead action." });
  } catch (error) {
    console.error("Lead API error:", error);
    const message = error instanceof Error ? error.message : "Unable to process lead request.";
    const invalidInput = message.startsWith("Request body")
      || message.startsWith("Enter a valid phone")
      || message.startsWith("Invalid lead at row");
    return response.status(invalidInput ? 400 : 503).json({ error: message });
  }
}
