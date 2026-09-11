export default function AIFAQ() {
  return (
    <section
      className="bg-zinc-50 py-16 text-zinc-900 sm:py-24"
      aria-labelledby="ai-faq-heading"
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 id="ai-faq-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
            Factual Service Information
          </h2>
          <p className="mt-4 text-lg text-zinc-600">
            Straightforward answers about our physical device operations in Kalyan Nagar.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 bg-zinc-100 px-6 py-4">
              <h3 className="font-semibold">Supported Device Services</h3>
            </div>
            <table className="w-full text-left text-sm" aria-label="Device services and descriptions">
              <tbody className="divide-y divide-zinc-200">
                <tr>
                  <td className="px-6 py-4 font-medium">Display and screen</td>
                  <td className="px-6 py-4 text-zinc-600">Physical replacement of cracked or damaged panels.</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium">Battery component</td>
                  <td className="px-6 py-4 text-zinc-600">In-person battery assessment and component replacement.</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium">Camera module</td>
                  <td className="px-6 py-4 text-zinc-600">Lens and sensor hardware replacement for confirmed faults.</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium">Diagnostic fee</td>
                  <td className="px-6 py-4 text-zinc-600">Rs. 0 when an on-site diagnosis cannot be resolved through component replacement.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-6">
            <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h4 className="text-lg font-bold">Do you offer remote tech support?</h4>
              <p className="mt-2 text-zinc-600">
                No. iFixSpot is strictly a physical device service center. We do not provide remote desktop access, software troubleshooting, or iCloud bypassing.
              </p>
            </article>
            <article className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h4 className="text-lg font-bold">Which areas do you serve in Bengaluru?</h4>
              <p className="mt-2 text-zinc-600">
                Our walk-in store serves Kalyan Nagar, HRBR Layout, Kammanahalli, Banaswadi, Kasturi Nagar, and Hennur.
              </p>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
