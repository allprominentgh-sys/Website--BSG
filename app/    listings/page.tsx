<div style={{ display: "grid", gap: "8px" }}>
  <Link
    href={`/listings/${listing.id}`}
    className="view-button"
  >
    View Listing
  </Link>

  <Link
    href={`/chat?listing=${listing.id}&seller=${encodeURIComponent(
      listing.seller
    )}&title=${encodeURIComponent(
      listing.title
    )}&price=${encodeURIComponent(
      listing.price
    )}`}
    className="view-button"
    style={{
      background: "#1769e0",
      color: "white",
    }}
  >
    💬 Chat with Seller
  </Link>
</div>
