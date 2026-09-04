import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/utils/cn";
import { NAV_LINKS, WHATSAPP_LINK, BRAND } from "@/lib/site";
import { Button } from "@/components/ui";
import { WhatsAppIcon } from "@/components/icons";

function Logo({ onClick }: { onClick?: () => void }) {
  return (
    <a
      href="#top"
      onClick={onClick}
      className="flex items-center text-ink"
    >
      <span className="font-display text-2xl font-extrabold tracking-tight leading-none">
        i<span className="font-extrabold text-red-600">fix</span>spot
      </span>
    </a>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-black/5 bg-white/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent"
      )}
    >
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:h-[68px] sm:px-8">
        <Logo />

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-3.5 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Button href={WHATSAPP_LINK} variant="whatsapp" size="md">
            <WhatsAppIcon className="h-4 w-4" />
            Book Service
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-ink transition-colors hover:bg-zinc-100 md:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {/* Mobile sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="md:hidden"
          >
            <div className="mx-4 mb-4 rounded-3xl border border-black/5 bg-white p-3 shadow-2xl shadow-black/10">
              <div className="flex flex-col">
                {NAV_LINKS.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="rounded-2xl px-4 py-3 text-base font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
              <div className="mt-2 flex flex-col gap-2 border-t border-black/5 pt-3">
                <Button
                  href={WHATSAPP_LINK}
                  variant="whatsapp"
                  size="lg"
                  className="w-full"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  Book on WhatsApp
                </Button>
                <a
                  href={`tel:+${BRAND.phoneIntl}`}
                  className="w-full rounded-full bg-ink px-7 py-3.5 text-center text-[15px] font-semibold text-white"
                >
                  Call {BRAND.phoneDisplay}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
