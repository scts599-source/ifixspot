export type LeadSource = "Website Form" | "WhatsApp" | "Meta Ad" | "Walk-in";
export type LeadStatus =
  | "New"
  | "Contacted"
  | "Visit Scheduled"
  | "In Progress"
  | "Converted"
  | "Lost";
export type LeadTeam = "Team 1 (Prajwal)" | "Team 2 (Rayyan)";

export interface LeadNote {
  timestamp: string;
  author: string;
  text: string;
}

export interface Lead {
  id: number;
  name: string;
  phone: string;
  device: string;
  issue: string;
  source: LeadSource;
  status: LeadStatus;
  team: LeadTeam;
  visitDate?: string;
  followUpReminder?: string;
  notes: LeadNote[];
  estimatedCost?: number;
  createdAt: string;
  pincode?: string;
  importKey?: string;
}

export type NewLead = Omit<Lead, "id" | "createdAt" | "importKey"> & {
  createdAt?: string;
};

async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    credentials: "same-origin",
    cache: "no-store",
    ...init,
    headers: {
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const result = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    if (response.status === 401) throw new Error("CRM session expired. Sign in again.");
    throw new Error(typeof result.error === "string" ? result.error : `CRM request failed (${response.status}).`);
  }
  return result as T;
}

export async function listLocalLeads(): Promise<Lead[]> {
  const result = await apiRequest<{ leads: Lead[] }>("/api/get-leads");
  return (result.leads ?? []).sort((left, right) => right.id - left.id);
}

export async function createLocalLead(input: NewLead): Promise<Lead> {
  const result = await apiRequest<{ lead: Lead }>("/api/track-lead", {
    method: "POST",
    body: JSON.stringify({ action: "create", payload: input }),
  });
  return result.lead;
}

export async function updateLocalLead(id: number, changes: Partial<Lead>): Promise<Lead> {
  const result = await apiRequest<{ lead: Lead }>("/api/track-lead", {
    method: "POST",
    body: JSON.stringify({ action: "update", id, payload: changes }),
  });
  return result.lead;
}

function textValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : value == null ? fallback : String(value);
}

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (quoted) {
      if (character === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (character === '"') {
        quoted = false;
      } else {
        field += character;
      }
    } else if (character === '"' && field.length === 0) {
      quoted = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n" || character === "\r") {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }
  if (quoted) throw new Error("CSV backup has an unterminated quoted field.");
  row.push(field);
  if (row.some((value) => value.length > 0)) rows.push(row);
  if (rows.length < 2) throw new Error("CSV backup must include a header and lead rows.");

  const headers = rows[0].map((header, index) =>
    (index === 0 ? header.replace(/^\uFEFF/, "") : header).trim(),
  );
  return rows.slice(1).map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])),
  );
}

function normalizeLead(value: unknown, rowIndex: number): Omit<Lead, "id"> & { id?: number } {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Backup contains an invalid lead record.");
  }
  const row = value as Record<string, unknown>;
  const id = Number(row.id);
  const createdAt = textValue(row.createdAt ?? row.created_at ?? row["Created At (ISO)"], `legacy-import-${rowIndex}`);
  const source = textValue(row.source);
  const status = textValue(row.status);
  const team = textValue(row.team ?? row["Assigned Team"]);
  let noteValues: unknown[] = Array.isArray(row.notes) ? row.notes : [];
  if (typeof row.notes === "string" && row.notes.trim()) {
    try {
      const parsed: unknown = JSON.parse(row.notes);
      if (Array.isArray(parsed)) noteValues = parsed;
      else noteValues = [{ text: row.notes, author: "Imported", timestamp: "" }];
    } catch {
      noteValues = [{ text: row.notes, author: "Imported", timestamp: "" }];
    }
  }
  if (typeof row["Conversation Notes"] === "string" && row["Conversation Notes"].trim()) {
    noteValues = row["Conversation Notes"].split("\n").map((line) => ({ text: line, author: "Imported", timestamp: "" }));
  }
  const notes = noteValues.map((note) => {
    const item = note && typeof note === "object" ? note as Record<string, unknown> : {};
    return {
      timestamp: textValue(item.timestamp ?? item.created_at),
      author: textValue(item.author, "Imported"),
      text: textValue(item.text ?? item.content),
    };
  });
  const cost = row.estimatedCost ?? row.estimated_cost ?? row["Estimated Cost (INR)"];
  const identity = [Number.isSafeInteger(id) ? id : "", row.phone ?? row.mobile ?? "", createdAt, row.name ?? row["Customer Name"] ?? ""].join("|").toLowerCase();

  return {
    ...(Number.isSafeInteger(id) && id > 0 ? { id } : {}),
    name: textValue(row.name ?? row["Customer Name"], "Unknown"),
    phone: textValue(row.phone ?? row.phone_number ?? row.phoneNumber ?? row.mobile ?? row.Phone),
    device: textValue(row.device ?? row.device_model ?? row.deviceModel ?? row.Device, "Unspecified"),
    issue: textValue(row.issue ?? row.Issue, "Diagnostic Requested"),
    source: (["Website Form", "WhatsApp", "Meta Ad", "Walk-in"].includes(source) ? source : "Website Form") as LeadSource,
    status: (status === "Paid" ? "Converted" : (["New", "Contacted", "Visit Scheduled", "In Progress", "Converted", "Lost"].includes(status) ? status : "New")) as LeadStatus,
    team: (team === "Team 1 (Prajwal)" || team === "Team 2 (Rayyan)" ? team : "Team 1 (Prajwal)") as LeadTeam,
    notes,
    createdAt,
    importKey: identity,
    ...(textValue(row.visitDate ?? row.visit_date ?? row["Visit Date"]) ? { visitDate: textValue(row.visitDate ?? row.visit_date ?? row["Visit Date"]) } : {}),
    ...(textValue(row.followUpReminder ?? row.follow_up_reminder ?? row["Follow-up Reminder"]) ? { followUpReminder: textValue(row.followUpReminder ?? row.follow_up_reminder ?? row["Follow-up Reminder"]) } : {}),
    ...(cost !== null && cost !== undefined && cost !== "" && Number.isFinite(Number(cost)) ? { estimatedCost: Number(cost) } : {}),
    ...(textValue(row.pincode ?? row.Pincode) ? { pincode: textValue(row.pincode ?? row.Pincode) } : {}),
  };
}

export async function importLocalLeads(content: string): Promise<{ imported: number; skipped: number }> {
  if (new Blob([content]).size > 20 * 1024 * 1024) throw new Error("Import file exceeds the 20 MB limit.");
  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    parsed = parseCsv(content);
  }
  const rows = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === "object" && Array.isArray((parsed as { leads?: unknown }).leads)
      ? (parsed as { leads: unknown[] }).leads
      : null;
  if (!rows || rows.length > 1000) throw new Error("Import must contain a leads array or CSV with at most 1,000 rows.");
  const leads = rows.map((row, index) => normalizeLead(row, index));
  let imported = 0;
  let skipped = 0;
  for (let index = 0; index < leads.length; index += 250) {
    const result = await apiRequest<{ imported: number; skipped: number }>("/api/track-lead", {
      method: "POST",
      body: JSON.stringify({ action: "import", payload: leads.slice(index, index + 250) }),
    });
    imported += result.imported;
    skipped += result.skipped;
  }
  return { imported, skipped };
}

function csvCell(value: unknown): string {
  let text = value == null ? "" : String(value);
  if (/^[\s]*[=+@\-]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export async function exportTeamLeadsCsv(team: LeadTeam): Promise<{ csv: string; leadIds: number[]; count: number }> {
  const allLeads = await listLocalLeads();
  const teamLeads = allLeads.filter((lead) => lead.team === team).sort((left, right) => left.id - right.id);
  const columns: Array<[string, (lead: Lead) => unknown]> = [
    ["Lead ID", (lead) => lead.id],
    ["Created At (ISO)", (lead) => lead.createdAt],
    ["Customer Name", (lead) => lead.name],
    ["Phone", (lead) => lead.phone],
    ["Device", (lead) => lead.device],
    ["Issue", (lead) => lead.issue],
    ["Source", (lead) => lead.source],
    ["Status", (lead) => lead.status],
    ["Assigned Team", (lead) => lead.team],
    ["Visit Date", (lead) => lead.visitDate],
    ["Follow-up Reminder", (lead) => lead.followUpReminder],
    ["Estimated Cost (INR)", (lead) => lead.estimatedCost],
    ["Conversation Notes", (lead) => lead.notes.map((note) => `${note.timestamp} ${note.author}: ${note.text}`).join("\n")],
  ];
  const rows = [
    columns.map(([title]) => csvCell(title)).join(","),
    ...teamLeads.map((lead) => columns.map(([, getValue]) => csvCell(getValue(lead))).join(",")),
  ];
  return { csv: `\uFEFF${rows.join("\r\n")}`, leadIds: teamLeads.map((lead) => lead.id), count: teamLeads.length };
}

export async function clearExportedTeamLeads(team: LeadTeam, exportedIds: number[]): Promise<number> {
  let deleted = 0;
  for (let index = 0; index < exportedIds.length; index += 500) {
    const result = await apiRequest<{ deleted: number }>("/api/clear-leads", {
      method: "POST",
      body: JSON.stringify({ team, ids: exportedIds.slice(index, index + 500) }),
    });
    deleted += result.deleted;
  }
  return deleted;
}
