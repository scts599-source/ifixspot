import { motion } from "framer-motion";
import {
  Smartphone,
  BatteryCharging,
  Droplets,
  Plug,
  Camera,
  Layers,
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
    title: "Display / Screen Replacement",
    desc: "Physical display replacement with transparent diagnosis and parts availability confirmed before service.",
    msg: "I need an iPhone display or screen replacement. What's the price?",
  },
  {
    icon: BatteryCharging,
    title: "Battery Component Replacement",
    desc: "Physical battery component replacement after an in-person device assessment.",
    msg: "My iPhone battery is draining fast. I'd like a replacement.",
  },
  {
    icon: Droplets,
    title: "Rear Glass Replacement",
    desc: "Physical rear glass replacement with the scope and risks explained before work begins.",
    msg: "I need an iPhone rear glass replacement. What's the price?",
  },
  {
    icon: Plug,
    title: "Charging Port Replacement",
    desc: "Physical charging-port inspection and replacement for confirmed component faults.",
    msg: "My iPhone isn't charging properly. Can you fix the port?",
  },
  {
    icon: Camera,
    title: "Camera Module Service",
    desc: "Physical camera-module diagnosis and replacement for confirmed hardware faults.",
    msg: "My iPhone camera isn't working. Can you repair it?",
  },
  {
    icon: Layers,
    title: "Physical Device Diagnostics",
    desc: "In-person component diagnostics at the Bangalore store or during an arranged doorstep visit.",
    msg: "I need an in-person physical device diagnosis. Please share availability.",
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
              Screen, Battery &amp; Back Glass Replacement Near{" "}
              <span className="dki-loc">Kalyan Nagar</span>
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
