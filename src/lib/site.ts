// ─── Brand & Contact Config ─────────────────────────────────────────────
// Update these values in one place to change them across the whole site.

export const BRAND = {
  name: "iFixSpot",
    tagline: "Physical iOS Device Care & Device Center",
  phoneLocal: "70227 18776",
  phoneDisplay: "+91 70227 18776",
  phoneIntl: "917022718776",
  area: "iFixSpot Service Center",
    addressLine:
    "B.R Plaza, CMR Main Rd, HRBR Layout 2nd Block, HRBR Layout,\nKalyan Nagar, Bengaluru, Karnataka 560043",
  hours: "Monday – Sunday: 10:00 AM – 9:00 PM",
  email: "support@ifixspot.com",
};

// ─── Device Models ──────────────────────────────────────────────────────
export const DEVICE_MODELS = [
  "iPhone 17 Series",
  "iPhone 16 Series",
  "iPhone 15 Series",
  "iPhone 14 Series",
  "iPhone 13 Series",
  "iPhone 12 Series",
  "iPhone 11 Series",
  "iPhone XS / XS Max",
  "Other iOS Device",
] as const;
export type DeviceModel = (typeof DEVICE_MODELS)[number];

// ─── Repair Types ───────────────────────────────────────────────────────
export const REPAIR_TYPES = [
  "Display / Screen Replacement",
  "Battery Component Replacement",
  "Rear Glass Replacement",
  "Camera Module Service",
  "Charging Port Replacement",
  "Physical Hardware Diagnostics",
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
// Use the verified Google Business listing supplied by the store.
const STORE_ADDRESS_ENCODED =
  "ifixspot+%7C+Mobile+And+laptop+service+center+Bangalore,+B.R+Plaza,+CMR+Main+Rd,+HRBR+Layout+2nd+Block,+HRBR+Layout,+Kalyan+Nagar,+Bengaluru,+Karnataka+560043";

// Business-name query avoids displaying the previous, incorrect coordinates.
export const MAPS_EMBED =
  `https://www.google.com/maps?q=${STORE_ADDRESS_ENCODED}&z=17&output=embed`;

// Directions link uses the full address so users see the place name.
export const MAPS_DIRECTIONS =
  "https://maps.app.goo.gl/hsxQLrK75Pha9Wmk6?g_st=ic";

// Public-facing URL (for sharing / social previews).
export const MAPS_URL =
  "https://maps.app.goo.gl/hsxQLrK75Pha9Wmk6?g_st=ic";

// ─── Social Links ───────────────────────────────────────────────────────
export const SOCIALS = {
  instagram: "https://www.instagram.com/ifixspot/",
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
