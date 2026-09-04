import { Link } from "react-router-dom";
import { Container } from "@/components/ui";
import { BRAND, PHONE_LINK, WHATSAPP_LINK } from "@/lib/site";

export default function TermsOfService() {
  return (
    <section className="bg-white py-16 sm:py-24">
      <Container className="max-w-3xl">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-500 hover:text-ink"
        >
          ← Back to home
        </Link>

        <h1 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Terms of Service
        </h1>
        <p className="mt-3 text-sm text-zinc-500">
          Last updated: January {new Date().getFullYear()}
        </p>

        <div className="prose prose-zinc mt-10 max-w-none text-[15px] leading-relaxed text-zinc-700">
          <p>
            Welcome to <strong>{BRAND.name}</strong>. By using our services or
            website, you agree to these terms. Please read them carefully.
          </p>

          <h2 className="mt-8 font-display text-xl font-bold text-ink">
            1. Services Provided
          </h2>
          <p>
            {BRAND.name} provides third-party premium device care, component
            replacement, diagnostics, and restoration services for iOS and other
            mobile devices. We are an independent service provider and are not
            affiliated with, endorsed by, or sponsored by any device
            manufacturer.
          </p>

          <h2 className="mt-8 font-display text-xl font-bold text-ink">
            2. Booking &amp; Dispatch
          </h2>
          <p>
            When you submit a booking through our form, you authorize us to
            contact you on the provided mobile number to confirm the service
            slot, pricing, and dispatch details. We reserve the right to decline
            service if device damage is beyond reasonable repair.
          </p>

          <h2 className="mt-8 font-display text-xl font-bold text-ink">
            3. Service Warranty
          </h2>
          <p>
            All services come with a <strong>6-month service warranty</strong>{" "}
            covering the parts we install and the workmanship. The warranty does
            not cover:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Physical damage caused after the service is completed</li>
            <li>Water damage occurring after service</li>
            <li>Issues caused by third-party modifications</li>
            <li>Pre-existing issues not covered during diagnosis</li>
          </ul>

          <h2 className="mt-8 font-display text-xl font-bold text-ink">
            4. Data &amp; Privacy
          </h2>
          <p>
            We do not access, copy, or transfer data on your device. However, we
            strongly recommend backing up your data before any service. We are
            not responsible for any data loss that occurs despite reasonable
            precautions.
          </p>

          <h2 className="mt-8 font-display text-xl font-bold text-ink">
            5. Pricing &amp; Payment
          </h2>
          <p>
            Pricing is provided after a free diagnosis. Final pricing may vary
            based on device model and part availability. Payment is due upon
            successful completion of service.
          </p>

          <h2 className="mt-8 font-display text-xl font-bold text-ink">
            6. Limitation of Liability
          </h2>
          <p>
            {BRAND.name}'s total liability is limited to the cost of the service
            rendered. We are not liable for any indirect, incidental, or
            consequential damages.
          </p>

          <h2 className="mt-8 font-display text-xl font-bold text-ink">
            7. Changes to These Terms
          </h2>
          <p>
            We may update these terms from time to time. Continued use of our
            services constitutes acceptance of the updated terms.
          </p>

          <h2 className="mt-8 font-display text-xl font-bold text-ink">
            8. Contact Us
          </h2>
          <ul className="mt-2 list-none space-y-1 pl-0">
            <li>📞 Phone: <a href={PHONE_LINK} className="font-semibold text-ink hover:text-red-600">{BRAND.phoneDisplay}</a></li>
            <li>💬 WhatsApp: <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="font-semibold text-ink hover:text-red-600">Chat with us</a></li>
            <li>📍 {BRAND.addressLine.replace("\n", ", ")}</li>
          </ul>
        </div>
      </Container>
    </section>
  );
}
