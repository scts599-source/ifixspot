import { BRAND, MAPS_URL, PHONE_LINK } from "@/lib/site";

export default function RefundPolicy() {
  return (
    <main className="bg-white pt-28 pb-20 sm:pt-36">
      <div className="mx-auto w-full max-w-4xl px-5 sm:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-red-600">
          iFixSpot policies
        </p>
        <h1 className="font-display mt-3 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Warranty &amp; Refund Policy
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-600">
          This policy applies to physical hardware services performed by iFixSpot
          at our Kalyan Nagar store or during an arranged doorstep visit.
        </p>

        <div className="mt-12 space-y-8">
          <section className="border-t border-zinc-200 pt-6">
            <h2 className="font-display text-2xl font-bold text-ink">
              1. 6-Month Hardware Warranty
            </h2>
            <p className="mt-3 leading-relaxed text-zinc-600">
              The warranty covers defects in replacement displays, batteries, and
              charging ports installed by iFixSpot. It covers the installed
              component and workmanship under normal use. Physical damage, liquid
              damage, unauthorized repair, and accidental damage are assessed
              separately.
            </p>
          </section>

          <section className="border-t border-zinc-200 pt-6">
            <h2 className="font-display text-2xl font-bold text-ink">
              2. No Fix, No Fee Guarantee
            </h2>
            <p className="mt-3 leading-relaxed text-zinc-600">
              If an on-site diagnosis reveals that a device cannot be resolved via
              component replacement, the customer pays Rs. 0 diagnostic fee. Any
              approved replacement work is quoted before installation.
            </p>
          </section>

          <section className="border-t border-zinc-200 pt-6">
            <h2 className="font-display text-2xl font-bold text-ink">
              3. Refund Policy
            </h2>
            <p className="mt-3 leading-relaxed text-zinc-600">
              If a replacement part is proven defective within the six-month
              warranty window and the issue cannot be resolved through component
              replacement, iFixSpot will arrange a prompt component replacement or
              issue a full refund for the affected replacement service. Refunds
              are reviewed after an in-person hardware inspection at the store.
            </p>
          </section>
        </div>

        <section className="mt-12 rounded-2xl bg-zinc-50 p-6">
          <h2 className="font-display text-xl font-bold text-ink">Physical store contact</h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-zinc-600">
            {BRAND.name}\n{BRAND.addressLine}\n{BRAND.hours}
          </p>
          <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold">
            <a href={PHONE_LINK} className="text-red-600 hover:underline">
              +91 70227 18776
            </a>
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">
              Open store location
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
