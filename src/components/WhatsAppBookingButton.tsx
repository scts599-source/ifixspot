import { useState, useMemo } from "react";
import { ChevronDown, Send } from "lucide-react";
import { cn } from "@/utils/cn";
import {
  buildWhatsAppLink,
  DEVICE_MODELS,
  REPAIR_TYPES,
  type DeviceModel,
  type RepairType,
  BRAND,
} from "@/lib/site";
import { WhatsAppIcon } from "@/components/icons";

/**
 * WhatsAppBookingButton
 *
 * A modular, accessible button that builds a structured WhatsApp URL with
 * device model, repair type, customer name, and optional notes. It can be
 * used inline (simple link) or as an expandable mini-form for richer context.
 *
 * Props:
 *   variant: "simple" | "form"
 *   deviceModel / repairType — pre-selected values
 *   source / additionalNote — optional extras
 *   size / variant (color)
 *   children — custom label override
 */

type BtnSize = "sm" | "md" | "lg";
type BtnColor = "whatsapp" | "dark";

interface Props {
  variant?: "simple" | "form";
  deviceModel?: DeviceModel | string;
  repairType?: RepairType | string;
  customerName?: string;
  additionalNote?: string;
  source?: string;
  size?: BtnSize;
  color?: BtnColor;
  className?: string;
  label?: string;
}

const SIZES: Record<BtnSize, string> = {
  sm: "px-4 py-2 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-[15px]",
};

const COLORS: Record<BtnColor, string> = {
  whatsapp:
    "bg-wa text-white shadow-lg shadow-wa/30 hover:bg-wa-dark hover:shadow-xl hover:shadow-wa/40",
  dark: "bg-ink text-white shadow-lg shadow-black/20 hover:bg-zinc-800",
};

export function WhatsAppBookingButton({
  variant = "simple",
  deviceModel: initialDeviceModel,
  repairType: initialRepairType,
  customerName,
  additionalNote,
  source,
  size = "md",
  color = "whatsapp",
  className,
  label,
}: Props) {
  const [deviceModel, setDeviceModel] = useState(initialDeviceModel ?? "");
  const [repairType, setRepairType] = useState(initialRepairType ?? "");

  const link = useMemo(() => {
    return buildWhatsAppLink({
      deviceModel: deviceModel || undefined,
      repairType: repairType || undefined,
      customerName: customerName || undefined,
      additionalNote: additionalNote || undefined,
      source: source || undefined,
    });
  }, [deviceModel, repairType, customerName, additionalNote, source]);

  // ── Simple mode: direct link, no form ──
  if (variant === "simple") {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "group inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 active:scale-[0.98]",
          SIZES[size],
          COLORS[color],
          className
        )}
      >
        <WhatsAppIcon className="h-4.5 w-4.5" />
        {label || "Book on WhatsApp"}
      </a>
    );
  }

  // ── Form mode: expandable mini-form ──
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={cn("w-full", className)}>
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className={cn(
          "group flex w-full items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 active:scale-[0.98]",
          SIZES[size],
          COLORS[color]
        )}
        aria-expanded={expanded}
        aria-label="Open booking form"
      >
        {expanded ? <Send className="h-4 w-4" /> : <WhatsAppIcon className="h-4 w-4" />}
        {expanded ? "Review & Send" : label || "Book a Repair"}
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      </button>

      {/* Expandable form */}
      {expanded && (
        <div className="mt-3 space-y-3 rounded-2xl border border-black/10 bg-zinc-50 p-4 shadow-inner">
          {/* Device model */}
          <div>
            <label
              htmlFor="wa-device"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-500"
            >
              iPhone Model
            </label>
            <select
              id="wa-device"
              value={deviceModel}
              onChange={(e) => setDeviceModel(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-ink outline-none transition-shadow focus:border-wa focus:ring-2 focus:ring-wa/30"
            >
              <option value="">Select your model…</option>
              {DEVICE_MODELS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Repair type */}
          <div>
            <label
              htmlFor="wa-repair"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-500"
            >
              Issue / Repair Type
            </label>
            <select
              id="wa-repair"
              value={repairType}
              onChange={(e) => setRepairType(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-ink outline-none transition-shadow focus:border-wa focus:ring-2 focus:ring-wa/30"
            >
              <option value="">What's the issue?…</option>
              {REPAIR_TYPES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Name (optional) */}
          <div>
            <label
              htmlFor="wa-name"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-500"
            >
              Your Name (optional)
            </label>
            <input
              id="wa-name"
              type="text"
              placeholder="e.g. Arun"
              className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-ink outline-none placeholder:text-zinc-400 transition-shadow focus:border-wa focus:ring-2 focus:ring-wa/30"
            />
          </div>

          {/* Notes (optional) */}
          <div>
            <label
              htmlFor="wa-note"
              className="block text-xs font-semibold uppercase tracking-wider text-zinc-500"
            >
              Additional Details (optional)
            </label>
            <textarea
              id="wa-note"
              rows={2}
              placeholder="e.g. Cracked diagonally, water exposure, etc."
              className="mt-1.5 w-full resize-none rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-ink outline-none placeholder:text-zinc-400 transition-shadow focus:border-wa focus:ring-2 focus:ring-wa/30"
            />
          </div>

          {/* Preview */}
          <div className="rounded-xl bg-white p-3 text-xs text-zinc-500">
            <span className="font-semibold text-zinc-700">Preview → </span>
            Message will include device model + repair type and be sent to{" "}
            <strong>{BRAND.phoneDisplay}</strong> on WhatsApp.
          </div>

          {/* Submit */}
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-wa py-3 text-sm font-semibold text-white shadow-lg shadow-wa/30 transition-all hover:bg-wa-dark"
          >
            <Send className="h-4 w-4" />
            Send on WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
