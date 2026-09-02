export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="container">
          <h1>ALL PROMINENT GHANA</h1>
          <p>Buy • Sell • Advertise • Connect</p>
          <a href="/listings" className="btn btn-gold">
            Browse Marketplace
          </a>
        </div>
      </section>

      <section className="container section">
        <h2>Ghana Marketplace</h2>
        <p className="muted">
          Discover products, services, businesses and opportunities across Ghana.
        </p>

        <div className="grid">
          <div className="card">
            <h3>Phones & Tablets</h3>
            <p>Find phones, tablets and accessories.</p>
          </div>

          <div className="card">
            <h3>Cars</h3>
            <p>Buy and sell vehicles across Ghana.</p>
          </div>

          <div className="card">
            <h3>Property</h3>
            <p>Homes, land, apartments and commercial property.</p>
          </div>

          <div className="card">
            <h3>Fashion</h3>
            <p>Clothing, shoes, bags and accessories.</p>
          </div>
        </div>
      </section>

      <section className="container section">
        <div className="card">
          <h2>Advertise Your Business</h2>
          <p>
            Promote your products and services with image and video advertising.
          </p>
          <a href="/ads" className="btn btn-primary">
            Start Advertising
          </a>
        </div>
      </section>
    </main>
  );
}
