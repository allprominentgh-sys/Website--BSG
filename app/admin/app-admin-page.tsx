
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/supabase-browser";

type Currency = {
  code: string;
  name: string;
  symbol: string;
  manual_rate_from_ghs: number | null;
  xe_rate: number | null;
  previous_xe_rate: number | null;
  xe_change_percent: number | null;
  adjustment_percent: number | null;
  auto_adjust_enabled: boolean | null;
  last_xe_update: string | null;
  rate_source: string | null;
};

type CurrencyCode = "CNY" | "USD" | "EUR" | "GBP";

const adminSections = [
  {
    title: "Direct Sales",
    description:
      "Manage products owned and sold directly by Best Sales Ghana.",
    icon: "🛒",
    href: "/admin/direct-sales",
    action: "Manage Products",
  },
  {
    title: "Marketplace Listings",
    description:
      "Review and manage listings posted by marketplace sellers.",
    icon: "📋",
    href: "/listings",
    action: "View Listings",
  },
  {
    title: "Sellers",
    description:
      "Manage seller accounts, verification and seller activity.",
    icon: "👥",
    href: "#",
    action: "Manage Sellers",
  },
  {
    title: "Customers",
    description: "View and manage customer accounts.",
    icon: "👤",
    href: "#",
    action: "Manage Customers",
  },
  {
    title: "Orders",
    description: "Monitor customer orders and order activity.",
    icon: "📦",
    href: "#",
    action: "View Orders",
  },
  {
    title: "Delivery & Tracking",
    description: "Manage deliveries and marketplace tracking.",
    icon: "🚚",
    href: "#",
    action: "Manage Delivery",
  },
  {
    title: "Payments",
    description: "Monitor marketplace payments and transactions.",
    icon: "💳",
    href: "#",
    action: "View Payments",
  },
  {
    title: "Revenue & Payments",
    description:
      "Monitor platform revenue, seller settlements, held funds and delivery payments.",
    icon: "💰",
    href: "/admin/revenue",
    action: "Manage Revenue",
  },
  {
    title: "Advertising",
    description: "Manage advertising placements and promotional content.",
    icon: "📢",
    href: "#",
    action: "Manage Advertising",
  },
  {
    title: "Settings",
    description: "Configure marketplace and administrator settings.",
    icon: "⚙️",
    href: "#",
    action: "Open Settings",
  },
];

export default function AdminDashboardPage() {
  const supabase = supabaseBrowser();

  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  const [dashboardStats, setDashboardStats] = useState({
    listings: 0,
    accounts: 0,
  });
  const [loadingDashboardStats, setLoadingDashboardStats] =
    useState(true);

  const [currencies, setCurrencies] = useState<Currency[]>([]);

  const [rmbRate, setRmbRate] = useState("");
  const [usdRate, setUsdRate] = useState("");
  const [eurRate, setEurRate] = useState("");
  const [gbpRate, setGbpRate] = useState("");

  const [rmbAmount, setRmbAmount] = useState("");
  const [usdAmount, setUsdAmount] = useState("");
  const [ghsAmount, setGhsAmount] = useState("");

  const [savingCurrency, setSavingCurrency] =
    useState<CurrencyCode | null>(null);
  const [currencyMessage, setCurrencyMessage] = useState("");

  const [autoAdjustEnabled, setAutoAdjustEnabled] = useState(true);
  const [adjustmentPercent, setAdjustmentPercent] = useState("100");
  const [savingAdjustmentSettings, setSavingAdjustmentSettings] =
    useState(false);

  /*
   * ADMIN CHECK
   */
  useEffect(() => {
    async function checkAdmin() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setIsAdmin(false);
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("account_type")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Admin check error:", error);
          setIsAdmin(false);
        } else {
          setIsAdmin(profile?.account_type === "admin");
        }
      } catch (error) {
        console.error("Admin check failed:", error);
        setIsAdmin(false);
      } finally {
        setCheckingAdmin(false);
      }
    }

    checkAdmin();
  }, [supabase]);

  /*
   * LOAD LIVE DASHBOARD STATISTICS
   */
  useEffect(() => {
    async function loadDashboardStats() {
      setLoadingDashboardStats(true);

      try {
        const [listingsResult, accountsResult] = await Promise.all([
          supabase
            .from("listings")
            .select("*", { count: "exact", head: true }),

          supabase
            .from("profiles")
            .select("*", { count: "exact", head: true }),
        ]);

        if (listingsResult.error) {
          console.error(
            "Marketplace listings count error:",
            listingsResult.error
          );
        }

        if (accountsResult.error) {
          console.error(
            "Registered accounts count error:",
            accountsResult.error
          );
        }

        setDashboardStats({
          listings: listingsResult.error
            ? 0
            : listingsResult.count ?? 0,
          accounts: accountsResult.error
            ? 0
            : accountsResult.count ?? 0,
        });
      } catch (error) {
        console.error("Dashboard statistics error:", error);
      } finally {
        setLoadingDashboardStats(false);
      }
    }

    loadDashboardStats();
  }, [supabase]);

  /*
   * LOAD CURRENCIES
   */
  useEffect(() => {
    async function loadCurrencies() {
      const { data, error } = await supabase
        .from("currencies")
        .select(
          `
            code,
            name,
            symbol,
            manual_rate_from_ghs,
            xe_rate,
            previous_xe_rate,
            xe_change_percent,
            adjustment_percent,
            auto_adjust_enabled,
            last_xe_update,
            rate_source
          `
        )
        .in("code", ["GHS", "USD", "CNY", "EUR", "GBP"])
        .order("code");

      if (error) {
        console.error("Currency loading error:", error);
        return;
      }

      const records = (data || []) as Currency[];
      setCurrencies(records);

      const usd = records.find((currency) => currency.code === "USD");
      const cny = records.find((currency) => currency.code === "CNY");
      const eur = records.find((currency) => currency.code === "EUR");
      const gbp = records.find((currency) => currency.code === "GBP");

      if (usd?.manual_rate_from_ghs != null) {
        setUsdRate(String(usd.manual_rate_from_ghs));
      }

      if (cny?.manual_rate_from_ghs != null) {
        setRmbRate(String(cny.manual_rate_from_ghs));
      }

      if (eur?.manual_rate_from_ghs != null) {
        setEurRate(String(eur.manual_rate_from_ghs));
      }

      if (gbp?.manual_rate_from_ghs != null) {
        setGbpRate(String(gbp.manual_rate_from_ghs));
      }

      const settingsCurrency = usd || cny;

      if (settingsCurrency?.auto_adjust_enabled != null) {
        setAutoAdjustEnabled(settingsCurrency.auto_adjust_enabled);
      }

      if (settingsCurrency?.adjustment_percent != null) {
        setAdjustmentPercent(
          String(settingsCurrency.adjustment_percent)
        );
      }
    }

    loadCurrencies();
  }, [supabase]);

  /*
   * SAVE MANUAL CURRENCY RATE
   */
  async function saveCurrencyRate(currencyCode: CurrencyCode) {
    if (!isAdmin) {
      setCurrencyMessage(
        "You do not have permission to change currency rates."
      );
      return;
    }

    const rawRate =
      currencyCode === "CNY"
        ? rmbRate
        : currencyCode === "USD"
          ? usdRate
          : currencyCode === "EUR"
            ? eurRate
            : gbpRate;

    const newRate = Number(rawRate);

    if (!rawRate || !Number.isFinite(newRate) || newRate <= 0) {
      setCurrencyMessage(
        `Please enter a valid ${currencyCode} rate.`
      );
      return;
    }

    setSavingCurrency(currencyCode);
    setCurrencyMessage("");

    try {
      const currentCurrency = currencies.find(
        (currency) => currency.code === currencyCode
      );

      const oldRate =
        currentCurrency?.manual_rate_from_ghs ?? null;

      const { error: updateError } = await supabase
        .from("currencies")
        .update({
          manual_rate_from_ghs: newRate,
          rate_source: "MANUAL",
        })
        .eq("code", currencyCode);

      if (updateError) throw updateError;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { error: historyError } = await supabase
          .from("currency_rate_history")
          .insert({
            currency_code: currencyCode,
            old_rate: oldRate,
            new_rate: newRate,
            changed_by: user.id,
          });

        if (historyError) {
          console.error("Rate history error:", historyError);
        }

        const { error: adjustmentHistoryError } = await supabase
          .from("currency_adjustment_history")
          .insert({
            currency_code: currencyCode,
            old_rate: oldRate,
            reference_rate: currentCurrency?.xe_rate ?? null,
            new_rate: newRate,
            change_percent:
              currentCurrency?.xe_change_percent ?? 0,
            adjustment_percent:
              currentCurrency?.adjustment_percent ?? 100,
            adjustment_type: "MANUAL",
            changed_by: user.id,
          });

        if (adjustmentHistoryError) {
          console.error(
            "Adjustment history error:",
            adjustmentHistoryError
          );
        }
      }

      setCurrencies((current) =>
        current.map((currency) =>
          currency.code === currencyCode
            ? {
                ...currency,
                manual_rate_from_ghs: newRate,
                rate_source: "MANUAL",
              }
            : currency
        )
      );

      const name = currencyCode === "CNY" ? "RMB" : currencyCode;
      setCurrencyMessage(`${name} rate saved successfully.`);
    } catch (error: any) {
      console.error(error);
      setCurrencyMessage(
        error?.message || "Unable to save the currency rate."
      );
    } finally {
      setSavingCurrency(null);
    }
  }

  /*
   * SAVE XE ADJUSTMENT SETTINGS
   */
  async function saveAdjustmentSettings() {
    if (!isAdmin) {
      setCurrencyMessage(
        "You do not have administrator permission."
      );
      return;
    }

    const percentage = Number(adjustmentPercent);

    if (
      !Number.isFinite(percentage) ||
      percentage < 0 ||
      percentage > 100
    ) {
      setCurrencyMessage(
        "Adjustment percentage must be between 0% and 100%."
      );
      return;
    }

    setSavingAdjustmentSettings(true);
    setCurrencyMessage("");

    try {
      const { error } = await supabase
        .from("currencies")
        .update({
          auto_adjust_enabled: autoAdjustEnabled,
          adjustment_percent: percentage,
        })
        .in("code", ["USD", "CNY", "EUR", "GBP"]);

      if (error) throw error;

      setCurrencies((current) =>
        current.map((currency) =>
          ["USD", "CNY", "EUR", "GBP"].includes(currency.code)
            ? {
                ...currency,
                auto_adjust_enabled: autoAdjustEnabled,
                adjustment_percent: percentage,
              }
            : currency
        )
      );

      setCurrencyMessage(
        `XE adjustment settings saved. Automatic adjustment is ${
          autoAdjustEnabled ? "ON" : "OFF"
        } at ${percentage}%.`
      );
    } catch (error: any) {
      console.error(error);
      setCurrencyMessage(
        error?.message ||
          "Unable to save XE adjustment settings."
      );
    } finally {
      setSavingAdjustmentSettings(false);
    }
  }

  /*
   * CURRENT RATES
   */
  const currentRmbRate =
    currencies.find((currency) => currency.code === "CNY")
      ?.manual_rate_from_ghs ?? null;

  const currentUsdRate =
    currencies.find((currency) => currency.code === "USD")
      ?.manual_rate_from_ghs ?? null;

  const currentEurRate =
    currencies.find((currency) => currency.code === "EUR")
      ?.manual_rate_from_ghs ?? null;

  const currentGbpRate =
    currencies.find((currency) => currency.code === "GBP")
      ?.manual_rate_from_ghs ?? null;

  /*
   * CALCULATIONS
   */
  const ghsToRmb =
    ghsAmount && currentRmbRate && Number(ghsAmount) > 0
      ? Number(ghsAmount) * currentRmbRate
      : null;

  const rmbToGhs =
    rmbAmount && currentRmbRate && Number(rmbAmount) > 0
      ? Number(rmbAmount) / currentRmbRate
      : null;

  const ghsToUsd =
    ghsAmount && currentUsdRate && Number(ghsAmount) > 0
      ? Number(ghsAmount) * currentUsdRate
      : null;

  const usdToGhs =
    usdAmount && currentUsdRate && Number(usdAmount) > 0
      ? Number(usdAmount) / currentUsdRate
      : null;

  function formatNumber(value: number | null) {
    if (value === null) return "—";

    return value.toLocaleString("en-GH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function formatMovement(value: number | null) {
    if (value == null) return "Waiting";
    if (value > 0) return `+${value.toFixed(4)}%`;
    return `${value.toFixed(4)}%`;
  }

  /*
   * CURRENCY STATUS CARD
   */
  function CurrencyControlCard({
    code,
    name,
    flag,
    rate,
  }: {
    code: CurrencyCode;
    name: string;
    flag: string;
    rate: number | null;
  }) {
    const record = currencies.find(
      (currency) => currency.code === code
    );

    const movement = record?.xe_change_percent ?? null;

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
              {code}
            </p>
            <p className="mt-1 font-black">
              {flag} {name}
            </p>
          </div>

          <span
            className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
              record?.rate_source === "XE"
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {record?.rate_source || "MANUAL"}
          </span>
        </div>

        <div className="mt-4">
          <p className="text-xs font-black uppercase text-slate-400">
            Current Rate
          </p>
          <p className="mt-1 text-2xl font-black text-blue-700">
            {rate != null ? rate : "Not set"}
          </p>
        </div>

        <div className="mt-4">
          <p className="text-xs font-black uppercase text-slate-400">
            XE Reference
          </p>
          <p className="mt-1 font-black">
            {record?.xe_rate != null
              ? record.xe_rate
              : "Waiting for XE"}
          </p>
        </div>

        <div className="mt-3">
          <p className="text-xs font-black uppercase text-slate-400">
            XE Movement
          </p>
          <p
            className={`mt-1 font-black ${
              (movement ?? 0) > 0
                ? "text-green-600"
                : (movement ?? 0) < 0
                  ? "text-red-600"
                  : "text-slate-600"
            }`}
          >
            {formatMovement(movement)}
          </p>
        </div>

        {record?.last_xe_update && (
          <p className="mt-3 text-[11px] text-slate-400">
            Updated{" "}
            {new Date(record.last_xe_update).toLocaleString("en-GH")}
          </p>
        )}
      </div>
    );
  }

  /*
   * ACCESS CHECK SCREENS
   */
  if (checkingAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="text-3xl">🔐</div>
          <h1 className="mt-4 text-xl font-black">
            Checking administrator access...
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Please wait.
          </p>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-xl">
          <div className="text-5xl">🔒</div>
          <h1 className="mt-5 text-2xl font-black">
            Administrator Access Required
          </h1>
          <p className="mt-3 leading-7 text-slate-500">
            Your account does not have administrator permissions
            for Best Sales Ghana.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-xl bg-blue-700 px-6 py-3 font-black text-white hover:bg-blue-800"
          >
            Return to Website
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-dashboard min-h-screen text-slate-900">
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <Link href="/" className="admin-brand">
            <span className="admin-brand-mark">★</span>
            <span><strong>BEST SALES</strong><small>GHANA · ADMIN</small></span>
          </Link>
          <div className="admin-nav-label">WORKSPACE</div>
          <nav className="admin-nav" aria-label="Admin navigation">
            <a className="admin-nav-link active" href="#dashboard"><span>▦</span> Overview</a>
            <Link className="admin-nav-link" href="/admin/direct-sales"><span>🛒</span> Direct Sales</Link>
            <Link className="admin-nav-link" href="/listings"><span>📋</span> Marketplace Listings</Link>
            <a className="admin-nav-link" href="#management"><span>👥</span> Sellers & Customers</a>
            <a className="admin-nav-link" href="#management"><span>📦</span> Orders</a>
            <a className="admin-nav-link" href="#management"><span>🚚</span> Delivery & Tracking</a>
            <a className="admin-nav-link" href="#management"><span>💳</span> Payments</a>
            <Link className="admin-nav-link" href="/admin/revenue"><span>💰</span> Revenue & Settlements</Link>
            <a className="admin-nav-link" href="#management"><span>📢</span> Advertising</a>
            <a className="admin-nav-link" href="#currency-management"><span>⚙</span> Currency Settings</a>
          </nav>
          <div className="admin-sidebar-bottom">
            <div className="admin-secure"><span>🔐</span><div><strong>Secure workspace</strong><small>Administrator access</small></div></div>
            <Link href="/" className="admin-website-link">↗ View public website</Link>
          </div>
        </aside>
        <div className="admin-main" id="dashboard">
      {/* HEADER */}
      <header className="admin-topbar sticky top-0 z-40 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-700 text-2xl shadow-md">
              ⭐
            </div>
            <div>
              <div className="text-lg font-black tracking-tight sm:text-xl">
                BEST SALES GHANA
              </div>
              <div className="text-xs text-slate-500">
                Administration Portal
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden rounded-xl px-4 py-2.5 font-bold text-slate-600 hover:bg-slate-100 sm:block"
            >
              View Website
            </Link>
            <span className="rounded-xl bg-slate-950 px-4 py-2.5 font-bold text-white">
              Admin
            </span>
          </div>
        </div>
      </header>

      <section className="admin-content mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* TITLE */}
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-widest text-blue-700">
            Administration
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight sm:text-5xl">
            Admin Dashboard
          </h1>
          <p className="mt-3 max-w-3xl text-slate-500">
            Manage Best Sales Ghana, direct-sales products,
            marketplace sellers, customers, orders, deliveries,
            payments, revenue, advertising and currency exchange rates.
          </p>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500">
                Direct Sales
              </span>
              <span className="text-2xl">🛒</span>
            </div>
            <div className="mt-4 text-3xl font-black">0</div>
            <p className="mt-1 text-sm text-slate-500">
              Products published
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500">
                Marketplace
              </span>
              <span className="text-2xl">📋</span>
            </div>
            <div className="mt-4 text-3xl font-black">
              {loadingDashboardStats
                ? "..."
                : dashboardStats.listings.toLocaleString("en-GH")}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Seller listings
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500">
                Orders
              </span>
              <span className="text-2xl">📦</span>
            </div>
            <div className="mt-4 text-3xl font-black">0</div>
            <p className="mt-1 text-sm text-slate-500">
              Orders received
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-500">
                Customers
              </span>
              <span className="text-2xl">👤</span>
            </div>
            <div className="mt-4 text-3xl font-black">
              {loadingDashboardStats
                ? "..."
                : dashboardStats.accounts.toLocaleString("en-GH")}
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Registered accounts
            </p>
          </div>
        </div>

        {/* CURRENCY EXCHANGE */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-blue-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-blue-800 to-cyan-600 p-7 text-white sm:p-8">
            <p className="text-sm font-black uppercase tracking-widest text-cyan-100">
              Financial Control
            </p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              💱 Currency Exchange Control
            </h2>
            <p className="mt-3 max-w-3xl leading-7 text-white/85">
              Control your GHS conversion rates for RMB, USD, EUR
              and GBP. XE will provide the reference movement used
              for automatic rate adjustment once connected.
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {/* RATE INPUTS */}
            <div className="grid gap-5 md:grid-cols-2">
              {(
                [
                  {
                    code: "CNY",
                    name: "Chinese Yuan",
                    flag: "🇨🇳",
                    symbol: "¥",
                    value: rmbRate,
                    setter: setRmbRate,
                    current: currentRmbRate,
                    example: "0.544",
                    description:
                      "Enter the amount of RMB received for GH₵1.",
                  },
                  {
                    code: "USD",
                    name: "United States Dollar",
                    flag: "🇺🇸",
                    symbol: "$",
                    value: usdRate,
                    setter: setUsdRate,
                    current: currentUsdRate,
                    example: "0.080000",
                    description:
                      "Enter the amount of USD received for GH₵1.",
                  },
                  {
                    code: "EUR",
                    name: "Euro",
                    flag: "🇪🇺",
                    symbol: "€",
                    value: eurRate,
                    setter: setEurRate,
                    current: currentEurRate,
                    example: "0.070000",
                    description:
                      "Enter the amount of EUR received for GH₵1.",
                  },
                  {
                    code: "GBP",
                    name: "British Pound",
                    flag: "🇬🇧",
                    symbol: "£",
                    value: gbpRate,
                    setter: setGbpRate,
                    current: currentGbpRate,
                    example: "0.060000",
                    description:
                      "Enter the amount of GBP received for GH₵1.",
                  },
                ] as const
              ).map((item) => (
                <div
                  key={item.code}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black uppercase tracking-wider text-slate-500">
                        {item.name}
                      </p>
                      <h3 className="mt-1 text-2xl font-black">
                        {item.flag} {item.code}
                      </h3>
                    </div>
                    <div className="text-4xl">{item.symbol}</div>
                  </div>

                  <label className="mt-6 block text-sm font-bold text-slate-700">
                    GHS → {item.code} rate
                  </label>

                  <div className="mt-2 flex gap-3">
                    <input
                      type="number"
                      step="0.000001"
                      min="0"
                      value={item.value}
                      onChange={(event) =>
                        item.setter(event.target.value)
                      }
                      placeholder={`Example: ${item.example}`}
                      className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 font-bold outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        saveCurrencyRate(item.code)
                      }
                      disabled={savingCurrency === item.code}
                      className="rounded-xl bg-blue-700 px-5 py-3 font-black text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingCurrency === item.code
                        ? "Saving..."
                        : "Save"}
                    </button>
                  </div>

                  <p className="mt-3 text-sm text-slate-500">
                    {item.description}
                  </p>

                  <div className="mt-4 rounded-xl bg-white p-4">
                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Current rate
                    </p>
                    <p className="mt-1 text-2xl font-black text-blue-700">
                      {item.current ?? "Not set"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {currencyMessage && (
              <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-bold text-blue-900">
                {currencyMessage}
              </div>
            )}

            {/* XE CONTROL */}
            <div className="mt-8 rounded-3xl border border-indigo-200 bg-indigo-50 p-6 sm:p-8">
              <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                <div>
                  <p className="text-sm font-black uppercase tracking-widest text-indigo-700">
                    XE Reference System
                  </p>
                  <h3 className="mt-2 text-2xl font-black text-indigo-950">
                    ⚡ Automatic XE Rate Adjustment
                  </h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-indigo-800">
                    When the XE reference rate changes, Best Sales Ghana
                    can calculate the percentage movement and apply
                    that movement to your current marketplace rate.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() =>
                      setAutoAdjustEnabled((value) => !value)
                    }
                    className={`rounded-full px-5 py-3 font-black transition ${
                      autoAdjustEnabled
                        ? "bg-green-600 text-white"
                        : "bg-slate-300 text-slate-700"
                    }`}
                  >
                    {autoAdjustEnabled
                      ? "AUTO ADJUST: ON"
                      : "AUTO ADJUST: OFF"}
                  </button>

                  <button
                    type="button"
                    onClick={saveAdjustmentSettings}
                    disabled={savingAdjustmentSettings}
                    className="rounded-full bg-slate-950 px-5 py-3 font-black text-white disabled:opacity-60"
                  >
                    {savingAdjustmentSettings
                      ? "Saving..."
                      : "Save Settings"}
                  </button>
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-3">
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <label className="text-sm font-black text-slate-700">
                    Adjustment Percentage
                  </label>
                  <div className="mt-2 flex items-center rounded-xl border border-slate-300 bg-white">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="1"
                      value={adjustmentPercent}
                      onChange={(event) =>
                        setAdjustmentPercent(event.target.value)
                      }
                      className="w-full rounded-xl border-0 px-4 py-3 font-black outline-none"
                    />
                    <span className="pr-4 font-black text-slate-500">
                      %
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    100% follows the full XE movement. 50% applies
                    half of the movement.
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm font-black text-slate-700">
                    XE Connection
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-amber-400" />
                    <span className="font-black text-amber-700">
                      Awaiting XE API
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Live XE rates will be activated after your XE API
                    account is recovered and connected.
                  </p>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                  <p className="text-sm font-black text-slate-700">
                    Adjustment Formula
                  </p>
                  <div className="mt-3 rounded-xl bg-indigo-50 p-4">
                    <p className="text-sm font-black text-indigo-900">
                      New Rate = Current Rate × (1 + XE Movement ×
                      Adjustment %)
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <CurrencyControlCard
                  code="CNY"
                  name="Chinese Yuan"
                  flag="🇨🇳"
                  rate={currentRmbRate}
                />
                <CurrencyControlCard
                  code="USD"
                  name="US Dollar"
                  flag="🇺🇸"
                  rate={currentUsdRate}
                />
                <CurrencyControlCard
                  code="EUR"
                  name="Euro"
                  flag="🇪🇺"
                  rate={currentEurRate}
                />
                <CurrencyControlCard
                  code="GBP"
                  name="British Pound"
                  flag="🇬🇧"
                  rate={currentGbpRate}
                />
              </div>

              <div className="mt-6 rounded-2xl border border-indigo-200 bg-white p-5">
                <h4 className="font-black text-indigo-950">
                  How automatic adjustment will work
                </h4>
                <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-4">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <strong>1.</strong> XE provides the new reference rate.
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <strong>2.</strong> The system calculates the percentage movement.
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <strong>3.</strong> Your adjustment percentage is applied.
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <strong>4.</strong> The new marketplace rate is saved in history.
                  </div>
                </div>
              </div>
            </div>

            {/* CURRENCY CALCULATOR */}
            <div className="mt-8">
              <div className="mb-5">
                <p className="text-sm font-black uppercase tracking-widest text-blue-700">
                  Automatic Calculator
                </p>
                <h3 className="mt-2 text-2xl font-black">
                  Currency Conversion
                </h3>
                <p className="mt-2 text-slate-500">
                  These calculations use the rates currently saved above.
                </p>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <label className="text-sm font-black text-slate-600">
                    Ghana Cedis
                  </label>
                  <div className="mt-2 flex items-center rounded-xl border border-slate-300 bg-white">
                    <span className="px-4 text-lg font-black text-slate-500">
                      GH₵
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={ghsAmount}
                      onChange={(event) =>
                        setGhsAmount(event.target.value)
                      }
                      placeholder="800"
                      className="w-full rounded-xl border-0 px-2 py-4 font-black outline-none"
                    />
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-blue-50 p-4">
                      <p className="text-xs font-black uppercase text-blue-600">
                        RMB
                      </p>
                      <p className="mt-2 text-xl font-black text-blue-900">
                        ¥{formatNumber(ghsToRmb)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-green-50 p-4">
                      <p className="text-xs font-black uppercase text-green-600">
                        USD
                      </p>
                      <p className="mt-2 text-xl font-black text-green-900">
                        ${formatNumber(ghsToUsd)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <label className="text-sm font-black text-slate-600">
                    Foreign Currency
                  </label>

                  <div className="mt-4">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                      RMB → GHS
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={rmbAmount}
                      onChange={(event) =>
                        setRmbAmount(event.target.value)
                      }
                      placeholder="800"
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-4 font-black outline-none focus:border-blue-600"
                    />
                    <div className="mt-2 rounded-xl bg-blue-50 p-4">
                      <p className="text-xs font-black text-blue-600">
                        GH₵ VALUE
                      </p>
                      <p className="mt-1 text-xl font-black text-blue-900">
                        GH₵{formatNumber(rmbToGhs)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-400">
                      USD → GHS
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={usdAmount}
                      onChange={(event) =>
                        setUsdAmount(event.target.value)
                      }
                      placeholder="100"
                      className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-4 font-black outline-none focus:border-blue-600"
                    />
                    <div className="mt-2 rounded-xl bg-green-50 p-4">
                      <p className="text-xs font-black text-green-600">
                        GH₵ VALUE
                      </p>
                      <p className="mt-1 text-xl font-black text-green-900">
                        GH₵{formatNumber(usdToGhs)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                <div className="flex gap-3">
                  <div className="text-xl">ℹ️</div>
                  <div>
                    <h4 className="font-black text-blue-900">
                      How the rate works
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-blue-800">
                      If your RMB rate is <strong>0.544</strong>, then
                      GH₵800 × 0.544 = ¥435.20. To convert back,
                      ¥800 ÷ 0.544 = GH₵1,470.59.
                    </p>
                    <p className="mt-2 text-sm leading-6 text-blue-800">
                      The rate can be controlled manually or, after the
                      XE API connection is activated, adjusted according
                      to XE percentage movement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* REVENUE SUMMARY */}
        <section className="mt-8">
          <div className="mb-5">
            <p className="text-sm font-black uppercase tracking-widest text-blue-700">
              Platform Finance
            </p>
            <h2 className="mt-2 text-3xl font-black">
              Revenue & Payment Overview
            </h2>
            <p className="mt-2 max-w-3xl text-slate-500">
              Monitor marketplace payment activity, platform revenue,
              seller funds and settlement status.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-blue-700">
                  Platform Revenue
                </span>
                <span className="text-2xl">📊</span>
              </div>
              <div className="mt-4 text-3xl font-black text-blue-900">
                2.15%
              </div>
              <p className="mt-1 text-sm text-blue-700">
                Standard marketplace payment fee
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500">
                  Seller Funds Held
                </span>
                <span className="text-2xl">🔒</span>
              </div>
              <div className="mt-4 text-3xl font-black">GH₵0</div>
              <p className="mt-1 text-sm text-slate-500">
                Awaiting settlement
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500">
                  Platform Revenue
                </span>
                <span className="text-2xl">💰</span>
              </div>
              <div className="mt-4 text-3xl font-black">GH₵0</div>
              <p className="mt-1 text-sm text-slate-500">
                Revenue collected
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-500">
                  Pending Settlement
                </span>
                <span className="text-2xl">⏳</span>
              </div>
              <div className="mt-4 text-3xl font-black">GH₵0</div>
              <p className="mt-1 text-sm text-slate-500">
                Scheduled for release
              </p>
            </div>
          </div>
        </section>

        {/* DIRECT SALES FEATURE */}
        <section className="mt-8 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-800 via-blue-700 to-cyan-500 p-7 text-white shadow-xl sm:p-10">
          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-cyan-100">
                Your Products
              </p>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                Direct Sales Products
              </h2>
              <p className="mt-3 max-w-2xl leading-7 text-white/85">
                Add and manage products owned by Best Sales Ghana.
                You decide when a product is published. Direct-sales
                products appear alongside other marketplace listings
                and will not be pinned.
              </p>
            </div>
            <Link
              href="/admin/direct-sales"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-6 py-4 font-black text-blue-800 shadow-lg transition hover:-translate-y-1"
            >
              Manage Direct Sales →
            </Link>
          </div>
        </section>

        {/* REVENUE FEATURE */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
          <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-widest text-blue-700">
                Financial Control
              </p>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                Revenue & Payments
              </h2>
              <p className="mt-3 max-w-3xl leading-7 text-slate-500">
                View customer payments, calculate platform revenue,
                monitor seller funds and manage settlement releases.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-100 px-3 py-1.5 text-xs font-black text-blue-700">
                  2.15% PLATFORM REVENUE
                </span>
                <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-black text-amber-700">
                  SELLER FUNDS HELD
                </span>
                <span className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-black text-green-700">
                  DELIVERY RELEASE
                </span>
                <span className="rounded-full bg-purple-100 px-3 py-1.5 text-xs font-black text-purple-700">
                  5-DAY SETTLEMENT
                </span>
              </div>
            </div>
            <Link
              href="/admin/revenue"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-slate-950 px-6 py-4 font-black text-white shadow-lg transition hover:-translate-y-1 hover:bg-blue-700"
            >
              Open Revenue Dashboard →
            </Link>
          </div>
        </section>

        {/* ADMIN SECTIONS */}
        <section className="mt-10">
          <div className="mb-6">
            <p className="text-sm font-black uppercase tracking-widest text-blue-700">
              Management
            </p>
            <h2 className="mt-2 text-3xl font-black">
              Marketplace Administration
            </h2>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {adminSections.map((section) => (
              <div
                key={section.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
                    {section.icon}
                  </div>

                  {section.title === "Direct Sales" && (
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-700">
                      YOUR PRODUCTS
                    </span>
                  )}

                  {section.title === "Revenue & Payments" && (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700">
                      2.15%
                    </span>
                  )}
                </div>

                <h3 className="mt-5 text-xl font-black">
                  {section.title}
                </h3>
                <p className="mt-2 min-h-[72px] text-sm leading-6 text-slate-500">
                  {section.description}
                </p>
                <Link
                  href={section.href}
                  className="mt-5 inline-flex rounded-xl border border-blue-700 px-4 py-3 font-bold text-blue-700 transition hover:bg-blue-700 hover:text-white"
                >
                  {section.action}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* DIRECT SALES CONTROL */}
        <section className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">
            Direct Sales Control
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-5">
              <div className="text-2xl">📷</div>
              <h3 className="mt-3 font-black">Product Pictures</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Upload and replace product images whenever necessary.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <div className="text-2xl">💵</div>
              <h3 className="mt-3 font-black">Price Management</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Change product prices from the admin area without
                changing website code.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-5">
              <div className="text-2xl">📦</div>
              <h3 className="mt-3 font-black">Stock Management</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Control stock quantities and product availability.
              </p>
            </div>
          </div>
        </section>

        {/* PAYMENT RULES */}
        <section className="mt-8 rounded-2xl border border-blue-200 bg-blue-50 p-6">
          <div className="flex gap-4">
            <div className="text-2xl">💳</div>
            <div>
              <h2 className="text-xl font-black text-blue-900">
                Marketplace Payment Structure
              </h2>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-blue-700">
                    Standard Marketplace
                  </p>
                  <p className="mt-2 text-2xl font-black">2.15%</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Platform revenue calculated from eligible platform payments.
                  </p>
                </div>

                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-amber-700">
                    Settlement
                  </p>
                  <p className="mt-2 text-2xl font-black">5 Days</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Seller funds can remain held for the settlement period.
                  </p>
                </div>

                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs font-black uppercase tracking-wider text-green-700">
                    Delivery
                  </p>
                  <p className="mt-2 text-2xl font-black">Successful</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Funds can be released after successful delivery according
                    to the payment rules.
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-xl border border-purple-200 bg-purple-50 p-4">
                <p className="text-sm leading-6 text-purple-900">
                  <strong>Top Priority advertising:</strong> Sellers who
                  purchase the Top Priority advertising package are not
                  charged the 2.15% platform payment revenue on payments
                  covered by that specific arrangement. Top Priority
                  advertising includes Best Sales Ghana delivery and tracking.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECURITY NOTICE */}
        <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex gap-3">
            <div className="text-xl">🔐</div>
            <div>
              <h3 className="font-black text-amber-900">
                Admin security
              </h3>
              <p className="mt-1 text-sm leading-6 text-amber-800">
                Currency changes and other administration controls
                should only be available to authenticated accounts
                with the admin account type.
              </p>
            </div>
          </div>
        </section>
      </section>

      {/* FOOTER */}
      <footer className="mt-12 border-t border-slate-200 bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center sm:px-6 lg:px-8">
          <p className="font-black text-white">
            BEST SALES GHANA — ADMINISTRATION
          </p>
          <p className="mt-2 text-sm text-slate-500">
            © {new Date().getFullYear()} All Prominent Ghana Limited.
            All rights reserved.
          </p>
        </div>
      </footer>
        </div>
      </div>
    </main>
  );
}
