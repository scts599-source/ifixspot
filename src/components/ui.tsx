import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/utils/cn";
import { PHONE_LINK, BRAND } from "@/lib/site";
import { PhoneIcon } from "@/components/icons";
import { WhatsAppBookingButton } from "@/components/WhatsAppBookingButton";

/* ------------------------------- Container ------------------------------- */
export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)}>
      {children}
    </div>
  );
}

/* --------------------------------- Pill ---------------------------------- */
export function Pill({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-zinc-600 backdrop-blur",
        className
      )}
    >
      {children}
    </span>
  );
}

/* -------------------------------- Buttons -------------------------------- */
type BtnProps = {
  className?: string;
  children: ReactNode;
  href: string;
  variant?: "whatsapp" | "dark" | "light";
  size?: "md" | "lg";
  external?: boolean;
};

const base =
  "group inline-flex items-center justify-center gap-2.5 rounded-full font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-900 active:scale-[0.98]";

const sizes = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-[15px]",
};

const variants = {
  whatsapp:
    "bg-wa text-white shadow-lg shadow-wa/30 hover:bg-wa-dark hover:shadow-xl hover:shadow-wa/40 hover:-translate-y-0.5",
  dark: "bg-ink text-white shadow-lg shadow-black/20 hover:bg-ink-soft hover:-translate-y-0.5",
  light:
    "bg-white text-ink ring-1 ring-black/10 hover:bg-zinc-50 hover:ring-black/20 hover:-translate-y-0.5",
};

export function Button({
  className,
  children,
  href,
  variant = "dark",
  size = "md",
  external = true,
}: BtnProps) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={cn(base, sizes[size], variants[variant], className)}
    >
      {children}
    </a>
  );
}

/**
 * CtaPair — the primary call-to-action pair used in Hero & Final CTA.
 * Uses the dynamic WhatsAppBookingButton (simple mode) so the URL
 * adapts if deviceModel/repairType are passed in.
 */
export function CtaPair({
  size = "lg",
  waLabel = "Book on WhatsApp",
  callLabel = `Call ${BRAND.phoneDisplay}`,
  deviceModel,
  repairType,
}: {
  size?: "md" | "lg";
  waLabel?: string;
  callLabel?: string;
  deviceModel?: string;
  repairType?: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <WhatsAppBookingButton
        variant="simple"
        size={size}
        color="whatsapp"
        label={waLabel}
        deviceModel={deviceModel}
        repairType={repairType}
      />
      <Button href={PHONE_LINK} variant="dark" size={size} external={false}>
        <PhoneIcon className="h-4 w-4" />
        {callLabel}
      </Button>
    </div>
  );
}

/* ----------------------------- Section header ---------------------------- */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "items-center text-center" : "items-start",
        className
      )}
    >
      {eyebrow && (
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-wa-dark">
          {eyebrow}
        </span>
      )}
      <h2 className="font-display max-w-2xl text-balance text-3xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-4xl md:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "max-w-xl text-base leading-relaxed text-zinc-500 sm:text-lg",
            align === "center" && "mx-auto"
          )}
        >
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}
