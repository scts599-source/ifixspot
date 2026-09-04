// ─── Brand & Contact Config ─────────────────────────────────────────────
// Update these values in one place to change them across the whole site.

export const BRAND = {
  name: "iFixSpot",
  tagline: "iPhone Repairs, Done Right.",
  phoneLocal: "70227 18776",
  phoneDisplay: "+91 70227 18776",
  phoneIntl: "917022718776",
  area: "iFixSpot Service Center",
  addressLine:
    "B.R Plaza, CMR Main Rd, HRBR Layout 2nd Block,\nKalyan Nagar, Bengaluru, Karnataka 560043",
  hours: "Mon – Sun · 10:00 AM – 9:00 PM",
  email: "support@ifixspot.in",
};

// ─── Device Models ──────────────────────────────────────────────────────
export const DEVICE_MODELS = [
  "iPhone 16 Pro Max",
  "iPhone 16 Pro",
  "iPhone 16 Plus",
  "iPhone 16",
  "iPhone 15 Pro Max",
  "iPhone 15 Pro",
  "iPhone 15 Plus",
  "iPhone 15",
  "iPhone 14 Pro Max",
  "iPhone 14 Pro",
  "iPhone 14 Plus",
  "iPhone 14",
  "iPhone 13 Pro Max",
  "iPhone 13 Pro",
  "iPhone 13 mini",
  "iPhone 13",
  "iPhone 12 Pro Max",
  "iPhone 12 Pro",
  "iPhone 12 mini",
  "iPhone 12",
  "iPhone 11 Pro Max",
  "iPhone 11 Pro",
  "iPhone 11",
  "iPhone SE (3rd gen)",
  "iPhone SE (2nd gen)",
  "iPhone XS Max",
  "iPhone XS",
  "iPhone XR",
  "iPhone X",
  "iPhone 8 Plus",
  "iPhone 8",
  "iPhone 7 Plus",
  "iPhone 7",
  "iPhone 6s Plus",
  "iPhone 6s",
  "Other",
] as const;
export type DeviceModel = (typeof DEVICE_MODELS)[number];

// ─── Repair Types ───────────────────────────────────────────────────────
export const REPAIR_TYPES = [
  "Screen Replacement",
  "Battery Replacement",
  "Water Damage Repair",
  "Charging Port Repair",
  "Camera Repair",
  "Back Glass Replacement",
  "Speaker / Mic Repair",
  "Face ID / Sensors",
  "Software & Update Fix",
  "Button Repair",
  "Other / Not Sure",
] as const;
export type RepairType = (typeof REPAIR_TYPES)[number];

// ─── Dynamic WhatsApp Booking Link Builder ──────────────────────────────
// Builds a structured, URL-encoded WhatsApp message that feeds directly
// into a custom WhatsApp automation web dashboard.

export interface BookingParams {
  /** The selected iPhone model */
  deviceModel?: DeviceModel | string;
  /** The type of repair needed */
  repairType?: RepairType | string;
  /** Optional: customer name for personalization */
  customerName?: string;
  /** Optional: any additional notes */
  additionalNote?: string;
  /** Optional: campaign source tracking (Google Ads, FB Ads, etc.) */
  source?: string;
  /** Optional: deep link UTM params passed through */
  utmCampaign?: string;
  utmMedium?: string;
  utmSource?: string;
}

/**
 * Builds a WhatsApp URL with a structured, machine-parseable message.
 * Example output:
 *   https://wa.me/917022718776?text=📱 Device: iPhone 15 Pro
 *   🔧 Repair: Screen Replacement
 *   👤 Name: Arun
 *   📝 Note: Screen cracked diagonally
 *   📢 Source: Google Ads
 *   ──────────────────
 *   [iFixSpot Auto-Booking]
 */
export function buildWhatsAppLink(params: BookingParams = {}): string {
  const parts: string[] = [];

  if (params.deviceModel) parts.push(`📱 Device: ${params.deviceModel}`);
  if (params.repairType) parts.push(`🔧 Repair: ${params.repairType}`);
  if (params.customerName) parts.push(`👤 Name: ${params.customerName}`);
  if (params.additionalNote) parts.push(`📝 Note: ${params.additionalNote}`);
  if (params.source) parts.push(`📢 Source: ${params.source}`);
  if (params.utmCampaign) parts.push(`📊 Campaign: ${params.utmCampaign}`);
  if (params.utmMedium) parts.push(`📊 Medium: ${params.utmMedium}`);
  if (params.utmSource) parts.push(`📊 UTM Source: ${params.utmSource}`);

  // Separator + auto-booking tag for bot parsing
  parts.push("────────────────");
  parts.push("[iFixSpot Auto-Booking]");

  const message = parts.join("\n");
  return `https://wa.me/${BRAND.phoneIntl}?text=${encodeURIComponent(message)}`;
}

/** Build a link with *any* arbitrary text — backward compatible. */
export function buildWhatsAppLinkLegacy(message: string): string {
  return `https://wa.me/${BRAND.phoneIntl}?text=${encodeURIComponent(message)}`;
}

// ─── Default / Static Links (backward compat) ───────────────────────────
export const WHATSAPP_MESSAGE =
  "Hi iFixSpot 👋 I saw your ad and need to get my iPhone repaired. Can you help?";

export const WHATSAPP_LINK = buildWhatsAppLink(); // dynamic but with no params

export const PHONE_LINK = `tel:+${BRAND.phoneIntl}`;

// ─── Google Maps ────────────────────────────────────────────────────────
// B.R Plaza, CMR Main Rd, HRBR Layout 2nd Block, Kalyan Nagar, Bengaluru
// Coordinates for the exact store location (more reliable than address query).
const STORE_LAT = "13.0358";
const STORE_LNG = "77.6374";
const STORE_ADDRESS_ENCODED =
  "B.R+Plaza,+CMR+Main+Rd,+HRBR+Layout+2nd+Block,+Kalyan+Nagar,+Bengaluru,+Karnataka+560043";

// Coordinates-first embed (most reliable), with zoom 18 to show the street.
export const MAPS_EMBED = `https://www.google.com/maps?q=${STORE_LAT},${STORE_LNG}&z=18&output=embed`;

// Directions link uses the full address so users see the place name.
export const MAPS_DIRECTIONS =
  `https://www.google.com/maps/dir/?api=1&destination=${STORE_ADDRESS_ENCODED}`;

// Public-facing URL (for sharing / social previews).
export const MAPS_URL =
  `https://www.google.com/maps/place/${STORE_ADDRESS_ENCODED}`;

// ─── Social Links ───────────────────────────────────────────────────────
export const SOCIALS = {
  instagram: "https://instagram.com/ifixspot",
  facebook: "https://facebook.com/ifixspot",
  whatsapp: WHATSAPP_LINK,
};

// ─── Nav Links ──────────────────────────────────────────────────────────
export const NAV_LINKS = [
  { label: "Services", href: "#services" },
  { label: "Why Us", href: "#why" },
  { label: "Reviews", href: "#reviews" },
  { label: "Visit Us", href: "#location" },
];
