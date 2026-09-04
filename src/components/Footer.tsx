import { NAV_LINKS, BRAND, SOCIALS, WHATSAPP_LINK, PHONE_LINK } from "@/lib/site";
import {
  WhatsAppIcon,
  InstagramIcon,
  FacebookIcon,
  PhoneIcon,
} from "@/components/icons";

const SERVICES = [
  "Screen Replacement",
  "Battery Replacement",
  "Water Damage",
  "Charging Port",
  "Camera Service",
  "Software Issues",
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink text-zinc-400">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-10 px-5 py-14 sm:px-8 md:grid-cols-4">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center text-white">
            <span className="font-display text-2xl font-extrabold tracking-tight leading-none">
              i<span className="font-extrabold text-red-500">fix</span>spot
            </span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed">
            Your trusted premium device care experts. Quality parts, fast service and a
            warranty you can count on.
          </p>
          <div className="mt-5 flex items-center gap-2.5">
            {[
              { href: SOCIALS.whatsapp, label: "WhatsApp", Icon: WhatsAppIcon },
              {
                href: SOCIALS.instagram,
                label: "Instagram",
                Icon: InstagramIcon,
              },
              { href: SOCIALS.facebook, label: "Facebook", Icon: FacebookIcon },
            ].map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-zinc-300 transition-colors hover:bg-wa hover:text-white"
              >
                <Icon className="h-[18px] w-[18px]" />
              </a>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-white">
            Explore
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="transition-colors hover:text-white"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wide text-white">
            Services
          </h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {SERVICES.map((s) => (
              <li key={s}>
                <a href={WHATSAPP_LINK} className="transition-colors hover:text-white">
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="col-span-2 md:col-span-1">
          <h4 className="text-sm font-bold uppercase tracking-wide text-white">
            Get in touch
          </h4>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 transition-colors hover:text-white"
              >
                <WhatsAppIcon className="h-4 w-4 text-wa" />
                WhatsApp us
              </a>
            </li>
            <li>
              <a
                href={PHONE_LINK}
                className="flex items-center gap-2.5 transition-colors hover:text-white"
              >
                <PhoneIcon className="h-4 w-4 text-wa" />
                {BRAND.phoneDisplay}
              </a>
            </li>
            <li className="text-zinc-500">{BRAND.hours}</li>
          </ul>
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-wa px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-wa-dark"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Book a service
          </a>
        </div>
      </div>

      {/* Critical Google Ads compliance disclaimer */}
      <div className="border-t border-white/10">
        <div className="mx-auto w-full max-w-6xl px-5 py-4 sm:px-8">
          <p className="text-[11px] leading-relaxed text-zinc-500">
            <strong className="text-zinc-400">Disclaimer:</strong>{" "}
            {BRAND.name} is an independent, third-party device service provider.
            We are not affiliated with, authorized by, endorsed by, or sponsored
            by Apple Inc. or any other device manufacturer. All brand names,
            trademarks, and logos mentioned on this website are the property of
            their respective owners and are used solely for identification
            purposes.
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-5 py-6 text-xs text-zinc-500 sm:flex-row sm:px-8">
          <p>
            © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="/privacy-policy" className="hover:text-white transition-colors">
              Privacy Policy
            </a>
            <span className="text-zinc-700">·</span>
            <a href="/terms-of-service" className="hover:text-white transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
