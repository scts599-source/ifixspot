import { useState, useMemo } from "react";
import { motion, type Variants } from "framer-motion";
import { Star, ShieldCheck, Clock, Check, Phone, ChevronDown, Lock } from "lucide-react";
import heroPhone from "@/assets/hero-phone.jpg";
import { Pill } from "@/components/ui";
import { BRAND, GOOGLE_SHEET_WEBHOOK_URL, PHONE_LINK } from "@/lib/site";

// ─── Types ───────────────────────────────────────────────────────────────
type DeviceSeries = "" | "iPhone 17 Series" | "iPhone 16 Series" | "iPhone 15 Series" | "iPhone 14 Series" | "iPhone 13 Series" | "iPhone 12 Series" | "iPhone 11 Series" | "iPhone XS / XS Max" | "Other iOS Device";
type IssueType = "" | "Display / Screen Replacement" | "Battery Component Replacement" | "Rear Glass Replacement" | "Camera Module Service" | "Charging Port Replacement" | "Physical Device Diagnostics";

const DEVICE_OPTIONS: DeviceSeries[] = ["iPhone 17 Series", "iPhone 16 Series", "iPhone 15 Series", "iPhone 14 Series", "iPhone 13 Series", "iPhone 12 Series", "iPhone 11 Series", "iPhone XS / XS Max", "Other iOS Device"];
const ISSUE_OPTIONS: IssueType[] = ["Display / Screen Replacement", "Battery Component Replacement", "Rear Glass Replacement", "Camera Module Service", "Charging Port Replacement", "Physical Device Diagnostics"];

// ─── Animations ──────────────────────────────────────────────────────────
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
function stagger(i: number): Variants {
  return {
    hidden: { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, delay: i * 0.08, ease: EASE } },
  };
}

const trust = [
  { icon: Star, label: "4.9★ Google" },
  { icon: Clock, label: "30-min service" },
  { icon: ShieldCheck, label: "6-month warranty" },
];

export default function Hero() {
  const [device, setDevice] = useState<DeviceSeries>("");
  const [issue, setIssue] = useState<IssueType>("");
  const [mobile, setMobile] = useState("");
  const [pincode, setPincode] = useState("");
  const [errors, setErrors] = useState<{ mobile?: string; pincode?: string }>({});
  const [reserved, setReserved] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => device && issue && mobile.length === 10 && pincode.length >= 4,
    [device, issue, mobile, pincode]
  );

  function validate(): boolean {
    const next: typeof errors = {};
    if (!/^\d{10}$/.test(mobile)) next.mobile = "Enter a valid 10-digit mobile number";
    if (!/^\d{4,8}$/.test(pincode)) next.pincode = "Enter a valid pincode";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({
          device,
          issue,
          mobile,
          pincode,
          source: "Hero Booking Form",
        }),
      });
    } catch (err) {
      console.error("Webhook error:", err);
    } finally {
      setIsSubmitting(false);
      setReserved(true);
    }
  }

  return (
    <section
      id="top"
      className="relative overflow-hidden bg-white pt-28 pb-16 sm:pt-32 lg:pt-36"
    >
      {/* soft background accents */}
      <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-60" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-linear-to-b from-red-100/40 to-transparent blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-8">
        {/* ─── Copy ─── */}
        <div className="flex flex-col items-start">
          <motion.div variants={stagger(0)} initial="hidden" animate="show">
            <Pill className="border-red-100 bg-red-50/60 text-red-700">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" />
              </span>
              📍 Physical Store at B.R Plaza, CMR Main Rd
            </Pill>
          </motion.div>

          <motion.h1
            variants={stagger(1)}
            initial="hidden"
            animate="show"
            className="font-display mt-5 text-balance text-[2.6rem] font-extrabold leading-[1.02] tracking-tight text-ink sm:text-6xl"
          >
            Walk-In & Doorstep iOS Device Service in Bangalore
          </motion.h1>

          <motion.p
            variants={stagger(2)}
            initial="hidden"
            animate="show"
            className="mt-6 max-w-md text-lg leading-relaxed text-zinc-500"
          >
            Physical component replacement and diagnostics performed in front of you. 100% data privacy preserved.
          </motion.p>

          {/* ─── The Booking Form ─── */}
          <motion.div
            variants={stagger(3)}
            initial="hidden"
            animate="show"
            className="mt-8 w-full max-w-md"
          >
            {!reserved ? (
              <form
                onSubmit={handleSubmit}
                className="overflow-hidden rounded-3xl border border-black/5 bg-white p-5 shadow-xl shadow-black/5 sm:p-6"
              >
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-display text-lg font-extrabold text-ink">
                      Book your service
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Get an instant price · No spam
                    </p>
                  </div>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <ShieldCheck className="h-5 w-5" strokeWidth={2} />
                  </span>
                </div>

                <div className="space-y-3">
                  {/* Device Series */}
                  <div className="relative">
                    <select
                      value={device}
                      onChange={(e) => setDevice(e.target.value as DeviceSeries)}
                      className="peer w-full appearance-none rounded-xl border border-zinc-200 bg-zinc-50/60 px-4 py-3 pr-10 text-sm text-ink outline-none transition-all focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/20"
                    >
                      <option value="">Select Device Model</option>
                      {DEVICE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  </div>

                  {/* Issue Type */}
                  <div className="relative">
                    <select
                      value={issue}
                      onChange={(e) => setIssue(e.target.value as IssueType)}
                      className="peer w-full appearance-none rounded-xl border border-zinc-200 bg-zinc-50/60 px-4 py-3 pr-10 text-sm text-ink outline-none transition-all focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/20"
                    >
                      <option value="">Select Issue</option>
                      {ISSUE_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={mobile}
                      onChange={(e) =>
                        setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                      }
                      placeholder="Mobile Number (10 digits)"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50/60 px-4 py-3 text-sm text-ink outline-none transition-all placeholder:text-zinc-400 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/20"
                    />
                    {errors.mobile && (
                      <p className="mt-1 text-xs text-red-600">{errors.mobile}</p>
                    )}
                  </div>

                  {/* Pincode */}
                  <div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      maxLength={8}
                      value={pincode}
                      onChange={(e) =>
                        setPincode(e.target.value.replace(/\D/g, "").slice(0, 8))
                      }
                      placeholder="Pincode"
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50/60 px-4 py-3 text-sm text-ink outline-none transition-all placeholder:text-zinc-400 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-500/20"
                    />
                    {errors.pincode && (
                      <p className="mt-1 text-xs text-red-600">{errors.pincode}</p>
                    )}
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className="group mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3.5 text-[15px] font-bold text-white shadow-lg shadow-red-600/30 transition-all hover:bg-red-700 hover:shadow-xl hover:shadow-red-600/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-500 disabled:shadow-none"
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Securing Slot...
                      </span>
                    ) : (
                      <>
                        <span>⚡</span>
                        Check Price &amp; Dispatch Technician
                      </>
                    )}
                  </button>
                </div>

                <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-zinc-400">
                  <Lock className="h-3 w-3" />
                  Your details are secure · We never share your info
                </p>
              </form>
            ) : (
              /* ─── Success State ─── */
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="overflow-hidden rounded-3xl border border-red-100 bg-white p-6 shadow-xl shadow-red-600/10 sm:p-8"
              >
                <div className="flex flex-col items-center text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600 ring-4 ring-green-100">
                    <Check className="h-8 w-8" strokeWidth={2.5} />
                  </span>
                  <h3 className="font-display mt-5 text-2xl font-extrabold text-ink sm:text-3xl">
                    Slot Reserved!
                  </h3>
                  <p className="mt-2 max-w-xs text-sm text-zinc-600 sm:text-base">
                    Call now to confirm dispatch:
                  </p>

                  <a
                    href={PHONE_LINK}
                    className="pulse-red-strong mt-6 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-red-600 px-6 py-5 text-base font-extrabold text-white shadow-xl shadow-red-600/40 transition-transform hover:scale-[1.02] active:scale-95 sm:text-lg"
                  >
                    <Phone className="h-5 w-5 sm:h-6 sm:w-6" strokeWidth={2.2} />
                    📞 Tap to Call Technician Now
                  </a>

                  <p className="mt-4 text-xs text-zinc-500">
                    {BRAND.phoneDisplay} · Available 10 AM – 9 PM
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* ─── Trust row ─── */}
          <motion.div
            variants={stagger(4)}
            initial="hidden"
            animate="show"
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3"
          >
            {trust.map((t) => (
              <div
                key={t.label}
                className="flex items-center gap-2 text-sm font-semibold text-zinc-600"
              >
                <t.icon className="h-5 w-5 text-red-600" strokeWidth={2.2} />
                {t.label}
              </div>
            ))}
          </motion.div>
        </div>

        {/* ─── Visual ─── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          <div className="relative overflow-hidden rounded-[2.25rem] border border-black/5 bg-linear-to-b from-zinc-50 to-zinc-100 shadow-2xl shadow-black/15">
            <img
              src={heroPhone}
              alt="Premium iOS device care at ifixspot"
              className="aspect-[4/5] w-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/30 to-transparent" />
          </div>

          {/* Floating rating card */}
          <motion.div
            initial={{ opacity: 0, x: -18, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: EASE }}
            className="absolute -left-3 top-10 hidden rounded-2xl border border-black/5 bg-white/90 px-4 py-3 shadow-xl shadow-black/10 backdrop-blur sm:block"
          >
            <div className="flex items-center gap-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>
            <p className="mt-1 text-xs font-semibold text-zinc-700">
              2,400+ happy customers
            </p>
          </motion.div>

          {/* Floating "Live service" card */}
          <motion.div
            initial={{ opacity: 0, x: 18, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 0.6, delay: 0.75, ease: EASE }}
            className="absolute -bottom-5 -right-2 flex items-center gap-3 rounded-2xl border border-black/5 bg-white/90 px-4 py-3 shadow-xl shadow-black/10 backdrop-blur sm:-right-4"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 text-white">
              <ShieldCheck className="h-5 w-5" strokeWidth={2.2} />
            </span>
            <span className="leading-tight">
              <span className="block text-[13px] font-bold text-ink">
                100% Data Safe
              </span>
              <span className="block text-[11px] text-zinc-500">
                Serviced in front of you →
              </span>
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* micro guarantee strip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.6 }}
        className="relative mx-auto mt-16 flex w-full max-w-6xl flex-wrap items-center justify-center gap-x-7 gap-y-2 px-5 text-sm font-medium text-zinc-400 sm:px-8"
      >
        {["No service, no charge", "Premium quality parts", "Data stays private"].map(
          (g, i) => (
            <span key={g} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-red-600" strokeWidth={3} />
              {g}
              {i < 2 && (
                <span className="ml-7 hidden h-1 w-1 rounded-full bg-zinc-300 sm:inline-block" />
              )}
            </span>
          )
        )}
      </motion.div>
    </section>
  );
}

// tiny lock helper so we don't pull from lucide unnecessarily
function Lock({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
