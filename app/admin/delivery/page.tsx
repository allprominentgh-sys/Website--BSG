
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/supabase-browser";

type DeliveryStatus =
  | "Pending Assignment"
  | "Assigned"
  | "Collected"
  | "In Transit"
  | "Delivered"
  | "Failed";

type Delivery = {
  id: string;
  orderNumber: string;
  seller: string;
  sellerId: string;
  items: string;
  customer: string;
  customerPhone: string;
  destination: string;
  gps: string;
  rider: string;
  riderId: string;
  riderPhone: string;
  vehicle: string;
  vehicleNumber: string;
  status: DeliveryStatus;
  fee: string;
  notes: string;
};

const statuses: DeliveryStatus[] = [
  "Pending Assignment",
  "Assigned",
  "Collected",
  "In Transit",
  "Delivered",
  "Failed",
];

const statusStyles: Record<DeliveryStatus, string> = {
  "Pending Assignment": "bg-amber-100 text-amber-800",
  Assigned: "bg-blue-100 text-blue-800",
  Collected: "bg-indigo-100 text-indigo-800",
  "In Transit": "bg-purple-100 text-purple-800",
  Delivered: "bg-green-100 text-green-800",
  Failed: "bg-red-100 text-red-800",
};

const emptyDelivery: Delivery = {
  id: "",
  orderNumber: "",
  seller: "",
  sellerId: "",
  items: "",
  customer: "",
  customerPhone: "",
  destination: "",
  gps: "",
  rider: "",
  riderId: "",
  riderPhone: "",
  vehicle: "",
  vehicleNumber: "",
  status: "Pending Assignment",
  fee: "",
  notes: "",
};

export default function AdminDeliveryPage() {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState<Delivery>(emptyDelivery);

  useEffect(() => {
    let active = true;

    async function verifyAdmin() {
      try {
        setError("");

        const supabase = supabaseBrowser();

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw new Error(
            `Login verification failed: ${authError.message}`
          );
        }

        if (!user) {
          window.location.href = "/login";
          return;
        }

        const {
          data: profile,
          error: profileError,
        } = await supabase
          .from("profiles")
          .select("account_type")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Delivery profile query failed:", {
            code: profileError.code,
            message: profileError.message,
          });

          throw new Error(
            `Could not verify your administrator profile. Database error: ${profileError.message}`
          );
        }

        const role = String(
          profile?.account_type ?? ""
        )
          .trim()
          .toLowerCase();

        if (!profile) {
          console.error(
            "Delivery authorization failed: no readable profile row for the authenticated user.",
            { userId: user.id }
          );

          throw new Error(
            "No readable profile was found for your current login. Please check that your profiles.id matches your authenticated user ID and that profile access permissions allow this lookup."
          );
        }

        if (!["admin", "administrator"].includes(role)) {
          console.warn("Delivery administrator access denied:", {
            role,
            userId: user.id,
          });

          throw new Error(
            `Your current account role is "${role || "empty"}". Only authorized administrators can access Delivery Operations.`
          );
        }

        if (active) {
          setAuthorized(true);
          setError("");
        }
      } catch (err) {
        if (active) {
          setAuthorized(false);
          setError(
            err instanceof Error
              ? err.message
              : "Unable to verify administrator access."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void verifyAdmin();

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();

    return deliveries.filter((delivery) => {
      const matchesStatus =
        statusFilter === "All" ||
        delivery.status === statusFilter;

      const searchable = [
        delivery.id,
        delivery.orderNumber,
        delivery.seller,
        delivery.sellerId,
        delivery.items,
        delivery.customer,
        delivery.customerPhone,
        delivery.destination,
        delivery.gps,
        delivery.rider,
        delivery.riderId,
        delivery.riderPhone,
        delivery.vehicleNumber,
      ]
        .join(" ")
        .toLowerCase();

      return matchesStatus && searchable.includes(term);
    });
  }, [deliveries, search, statusFilter]);

  function openNewDelivery() {
    setError("");
    setEditingId("");
    setForm({
      ...emptyDelivery,
      id: `BSG-${Date.now().toString().slice(-8)}`,
    });
    setShowForm(true);
  }

  function editDelivery(delivery: Delivery) {
    setError("");
    setEditingId(delivery.id);
    setForm({ ...delivery });
    setShowForm(true);
  }

  function saveDelivery(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (!form.orderNumber.trim() || !form.customer.trim()) {
      setError("Order number and customer name are required.");
      return;
    }

    if (editingId) {
      setDeliveries((current) =>
        current.map((item) =>
          item.id === editingId
            ? { ...form, id: editingId }
            : item
        )
      );
    } else {
      setDeliveries((current) => [
        {
          ...form,
          id: form.id || `BSG-${Date.now()}`,
        },
        ...current,
      ]);
    }

    setShowForm(false);

    setError(
      "Demo only: this delivery has not been saved to Supabase. Database integration is still required."
    );
  }

  const count = (status: DeliveryStatus) =>
    deliveries.filter((item) => item.status === status).length;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
        <p className="font-semibold text-slate-600">
          Verifying administrator access...
        </p>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="min-h-screen bg-slate-100 p-6">
        <section className="mx-auto max-w-xl rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-black text-slate-900">
            Access Restricted
          </h1>

          <p className="mt-3 break-words text-red-700">
            {error || "Administrator access is required."}
          </p>

          <p className="mt-3 text-sm text-slate-500">
            Your account permissions have not been changed.
          </p>

          <Link
            href="/admin"
            className="mt-5 inline-block rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800"
          >
            Back to Admin
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
              Monitor orders, sellers, customers, destinations
              and delivery personnel.
            </p>
          </div>

          <Link
            href="/admin"
            className="rounded-xl border border-slate-300 px-4 py-3 font-bold hover:bg-slate-50"
          >
            ← Admin Dashboard
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-blue-800 to-cyan-600 p-6 text-white">
          <div>
            <h2 className="text-2xl font-black">
              Delivery Operations
            </h2>
            <p className="mt-2 text-sm text-blue-50">
              Issue deliveries and monitor their progress.
            </p>
          </div>

          <button
            type="button"
            onClick={openNewDelivery}
            className="rounded-xl bg-white px-5 py-3 font-black text-blue-800 hover:bg-blue-50"
          >
            + Issue Delivery
          </button>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Deliveries Issued", deliveries.length, "📦"],
            ["Pending Assignment", count("Pending Assignment"), "⏳"],
            ["In Transit", count("In Transit"), "🚚"],
            ["Assigned", count("Assigned"), "👤"],
            ["Delivered", count("Delivered"), "✅"],
            ["Failed", count("Failed"), "⚠️"],
          ].map(([label, value, icon]) => (
            <article
              key={String(label)}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-2xl">{icon}</p>
              <p className="mt-3 text-sm font-semibold text-slate-500">
                {label}
              </p>
              <p className="mt-2 text-3xl font-black">
                {value}
              </p>
            </article>
          ))}
        </section>

        {error && (
          <div
            role="status"
            className="break-words rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
          >
            {error}
          </div>
        )}

        {showForm && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-black">
                {editingId ? "Edit Delivery" : "Issue a Delivery"}
              </h2>

              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border px-3 py-2 font-bold"
              >
                Close
              </button>
            </div>

            <form
              onSubmit={saveDelivery}
              className="mt-5 space-y-6"
            >
              <div>
                <h3 className="font-black text-blue-800">
                  Order and Seller / Company
                </h3>

                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  {[
                    ["orderNumber", "Order number *"],
                    ["seller", "Seller / Company name"],
                    ["sellerId", "Seller / Company ID"],
                    ["items", "Items and quantities"],
                    ["fee", "Delivery fee (GH₵)"],
                  ].map(([key, label]) => (
                    <label
                      key={key}
                      className="text-sm font-semibold"
                    >
                      {label}

                      <input
                        value={form[key as keyof Delivery] as string}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            [key]: event.target.value,
                          }))
                        }
                        required={key === "orderNumber"}
                        className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-black text-blue-800">
                  Customer and Destination
                </h3>

                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  {[
                    ["customer", "Customer name *"],
                    ["customerPhone", "Customer phone"],
                    ["destination", "Full delivery address"],
                    ["gps", "Ghana Post GPS / coordinates"],
                  ].map(([key, label]) => (
                    <label
                      key={key}
                      className="text-sm font-semibold"
                    >
                      {label}

                      <input
                        value={form[key as keyof Delivery] as string}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            [key]: event.target.value,
                          }))
                        }
                        required={key === "customer"}
                        className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-black text-blue-800">
                  Assigned BSG Rider / Driver
                </h3>

                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  {[
                    ["rider", "Rider / driver full name"],
                    ["riderId", "Staff / Rider ID"],
                    ["riderPhone", "Rider / driver phone"],
                    ["vehicle", "Vehicle type"],
                    ["vehicleNumber", "Vehicle registration number"],
                  ].map(([key, label]) => (
                    <label
                      key={key}
                      className="text-sm font-semibold"
                    >
                      {label}

                      <input
                        value={form[key as keyof Delivery] as string}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            [key]: event.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal"
                      />
                    </label>
                  ))}

                  <label className="text-sm font-semibold">
                    Delivery status

                    <select
                      value={form.status}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          status: event.target.value as DeliveryStatus,
                        }))
                      }
                      className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-3"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>

              <label className="block text-sm font-semibold">
                Internal notes / delivery instructions

                <textarea
                  value={form.notes}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      notes: event.target.value,
                    }))
                  }
                  rows={3}
                  className="mt-2 w-full rounded-xl border border-slate-300 px-3 py-3 font-normal"
                />
              </label>

              <button
                type="submit"
                className="rounded-xl bg-blue-700 px-6 py-3 font-black text-white hover:bg-blue-800"
              >
                Save Delivery Record
              </button>
            </form>
          </section>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black">Find a Delivery</h2>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order, seller, customer, rider..."
              className="rounded-xl border border-slate-300 px-4 py-3"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3"
            >
              <option value="All">All statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b p-5">
            <h2 className="text-xl font-black">
              Delivery Register
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {filtered.length} record(s) displayed.
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-3xl">🚚</p>
              <h3 className="mt-3 font-black">
                No delivery records to display
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Issue a delivery to begin. Live orders have not
                yet been connected.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((delivery) => (
                <article
                  key={delivery.id}
                  className="space-y-4 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-black">
                        {delivery.orderNumber}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Delivery reference: {delivery.id}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${statusStyles[delivery.status]}`}
                    >
                      {delivery.status}
                    </span>
                  </div>

                  <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="font-bold text-slate-500">
                        Seller / Company
                      </p>
                      <p>{delivery.seller || "Not recorded"}</p>
                      <p className="break-all text-xs text-slate-500">
                        {delivery.sellerId}
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-slate-500">
                        Items
                      </p>
                      <p className="whitespace-pre-wrap">
                        {delivery.items || "Not recorded"}
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-slate-500">
                        Customer
                      </p>
                      <p>{delivery.customer}</p>
                      <p>{delivery.customerPhone}</p>
                    </div>

                    <div>
                      <p className="font-bold text-slate-500">
                        Destination
                      </p>
                      <p>{delivery.destination || "Not recorded"}</p>
                      <p className="text-xs text-slate-500">
                        {delivery.gps}
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-slate-500">
                        Assigned Rider / Driver
                      </p>
                      <p>{delivery.rider || "Not assigned"}</p>
                      <p>{delivery.riderPhone}</p>
                      <p className="text-xs text-slate-500">
                        ID: {delivery.riderId || "Not assigned"}
                      </p>
                    </div>

                    <div>
                      <p className="font-bold text-slate-500">
                        Vehicle
                      </p>
                      <p>{delivery.vehicle || "Not recorded"}</p>
                      <p>{delivery.vehicleNumber}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                    <p className="font-bold">
                      Delivery fee: GH₵ {delivery.fee || "0.00"}
                    </p>

                    <button
                      type="button"
                      onClick={() => editDelivery(delivery)}
                      className="rounded-xl border border-blue-700 px-4 py-2 font-bold text-blue-700 hover:bg-blue-50"
                    >
                      Edit Record
                    </button>
                  </div>

                  {delivery.notes && (
                    <p className="text-sm text-slate-600">
                      Notes: {delivery.notes}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
