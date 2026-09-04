import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Container, SectionHeading } from "@/components/ui";

type Review = {
  name: string;
  meta: string;
  initials: string;
  text: string;
};

const REVIEWS: Review[] = [
  {
    name: "Aarav Sharma",
    meta: "iPhone 15 Pro · Screen",
    initials: "AS",
    text: "Cracked my screen in the morning, walked in and it was fixed in 25 minutes. Looks brand new. Super professional and fair price!",
  },
  {
    name: "Priya Nair",
    meta: "iPhone 13 · Battery",
    initials: "PN",
    text: "My battery was dying within hours. Got a premium replacement and the phone lasts all day again. The service warranty gave me real confidence.",
  },
  {
    name: "Rohan Mehta",
    meta: "iPhone 14 · Water damage",
    initials: "RM",
    text: "Dropped my phone in water and thought it was gone. iFixSpot recovered it completely — even my photos were safe. Lifesavers.",
  },
  {
    name: "Sneha Kapoor",
    meta: "iPhone 12 · Charging port",
    initials: "SK",
    text: "Booked on WhatsApp, got a quote instantly, and the service was done same day. No pushy upselling, just honest care.",
  },
  {
    name: "Vikram Reddy",
    meta: "iPhone 16 Pro Max · Back glass",
    initials: "VR",
    text: "Shattered back glass replaced flawlessly. You genuinely can't tell it was ever damaged. Highly recommend iFixSpot.",
  },
  {
    name: "Ananya Iyer",
    meta: "iPhone 11 · Camera",
    initials: "AI",
    text: "Front camera went black. Fixed quickly and cheaply. The team is friendly and really knows their stuff. 5 stars!",
  },
];

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function Reviews() {
  return (
    <section id="reviews" className="relative scroll-mt-20 bg-white py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Loved by customers"
          title="Don't just take our word for it"
          subtitle="Real reviews from real device owners who trusted ifixspot with their premium devices."
        />

        {/* rating highlight */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE }}
          className="mx-auto mt-10 flex w-fit items-center gap-4 rounded-full border border-black/5 bg-zinc-50 px-6 py-3"
        >
          <div className="flex items-center gap-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="h-5 w-5 fill-current" />
            ))}
          </div>
          <span className="font-display text-lg font-extrabold text-ink">4.9</span>
          <span className="text-sm text-zinc-500">/ 5 · 2,400+ reviews</span>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <motion.figure
              key={r.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: EASE }}
              className="relative flex flex-col rounded-3xl border border-black/5 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg hover:shadow-black/5"
            >
              <Quote className="absolute right-6 top-6 h-7 w-7 text-zinc-100" />
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-zinc-600">
                "{r.text}"
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3 border-t border-zinc-100 pt-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ink text-sm font-bold text-white">
                  {r.initials}
                </span>
                <span>
                  <span className="block text-sm font-bold text-ink">
                    {r.name}
                  </span>
                  <span className="block text-xs text-zinc-400">{r.meta}</span>
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
