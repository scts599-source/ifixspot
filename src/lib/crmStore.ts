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
  importKey?: string;
}

export type NewLead = Omit<Lead, "id" | "createdAt" | "importKey"> & {
  createdAt?: string;
};

const LEGACY_DATABASE_NAME = "ifixspot-crm-local";
const LEGACY_STORE_NAME = "leads";
const MAX_IMPORT_BYTES = 20 * 1024 * 1024;

let sessionLeads: Lead[] | undefined;
let initializePromise: Promise<void> | undefined;
let nextId = 1;

function notifyLeadsChanged(): void {
  window.dispatchEvent(new Event("ifixspot:leads-changed"));
}

function textValue(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : value == null ? fallback : String(value);
}

async function openExistingLegacyDatabase(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return null;
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(LEGACY_DATABASE_NAME);
    let wasMissing = false;

    request.onupgradeneeded = () => {
      wasMissing = true;
      request.transaction?.abort();
    };
    request.onerror = () => {
      if (wasMissing) resolve(null);
      else reject(request.error ?? new Error("Could not read legacy browser CRM data."));
    };
    request.onsuccess = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(LEGACY_STORE_NAME)) {
        database.close();
        resolve(null);
        return;
      }
      resolve(database);
    };
  });
}

async function readLegacyDatabase(): Promise<unknown[]> {
  const database = await openExistingLegacyDatabase();
  if (!database) return [];

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(LEGACY_STORE_NAME, "readonly");
    const request = transaction.objectStore(LEGACY_STORE_NAME).getAll();
    let records: unknown[] = [];
    request.onsuccess = () => { records = request.result as unknown[]; };
    request.onerror = () => reject(request.error ?? new Error("Could not read legacy browser CRM records."));
    transaction.oncomplete = () => {
      database.close();
      resolve(records);
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error ?? new Error("Legacy CRM read was interrupted."));
    };
  });
}

function normalizeLead(value: unknown, rowIndex: number): Omit<Lead, "id"> & { id?: number } {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Backup contains an invalid lead record.");
  }
  const row = value as Record<string, unknown>;
  const idValue = Number(row.id);
  const createdAt = textValue(
    row.createdAt ?? row.created_at,
    Number.isSafeInteger(idValue) && idValue > 0 ? `legacy-${idValue}` : `legacy-import-${rowIndex}`,
  );
  const sourceValue = textValue(row.source);
  const statusValue = textValue(row.status);
  const teamValue = textValue(row.team);
  const sources: LeadSource[] = ["Website Form", "WhatsApp", "Meta Ad", "Walk-in"];
  const statuses: LeadStatus[] = ["New", "Contacted", "Visit Scheduled", "In Progress", "Converted", "Lost"];
  let noteValues: unknown[] = Array.isArray(row.notes) ? row.notes : [];
  if (typeof row.notes === "string" && row.notes.trim()) {
    try {
      const parsed: unknown = JSON.parse(row.notes);
      if (Array.isArray(parsed)) noteValues = parsed;
    } catch {
      noteValues = [{ text: row.notes, author: "Imported", timestamp: "" }];
    }
  }

  const notes = noteValues.map((note) => {
    const item = note && typeof note === "object" ? note as Record<string, unknown> : {};
    return {
      timestamp: textValue(item.timestamp ?? item.created_at),
      author: textValue(item.author, "Imported"),
      text: textValue(item.text ?? item.content),
    };
  });
  const costValue = row.estimatedCost ?? row.estimated_cost;

  return {
    ...(Number.isSafeInteger(idValue) && idValue > 0 ? { id: idValue } : {}),
    name: textValue(row.name, "Unknown"),
    phone: textValue(row.phone ?? row.phone_number ?? row.phoneNumber ?? row.mobile),
    device: textValue(row.device ?? row.device_model ?? row.deviceModel, "Unspecified"),
    issue: textValue(row.issue, "Diagnostic Requested"),
    source: sources.includes(sourceValue as LeadSource) ? sourceValue as LeadSource : "Website Form",
    status: statuses.includes(statusValue as LeadStatus) ? statusValue as LeadStatus : statusValue === "Paid" ? "Converted" : "New",
    team: teamValue === "Team 2 (Rayyan)" ? "Team 2 (Rayyan)" : "Team 1 (Prajwal)",
    ...(textValue(row.visitDate ?? row.visit_date) ? { visitDate: textValue(row.visitDate ?? row.visit_date) } : {}),
    ...(textValue(row.followUpReminder ?? row.follow_up_reminder) ? { followUpReminder: textValue(row.followUpReminder ?? row.follow_up_reminder) } : {}),
    notes,
    ...(costValue !== null && costValue !== undefined && costValue !== "" && Number.isFinite(Number(costValue))
      ? { estimatedCost: Number(costValue) }
      : {}),
    createdAt,
  };
}

function leadIdentity(lead: Omit<Lead, "id"> & { id?: number }): string {
  return [lead.id ?? "", lead.phone, lead.createdAt, lead.name].join("|").toLowerCase();
}

async function initializeSession(): Promise<void> {
  if (!initializePromise) {
    initializePromise = (async () => {
      const oldRecords = await readLegacyDatabase();
      const identities = new Set<string>();
      sessionLeads = [];
      for (const [index, row] of oldRecords.entries()) {
        const normalized = normalizeLead(row, index);
        const identity = leadIdentity(normalized);
        if (identities.has(identity)) continue;
        const id = normalized.id && !sessionLeads.some((lead) => lead.id === normalized.id)
          ? normalized.id
          : nextId;
        nextId = Math.max(nextId, id + 1);
        sessionLeads.push({ ...normalized, id, importKey: identity });
        identities.add(identity);
      }
      nextId = Math.max(nextId, ...sessionLeads.map((lead) => lead.id + 1), 1);
    })().catch((error) => {
      initializePromise = undefined;
      throw error;
    });
  }
  await initializePromise;
}

export async function listLocalLeads(): Promise<Lead[]> {
  await initializeSession();
  return [...(sessionLeads ?? [])].sort((left, right) => right.id - left.id);
}

export async function createLocalLead(input: NewLead): Promise<Lead> {
  await initializeSession();
  const lead: Lead = {
    ...input,
    id: nextId++,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
  sessionLeads!.push(lead);
  notifyLeadsChanged();
  return lead;
}

export async function updateLocalLead(id: number, changes: Partial<Lead>): Promise<Lead> {
  await initializeSession();
  const index = sessionLeads!.findIndex((lead) => lead.id === id);
  if (index < 0) throw new Error("This lead is not in the current session. Reload legacy records or import a backup.");
  const updated = { ...sessionLeads![index], ...changes, id };
  sessionLeads![index] = updated;
  notifyLeadsChanged();
  return updated;
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

export async function importLocalLeads(content: string): Promise<{ imported: number; skipped: number }> {
  if (new Blob([content]).size > MAX_IMPORT_BYTES) throw new Error("Import file exceeds the 20 MB limit.");
  await initializeSession();

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
  if (!rows) throw new Error("Import must contain a leads array or a CSV header and rows.");
  if (rows.length > 50000) throw new Error("Import contains too many leads.");

  const identities = new Set(sessionLeads!.map((lead) => lead.importKey || leadIdentity(lead)));
  let imported = 0;
  let skipped = 0;
  for (const [index, row] of rows.entries()) {
    const normalized = normalizeLead(row, index);
    const identity = leadIdentity(normalized);
    if (identities.has(identity)) {
      skipped += 1;
      continue;
    }

    const id = normalized.id && !sessionLeads!.some((lead) => lead.id === normalized.id)
      ? normalized.id
      : nextId;
    nextId = Math.max(nextId, id + 1);
    sessionLeads!.push({ ...normalized, id, importKey: identity });
    identities.add(identity);
    imported += 1;
  }
  if (imported) notifyLeadsChanged();
  return { imported, skipped };
}

function csvCell(value: unknown): string {
  let text = value == null ? "" : String(value);
  if (/^[\s]*[=+@\-]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export async function exportTeamLeadsCsv(team: LeadTeam): Promise<{ csv: string; leadIds: number[]; count: number }> {
  await initializeSession();
  const teamLeads = sessionLeads!.filter((lead) => lead.team === team).sort((left, right) => left.id - right.id);
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
  return {
    csv: `\uFEFF${rows.join("\r\n")}`,
    leadIds: teamLeads.map((lead) => lead.id),
    count: teamLeads.length,
  };
}

export async function clearExportedTeamLeads(team: LeadTeam, exportedIds: number[]): Promise<number> {
  await initializeSession();
  const ids = new Set(exportedIds);
  const legacyDatabase = await openExistingLegacyDatabase();
  if (legacyDatabase) {
    await new Promise<void>((resolve, reject) => {
      const transaction = legacyDatabase.transaction(LEGACY_STORE_NAME, "readwrite");
      const store = transaction.objectStore(LEGACY_STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => {
        for (const value of request.result as unknown[]) {
          const normalized = normalizeLead(value, 0);
          if (normalized.team === team && normalized.id && ids.has(normalized.id)) {
            store.delete(normalized.id);
          }
        }
      };
      request.onerror = () => transaction.abort();
      transaction.oncomplete = () => { legacyDatabase.close(); resolve(); };
      transaction.onabort = () => {
        legacyDatabase.close();
        reject(transaction.error ?? new Error("Could not clear exported legacy leads."));
      };
    });
  }

  const before = sessionLeads!.length;
  sessionLeads = sessionLeads!.filter((lead) => !(lead.team === team && ids.has(lead.id)));
  const removed = before - sessionLeads.length;
  if (removed) notifyLeadsChanged();
  return removed;
}

export function subscribeToLocalLeadChanges(onChange: () => void): () => void {
  window.addEventListener("ifixspot:leads-changed", onChange);
  return () => window.removeEventListener("ifixspot:leads-changed", onChange);
}
