"use client";

import Link from "next/link";
import { useState } from "react";

export default function ClientDashboard() {
  const [active, setActive] = useState("Overview");

  const menu = [
    "Overview",
    "My Ads",
    "Promote Ads",
    "Payments",
    "Messages",
    "Issues & Support",
  ];

  return (
    <main style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <Link href="/" style={styles.logo}>
            ALL PROMINENT GHANA
          </Link>
          <div style={styles.tagline}>
            Buy • Sell • Advertise • Connect
          </div>
        </div>

        <Link href="/" style={styles.homeButton}>
          Marketplace
        </Link>
      </header>

      {/* Dashboard title */}
      <section style={styles.hero}>
        <h1 style={styles.title}>Client Dashboard</h1>
        <p style={styles.subtitle}>
          Manage your ads, payments, messages and marketplace activity.
        </p>
      </section>

      {/* Dashboard body */}
      <section style={styles.container}>
        {/* Menu */}
        <div style={styles.menu}>
          {menu.map((item) => (
            <button
              key={item}
              onClick={() => setActive(item)}
              style={{
                ...styles.menuButton,
                ...(active === item ? styles.activeMenu : {}),
              }}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={styles.content}>
          {active === "Overview" && (
            <>
              <h2 style={styles.heading}>Welcome to your dashboard</h2>

              <div style={styles.cards}>
                <StatCard title="Active Ads" value="0" />
                <StatCard title="Total Views" value="0" />
                <StatCard title="Promoted Ads" value="0" />
                <StatCard title="Messages" value="0" />
              </div>

              <div style={styles.panel}>
                <h3>Quick Actions</h3>

                <div style={styles.actions}>
                  <Link href="/post-ad" style={styles.primaryButton}>
                    + Post an Ad
                  </Link>

                  <button
                    style={styles.secondaryButton}
                    onClick={() => setActive("My Ads")}
                  >
                    View My Ads
                  </button>

                  <button
                    style={styles.secondaryButton}
                    onClick={() => setActive("Messages")}
                  >
                    Open Messages
                  </button>
                </div>
              </div>
            </>
          )}

          {active === "My Ads" && (
            <>
              <h2 style={styles.heading}>My Ads</h2>

              <div style={styles.empty}>
                <div style={styles.emptyIcon}>📢</div>
                <h3>No ads posted yet</h3>
                <p>
                  Your advertisements will appear here after you post them.
                </p>

                <Link href="/post-ad" style={styles.primaryButton}>
                  Post Your First Ad
                </Link>
              </div>
            </>
          )}

          {active === "Promote Ads" && (
            <>
              <h2 style={styles.heading}>Promote Your Ads</h2>

              <div style={styles.panel}>
                <h3>Top Ads</h3>
                <p>
                  Pay to place your advertisement in a more prominent position
                  on the marketplace.
                </p>

                <div style={styles.priceBox}>
                  <strong>Promotion</strong>
                  <span>Choose your promotion package when your ad is active.</span>
                </div>

                <p style={styles.note}>
                  Payment processing will be connected to the marketplace
                  payment system later.
                </p>
              </div>
            </>
          )}

          {active === "Payments" && (
            <>
              <h2 style={styles.heading}>Payments</h2>

              <div style={styles.cards}>
                <StatCard title="Total Paid" value="GHS 0.00" />
                <StatCard title="Platform Charges" value="GHS 0.00" />
                <StatCard title="Promotion Payments" value="GHS 0.00" />
              </div>

              <div style={styles.panel}>
                <h3>Marketplace Payment Fee</h3>
                <p>
                  Payments made through the marketplace will include a
                  <strong> 3% platform charge</strong>.
                </p>
              </div>
            </>
          )}

          {active === "Messages" && (
            <>
              <h2 style={styles.heading}>Messages</h2>

              <div style={styles.empty}>
                <div style={styles.emptyIcon}>💬</div>
                <h3>No messages yet</h3>
                <p>
                  Conversations with buyers and sellers will appear here.
                </p>
              </div>
            </>
          )}

          {active === "Issues & Support" && (
            <>
              <h2 style={styles.heading}>Issues & Support</h2>

              <div style={styles.panel}>
                <h3>Need help?</h3>

                <p>
                  Report suspicious users, payment problems, advertisement
                  problems or other marketplace issues.
                </p>

                <button style={styles.primaryButton}>
                  Report an Issue
                </button>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div style={styles.card}>
      <span style={styles.cardTitle}>{title}</span>
      <strong style={styles.cardValue}>{value}</strong>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f5f7fb",
    color: "#111827",
  },

  header: {
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    padding: "18px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
  },

  logo: {
    color: "#1769ff",
    fontSize: "22px",
    fontWeight: 800,
    textDecoration: "none",
  },

  tagline: {
    color: "#64748b",
    fontSize: "14px",
    marginTop: "4px",
  },

  homeButton: {
    textDecoration: "none",
    color: "#1769ff",
    border: "1px solid #1769ff",
    borderRadius: "10px",
    padding: "10px 15px",
    fontWeight: 600,
  },

  hero: {
    background: "linear-gradient(135deg, #1257e8, #08aeea)",
    color: "white",
    padding: "45px 24px",
  },

  title: {
    margin: 0,
    fontSize: "36px",
    fontWeight: 800,
  },

  subtitle: {
    marginTop: "10px",
    fontSize: "17px",
    opacity: 0.95,
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "25px 18px",
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    gap: "25px",
  },

  menu: {
    background: "#ffffff",
    borderRadius: "14px",
    padding: "10px",
    height: "fit-content",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  },

  menuButton: {
    width: "100%",
    border: "none",
    background: "transparent",
    textAlign: "left",
    padding: "13px 12px",
    borderRadius: "9px",
    cursor: "pointer",
    fontSize: "15px",
    color: "#334155",
  },

  activeMenu: {
    background: "#1769ff",
    color: "#ffffff",
    fontWeight: 700,
  },

  content: {
    minWidth: 0,
  },

  heading: {
    marginTop: 0,
    fontSize: "28px",
  },

  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "15px",
    marginBottom: "22px",
  },

  card: {
    background: "#ffffff",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  },

  cardTitle: {
    display: "block",
    color: "#64748b",
    fontSize: "14px",
    marginBottom: "10px",
  },

  cardValue: {
    fontSize: "26px",
    color: "#1769ff",
  },

  panel: {
    background: "#ffffff",
    borderRadius: "14px",
    padding: "24px",
    marginBottom: "20px",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  },

  actions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
    marginTop: "18px",
  },

  primaryButton: {
    display: "inline-block",
    border: "none",
    background: "#1769ff",
    color: "#ffffff",
    padding: "13px 18px",
    borderRadius: "10px",
    textDecoration: "none",
    fontWeight: 700,
    cursor: "pointer",
  },

  secondaryButton: {
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#1e293b",
    padding: "13px 18px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 600,
  },

  empty: {
    background: "#ffffff",
    borderRadius: "14px",
    padding: "50px 25px",
    textAlign: "center",
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
  },

  emptyIcon: {
    fontSize: "45px",
    marginBottom: "10px",
  },

  priceBox: {
    marginTop: "20px",
    padding: "18px",
    background: "#f1f5f9",
    borderRadius: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  note: {
    color: "#64748b",
    fontSize: "14px",
  },
};
