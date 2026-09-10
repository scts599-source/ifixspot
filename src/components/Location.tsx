import { motion } from "framer-motion";
import { MapPin, Clock, Phone, Navigation, Share2, Loader2 } from "lucide-react";
import { useState } from "react";
import { Container, SectionHeading } from "@/components/ui";
import {
  MAPS_DIRECTIONS,
  MAPS_EMBED,
  WHATSAPP_LINK,
  PHONE_LINK,
  BRAND,
  SOCIALS,
} from "@/lib/site";
import { WhatsAppIcon, InstagramIcon, FacebookIcon } from "@/components/icons";

const STOREFRONT_IMAGE = "https://i.ibb.co/YBctBrwW/IMG-3181.jpg";
const STOREFRONT_PAGE = "https://ibb.co/MkcRkXQh";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const SOCIAL_LINKS = [
  { href: SOCIALS.whatsapp, label: "WhatsApp", icon: WhatsAppIcon },
  { href: SOCIALS.instagram, label: "Instagram", icon: InstagramIcon },
  { href: SOCIALS.facebook, label: "Facebook", icon: FacebookIcon },
];

export default function Location() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  return (
    <section
      id="location"
      className="relative scroll-mt-20 overflow-hidden bg-zinc-50 py-20 sm:py-28"
    >
      <Container>
        <SectionHeading
          eyebrow="Visit us"
          title="Find us & drop by anytime"
          subtitle="Walk in for a free diagnosis, or message us first to skip the wait. Search 'iFixSpot' on Google Maps for directions."
        />

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: EASE }}
            className="lg:col-span-3"
          >
            <div className="relative overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm">
              {/* Loading skeleton */}
              {!mapLoaded && !mapError && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-zinc-100">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-wa-dark" />
                    <p className="text-sm font-medium text-zinc-500">
                      Loading map...
                    </p>
                  </div>
                </div>
              )}

              {/* Error fallback */}
              {mapError && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-100 p-8 text-center">
                  <MapPin className="h-12 w-12 text-zinc-400" />
                  <p className="mt-3 text-base font-semibold text-ink">
                    Map unavailable
                  </p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Please open in Google Maps directly
                  </p>
                  <a
                    href={MAPS_DIRECTIONS}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white"
                  >
                    <Navigation className="h-4 w-4" />
                    Open in Google Maps
                  </a>
                </div>
              )}

              {/* The actual iframe */}
              <iframe
                title="iFixSpot location on Google Maps"
                src={MAPS_EMBED}
                className="h-[320px] w-full sm:h-[440px]"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; geolocation"
                allowFullScreen
                onLoad={() => setMapLoaded(true)}
                onError={() => setMapError(true)}
              />
            </div>
          </motion.div>

          {/* Physical storefront and details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            className="lg:col-span-2"
          >
            <div className="flex h-full flex-col gap-6 rounded-3xl border border-black/5 bg-white p-7 shadow-sm">
              <a href={STOREFRONT_PAGE} target="_blank" rel="noopener noreferrer" className="group overflow-hidden rounded-2xl border border-zinc-100 bg-zinc-100">
                <img src={STOREFRONT_IMAGE} alt="iFixSpot physical storefront at B.R Plaza" className="h-48 w-full object-cover transition-transform group-hover:scale-105" />
                <span className="block px-3 py-2 text-xs font-semibold text-zinc-500">View physical storefront photo</span>
              </a>
              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-ink">
                  <MapPin className="h-5 w-5" strokeWidth={2} />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-ink">
                    {BRAND.area}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-zinc-500 whitespace-pre-line">
                    {BRAND.addressLine}
                  </p>
                  <a
                    href={MAPS_DIRECTIONS}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1.5 text-sm font-semibold text-wa-dark hover:underline"
                  >
                    <Navigation className="h-3.5 w-3.5" />
                    Get directions
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-ink">
                  <Clock className="h-5 w-5" strokeWidth={2} />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-ink">
                    Opening Hours
                  </h3>
                  <p className="mt-1 text-sm text-zinc-500">{BRAND.hours}</p>
                  <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs font-semibold text-wa-dark">
                    <span className="h-2 w-2 rounded-full bg-wa" />
                    Open now
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-ink">
                  <Phone className="h-5 w-5" strokeWidth={2} />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold text-ink">
                    Call / WhatsApp
                  </h3>
                  <a
                    href={PHONE_LINK}
                    className="mt-1 block text-sm font-semibold text-ink hover:text-wa-dark"
                  >
                    {BRAND.phoneDisplay}
                  </a>
                </div>
              </div>

              {/* quick connect */}
              <div className="mt-auto border-t border-zinc-100 pt-5">
                <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  <Share2 className="h-3.5 w-3.5" />
                  Connect with us
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  {SOCIAL_LINKS.map((s) => (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-1.5 rounded-2xl border border-black/5 bg-zinc-50 py-3 text-zinc-600 transition-all hover:-translate-y-0.5 hover:border-black/10 hover:bg-ink hover:text-white"
                    >
                      <s.icon className="h-5 w-5" />
                      <span className="text-[11px] font-semibold">{s.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-8 text-center text-sm text-zinc-400"
        >
          Prefer doorstep pickup?{" "}
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-ink underline underline-offset-4 decoration-wa decoration-2 hover:text-wa-dark"
          >
            Message us to arrange it.
          </a>
        </motion.p>
      </Container>
    </section>
  );
}
