
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Order = {
  id: string;
  user_id: string | null;
  order_number: string | null;
  product_name: string | null;
  product_id: string | null;
  order_type: string | null;
  quantity: number | null;
  total_amount: number | null;
  deposit_percentage: number | null;
  deposit_amount: number | null;
  balance_percentage: number | null;
  balance_amount: number | null;
  amount_paid: number | null;
  amount_remaining: number | null;
  status: string | null;
  phone: string | null;
  delivery_address: string | null;
  terms_accepted: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

const money = (value: number | null | undefined) =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: "GHS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));

const dateLabel = (value: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-GH");
};

const statusStyle = (status: string | null) => {
  const value = (status || "").toLowerCase();

  if (
    ["completed", "delivered", "paid"].includes(value)
  ) {
    return {
      background: "#dcfce7",
      color: "#166534",
    };
  }

  if (
    ["cancelled", "canceled", "rejected", "failed"].includes(value)
  ) {
    return {
      background: "#fee2e2",
      color: "#991b1b",
    };
  }

  if (
    ["pending", "processing", "awaiting_payment"].includes(value)
  ) {
    return {
      background: "#fef3c7",
      color: "#92400e",
    };
  }

  return {
    background: "#e2e8f0",
    color: "#334155",
  };
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selected, setSelected] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // Verify the central Admin's custom cookie session.
      const sessionResponse = await fetch("/api/admin/session", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const session = await sessionResponse.json().catch(() => ({}));

      if (!sessionResponse.ok || session.authenticated !== true) {
        setAuthenticated(false);
        setOrders([]);
        setError("Admin session not found. Please sign in again.");
        return;
      }

      setAuthenticated(true);

      // Orders must be read through a protected server API.
      const response = await fetch("/api/admin/orders", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.error ||
            "The orders API is not ready or could not load orders."
        );
      }

      if (!Array.isArray(result.orders)) {
        throw new Error(
          "The orders API returned an unexpected response."
        );
      }

      setOrders(result.orders);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const statuses = useMemo(
    () =>
      Array.from(
        new Set(
          orders
            .map((order) => order.status || "Unknown")
        )
      ).sort(),
    [orders]
  );

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesSearch =
        !term ||
        [
          order.order_number,
          order.product_name,
          order.product_id,
          order.user_id,
          order.phone,
          order.delivery_address,
          order.order_type,
          order.status,
        ].some((value) =>
          String(value ?? "").toLowerCase().includes(term)
        );

      const matchesStatus =
        statusFilter === "all" ||
        (order.status || "Unknown") === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  const totalValue = filteredOrders.reduce(
    (sum, order) => sum + Number(order.total_amount ?? 0),
    0
  );

  const totalPaid = filteredOrders.reduce(
    (sum, order) => sum + Number(order.amount_paid ?? 0),
    0
  );

  const totalOutstanding = filteredOrders.reduce(
    (sum, order) => sum + Number(order.amount_remaining ?? 0),
    0
  );

  const card: React.CSSProperties = {
    background: "#ffffff",
    border: "1px solid #dbe3ef",
    borderRadius: 14,
    padding: 16,
    color: "#111827",
    minWidth: 0,
  };

  const button: React.CSSProperties = {
    border: 0,
    borderRadius: 9,
    background: "#2453e6",
    color: "#ffffff",
    padding: "11px 15px",
    fontWeight: 700,
    cursor: "pointer",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f4f7fb",
        padding: "22px 14px 48px",
        color: "#111827",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Link
          href="/admin"
          style={{
            color: "#2453e6",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          ← Back to Admin Dashboard
        </Link>

        <header style={{ margin: "24px 0" }}>
          <h1 style={{ fontSize: 30, fontWeight: 900, margin: 0 }}>
            Admin Orders Management
          </h1>
          <p style={{ color: "#64748b", lineHeight: 1.7 }}>
            Review customer orders, payments, balances and delivery details.
          </p>
        </header>

        {error && (
          <section
            role="alert"
            style={{
              ...card,
              background: "#fef2f2",
              borderColor: "#fecaca",
              color: "#991b1b",
              marginBottom: 18,
            }}
          >
            <strong>Unable to load orders</strong>
            <p>{error}</p>

            {!authenticated && (
              <Link
                href="/admin/login"
                style={{ color: "#1d4ed8", fontWeight: 700 }}
              >
                Go to Admin Login →
              </Link>
            )}

            <div style={{ marginTop: 14 }}>
              <button type="button" style={button} onClick={() => void loadOrders()}>
                Try Again
              </button>
            </div>
          </section>
        )}

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <div style={card}>
            <p style={{ color: "#64748b", marginTop: 0 }}>Matching orders</p>
            <strong style={{ fontSize: 27 }}>{filteredOrders.length}</strong>
          </div>

          <div style={card}>
            <p style={{ color: "#64748b", marginTop: 0 }}>
              Total order value
            </p>
            <strong style={{ fontSize: 22 }}>{money(totalValue)}</strong>
          </div>

          <div style={card}>
            <p style={{ color: "#64748b", marginTop: 0 }}>
              Amount paid
            </p>
            <strong style={{ fontSize: 22, color: "#15803d" }}>
              {money(totalPaid)}
            </strong>
          </div>

          <div style={card}>
            <p style={{ color: "#64748b", marginTop: 0 }}>
              Outstanding balance
            </p>
            <strong style={{ fontSize: 22, color: "#b45309" }}>
              {money(totalOutstanding)}
            </strong>
          </div>
        </section>

        <section
          style={{
            ...card,
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 20,
          }}
        >
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search order, customer ID, product or phone..."
            aria-label="Search orders"
            style={{
              flex: "1 1 250px",
              minWidth: 0,
              border: "1px solid #cbd5e1",
              borderRadius: 9,
              padding: 12,
              fontSize: 16,
            }}
          />

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by order status"
            style={{
              flex: "0 1 200px",
              minWidth: 0,
              border: "1px solid #cbd5e1",
              borderRadius: 9,
              padding: 12,
              background: "#ffffff",
              fontSize: 16,
            }}
          >
            <option value="all">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <button
            type="button"
            style={button}
            onClick={() => void loadOrders()}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </section>

        {loading ? (
          <section style={card}>Loading orders...</section>
        ) : !error && filteredOrders.length === 0 ? (
          <section style={card}>No matching orders found.</section>
        ) : (
          <section style={{ display: "grid", gap: 14 }}>
            {filteredOrders.map((order) => (
              <article key={order.id} style={card}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 14,
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ flex: "1 1 250px", minWidth: 0 }}>
                    <p
                      style={{
                        margin: "0 0 6px",
                        fontSize: 12,
                        color: "#64748b",
                      }}
                    >
                      ORDER: {order.order_number || order.id}
                    </p>

                    <h2
                      style={{
                        fontSize: 19,
                        margin: "0 0 10px",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {order.product_name || "Product not specified"}
                    </h2>

                    <p style={{ margin: "5px 0" }}>
                      <strong>Total:</strong>{" "}
                      {money(order.total_amount)}
                    </p>

                    <p style={{ margin: "5px 0" }}>
                      <strong>Paid:</strong>{" "}
                      {money(order.amount_paid)}
                    </p>

                    <p style={{ margin: "5px 0" }}>
                      <strong>Remaining:</strong>{" "}
                      {money(order.amount_remaining)}
                    </p>

                    <p style={{ margin: "8px 0", color: "#64748b" }}>
                      Quantity: {order.quantity ?? "—"} · Type:{" "}
                      {order.order_type || "—"}
                    </p>

                    <span
                      style={{
                        display: "inline-block",
                        borderRadius: 20,
                        padding: "5px 10px",
                        fontSize: 12,
                        fontWeight: 800,
                        ...statusStyle(order.status),
                      }}
                    >
                      {order.status || "Unknown"}
                    </span>

                    <p style={{ fontSize: 13, color: "#64748b" }}>
                      Created: {dateLabel(order.created_at)}
                    </p>
                  </div>

                  <button
                    type="button"
                    style={{
                      ...button,
                      background: "#e8efff",
                      color: "#2453e6",
                    }}
                    onClick={() => setSelected(order)}
                  >
                    View Details
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}

        {selected && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-details-heading"
            onClick={() => setSelected(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(15,23,42,0.65)",
              padding: 14,
            }}
          >
            <section
              style={{
                ...card,
                width: "100%",
                maxWidth: 650,
                maxHeight: "88vh",
                overflowY: "auto",
              }}
              onClick={(event) => event.stopPropagation()}
            >
              <h2
                id="order-details-heading"
                style={{ fontSize: 24, marginTop: 0 }}
              >
                Order Details
              </h2>

              <p><strong>Order number:</strong> {selected.order_number || selected.id}</p>
              <p><strong>Order ID:</strong> {selected.id}</p>
              <p><strong>Customer ID:</strong> {selected.user_id || "—"}</p>
              <p><strong>Product:</strong> {selected.product_name || "—"}</p>
              <p><strong>Product ID:</strong> {selected.product_id || "—"}</p>
              <p><strong>Order type:</strong> {selected.order_type || "—"}</p>
              <p><strong>Quantity:</strong> {selected.quantity ?? "—"}</p>
              <p><strong>Status:</strong> {selected.status || "Unknown"}</p>
              <p><strong>Total amount:</strong> {money(selected.total_amount)}</p>
              <p><strong>Deposit percentage:</strong> {selected.deposit_percentage ?? "—"}%</p>
              <p><strong>Deposit amount:</strong> {money(selected.deposit_amount)}</p>
              <p><strong>Balance percentage:</strong> {selected.balance_percentage ?? "—"}%</p>
              <p><strong>Balance amount:</strong> {money(selected.balance_amount)}</p>
              <p><strong>Amount paid:</strong> {money(selected.amount_paid)}</p>
              <p><strong>Amount remaining:</strong> {money(selected.amount_remaining)}</p>
              <p><strong>Phone:</strong> {selected.phone || "—"}</p>
              <p><strong>Delivery address:</strong> {selected.delivery_address || "—"}</p>
              <p><strong>Terms accepted:</strong> {selected.terms_accepted ? "Yes" : "No / Not recorded"}</p>
              <p><strong>Created:</strong> {dateLabel(selected.created_at)}</p>
              <p><strong>Last updated:</strong> {dateLabel(selected.updated_at)}</p>

              <button
                type="button"
                style={button}
                onClick={() => setSelected(null)}
              >
                Close Details
              </button>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
