import { motion } from "framer-motion";
import {
  BadgeCheck,
  Zap,
  ShieldCheck,
  Users,
  Wallet,
  Stethoscope,
} from "lucide-react";
import repairImg from "@/assets/repair-work.jpg";
import { Container } from "@/components/ui";

const REASONS = [
  {
    icon: BadgeCheck,
    title: "Premium Quality Parts",
    desc: "We use genuine Apple parts where available, with warranty coverage documented at service.",
  },
  {
    icon: ShieldCheck,
    title: "6-Month Service Warranty",
    desc: "Every service is backed by a written warranty. Total peace of mind.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    desc: "Most services completed in 30 minutes while you wait. Walk in, walk out happy.",
  },
  {
    icon: Users,
    title: "Certified Technicians",
    desc: "Specialists trained on iOS devices with years of hands-on experience.",
  },
  {
    icon: Wallet,
    title: "Competitive Pricing",
    desc: "Honest, upfront pricing. Transparent quotes with no hidden fees.",
  },
  {
    icon: Stethoscope,
    title: "Free Diagnosis",
    desc: "We inspect your device and tell you exactly what's wrong — at no cost.",
  },
];

const STATS = [
  { value: "10K+", label: "Devices serviced" },
  { value: "4.9★", label: "Average rating" },
  { value: "30m", label: "Avg. service time" },
  { value: "6-mo", label: "Warranty" },
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function WhyChooseUs() {
  return (
    <section id="why" className="relative scroll-mt-20 overflow-hidden bg-ink py-20 text-white sm:py-28">
      {/* ambient glow */}
      <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-wa/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 bottom-0 h-96 w-96 rounded-full bg-wa/10 blur-3xl" />

      <Container className="relative">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, x: -28 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative overflow-hidden rounded-[2rem] ring-1 ring-white/10">
              <img
                src={repairImg}
                alt="iFixSpot technician servicing a premium device with precision tools"
                width={1200}
                height={900}
                className="aspect-[4/3] w-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-linear-to-t from-ink/70 via-transparent to-transparent" />
            </div>

            {/* stat overlay */}
            <div className="absolute inset-x-4 bottom-4 grid grid-cols-4 gap-2 rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-md">
              {STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="font-display text-lg font-extrabold sm:text-xl">
                    {s.value}
                  </div>
                  <div className="mt-0.5 text-[10px] leading-tight text-zinc-300 sm:text-[11px]">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Reasons side */}
          <div className="order-1 lg:order-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-wa">
                Why iFixSpot
              </span>
              <h2 className="font-display mt-4 max-w-md text-balance text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl">
                Trusted by thousands. Loved for the details.
              </h2>
              <p className="mt-4 max-w-md text-zinc-400">
              We obsess over doing your service right the first time — with
              premium parts, fair prices and a warranty that actually means
              something.
              </p>
            </motion.div>

            <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
              {REASONS.map((r, i) => (
                <motion.div
                  key={r.title}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: (i % 2) * 0.08, ease: EASE }}
                  className="flex gap-3.5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-wa ring-1 ring-white/10">
                    <r.icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-bold">{r.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                      {r.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
