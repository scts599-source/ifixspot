import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WHATSAPP_LINK, PHONE_LINK } from "@/lib/site";
import { WhatsAppIcon, PhoneIcon } from "@/components/icons";

export default function FloatingButtons() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Desktop / tablet floating WhatsApp FAB */}
      <AnimatePresence>
        {show && (
          <motion.a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
            initial={{ opacity: 0, scale: 0.6, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="group fixed bottom-5 right-5 z-50 flex items-center gap-3 rounded-full bg-wa py-3 pl-3 pr-5 text-white shadow-2xl shadow-wa/40 transition-colors hover:bg-wa-dark sm:bottom-7 sm:right-7"
          >
            <span className="relative flex h-10 w-10 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/40" />
              <WhatsAppIcon className="relative h-7 w-7" />
            </span>
            <span className="hidden flex-col leading-tight sm:flex">
              <span className="text-sm font-bold">Chat with us</span>
              <span className="text-[11px] text-white/80">
                Reply in ~2 minutes
              </span>
            </span>
          </motion.a>
        )}
      </AnimatePresence>

      {/* Mobile sticky action bar */}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 26 }}
            className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-2 gap-2 border-t border-black/5 bg-white/90 p-3 backdrop-blur-lg sm:hidden"
          >
            <a
              href={PHONE_LINK}
              className="flex items-center justify-center gap-2 rounded-xl bg-ink py-3 text-sm font-semibold text-white"
            >
              <PhoneIcon className="h-4 w-4" />
              Call Now
            </a>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-xl bg-wa py-3 text-sm font-semibold text-white"
            >
              <WhatsAppIcon className="h-4 w-4" />
              WhatsApp
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
