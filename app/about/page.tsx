
import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
          <Link href="/" className="text-xl font-black text-blue-700">
            BEST SALES GHANA
          </Link>
          <Link href="/" className="font-semibold text-blue-700">
            Home
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-5 py-16">
        <p className="font-bold uppercase tracking-widest text-blue-700">
          About Us
        </p>
        <h1 className="mt-3 text-4xl font-black">
          Connecting buyers and sellers across Ghana
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-600">
          BestSalesGH is an online marketplace designed to help individuals
          and businesses discover products, advertise services, and connect
          with potential customers.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl border bg-white p-6">
            <h2 className="text-xl font-bold">Our mission</h2>
            <p className="mt-3 leading-7 text-slate-600">
              To make buying, selling, and advertising easier and more
              accessible for people and businesses in Ghana.
            </p>
          </div>
          <div className="rounded-2xl border bg-white p-6">
            <h2 className="text-xl font-bold">Our marketplace</h2>
            <p className="mt-3 leading-7 text-slate-600">
              Discover vehicles, property, electronics, machinery,
              agricultural products, services, and business opportunities.
            </p>
          </div>
        </div>

        <div className="mt-10">
          <Link
            href="/categories"
            className="inline-block rounded-xl bg-blue-700 px-6 py-3 font-bold text-white"
          >
            Explore Categories
          </Link>
        </div>
      </section>

      <footer className="bg-slate-950 px-5 py-8 text-center text-slate-400">
        © 2026 All Prominent Ghana Limited. All rights reserved.
      </footer>
    </main>
  );
}
