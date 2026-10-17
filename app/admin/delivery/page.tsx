
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Order = {
  id: string;
  order_number?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  delivery_address?: string | null;
  delivery_city?: string | null;
  delivery_region?: string | null;
  currency?: string | null;
  delivery_fee?: number | string | null;
  payment_status?: string | null;
};

type Delivery = {
  id: string;
  order_id: string;
  status?: string | null;
  delivery_method?: string | null;
  tracking_number?: string | null;
  third_party_provider?: string | null;
  vehicle_type?: string | null;
  vehicle_number?: string | null;
  delivery_fee?: number | string | null;
  notes?: string | null;
  created_at?: string | null;
};

const DELIVERY_METHODS = [
  { value: "BSG_DELIVERY", label: "BestSalesGH Delivery" },
  { value: "SELLER_DELIVERY", label: "Seller Delivery" },
  { value: "SELF_PICKUP", label: "Customer Self-Pickup" },
  { value: "THIRD_PARTY_REQUEST", label: "Third-Party Delivery" },
];

function money(value: number | string | null | undefined, currency?: string | null) {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) return "—";

  return `${currency || "GHS"} ${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function readable(value?: string | null) {
  if (!value) return "Not set";

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function AdminDeliveryPage() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [method, setMethod] = useState("BSG_DELIVERY");
  const [provider, setProvider] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [deliveryFee, setDeliveryFee] = useState("");
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const selectedOrder = orders.find(
    (order) => order.id === selectedOrderId
  );

  const loadDeliveries = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/deliver", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const result = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        router.replace("/admin/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Could not load delivery records."
        );
      }

      const loadedOrders = Array.isArray(result.orders)
        ? result.orders
        : Array.isArray(result.data?.orders)
          ? result.data.orders
          : [];

      const loadedDeliveries = Array.isArray(result.deliveries)
        ? result.deliveries
        : Array.isArray(result.data?.deliveries)
          ? result.data.deliveries
          : [];

      setOrders(loadedOrders);
      setDeliveries(loadedDeliveries);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while loading deliveries."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    let active = true;

    async function checkAdminSession() {
      setChecking(true);

      try {
        const response = await fetch("/api/admin/session", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const result = await response.json().catch(() => ({}));

        if (!active) return;

        if (!response.ok || result.authenticated !== true) {
          router.replace("/admin/login");
          return;
        }

        setChecking(false);
        await loadDeliveries();
      } catch {
        if (active) {
          router.replace("/admin/login");
        }
      } finally {
        if (active) setChecking(false);
      }
    }

    checkAdminSession();

    return () => {
      active = false;
    };
  }, [router, loadDeliveries]);

  async function createDelivery(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!selectedOrderId) {
      setError("Please select a paid order.");
      return;
    }

    if (method === "THIRD_PARTY_REQUEST" && !provider.trim()) {
      setError("Enter the third-party delivery provider.");
      return;
    }

    if (deliveryFee.trim() && !Number.isFinite(Number(deliveryFee))) {
      setError("Enter a valid delivery fee.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/admin/deliver", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId: selectedOrderId,
          method,
          thirdPartyProvider:
            method === "THIRD_PARTY_REQUEST" ? provider.trim() : null,
          vehicleType: vehicleType.trim() || null,
          vehicleNumber: vehicleNumber.trim() || null,
          deliveryFee:
            deliveryFee.trim() === "" ? null : Number(deliveryFee),
          notes: notes.trim() || null,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (response.status === 401 || response.status === 403) {
        router.replace("/admin/login");
        return;
      }

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Could not create delivery record."
        );
      }

      setNotice(result.message || "Delivery record created successfully.");
      setSelectedOrderId("");
      setMethod("BSG_DELIVERY");
      setProvider("");
      setVehicleType("");
      setVehicleNumber("");
      setDeliveryFee("");
      setNotes("");

      await loadDeliveries();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while creating the delivery."
      );
    } finally {
      setSaving(false);
    }
  }

  const filteredDeliveries = deliveries.filter((delivery) => {
    const order = orders.find((item) => item.id === delivery.order_id);

    const text = [
      delivery.id,
      delivery.order_id,
      delivery.tracking_number,
      delivery.status,
      delivery.delivery_method,
      delivery.third_party_provider,
      order?.order_number,
      order?.customer_name,
      order?.customer_email,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return text.includes(search.toLowerCase());
  });

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-700 shadow-sm">
          Verifying administrator access…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 text-slate-900 sm:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
              BestSalesGH Admin
            </p>
            <h1 className="mt-1 text-3xl font-bold">Delivery & Tracking</h1>
            <p className="mt-2 text-sm text-slate-600">
              Manage delivery records for orders whose payments have been
              confirmed.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold hover:bg-slate-100"
            >
              Admin Dashboard
            </button>

            <button
              type="button"
              onClick={() => void loadDeliveries()}
              disabled={loading}
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {loading ? "Refreshing…" : "Refresh Records"}
            </button>
          </div>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Paid Orders Available</p>
            <p className="mt-2 text-3xl font-bold">{orders.length}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Delivery Records</p>
            <p className="mt-2 text-3xl font-bold">{deliveries.length}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Orders Without a Delivery Record</p>
            <p className="mt-2 text-3xl font-bold">
              {
                orders.filter(
                  (order) =>
                    !deliveries.some(
                      (delivery) => delivery.order_id === order.id
                    )
                ).length
              }
            </p>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {error}
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800"
          >
            {notice}
          </div>
        )}

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-bold">Create Delivery Record</h2>
          <p className="mt-1 text-sm text-slate-600">
            Only orders returned by the server as paid can be selected.
          </p>

          <form onSubmit={createDelivery} className="mt-5 space-y-5">
            <div>
              <label
                htmlFor="order"
                className="mb-2 block text-sm font-semibold"
              >
                Paid Order
              </label>

              <select
                id="order"
                value={selectedOrderId}
                onChange={(event) => setSelectedOrderId(event.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Select a paid order</option>
                {orders.map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.order_number || order.id} —{" "}
                    {order.customer_name || order.customer_email || "Customer"}
                    {order.delivery_city ? ` — ${order.delivery_city}` : ""}
                  </option>
                ))}
              </select>

              {orders.length === 0 && !loading && (
                <p className="mt-2 text-sm text-amber-700">
                  No paid orders were returned. Check payment records and the
                  delivery API if you expected orders here.
                </p>
              )}
            </div>

            {selectedOrder && (
              <div className="rounded-lg bg-slate-50 p-4 text-sm">
                <h3 className="font-semibold">Selected Order Details</h3>
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <p>
                    <span className="text-slate-500">Customer: </span>
                    {selectedOrder.customer_name ||
                      selectedOrder.customer_email ||
                      "Not provided"}
                  </p>
                  <p>
                    <span className="text-slate-500">Phone: </span>
                    {selectedOrder.customer_phone || "Not provided"}
                  </p>
                  <p>
                    <span className="text-slate-500">Region: </span>
                    {selectedOrder.delivery_region || "Not provided"}
                  </p>
                  <p>
                    <span className="text-slate-500">City: </span>
                    {selectedOrder.delivery_city || "Not provided"}
                  </p>
                  <p className="sm:col-span-2">
                    <span className="text-slate-500">Address: </span>
                    {selectedOrder.delivery_address || "Not provided"}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="method"
                  className="mb-2 block text-sm font-semibold"
                >
                  Delivery Method
                </label>
                <select
                  id="method"
                  value={method}
                  onChange={(event) => setMethod(event.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm"
                >
                  {DELIVERY_METHODS.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              {method === "THIRD_PARTY_REQUEST" && (
                <div>
                  <label
                    htmlFor="provider"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Third-Party Provider
                  </label>
                  <input
                    id="provider"
                    value={provider}
                    onChange={(event) => setProvider(event.target.value)}
                    required
                    maxLength={120}
                    placeholder="Enter provider name"
                    className="w-full rounded-lg border border-slate-300 p-3 text-sm"
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="vehicleType"
                  className="mb-2 block text-sm font-semibold"
                >
                  Vehicle Type (optional)
                </label>
                <input
                  id="vehicleType"
                  value={vehicleType}
                  onChange={(event) => setVehicleType(event.target.value)}
                  maxLength={80}
                  placeholder="e.g. Motorcycle, van"
                  className="w-full rounded-lg border border-slate-300 p-3 text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="vehicleNumber"
                  className="mb-2 block text-sm font-semibold"
                >
                  Vehicle Number (optional)
                </label>
                <input
                  id="vehicleNumber"
                  value={vehicleNumber}
                  onChange={(event) => setVehicleNumber(event.target.value)}
                  maxLength={40}
                  placeholder="Enter vehicle registration"
                  className="w-full rounded-lg border border-slate-300 p-3 text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="deliveryFee"
                  className="mb-2 block text-sm font-semibold"
                >
                  Delivery Fee (optional)
                </label>
                <input
                  id="deliveryFee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={deliveryFee}
                  onChange={(event) => setDeliveryFee(event.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-lg border border-slate-300 p-3 text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="mb-2 block text-sm font-semibold"
                >
                  Delivery Notes (optional)
                </label>
                <input
                  id="notes"
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  maxLength={1000}
                  placeholder="Instructions or additional details"
                  className="w-full rounded-lg border border-slate-300 p-3 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving || loading || orders.length === 0}
              className="w-full rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {saving ? "Saving…" : "Create Delivery Record"}
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold">Delivery Records</h2>
              <p className="mt-1 text-sm text-slate-600">
                Records returned by the delivery API.
              </p>
            </div>

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search order or tracking number"
              aria-label="Search delivery records"
              className="w-full rounded-lg border border-slate-300 p-3 text-sm sm:max-w-sm"
            />
          </div>

          {loading ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Loading delivery records…
            </p>
          ) : filteredDeliveries.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No delivery records match your search.
            </p>
          ) : (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[850px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="p-3 font-semibold">Order</th>
                    <th className="p-3 font-semibold">Customer</th>
                    <th className="p-3 font-semibold">Method</th>
                    <th className="p-3 font-semibold">Tracking Number</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold">Fee</th>
                    <th className="p-3 font-semibold">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDeliveries.map((delivery) => {
                    const order = orders.find(
                      (item) => item.id === delivery.order_id
                    );

                    return (
                      <tr
                        key={delivery.id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="p-3">
                          {order?.order_number || delivery.order_id}
                        </td>
                        <td className="p-3">
                          {order?.customer_name ||
                            order?.customer_email ||
                            "Not available"}
                        </td>
                        <td className="p-3">
                          {readable(delivery.delivery_method)}
                          {delivery.third_party_provider
                            ? ` (${delivery.third_party_provider})`
                            : ""}
                        </td>
                        <td className="p-3">
                          {delivery.tracking_number || "Not assigned"}
                        </td>
                        <td className="p-3">
                          <span className="inline-block rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">
                            {readable(delivery.status)}
                          </span>
                        </td>
                        <td className="p-3">
                          {money(
                            delivery.delivery_fee,
                            order?.currency
                          )}
                        </td>
                        <td className="p-3">
                          {delivery.created_at
                            ? new Date(delivery.created_at).toLocaleDateString()
                            : "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
