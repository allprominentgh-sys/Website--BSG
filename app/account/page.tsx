import Header from "../../components/Header";

export default function AccountPage() {
  return (
    <>
      <Header />

      <main className="account-page">
        <div className="account-card">

          <h1>My Account</h1>

          <p>
            Your customer and seller account
            centre will live here.
          </p>

          <p>
            Sign-in, registration,
            advertisements, orders and
            account management will be
            connected to Supabase.
          </p>

          <p>
            <strong>
              All Prominent Ghana
            </strong>
            <br />
            Buy • Sell • Advertise • Connect
          </p>

        </div>
      </main>
    </>
  );
}
