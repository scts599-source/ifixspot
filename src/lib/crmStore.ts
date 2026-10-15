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

const DATABASE_NAME = "ifixspot-crm-local";
const DATABASE_VERSION = 1;
const LEADS_STORE = "leads";
const BACKUP_FORMAT = "ifixspot-crm-backup-v1";
const MAX_IMPORT_BYTES = 20 * 1024 * 1024;

let databasePromise: Promise<IDBDatabase> | undefined;

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("This browser does not support local CRM storage."));
  }

  if (!databasePromise) {
    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(LEADS_STORE)) {
          database.createObjectStore(LEADS_STORE, {
            keyPath: "id",
            autoIncrement: true,
          });
        }
      };
      request.onsuccess = () => {
        const database = request.result;
        database.onversionchange = () => database.close();
        resolve(database);
      };
      request.onerror = () => {
        databasePromise = undefined;
        reject(request.error ?? new Error("Unable to open local CRM storage."));
      };
      request.onblocked = () => {
        databasePromise = undefined;
        reject(new Error("Local CRM storage upgrade is blocked by another open tab. Close other CRM tabs and retry."));
      };
    });
  }

  return databasePromise;
}

function notifyLeadsChanged(): void {
  window.dispatchEvent(new Event("ifixspot:leads-changed"));
  try {
    localStorage.setItem("ifixspot-crm-updated", String(Date.now()));
  } catch {
    // IndexedDB is authoritative; cross-tab notification is best-effort.
  }
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Local CRM request failed."));
  });
}

function transactionResult(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error ?? new Error("Local CRM transaction was cancelled."));
    transaction.onerror = () => reject(transaction.error ?? new Error("Local CRM transaction failed."));
  });
}

export async function listLocalLeads(): Promise<Lead[]> {
  const database = await openDatabase();
  const transaction = database.transaction(LEADS_STORE, "readonly");
  const finished = transactionResult(transaction);
  const leads = await requestResult(transaction.objectStore(LEADS_STORE).getAll() as IDBRequest<Lead[]>);
  await finished;
  return leads.sort((left, right) => right.id - left.id);
}

export async function createLocalLead(input: NewLead): Promise<Lead> {
  const database = await openDatabase();
  const transaction = database.transaction(LEADS_STORE, "readwrite");
  const finished = transactionResult(transaction);
  const store = transaction.objectStore(LEADS_STORE);
  const lead: Omit<Lead, "id"> = {
    ...input,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
  const id = await requestResult(store.add(lead));
  await finished;
  const savedLead = { ...lead, id: Number(id) } as Lead;
  notifyLeadsChanged();
  return savedLead;
}

export async function updateLocalLead(id: number, changes: Partial<Lead>): Promise<Lead> {
  const database = await openDatabase();
  const transaction = database.transaction(LEADS_STORE, "readwrite");
  const finished = transactionResult(transaction);
  const store = transaction.objectStore(LEADS_STORE);
  const current = await requestResult(store.get(id) as IDBRequest<Lead | undefined>);
  if (!current) {
    await finished;
    throw new Error("This lead no longer exists in local storage. Refresh and retry.");
  }
  const updated = { ...current, ...changes, id };
  await requestResult(store.put(updated));
  await finished;
  notifyLeadsChanged();
  return updated;
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

function normalizeImportedLead(value: unknown, rowIndex: number): Omit<Lead, "id"> & { id?: number } {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Backup contains an invalid lead record.");
  }
  const row = value as Record<string, unknown>;
  const phone = textValue(row.phone ?? row.phone_number ?? row.phoneNumber ?? row.mobile);
  const name = textValue(row.name, "Unknown");
  const idValue = Number(row.id);
  const createdAt = textValue(
    row.createdAt ?? row.created_at,
    Number.isSafeInteger(idValue) && idValue > 0 ? `legacy-${idValue}` : `legacy-import-${rowIndex}`,
  );
  const sourceValue = textValue(row.source);
  const sources: LeadSource[] = ["Website Form", "WhatsApp", "Meta Ad", "Walk-in"];
  const statusValue = textValue(row.status);
  const statuses: LeadStatus[] = ["New", "Contacted", "Visit Scheduled", "In Progress", "Converted", "Lost"];
  const teamValue = textValue(row.team);
  let notesValue: unknown[] = Array.isArray(row.notes) ? row.notes : [];
  if (typeof row.notes === "string" && row.notes.trim()) {
    try {
      const parsedNotes: unknown = JSON.parse(row.notes);
      if (Array.isArray(parsedNotes)) notesValue = parsedNotes;
    } catch {
      notesValue = [{ text: row.notes, author: "Imported", timestamp: "" }];
    }
  }
  const costValue = row.estimatedCost ?? row.estimated_cost;

  const notes = notesValue.map((note) => {
    const item = note && typeof note === "object" ? note as Record<string, unknown> : {};
    return {
      timestamp: textValue(item.timestamp ?? item.created_at),
      author: textValue(item.author, "Imported"),
      text: textValue(item.text ?? item.content),
    };
  });

  return {
    ...(Number.isSafeInteger(idValue) && idValue > 0 ? { id: idValue } : {}),
    name,
    phone,
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

function importIdentity(lead: Omit<Lead, "id"> & { id?: number }): string {
  return [lead.id ?? "", lead.phone, lead.createdAt, lead.name].join("|").toLowerCase();
}

export async function importLocalLeads(jsonText: string): Promise<{ imported: number; skipped: number }> {
  if (new Blob([jsonText]).size > MAX_IMPORT_BYTES) {
    throw new Error("Backup file exceeds the 20 MB import limit.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    parsed = parseCsv(jsonText);
  }
  const rows = Array.isArray(parsed)
    ? parsed
    : parsed && typeof parsed === "object" && Array.isArray((parsed as { leads?: unknown }).leads)
      ? (parsed as { leads: unknown[] }).leads
      : null;
  if (!rows) throw new Error("Backup must contain a leads array.");
  if (rows.length > 50000) throw new Error("Backup contains too many lead records.");

  const normalized = rows.map((row, index) => normalizeImportedLead(row, index));
  const database = await openDatabase();
  const transaction = database.transaction(LEADS_STORE, "readwrite");
  const finished = transactionResult(transaction);
  const store = transaction.objectStore(LEADS_STORE);
  let imported = 0;
  let skipped = 0;

  store.getAll().onsuccess = (event) => {
    try {
      const request = event.target as IDBRequest<Lead[]>;
      const existing = request.result;
      const identities = new Set(existing.map((lead) => lead.importKey || importIdentity(lead)));
      const usedIds = new Set(existing.map((lead) => lead.id));
      let nextId = Math.max(0, ...existing.map((lead) => lead.id));
      for (const incoming of normalized) {
        const identity = importIdentity(incoming);
        if (identities.has(identity)) {
          skipped += 1;
          continue;
        }

        let id = incoming.id;
        if (!id || usedIds.has(id)) {
          id = ++nextId;
        }
        const importedLead: Lead = { ...incoming, id, importKey: identity };
        store.put(importedLead);
        usedIds.add(id);
        identities.add(identity);
        imported += 1;
      }
    } catch {
      transaction.abort();
    }
  };

  await finished;
  if (imported > 0) notifyLeadsChanged();
  return { imported, skipped };
}

export async function exportLocalLeads(): Promise<string> {
  const leads = await listLocalLeads();
  return JSON.stringify(
    {
      format: BACKUP_FORMAT,
      exportedAt: new Date().toISOString(),
      leads,
    },
    null,
    2,
  );
}

export function subscribeToLocalLeadChanges(onChange: () => void): () => void {
  const handleLocalChange = () => onChange();
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === "ifixspot-crm-updated") onChange();
  };
  window.addEventListener("ifixspot:leads-changed", handleLocalChange);
  window.addEventListener("storage", handleStorageChange);
  return () => {
    window.removeEventListener("ifixspot:leads-changed", handleLocalChange);
    window.removeEventListener("storage", handleStorageChange);
  };
}
