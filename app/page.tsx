export default function Home() {
  return (
    <main>
      <section className="hero">
        <div className="container py-16">
          <h1 className="text-4xl md:text-6xl font-black">
            ALL PROMINENT GHANA
          </h1>

          <p className="mt-4 text-xl">
            Buy • Sell • Advertise • Connect
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="/listings" className="btn btn-gold">
              Browse Marketplace
            </a>

            <a href="/post" className="btn bg-white text-green-800">
              Post an Ad
            </a>
          </div>
        </div>
      </section>

      <section className="container section py-12">
        <h2 className="text-3xl font-bold">
          Ghana Marketplace
        </h2>

        <p className="muted mt-2">
          Find products, services, property, vehicles, jobs and more
          from sellers across Ghana.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            "Phones & Tablets",
            "Cars",
            "Property",
            "Fashion",
            "Electronics",
            "Jobs & Services",
            "Home & Garden",
            "Agriculture",
          ].map((category) => (
            <a
              key={category}
              href="/listings"
              className="card p-5 font-bold hover:shadow-lg"
            >
              {category}
            </a>
          ))}
        </div>
      </section>

      <section className="container pb-12">
        <div className="card p-8">
          <h2 className="text-2xl font-bold">
            Advertise Your Business
          </h2>

          <p className="muted mt-2">
            Promote your products and services with sponsored
            listings and video advertising.
          </p>

          <a href="/ads" className="btn btn-primary mt-5">
            Start Advertising
          </a>
        </div>
      </section>
    </main>
  );
}
