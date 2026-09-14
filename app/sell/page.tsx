import Link from "next/link";

export default function SellPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">

      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">

          <Link href="/" className="block">
            <div className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              BEST SALES GHANA
            </div>

            <div className="text-sm font-medium text-slate-500">
              Buy • Sell • Advertise • Connect
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-xl px-4 py-3 font-bold text-slate-700 hover:bg-slate-100 sm:block"
            >
              Sign In
            </Link>

            <Link
              href="/register"
              className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white shadow-md transition hover:bg-blue-800"
            >
              Create Account
            </Link>
          </div>

        </div>
      </header>

      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 px-4 py-16 text-white sm:px-6 lg:px-8">

        <div className="mx-auto max-w-5xl text-center">

          <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-100">
            Sell on BEST SALES GHANA
          </p>

          <h1 className="mt-4 text-4xl font-black sm:text-5xl lg:text-6xl">
            Turn your products into sales.
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/90">
            List your products, vehicles, property, machinery, equipment,
            services and business opportunities and connect with buyers across
            Ghana.
          </p>

        </div>

      </section>

      {/* SELLING OPTIONS */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">

        <div className="text-center">

          <p className="text-sm font-black uppercase tracking-widest text-blue-700">
            Choose your seller type
          </p>

          <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
            How do you want to sell?
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-slate-500">
            Select the account type that best describes you or your business.
          </p>

        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">

          {/* INDIVIDUAL */}
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
              👤
            </div>

            <h3 className="mt-6 text-2xl font-black text-slate-900">
              Individual Seller
            </h3>

            <p className="mt-3 leading-7 text-slate-500">
              Sell personal products, vehicles, equipment, property and other
              permitted items as an individual.
            </p>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5">

              <p className="font-black text-slate-900">
                Verification required
              </p>

              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                <li>✓ Valid National ID</li>
                <li>✓ Identity verification</li>
                <li>✓ Face verification may be required</li>
                <li>✓ Manual transaction verification</li>
              </ul>

            </div>

            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">

              <p className="text-sm font-bold text-amber-900">
                Payment handling
              </p>

              <p className="mt-1 text-sm leading-6 text-amber-800">
                Individual sellers do not receive direct platform payouts
                into a bank account. Eligible transactions may be held for
                verification.
              </p>

            </div>

            <Link
              href="/register?type=individual"
              className="mt-6 block rounded-xl bg-blue-700 px-5 py-4 text-center font-black text-white transition hover:bg-blue-800"
            >
              Register as Individual
            </Link>

          </div>

          {/* COMPANY */}
          <div className="relative rounded-3xl border-2 border-blue-600 bg-white p-7 shadow-xl">

            <div className="absolute right-5 top-5 rounded-full bg-blue-700 px-3 py-1 text-xs font-black text-white">
              RECOMMENDED
            </div>

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-3xl">
              🏢
            </div>

            <h3 className="mt-6 text-2xl font-black text-slate-900">
              Registered Company
            </h3>

            <p className="mt-3 leading-7 text-slate-500">
              For registered companies and businesses that want to sell
              professionally and receive eligible client payments through
              the platform.
            </p>

            <div className="mt-6 rounded-2xl bg-blue-50 p-5">

              <p className="font-black text-slate-900">
                Business verification
              </p>

              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                <li>✓ Business Registration Certificate</li>
                <li>✓ Tax identification details</li>
                <li>✓ Authorized representative ID</li>
                <li>✓ Business verification</li>
              </ul>

            </div>

            <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4">

              <p className="text-sm font-black text-green-900">
                ✓ Platform payment eligible
              </p>

              <p className="mt-1 text-sm leading-6 text-green-800">
                Verified registered companies may receive client payments
                through the platform, subject to the applicable processing
                period and platform fee.
              </p>

            </div>

            <Link
              href="/register?type=business"
              className="mt-6 block rounded-xl bg-blue-700 px-5 py-4 text-center font-black text-white shadow-lg transition hover:bg-blue-800"
            >
              Register Business
            </Link>

          </div>

          {/* SERVICE PROVIDER */}
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">

            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-100 text-3xl">
              🛠️
            </div>

            <h3 className="mt-6 text-2xl font-black text-slate-900">
              Service Provider
            </h3>

            <p className="mt-3 leading-7 text-slate-500">
              Offer professional, technical, physical and other permitted
              services to customers across Ghana.
            </p>

            <div className="mt-6 rounded-2xl bg-slate-50 p-5">

              <p className="font-black text-slate-900">
                Service requirements
              </p>

              <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
                <li>✓ Accurate service description</li>
                <li>✓ Valid contact information</li>
                <li>✓ Required credentials where applicable</li>
                <li>✓ Quality standards</li>
              </ul>

            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4">

              <p className="text-sm font-bold text-slate-900">
                Customer protection
              </p>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Service providers are subject to the marketplace dispute and
                resolution process.
              </p>

            </div>

            <Link
              href="/register?type=service"
              className="mt-6 block rounded-xl border-2 border-blue-700 px-5 py-3.5 text-center font-black text-blue-700 transition hover:bg-blue-50"
            >
              Register as Service Provider
            </Link>

          </div>

        </div>

      </section>

      {/* HOW IT WORKS */}
      <section className="border-y border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

          <div className="text-center">

            <p className="text-sm font-black uppercase tracking-widest text-blue-700">
              Simple process
            </p>

            <h2 className="mt-2 text-3xl font-black text-slate-900">
              Start selling in four steps
            </h2>

          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {[
              {
                number: "01",
                title: "Create Account",
                text: "Register as an individual, company or service provider.",
              },
              {
                number: "02",
                title: "Verify",
                text: "Complete the required identity or business verification.",
              },
              {
                number: "03",
                title: "Create Listing",
                text: "Add your product, service, price, photos and details.",
              },
              {
                number: "04",
                title: "Connect & Sell",
                text: "Receive enquiries and connect with buyers across Ghana.",
              },
            ].map((step) => (

              <div
                key={step.number}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
              >

                <div className="text-3xl font-black text-blue-700">
                  {step.number}
                </div>

                <h3 className="mt-4 text-xl font-black text-slate-900">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {step.text}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* ADVERTISING */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

        <div className="overflow-hidden rounded-3xl bg-slate-950 p-8 text-white sm:p-12 lg:flex lg:items-center lg:justify-between lg:gap-10">

          <div>

            <p className="text-sm font-black uppercase tracking-widest text-cyan-400">
              Advertising
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Want more visibility?
            </h2>

            <p className="mt-4 max-w-2xl leading-7 text-white/70">
              Promote your products and business with optional advertising
              and featured listing packages.
            </p>

            <p className="mt-4 text-sm text-white/50">
              Advertising fees are non-refundable once an advertising package
              has been activated.
            </p>

          </div>

          <Link
            href="/register"
            className="mt-7 inline-flex shrink-0 rounded-xl bg-blue-600 px-7 py-4 font-black text-white transition hover:bg-cyan-400 hover:text-slate-950 lg:mt-0"
          >
            Start Selling
          </Link>

        </div>

      </section>

      {/* IMPORTANT POLICY */}
      <section className="bg-blue-50">

        <div className="mx-auto max-w-5xl px-4 py-12 text-center sm:px-6 lg:px-8">

          <h2 className="text-2xl font-black text-slate-900">
            Before you list
          </h2>

          <p className="mx-auto mt-4 max-w-3xl leading-7 text-slate-600">
            All listings must contain accurate descriptions, correct pricing,
            clear photographs or representations and must be placed in the
            correct category. Prohibited goods and services are not allowed.
          </p>

          <Link
            href="/terms"
            className="mt-5 inline-block font-black text-blue-700 hover:text-blue-900"
          >
            Read Marketplace Terms & Conditions →
          </Link>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-white">

        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">

          <div className="grid gap-8 md:grid-cols-3">

            <div>
              <div className="text-xl font-black">
                BEST SALES GHANA
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Buy • Sell • Advertise • Connect
              </p>
            </div>

            <div>
              <h3 className="font-bold">
                Marketplace
              </h3>

              <div className="mt-4 space-y-2 text-sm text-slate-400">

                <Link
                  href="/"
                  className="block hover:text-white"
                >
                  Home
                </Link>

                <Link
                  href="/terms"
                  className="block hover:text-white"
                >
                  Terms & Conditions
                </Link>

                <Link
                  href="/login"
                  className="block hover:text-white"
                >
                  Sign In
                </Link>

              </div>
            </div>

            <div>
              <h3 className="font-bold">
                Sell
              </h3>

              <div className="mt-4 space-y-2 text-sm text-slate-400">

                <Link
                  href="/register?type=individual"
                  className="block hover:text-white"
                >
                  Individual Seller
                </Link>

                <Link
                  href="/register?type=business"
                  className="block hover:text-white"
                >
                  Registered Business
                </Link>

                <Link
                  href="/register?type=service"
                  className="block hover:text-white"
                >
                  Service Provider
                </Link>

              </div>
            </div>

          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-slate-500">
            © 2026 All Prominent Ghana Limited. All rights reserved.
          </div>

        </div>

      </footer>

    </main>
  );
}
