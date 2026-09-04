import { Link } from "react-router-dom";
import { Container } from "@/components/ui";
import { BRAND, PHONE_LINK, WHATSAPP_LINK } from "@/lib/site";

export default function PrivacyPolicy() {
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
          Privacy Policy
        </h1>
        <p className="mt-3 text-sm text-zinc-500">
          Last updated: January {new Date().getFullYear()}
        </p>

        <div className="prose prose-zinc mt-10 max-w-none text-[15px] leading-relaxed text-zinc-700">
          <p>
            At <strong>{BRAND.name}</strong> (“we”, “our”, “us”), we respect your
            privacy and are committed to protecting the personal information you
            share with us. This policy explains what information we collect, how
            we use it, and the choices you have.
          </p>

          <h2 className="mt-8 font-display text-xl font-bold text-ink">
            1. Information We Collect
          </h2>
          <p>
            We may collect the following information when you use our booking
            form, contact us, or visit our store:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>Name, mobile number, and pincode (for service dispatch)</li>
            <li>Device model and issue description</li>
            <li>Service history and warranty records</li>
            <li>Analytics data (pages visited, device type, time on site)</li>
          </ul>

          <h2 className="mt-8 font-display text-xl font-bold text-ink">
            2. How We Use Your Information
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-6">
            <li>To provide and complete device services you've requested</li>
            <li>To contact you about your booking, dispatch, or service updates</li>
            <li>To honour service warranties</li>
            <li>To improve our website and customer experience</li>
            <li>To comply with legal obligations</li>
          </ul>

          <h2 className="mt-8 font-display text-xl font-bold text-ink">
            3. Data Safety
          </h2>
          <p>
            We <strong>never</strong> access, copy, or transfer the data on your
            device. Our services are performed in front of you. We do not sell,
            trade, or rent your personal information to third parties.
          </p>

          <h2 className="mt-8 font-display text-xl font-bold text-ink">
            4. Cookies &amp; Analytics
          </h2>
          <p>
            Our website may use cookies and analytics tools (such as Google
            Analytics or Meta Pixel) to understand how visitors use our site. You
            may disable cookies in your browser settings at any time.
          </p>

          <h2 className="mt-8 font-display text-xl font-bold text-ink">
            5. Third-Party Services
          </h2>
          <p>
            We use WhatsApp for customer communication and Google Maps for
            location display. These services have their own privacy policies.
          </p>

          <h2 className="mt-8 font-display text-xl font-bold text-ink">
            6. Your Rights
          </h2>
          <p>
            You may request access to, correction of, or deletion of your
            personal data at any time by contacting us.
          </p>

          <h2 className="mt-8 font-display text-xl font-bold text-ink">
            7. Contact Us
          </h2>
          <p>
            For any privacy-related questions, reach out to us:
          </p>
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
