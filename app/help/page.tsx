
import Link from "next/link";

const helpTopics = [
  {
    title: "Buying on BestSalesGH",
    description:
      "Learn how to find products, contact sellers, compare prices, and arrange purchases.",
    items: [
      "Browse categories and search for listings.",
      "Review product descriptions and seller information.",
      "Contact sellers before making payment.",
    ],
  },
  {
    title: "Selling and posting advertisements",
    description:
      "Get help creating listings and promoting your products or services.",
    items: [
      "Sign in to your account.",
      "Select Sell to create an advertisement.",
      "Provide accurate descriptions, prices, locations, and photos.",
    ],
  },
  {
    title: "Account and login problems",
    description:
      "Guidance for account access and keeping your account secure.",
    items: [
      "Use the login page to access your account.",
      "Use the available password recovery option if necessary.",
      "Never share your password or verification codes.",
    ],
  },
  {
    title: "Messages and communication",
    description:
      "Learn how to communicate with buyers and sellers.",
    items: [
      "Open Messages from your account dashboard.",
      "Select a conversation to read and reply.",
      "Report suspicious messages or activity.",
    ],
  },
  {
    title: "Payments and safety",
    description:
      "Understand safe buying practices and advertising charges.",
    items: [
      "Confirm the seller and product before paying.",
      "Check applicable fees before purchasing advertising services.",
      "Keep evidence of transactions and report suspected fraud.",
    ],
  },
  {
    title: "Report a problem",
    description:
      "Get help with suspicious listings, misleading advertisements, or marketplace issues.",
    items: [
      "Record the listing details and describe the problem.",
      "Use the listing's Report option where available.",
      "Contact marketplace support for further assistance.",
    ],
  },
];

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-5">
          <Link href="/" className="min-w-0">
            <span className="block text-lg font-black text-blue-700 sm:text-xl">
              BEST SALES GHANA
            </span>
            <span className="mt-1 block text-sm text-slate-500">
              Buy • Sell • Advertise • Connect
            </span>
          </Link>

          <Link
            href="/login"
            className="shrink-0 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800"
          >
            Sign In
          </Link>
        </div>
      </header>

      <section className="bg-gradient-to-br from-blue-700 to-cyan-500 px-5 py-14 text-white sm:py-20">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-blue-100">
            Customer Support
          </p>

          <h1 className="mt-4 text-4xl font-black sm:text-5xl">
            Help Centre
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-blue-50">
            Welcome to BestSalesGH support. Find guidance on buying,
            selling, advertisements, your account, messages, and
            marketplace safety.
          </p>

          <Link
            href="/categories"
            className="mt-8 inline-block rounded-xl bg-white px-6 py-3 font-bold text-blue-700 hover:bg-blue-50"
          >
            Explore Marketplace
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 sm:py-16">
        <div className="mb-8">
          <h2 className="text-2xl font-black sm:text-3xl">
            How can we help you?
          </h2>
          <p className="mt-3 leading-7 text-slate-600">
            Choose a topic below to find useful information.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {helpTopics.map((topic, index) => (
            <article
              key={topic.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-lg font-black text-blue-700">
                  {index + 1}
                </div>

                <div className="min-w-0">
                  <h3 className="text-lg font-black">
                    {topic.title}
                  </h3>

                  <p className="mt-2 leading-7 text-slate-600">
                    {topic.description}
                  </p>
                </div>
              </div>

              <ul className="mt-5 space-y-3">
                {topic.items.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm leading-6 text-slate-600"
                  >
                    <span className="mt-0.5 font-black text-blue-700">
                      ✓
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div className="mt-10 rounded-2xl border border-blue-200 bg-blue-50 p-6 sm:p-8">
          <h2 className="text-2xl font-black">
            Still need assistance?
          </h2>

          <p className="mt-3 leading-7 text-slate-600">
            Contact BestSalesGH through the official support channels
            provided by the marketplace. Include a clear description
            of your problem so the support team can assist you.
          </p>

          <Link
            href="/contact"
            className="mt-6 inline-block rounded-xl bg-blue-700 px-6 py-3 font-bold text-white hover:bg-blue-800"
          >
            Contact Us
          </Link>
        </div>

        <div className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-500">
          Please also review our{" "}
          <Link
            href="/terms"
            className="font-semibold text-blue-700 underline"
          >
            Terms &amp; Conditions
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="font-semibold text-blue-700 underline"
          >
            Privacy Policy
          </Link>
          .
        </div>
      </section>

      <footer className="bg-slate-950 px-5 py-8 text-center text-slate-400">
        <Link href="/" className="font-black text-white">
          BEST SALES GHANA
        </Link>

        <p className="mt-2 text-sm">
          Buy • Sell • Advertise • Connect
        </p>

        <p className="mt-5 text-sm">
          © 2026 All Prominent Ghana Limited. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
