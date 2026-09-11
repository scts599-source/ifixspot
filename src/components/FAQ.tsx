import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Minus, HelpCircle } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui";
import { WhatsAppBookingButton } from "@/components/WhatsAppBookingButton";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

type FaqItem = { q: string; a: string };

const FAQS: FaqItem[] = [
  {
    q: "How fast is screen replacement at iFixSpot Kalyan Nagar?",
    a: "Many straightforward screen replacements can be completed during the same visit after an in-person diagnosis. We confirm the expected time and parts availability before starting.",
  },
  {
    q: "Is iFixSpot a walk-in physical store?",
    a: "Yes. iFixSpot operates as a physical walk-in device service center in Kalyan Nagar, Bengaluru, with arranged doorstep visits also available.",
  },
  {
    q: "Does ifixspot provide quality parts service?",
    a: "Yes, we use genuine Apple parts where available, with the applicable warranty documented at the time of service. Every replacement is explained before installation.",
  },
  {
    q: "How long does a typical device service take?",
    a: "Most services are completed within 30 minutes — right in front of your eyes. Complex issues may take up to a few hours, but we'll always give you a clear time estimate before we start.",
  },
  {
    q: "Is my data safe during the service?",
    a: "Absolutely. Your data is 100% safe. We service your device in front of you and never ask for your passcode. We also recommend a quick backup before service as a general best practice.",
  },
  {
    q: "Do you offer a warranty on services?",
    a: "Yes — every service comes with a comprehensive service warranty. If anything goes wrong with the part we've installed, we'll take care of it under warranty, no extra cost.",
  },
  {
    q: "Which device models do you service?",
    a: "We service the iPhone series listed in our booking form, including display, battery, rear glass, camera, and charging-port component work.",
  },
];

function FaqAccordion({ item, index }: { item: FaqItem; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: EASE }}
      className="overflow-hidden rounded-2xl border border-black/5 bg-white transition-shadow hover:shadow-md hover:shadow-black/5"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-4 p-5 text-left sm:p-6"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600">
            <HelpCircle className="h-4 w-4" strokeWidth={2.2} />
          </span>
          <span className="font-display pt-0.5 text-base font-bold leading-snug text-ink sm:text-lg">
            {item.q}
          </span>
        </div>
        <span
          className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-black/10 text-ink transition-all ${
            open ? "rotate-0 bg-ink text-white border-ink" : "bg-white"
          }`}
        >
          {open ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
        </span>
      </button>
      <motion.div
        initial={false}
        animate={{
          height: open ? "auto" : 0,
          opacity: open ? 1 : 0,
        }}
        transition={{ duration: 0.3, ease: EASE }}
        className="overflow-hidden"
      >
        <div className="px-5 pb-5 pl-[3.75rem] pr-5 sm:px-6 sm:pb-6 sm:pl-[4rem]">
          <p className="text-sm leading-relaxed text-zinc-600 sm:text-[15px]">
            {item.a}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function FAQ() {
  return (
    <section id="faq" className="relative scroll-mt-20 bg-zinc-50 py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Frequently Asked"
          title="Answers before you even ask"
          subtitle="Transparent, honest answers about our parts, process, and warranty."
        />

        <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-3">
          {FAQS.map((item, i) => (
            <FaqAccordion key={item.q} item={item} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mt-12 flex flex-col items-center gap-3 rounded-3xl border border-black/5 bg-white p-6 text-center sm:p-8"
        >
          <p className="text-base font-semibold text-ink sm:text-lg">
            Still have a question? Our team responds in under 2 minutes.
          </p>
          <WhatsAppBookingButton
            variant="simple"
            size="lg"
            color="whatsapp"
            label="Chat with our team"
          />
        </motion.div>
      </Container>
    </section>
  );
}
