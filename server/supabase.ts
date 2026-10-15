import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

export function getSupabaseAdmin(): SupabaseClient {
  if (client) return client;
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.");
  }
  client = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return client;
}

export function toLeadRow(input: Record<string, unknown>): Record<string, unknown> {
  const fields: Record<string, string> = {
    name: "name",
    phone: "phone",
    mobile: "phone",
    device: "device",
    issue: "issue",
    source: "source",
    status: "status",
    team: "team",
    visitDate: "visit_date",
    followUpReminder: "follow_up_reminder",
    estimatedCost: "estimated_cost",
    createdAt: "created_at",
    notes: "notes",
    submissionId: "submission_id",
    importKey: "import_key",
    pincode: "pincode",
  };
  const row: Record<string, unknown> = {};
  for (const [source, target] of Object.entries(fields)) {
    if (Object.prototype.hasOwnProperty.call(input, source)) row[target] = input[source];
  }
  return row;
}

export function fromLeadRow(row: Record<string, unknown>): Record<string, unknown> {
  return {
    id: Number(row.id),
    name: row.name ?? "Unknown",
    phone: row.phone ?? "",
    device: row.device ?? "Unspecified",
    issue: row.issue ?? "Diagnostic Requested",
    source: row.source ?? "Website Form",
    status: row.status ?? "New",
    team: row.team ?? "Team 1 (Prajwal)",
    ...(row.visit_date ? { visitDate: row.visit_date } : {}),
    ...(row.follow_up_reminder ? { followUpReminder: row.follow_up_reminder } : {}),
    ...(row.estimated_cost != null ? { estimatedCost: Number(row.estimated_cost) } : {}),
    notes: Array.isArray(row.notes) ? row.notes : [],
    createdAt: row.created_at ?? new Date().toISOString(),
    ...(row.pincode ? { pincode: row.pincode } : {}),
  };
}
