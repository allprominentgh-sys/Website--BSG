"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/supabase-browser";

type DeliveryStatus =
  | "Assigned"
  | "Collected"
  | "In Transit"
  | "Delivered"
  | "Failed";

type Delivery = {
  id: string;
  order_number: string;
  seller_name: string;
  items: string;
  customer_name: string;
  customer_phone: string;
  pickup_address: string;
  delivery_address: string;
  delivery_gps: string;
  rider_name: string;
  rider_phone: string;
  vehicle: string;
  status: DeliveryStatus;
};

export default function DeliveryStaffPage() {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function checkAccess() {
      try {
        const supabase = supabaseBrowser();

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user) {
          window.location.href = "/login";
          return;
        }

        const { data: profile, error: profileError } =
          await supabase
            .from("profiles")
            .select("id, full_name, account_type")
            .eq("id", user.id)
            .maybeSingle();

        if (profileError) throw profileError;

        const role = (
          profile?.account_type ?? ""
        ).toLowerCase();

        const allowedRoles = [
          "admin",
          "administrator",
          "delivery",
          "rider",
          "driver",
          "delivery_staff",
        ];

        if (!allowedRoles.includes(role)) {
          if (active) {
            setError(
              "You are not authorised to access BSG Delivery Service."
            );
          }
          return;
        }

        if (active) setAuthorized(true);

        /*
         * Delivery records will be loaded here after the
         * permanent delivery database and staff assignments
         * have been connected.
         */
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to verify delivery staff access."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void checkAccess();

    return () => {
      active = false;
    };
  }, []);

  const filteredDeliveries = deliveries.filter((delivery) => {
    const term = search.toLowerCase().trim();

    return [
      delivery.order_number,
      delivery.seller_name,
      delivery.customer_name,
      delivery.customer_phone,
      delivery.delivery_address,
      delivery.delivery_gps,
      delivery.status,
    ].some((value) =>
      (value ?? "").toLowerCase().includes(term)
    );
  });

  function updateStatus(
    id: string,
    status: DeliveryStatus
  ) {
    setDeliveries((current) =>
      current.map((delivery) =>
        delivery.id === id
          ? { ...delivery, status }
          : delivery
      )
    );

    setError(
      "Status changed on this screen only. Database saving must be connected before this update is permanent."
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <p className="font-semibold text-slate-600">
          Checking delivery staff access...
        </p>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="min-h-screen bg-slate-100 p-6">
        <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6">
          <h1 className="text-2xl font-black">
            BSG Delivery Service
          </h1>
          <p className="mt-3 text-red-700">
            {error || "Authorised delivery staff only."}
          </p>
          <Link
            href="/"
            className="mt-5 inline-block rounded-xl bg-blue-700 px-4 py-3 font-bold text-white"
          >
            Return to Website
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-6 sm:px-6">
          <div>
            <p className="text-sm font-black text-blue-700">
              BEST SALES GHANA
            </p>
            <h1 className="mt-2 text-3xl font-black">
              BSG Delivery Service
            </h1>
            <p className="mt-2 text-slate-600">
              Rider and driver delivery workspace
            </p>
          </div>

          <Link
            href="/"
            className="rounded-xl border border-slate-300 px-4 py-3 font-bold"
          >
            ← Website
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <section className="rounded-3xl bg-gradient-to-r from-blue-800 to-cyan-600 p-7 text-white">
          <h2 className="text-2xl font-black">
            My Assigned Deliveries
          </h2>
          <p className="mt-3 leading-7 text-blue-50">
            Review collection details, confirm customer destinations,
            and record delivery progress.
          </p>
        </section>

        {error && (
          <div
            role="status"
            className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
          >
            {error}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Assigned",
              value: deliveries.filter(
                (item) => item.status === "Assigned"
              ).length,
            },
            {
              label: "In Transit",
              value: deliveries.filter(
                (item) => item.status === "In Transit"
              ).length,
            },
            {
              label: "Delivered",
              value: deliveries.filter(
                (item) => item.status === "Delivered"
              ).length,
            },
          ].map((stat) => (
            <article
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-sm font-semibold text-slate-500">
                {stat.label}
              </p>
              <p className="mt-3 text-3xl font-black">
                {stat.value}
              </p>
            </article>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <label
            htmlFor="delivery-search"
            className="font-bold"
          >
            Search deliveries
          </label>
          <input
            id="delivery-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Order number, customer, phone or location..."
            className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3"
          />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-xl font-black">
              Delivery Assignments
            </h2>
          </div>

          {filteredDeliveries.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-4xl">🚚</p>
              <h3 className="mt-4 text-lg font-black">
                No assigned deliveries
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Your assigned orders will appear here after the
                BSG delivery database is connected.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredDeliveries.map((delivery) => (
                <article
                  key={delivery.id}
                  className="space-y-4 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-lg font-black">
                      Order {delivery.order_number}
                    </h3>
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                      {delivery.status}
                    </span>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="font-bold">Seller / Company</p>
                      <p className="mt-1 text-slate-600">
                        {delivery.seller_name}
                      </p>
                    </div>
                    <div>
                      <p className="font-bold">Items</p>
                      <p className="mt-1 whitespace-pre-wrap text-slate-600">
                        {delivery.items}
                      </p>
                    </div>
                    <div>
                      <p className="font-bold">Collection Address</p>
                      <p className="mt-1 text-slate-600">
                        {delivery.pickup_address}
                      </p>
                    </div>
                    <div>
                      <p className="font-bold">Customer</p>
                      <p className="mt-1 text-slate-600">
                        {delivery.customer_name}
                      </p>
                      <p className="text-slate-600">
                        {delivery.customer_phone}
                      </p>
                    </div>
                    <div>
                      <p className="font-bold">Delivery Destination</p>
                      <p className="mt-1 text-slate-600">
                        {delivery.delivery_address}
                      </p>
                      <p className="text-sm text-slate-500">
                        GPS: {delivery.delivery_gps || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="font-bold">Assigned Driver / Rider</p>
                      <p className="mt-1 text-slate-600">
                        {delivery.rider_name}
                      </p>
                      <p className="text-slate-600">
                        {delivery.rider_phone}
                      </p>
                      <p className="text-sm text-slate-500">
                        {delivery.vehicle}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 border-t pt-4">
                    <label className="text-sm font-bold">
                      Update status
                      <select
                        value={delivery.status}
                        onChange={(event) =>
                          updateStatus(
                            delivery.id,
                            event.target.value as DeliveryStatus
                          )
                        }
                        className="mt-2 block rounded-xl border border-slate-300 bg-white px-3 py-3"
                      >
                        {(
                          [
                            "Assigned",
                            "Collected",
                            "In Transit",
                            "Delivered",
                            "Failed",
                          ] as DeliveryStatus[]
                        ).map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
