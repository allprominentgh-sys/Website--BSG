import Link from "next/link";

export default function DashboardPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 20px",
        background: "#f5f7fb",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          background: "#fff",
          padding: "30px",
          borderRadius: "18px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ color: "#1769ff", marginBottom: "10px" }}>
          My Account
        </h1>

        <p style={{ color: "#64748b", fontSize: "18px" }}>
          Welcome to your All Prominent Ghana Marketplace account.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "15px",
            marginTop: "30px",
          }}
        >
          <div style={cardStyle}>
            <strong>My Ads</strong>
            <span>Manage your advertisements</span>
          </div>

          <div style={cardStyle}>
            <strong>Ad Progress</strong>
            <span>See views and activity</span>
          </div>

          <div style={cardStyle}>
            <strong>Payments</strong>
            <span>Manage marketplace payments</span>
          </div>

          <div style={cardStyle}>
            <strong>Messages</strong>
            <span>Chat with buyers and sellers</span>
          </div>

          <div style={cardStyle}>
            <strong>Promote Ads</strong>
            <span>Boost your advertisements</span>
          </div>

          <div style={cardStyle}>
            <strong>Support</strong>
            <span>Report an issue</span>
          </div>
        </div>

        <Link
          href="/"
          style={{
            display: "inline-block",
            marginTop: "30px",
            background: "#1769ff",
            color: "#fff",
            padding: "14px 22px",
            borderRadius: "10px",
            textDecoration: "none",
            fontWeight: "bold",
          }}
        >
          ← Back to Marketplace
        </Link>
      </div>
    </main>
  );
}

const cardStyle = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "20px",
  display: "flex",
  flexDirection: "column" as const,
  gap: "8px",
};
