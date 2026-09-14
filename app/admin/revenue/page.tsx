"use client";

import Link from "next/link";

const transactions = [
  {
    id: "BSG-TRX-1001",
    seller: "Marketplace Seller",
    product: "Industrial Printing Machine",
    gross: 250000,
    fee: 5375,
    sellerAmount: 244625,
    status: "Held",
    delivery: "In Transit",
    priority: false,
  },
  {
    id: "BSG-TRX-1002",
    seller: "Individual Seller",
    product: "Toyota Corolla 2020",
    gross: 185000,
    fee: 3977.5,
    sellerAmount: 181022.5,
    status: "Ready",
    delivery: "Delivered",
    priority: false,
  },
  {
    id: "BSG-TRX-1003",
    seller: "Individual Seller",
    product: "Premium Equipment",
    gross: 10000,
    fee: 0,
    sellerAmount: 10000,
    status: "Ready",
    delivery: "Delivered",
    priority: true,
  },
];

function money(amount: number) {
  return `GH₵${amount.toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function RevenuePage() {
  const totalSales = transactions.reduce(
    (sum, transaction) => sum + transaction.gross,
    0
  );

  const totalPlatformRevenue = transactions.reduce(
    (sum, transaction) => sum + transaction.fee,
    0
  );

  const totalSellerAmount = transactions.reduce(
    (sum, transaction) => sum + transaction.sellerAmount,
    0
  );

  const heldAmount = transactions
    .filter((transaction) => transaction.status === "Held")
    .reduce((sum, transaction) => sum + transaction.sellerAmount, 0);

  const readyAmount = transactions
    .filter((transaction) => transaction.status === "Ready")
    .reduce((sum, transaction) => sum + transaction.sellerAmount, 0);

  const priorityExemptions = transactions.filter(
    (transaction) => transaction.priority
  ).length;

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-700 text-2xl shadow-md">
              ⭐
            </div>

            <div>
              <div className="text-lg font-black sm:text-xl">
                BEST SALES GHANA
              </div>

              <div className="text-xs text-slate-500">
                Admin • Revenue & Payments
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/admin"
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
            >
              ← Dashboard
            </Link>

            <Link
              href="/"
              className="hidden rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-800 sm:block"
            >
              View Website
            </Link>
          </div>
        </div>
      </header>

      {/* PAGE */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* TITLE */}
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-widest text-blue-700">
            Financial Control
          </p>

          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
            Revenue & Payments
          </h1>

          <p className="mt-3 max-w-3xl text-slate-500">
            Monitor marketplace transactions, the 2.15% platform revenue,
            seller settlements, delivery status and Top Priority exemptions.
          </p>
        </div>

        {/* FEE RULE */}
        <section className="mb-8 rounded-3xl border border-blue-200 bg-blue-50 p-6">
          <div className="flex gap-4">
            <div className="text-3xl">💰</div>

            <div>
              <h2 className="text-xl font-black text-blue-900">
                Platform Revenue Rule
              </h2>

              <p className="mt-2 leading-7 text-blue-800">
                Normal marketplace payments are charged a{" "}
                <strong>2.15%</strong> platform transaction fee.
                Top Priority sellers are recorded as exempt from this
                transaction fee under the agreed package structure.
              </p>
            </div>
          </div>
        </section>

        {/* SUMMARY */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500">
                Total Sales
              </span>

              <span className="text-2xl">💵</span>
            </div>

            <div className="mt-4 text-3xl font-black">
              {money(totalSales)}
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Gross marketplace payments
            </p>
          </div>

          <div className="rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500">
                Platform Revenue
              </span>

              <span className="text-2xl">📈</span>
            </div>

            <div className="mt-4 text-3xl font-black text-blue-700">
              {money(totalPlatformRevenue)}
            </div>

            <p className="mt-2 text-xs text-slate-500">
              2.15% normal transaction revenue
            </p>
          </div>

          <div className="rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500">
                Seller Funds Held
              </span>

              <span className="text-2xl">⏳</span>
            </div>

            <div className="mt-4 text-3xl font-black text-amber-600">
              {money(heldAmount)}
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Awaiting settlement
            </p>
          </div>

          <div className="rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500">
                Ready for Settlement
              </span>

              <span className="text-2xl">✅</span>
            </div>

            <div className="mt-4 text-3xl font-black text-green-700">
              {money(readyAmount)}
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Delivery completed or hold expired
            </p>
          </div>
        </div>

        {/* SETTLEMENT STRUCTURE */}
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-6">
            <p className="text-xs font-black uppercase tracking-widest text-blue-700">
              Settlement Structure
            </p>

            <h2 className="mt-1 text-2xl font-black">
              How Seller Payments Work
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-4">
            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="text-3xl">1️⃣</div>

              <h3 className="mt-3 font-black">
                Customer Pays
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Customer completes the marketplace payment.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="text-3xl">2️⃣</div>

              <h3 className="mt-3 font-black">
                2.15% Calculated
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                The system automatically calculates the platform revenue for
                normal marketplace transactions.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="text-3xl">3️⃣</div>

              <h3 className="mt-3 font-black">
                Funds Held
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Seller funds remain protected during the delivery and
                settlement period.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="text-3xl">4️⃣</div>

              <h3 className="mt-3 font-black">
                Seller Paid
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Funds become eligible for release after successful delivery
                or when the agreed 5-day settlement period expires.
              </p>
            </div>
          </div>
        </section>

        {/* TRANSACTIONS */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <p className="text-xs font-black uppercase tracking-widest text-blue-700">
              Transactions
            </p>

            <h2 className="mt-1 text-2xl font-black">
              Marketplace Payment Activity
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-black">
                    Transaction
                  </th>

                  <th className="px-6 py-4 font-black">
                    Product
                  </th>

                  <th className="px-6 py-4 font-black">
                    Gross
                  </th>

                  <th className="px-6 py-4 font-black">
                    2.15%
                  </th>

                  <th className="px-6 py-4 font-black">
                    Seller Amount
                  </th>

                  <th className="px-6 py-4 font-black">
                    Delivery
                  </th>

                  <th className="px-6 py-4 font-black">
                    Settlement
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="hover:bg-slate-50"
                  >
                    <td className="px-6 py-5">
                      <div className="font-black text-slate-900">
                        {transaction.id}
                      </div>

                      <div className="mt-1 text-xs text-slate-500">
                        {transaction.seller}
                      </div>

                      {transaction.priority && (
                        <span className="mt-2 inline-flex rounded-full bg-purple-100 px-2.5 py-1 text-[10px] font-black text-purple-700">
                          TOP PRIORITY
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-5">
                      <span className="font-semibold text-slate-700">
                        {transaction.product}
                      </span>
                    </td>

                    <td className="px-6 py-5 font-black">
                      {money(transaction.gross)}
                    </td>

                    <td className="px-6 py-5">
                      {transaction.priority ? (
                        <span className="font-black text-green-700">
                          EXEMPT
                        </span>
                      ) : (
                        <div>
                          <div className="font-black text-blue-700">
                            {money(transaction.fee)}
                          </div>

                          <div className="text-xs text-slate-400">
                            2.15%
                          </div>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-5 font-black text-slate-900">
                      {money(transaction.sellerAmount)}
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={
                          transaction.delivery === "Delivered"
                            ? "rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700"
                            : "rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700"
                        }
                      >
                        {transaction.delivery}
                      </span>
                    </td>

                    <td className="px-6 py-5">
                      <span
                        className={
                          transaction.status === "Ready"
                            ? "rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700"
                            : "rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700"
                        }
                      >
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* TOP PRIORITY */}
        <section className="mt-8 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-7 text-white shadow-xl sm:p-9">
          <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-cyan-400">
                Top Priority
              </p>

              <h2 className="mt-2 text-3xl font-black">
                Platform Fee Exemption
              </h2>

              <p className="mt-3 max-w-2xl leading-7 text-slate-300">
                Top Priority individual sellers are identified separately so
                the system does not automatically deduct the 2.15% marketplace
                transaction fee from their qualifying transactions.
              </p>
            </div>

            <div className="rounded-2xl bg-white/10 p-6 text-center backdrop-blur">
              <div className="text-4xl font-black">
                {priorityExemptions}
              </div>

              <div className="mt-1 text-sm text-slate-300">
                Exempt Transactions
              </div>
            </div>
          </div>
        </section>

        {/* IMPORTANT */}
        <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex gap-3">
            <div className="text-xl">⚠️</div>

            <div>
              <h3 className="font-black text-amber-900">
                Payment gateway connection comes later
              </h3>

              <p className="mt-1 text-sm leading-6 text-amber-800">
                This dashboard currently displays the financial structure and
                sample transaction data. The next payment integration will
                connect the calculations to actual customer payments, seller
                settlement accounts, refunds and transaction records.
              </p>
            </div>
          </div>
        </section>

        {/* TOTAL SELLER PAYOUT */}
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-bold text-slate-500">
                Total Seller Amount
              </p>

              <h2 className="mt-1 text-3xl font-black">
                {money(totalSellerAmount)}
              </h2>
            </div>

            <Link
              href="/admin"
              className="inline-flex rounded-xl bg-blue-700 px-6 py-3 font-black text-white hover:bg-blue-800"
            >
              Back to Admin →
            </Link>
          </div>
        </section>
      </section>

      {/* FOOTER */}
      <footer className="mt-12 border-t border-slate-200 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center sm:px-6 lg:px-8">
          <p className="font-black text-white">
            BEST SALES GHANA — REVENUE & PAYMENTS
          </p>

          <p className="mt-2 text-sm text-slate-500">
            © {new Date().getFullYear()} All Prominent Ghana Limited. All
            rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
