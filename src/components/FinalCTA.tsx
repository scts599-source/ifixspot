import { motion } from "framer-motion";
import { CtaPair } from "@/components/ui";
import { Check } from "lucide-react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const POINTS = ["Free diagnosis", "Same-day service", "6-month warranty"];

export default function FinalCTA() {
  return (
    <section className="relative bg-white px-5 py-16 sm:px-8 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-[2.5rem] bg-ink px-6 py-16 text-center text-white sm:px-12 sm:py-20"
      >
        {/* glow accents */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-wa/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-80 w-80 rounded-full bg-wa/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 bg-dot-grid opacity-[0.07]" />

        <div className="relative">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-wa">
            Ready when you are
          </span>
          <h2 className="font-display mx-auto mt-4 max-w-2xl text-balance text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
            Get your device serviced today.
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base text-zinc-300 sm:text-lg">
            One message is all it takes. Tell us your model and the issue — we'll
            handle the rest, fast.
          </p>

          <div className="mt-9 flex justify-center">
            <CtaPair size="lg" />
          </div>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-2">
            {POINTS.map((p) => (
              <span
                key={p}
                className="flex items-center gap-2 text-sm font-medium text-zinc-300"
              >
                <Check className="h-4 w-4 text-wa" strokeWidth={3} />
                {p}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
