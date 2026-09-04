import { Routes, Route } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import WhyChooseUs from "@/components/WhyChooseUs";
import FAQ from "@/components/FAQ";
import Reviews from "@/components/Reviews";
import Location from "@/components/Location";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";
import FloatingButtons from "@/components/FloatingButtons";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";

/**
 * Home — the main landing page with all sections.
 * Focused flow: Hero (form) → Services → Trust → FAQ → Reviews → Location → Final CTA
 */
function Home() {
  return (
    <>
      <Hero />
      <Services />
      <WhyChooseUs />
      <FAQ />
      <Reviews />
      <Location />
      <FinalCTA />
    </>
  );
}

/**
 * 404 — Fallback for any unknown route.
 * Reuses the same layout; visitors are funneled to the booking flow.
 */
function NotFound() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center text-center px-5">
      <h1 className="font-display text-6xl font-extrabold text-ink">404</h1>
      <p className="mt-4 text-lg text-zinc-500">Page not found</p>
      <a
        href="/"
        className="mt-6 rounded-full bg-ink px-7 py-3.5 text-[15px] font-semibold text-white"
      >
        Go back home
      </a>
    </section>
  );
}

export default function App() {
  return (
    <div className="relative min-h-screen bg-white pb-20 sm:pb-0">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <FloatingButtons />
    </div>
  );
}
