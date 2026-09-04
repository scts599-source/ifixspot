import { motion } from "framer-motion";
import {
  Smartphone,
  BatteryCharging,
  Droplets,
  Plug,
  Camera,
  Layers,
  Volume2,
  Cpu,
  ScanFace,
  ArrowUpRight,
} from "lucide-react";
import { Container, SectionHeading } from "@/components/ui";
import { WhatsAppIcon } from "@/components/icons";
import { BRAND } from "@/lib/site";

type Service = {
  icon: typeof Smartphone;
  title: string;
  desc: string;
  msg: string;
};

const SERVICES: Service[] = [
  {
    icon: Smartphone,
    title: "Screen Replacement",
    desc: "Cracked, blank or unresponsive display restored to original quality.",
    msg: "I need an iPhone screen replacement. What's the price?",
  },
  {
    icon: BatteryCharging,
    title: "Battery Replacement",
    desc: "Draining fast or shutting down? Premium battery replacement, back to full health.",
    msg: "My iPhone battery is draining fast. I'd like a replacement.",
  },
  {
    icon: Droplets,
    title: "Water Damage Restoration",
    desc: "Dropped in water? We clean, dry and recover your device & data.",
    msg: "My iPhone got water damaged. Can you recover it?",
  },
  {
    icon: Plug,
    title: "Charging Port Service",
    desc: "Not charging or loose connection? Port service or replacement.",
    msg: "My iPhone isn't charging properly. Can you fix the port?",
  },
  {
    icon: Camera,
    title: "Camera Service",
    desc: "Blurry, black or shaky camera? Front & rear camera solutions.",
    msg: "My iPhone camera isn't working. Can you repair it?",
  },
  {
    icon: Layers,
    title: "Back Glass",
    desc: "Shattered back glass replaced cleanly — like it never happened.",
    msg: "I need my iPhone back glass replaced.",
  },
  {
    icon: Volume2,
    title: "Speaker & Mic",
    desc: "Can't hear calls or muffled audio? Speaker, mic & earpiece care.",
    msg: "My iPhone speaker/mic has issues. Please help.",
  },
  {
    icon: ScanFace,
    title: "Face ID / Sensors",
    desc: "Face ID not working? TrueDepth & sensor module service.",
    msg: "My iPhone Face ID stopped working. Can you fix it?",
  },
  {
    icon: Cpu,
    title: "Software & Updates",
    desc: "Stuck on Apple logo, iCloud, frozen or update issues resolved.",
    msg: "My iPhone has a software / boot issue. Can you help?",
  },
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function wa(message: string) {
  return `https://wa.me/${BRAND.phoneIntl}?text=${encodeURIComponent(message)}`;
}

export default function Services() {
  return (
    <section id="services" className="relative scroll-mt-20 bg-white py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="What we service"
          title={
            <>
              Whatever issue your device faces,
              <br className="hidden sm:block" /> we have it covered.
            </>
          }
          subtitle="Pick your issue and get an instant quote on WhatsApp. Most services done the same day."
        />

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <motion.a
              key={s.title}
              href={wa(s.msg)}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: EASE }}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-black/5 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-black/10 hover:shadow-xl hover:shadow-black/5"
            >
              {/* hover wash */}
              <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-wa/[0.06] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-ink transition-colors duration-300 group-hover:bg-ink group-hover:text-white">
                  <s.icon className="h-6 w-6" strokeWidth={1.9} />
                </span>
                <ArrowUpRight className="h-5 w-5 text-zinc-300 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
              </div>

              <h3 className="font-display relative mt-5 text-lg font-bold text-ink">
                {s.title}
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-zinc-500">
                {s.desc}
              </p>

              <span className="relative mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-wa-dark">
                <WhatsAppIcon className="h-4 w-4" />
                Get a quote
              </span>
            </motion.a>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-zinc-400">
          Don&apos;t see your issue? Just message us —{" "}
          <a
            href={wa("Hi iFixSpot, I have an iOS device issue not listed here.")}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-ink underline underline-offset-4 decoration-wa decoration-2 hover:text-wa-dark"
          >
            we care for almost everything.
          </a>
        </p>
      </Container>
    </section>
  );
}
