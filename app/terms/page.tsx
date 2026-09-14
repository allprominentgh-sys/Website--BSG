import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">

      {/* HEADER */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">

          <Link href="/" className="block">
            <div className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
              BEST SALES GHANA
            </div>

            <div className="text-sm font-medium text-slate-500">
              Buy • Sell • Advertise • Connect
            </div>
          </Link>

          <Link
            href="/login"
            className="rounded-xl bg-blue-700 px-5 py-3 font-bold text-white shadow-md hover:bg-blue-800"
          >
            Sign In
          </Link>

        </div>
      </header>

      {/* TITLE */}
      <section className="bg-gradient-to-br from-blue-700 to-cyan-500 px-4 py-14 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">

          <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-100">
            Legal & Policies
          </p>

          <h1 className="mt-3 text-4xl font-black sm:text-5xl">
            Marketplace Terms & Conditions
          </h1>

          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/90">
            These Terms & Conditions govern the use of BEST SALES GHANA,
            including buying, selling, advertising, payments, communications,
            disputes and account verification.
          </p>

        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">

          <p className="leading-8 text-slate-600">
            Welcome to BEST SALES GHANA. By accessing or using our marketplace
            website, you agree to be bound by these Terms & Conditions and
            applicable marketplace policies. Please read them carefully before
            using the platform.
          </p>

          {/* 1 */}
          <section className="mt-10">
            <h2 className="text-2xl font-black text-slate-900">
              1. General Payment & Refund Policies
            </h2>

            <h3 className="mt-6 text-lg font-black text-blue-700">
              Payment Terms
            </h3>

            <div className="mt-4 space-y-4 leading-7 text-slate-600">

              <p>
                <strong>Processing & Payout Schedule:</strong> Platform
                payments have a processing period of five (5) business days
                before eligible funds are debited and transferred to the
                seller's designated bank account.
              </p>

              <p>
                <strong>Platform Fee:</strong> A platform processing fee of
                2.15% of the total transaction amount paid by the client will
                be automatically deducted before account settlement.
              </p>

              <p>
                <strong>Company/Business Payout Eligibility:</strong> Direct
                platform payouts are available to registered and verified
                companies/businesses that provide valid business registration
                documentation and satisfy the platform's verification
                requirements.
              </p>

              <p>
                <strong>Individual Sellers:</strong> Individual sellers do
                not receive direct platform payouts into a bank account.
                Transactions involving individual sellers may be subject to
                internal holding and manual verification procedures.
              </p>

            </div>

            <h3 className="mt-8 text-lg font-black text-blue-700">
              Refund Policy
            </h3>

            <div className="mt-4 space-y-4 leading-7 text-slate-600">

              <p>
                <strong>Processing Timeframe:</strong> Approved refunds may
                take three (3) working weeks to be fully processed and credited
                to the client's original payment method.
              </p>

              <p>
                <strong>Scope:</strong> Refunds are applicable to purchases
                made from registered business sellers on the platform, subject
                to verification of the returned item, transaction evidence or
                service dispute.
              </p>

            </div>

            <h3 className="mt-8 text-lg font-black text-red-600">
              Anti-Fraud & Scam Policy
            </h3>

            <div className="mt-4 space-y-4 leading-7 text-slate-600">

              <p>
                BEST SALES GHANA maintains a strict zero-tolerance policy
                toward fraudulent activities, misrepresentation, counterfeit
                products, scams and non-delivery of goods or services.
              </p>

              <p>
                Accounts suspected of fraudulent activity, scams or serious
                violations of marketplace safety rules may be immediately
                suspended. Pending balances may be withheld while an
                investigation is conducted and accounts may be permanently
                banned where violations are established.
              </p>

              <p>
                Serious or potentially criminal matters may be reported to
                the appropriate law enforcement or regulatory authorities.
              </p>

            </div>
          </section>

          {/* 2 */}
          <section className="mt-12 border-t pt-10">
            <h2 className="text-2xl font-black text-slate-900">
              2. Account & Category Requirements
            </h2>

            <h3 className="mt-6 text-lg font-black text-blue-700">
              Individual Sellers
            </h3>

            <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-slate-600">
              <li>
                Individual sellers must verify their identity using a valid
                National ID or other accepted identity documentation.
              </li>
              <li>
                The platform may require a live face-recognition check or
                official passport photograph for identity verification.
              </li>
              <li>
                Individual sellers do not receive direct platform payouts.
              </li>
              <li>
                Transactions may be held for internal verification and safety
                procedures.
              </li>
            </ul>

            <h3 className="mt-8 text-lg font-black text-blue-700">
              Buyers
            </h3>

            <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-slate-600">
              <li>
                Buyers must provide accurate registration information.
              </li>
              <li>
                A valid email address and phone number may be required.
              </li>
              <li>
                Buyers must provide accurate delivery information where
                delivery is requested.
              </li>
              <li>
                Buyers should review listing information, seller information,
                ratings and transaction details before checkout.
              </li>
              <li>
                Buyer protection mechanisms apply to transactions completed
                through the platform.
              </li>
            </ul>

            <h3 className="mt-8 text-lg font-black text-blue-700">
              Registered Businesses & Companies
            </h3>

            <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-slate-600">
              <li>
                Business accounts must provide a valid Business Registration
                Certificate.
              </li>
              <li>
                Businesses must provide required tax identification details.
              </li>
              <li>
                Authorized representatives may be required to submit valid
                identification.
              </li>
              <li>
                Business accounts must pass platform verification before
                receiving direct platform payment privileges.
              </li>
              <li>
                Verified registered businesses are eligible to receive client
                payments through the platform.
              </li>
              <li>
                Eligible business payouts are subject to the five (5) business
                day processing period and 2.15% platform processing fee.
              </li>
            </ul>
          </section>

          {/* 3 */}
          <section className="mt-12 border-t pt-10">
            <h2 className="text-2xl font-black text-slate-900">
              3. Service Providers & Advertising Packages
            </h2>

            <h3 className="mt-6 text-lg font-black text-blue-700">
              Service Providers
            </h3>

            <p className="mt-4 leading-7 text-slate-600">
              Service providers offering professional, technical, physical or
              other services must comply with marketplace quality standards
              and maintain any required credentials or verification
              information.
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              Service providers are subject to the marketplace dispute and
              resolution procedures for unfulfilled, cancelled or materially
              substandard services.
            </p>

            <h3 className="mt-8 text-lg font-black text-blue-700">
              Advertising Packages
            </h3>

            <p className="mt-4 leading-7 text-slate-600">
              Sellers and businesses may purchase optional advertising,
              promotional and featured-listing packages to increase listing
              visibility.
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              Advertising package fees are non-refundable once the package has
              been activated. BEST SALES GHANA does not guarantee a particular
              number of views, enquiries, sales, customers or conversion
              rates from advertising.
            </p>
          </section>

          {/* 4 */}
          <section className="mt-12 border-t pt-10">
            <h2 className="text-2xl font-black text-slate-900">
              4. Dispute Resolution Process
            </h2>

            <div className="mt-6 space-y-5">

              <div className="rounded-2xl bg-slate-50 p-5">
                <strong>Phase 1 — Direct Negotiation (48 Hours)</strong>
                <p className="mt-2 leading-7 text-slate-600">
                  Buyers and sellers should first attempt to resolve disputes
                  through internal marketplace messaging within 48 hours of
                  product delivery or service completion.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <strong>Phase 2 — Formal Escalation</strong>
                <p className="mt-2 leading-7 text-slate-600">
                  If the matter remains unresolved, either party may escalate
                  the dispute to Marketplace Support. Supporting evidence such
                  as photographs, messages, receipts and tracking information
                  should be submitted within three (3) business days of
                  escalation.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <strong>Phase 3 — Platform Review</strong>
                <p className="mt-2 leading-7 text-slate-600">
                  The platform compliance team will review the evidence and
                  determine the appropriate resolution, which may include a
                  refund, item return or release of eligible funds.
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5">
                <strong>Fund Holding</strong>
                <p className="mt-2 leading-7 text-slate-600">
                  Eligible pending payouts may be frozen during an active
                  dispute and released after formal dispute closure.
                </p>
              </div>

            </div>
          </section>

          {/* 5 */}
          <section className="mt-12 border-t pt-10">
            <h2 className="text-2xl font-black text-slate-900">
              5. Listing Rules & Prohibited Items
            </h2>

            <h3 className="mt-6 text-lg font-black text-blue-700">
              General Listing Rules
            </h3>

            <ul className="mt-4 list-disc space-y-3 pl-6 leading-7 text-slate-600">
              <li>
                Listings must contain accurate descriptions.
              </li>
              <li>
                Sellers must provide correct pricing information.
              </li>
              <li>
                Sellers should use clear and original photographs or
                representations where applicable.
              </li>
              <li>
                Items must be placed in the correct marketplace category.
              </li>
              <li>
                Defects, damage, usage conditions and relevant limitations must
                be disclosed.
              </li>
            </ul>

            <h3 className="mt-8 text-lg font-black text-red-600">
              Prohibited Items & Services
            </h3>

            <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-6">
              <ul className="list-disc space-y-3 pl-6 leading-7 text-red-900">
                <li>Illegal drugs and controlled substances.</li>
                <li>Prescription medications where prohibited.</li>
                <li>Counterfeit goods and unauthorized replicas.</li>
                <li>Weapons, firearms and explosives.</li>
                <li>Hazardous materials.</li>
                <li>Stolen property.</li>
                <li>Pirated software or unauthorized copyrighted material.</li>
                <li>Sexually explicit material and escort services.</li>
                <li>Unverified investment schemes.</li>
                <li>Other goods or services prohibited by applicable law.</li>
              </ul>
            </div>
          </section>

          {/* 6 */}
          <section className="mt-12 border-t pt-10">
            <h2 className="text-2xl font-black text-slate-900">
              6. Privacy & Data Protection
            </h2>

            <h3 className="mt-6 text-lg font-black text-blue-700">
              Identity Verification
            </h3>

            <p className="mt-4 leading-7 text-slate-600">
              To help protect the marketplace against fraud and support
              applicable regulatory requirements, individual sellers may be
              required to submit identity verification information, including
              National ID details, passport photographs or face-recognition
              information.
            </p>

            <h3 className="mt-8 text-lg font-black text-blue-700">
              Storage & Security
            </h3>

            <p className="mt-4 leading-7 text-slate-600">
              Identity verification information and biometric verification
              records will be protected using appropriate security and
              encryption measures. Biometric information is used for identity
              confirmation and anti-spoofing verification purposes.
            </p>

            <h3 className="mt-8 text-lg font-black text-blue-700">
              Data Retention & Access
            </h3>

            <p className="mt-4 leading-7 text-slate-600">
              Personal information will be retained only for as long as
              reasonably necessary to operate the account, provide services,
              resolve disputes, prevent fraud or satisfy applicable legal
              retention requirements.
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              Identity verification information will not be sold, rented or
              provided to third-party advertisers for advertising purposes.
              Information may be disclosed to appropriate authorities where
              required by applicable law or valid legal process.
            </p>
          </section>

          {/* 7 */}
          <section className="mt-12 border-t pt-10">
            <h2 className="text-2xl font-black text-slate-900">
              7. Seller Responsibilities
            </h2>

            <ul className="mt-6 list-disc space-y-3 pl-6 leading-7 text-slate-600">
              <li>
                Sellers are responsible for the accuracy of their listings.
              </li>
              <li>
                Sellers must have the legal right to sell the listed goods or
                services.
              </li>
              <li>
                Sellers must communicate honestly with buyers.
              </li>
              <li>
                Sellers must fulfil accepted orders and service commitments.
              </li>
              <li>
                Sellers must comply with applicable laws and marketplace
                policies.
              </li>
            </ul>
          </section>

          {/* 8 */}
          <section className="mt-12 border-t pt-10">
            <h2 className="text-2xl font-black text-slate-900">
              8. Buyer Responsibilities
            </h2>

            <ul className="mt-6 list-disc space-y-3 pl-6 leading-7 text-slate-600">
              <li>
                Buyers must provide accurate account and delivery information.
              </li>
              <li>
                Buyers should carefully review listings before purchasing.
              </li>
              <li>
                Buyers must not use the platform for fraudulent transactions.
              </li>
              <li>
                Buyers must provide truthful information when submitting a
                dispute or refund request.
              </li>
            </ul>
          </section>

          {/* 9 */}
          <section className="mt-12 border-t pt-10">
            <h2 className="text-2xl font-black text-slate-900">
              9. Account Suspension & Termination
            </h2>

            <p className="mt-5 leading-7 text-slate-600">
              BEST SALES GHANA may suspend, restrict or terminate an account
              where there is suspected fraud, misrepresentation, prohibited
              activity, abuse of the platform, repeated violations of these
              Terms & Conditions or other conduct that threatens marketplace
              safety.
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              Where funds are associated with a suspected fraudulent or
              disputed transaction, those funds may be held pending review and
              resolution.
            </p>
          </section>

          {/* 10 */}
          <section className="mt-12 border-t pt-10">
            <h2 className="text-2xl font-black text-slate-900">
              10. Platform Role
            </h2>

            <p className="mt-5 leading-7 text-slate-600">
              BEST SALES GHANA provides a marketplace environment that allows
              buyers, individual sellers, registered businesses, companies and
              service providers to connect.
            </p>

            <p className="mt-4 leading-7 text-slate-600">
              Unless expressly stated otherwise, the platform is not the owner
              of goods listed by independent sellers and does not guarantee
              the quality, legality, authenticity or suitability of every
              third-party listing.
            </p>
          </section>

          {/* FINAL */}
          <section className="mt-12 rounded-2xl bg-blue-50 p-6">
            <h2 className="text-xl font-black text-slate-900">
              Acceptance of Terms
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              By creating an account, accessing the marketplace, posting a
              listing, purchasing an item, purchasing an advertising package
              or using marketplace services, you acknowledge that you have
              read and agree to these Terms & Conditions and applicable
              marketplace policies.
            </p>
          </section>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 text-center sm:px-6 lg:px-8">

          <div className="text-xl font-black">
            BEST SALES GHANA
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Buy • Sell • Advertise • Connect
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-5 text-sm text-slate-400">
            <Link href="/" className="hover:text-white">
              Home
            </Link>

            <Link href="/login" className="hover:text-white">
              Sign In
            </Link>

            <Link href="/register" className="hover:text-white">
              Create Account
            </Link>
          </div>

          <p className="mt-6 text-sm text-slate-500">
            © 2026 All Prominent Ghana Limited. All rights reserved.
          </p>

        </div>
      </footer>

    </main>
  );
}
