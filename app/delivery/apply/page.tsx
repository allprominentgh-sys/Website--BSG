
"use client";

import { FormEvent, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

type ApplicationStatus = "idle" | "success" | "error";

export default function DeliveryRiderApplicationPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [licenceNumber, setLicenceNumber] = useState("");
  const [personnelType, setPersonnelType] = useState<
    "MOTORBIKE_RIDER" | "CARGO_DRIVER"
  >("MOTORBIKE_RIDER");
  const [vehicleType, setVehicleType] = useState("MOTORBIKE");
  const [vehicleModel, setVehicleModel] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ApplicationStatus>("idle");
  const [message, setMessage] = useState("");

  function showError(text: string) {
    setStatus("error");
    setMessage(text);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("idle");
    setMessage("");

    const name = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();
    const licence = licenceNumber.trim();
    const registration = registrationNumber.trim();
    const model = vehicleModel.trim();
    const kg = capacity.trim() ? Number(capacity) : null;

    if (name.length < 2) {
      showError("Enter your full legal name.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      showError("Enter a valid email address.");
      return;
    }

    if (normalizedPhone.length < 7 || normalizedPhone.length > 25) {
      showError("Enter a valid phone number.");
      return;
    }

    if (licence.length < 3) {
      showError("Enter your driver’s licence number.");
      return;
    }

    if (registration.length < 2) {
      showError("Enter your vehicle registration number.");
      return;
    }

    if (personnelType === "MOTORBIKE_RIDER" && vehicleType !== "MOTORBIKE") {
      showError("Motorbike riders must register a motorbike.");
      return;
    }

    if (personnelType === "CARGO_DRIVER" && vehicleType === "MOTORBIKE") {
      showError("Cargo drivers must register a suitable cargo vehicle.");
      return;
    }

    if (capacity.trim() && (!Number.isFinite(kg) || kg! <= 0)) {
      showError("Carrying capacity must be a number greater than zero.");
      return;
    }

    if (password.length < 8) {
      showError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      showError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!url || !anonKey) {
        throw new Error("Registration is temporarily unavailable.");
      }

      const supabase = createBrowserClient(url, anonKey);

      const { data, error: signupError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: name,
            phone: normalizedPhone,
            requested_account_type: "rider",
          },
        },
      });

      if (signupError) throw signupError;

      if (!data.user) {
        throw new Error("We could not create your account. Please try again.");
      }

      if (!data.session) {
        setStatus("success");
        setMessage(
          "Your login account was created. Please confirm your email, then sign in and return to this application page to submit your driver and vehicle details. Your application is not yet submitted, and you cannot accept deliveries."
        );
        setPassword("");
        setConfirmPassword("");
        return;
      }

      const { error: applicationError } = await supabase
        .from("bsg_delivery_personnel")
        .insert({
          user_id: data.user.id,
          full_name: name,
          phone: normalizedPhone,
          licence_number: licence,
          personnel_type: personnelType,
          vehicle_type: vehicleType,
          vehicle_model: model || null,
          vehicle_registration_number: registration,
          carrying_capacity_kg: kg,
          application_status: "pending",
        });

      if (applicationError) {
        console.error("Delivery application save failed:", applicationError.message);
        throw new Error(
          "Your login account exists, but the application could not be saved. Sign in and contact support for help. Do not create another account."
        );
      }

      setStatus("success");
      setMessage(
        "Your application has been submitted successfully and is pending administrator approval. You cannot accept deliveries until your application and vehicle are approved."
      );
      setPassword("");
      setConfirmPassword("");
    } catch (error) {
      showError(
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-700">
            BEST SALES GHANA
          </p>
          <h1 className="mt-3 text-3xl font-extrabold">
            Join our delivery team
          </h1>
          <p className="mt-3 text-slate-600">
            Register as a motorbike rider or cargo driver. Approval is required
            before you can receive delivery assignments.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          {status === "success" ? (
            <div
              role="status"
              className="rounded-xl border border-green-200 bg-green-50 p-5 text-green-900"
            >
              <h2 className="text-lg font-bold">Registration update</h2>
              <p className="mt-2 text-sm leading-6">{message}</p>
              <a
                href="/login"
                className="mt-5 inline-block rounded-xl bg-blue-700 px-5 py-3 font-bold text-white"
              >
                Go to login
              </a>
              <button
                type="button"
                onClick={() => {
                  setStatus("idle");
                  setMessage("");
                }}
                className="ml-3 mt-5 rounded-xl border border-slate-300 px-4 py-3 font-semibold"
              >
                Back to form
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-xl font-extrabold">Personal details</h2>

              <div>
                <label htmlFor="fullName" className="mb-1 block text-sm font-semibold">
                  Full legal name
                </label>
                <input id="fullName" autoComplete="name" required maxLength={120}
                  value={fullName} onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  placeholder="Name as shown on your documents" />
              </div>

              <div>
                <label htmlFor="email" className="mb-1 block text-sm font-semibold">
                  Email address
                </label>
                <input id="email" type="email" autoComplete="email" required maxLength={254}
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  placeholder="you@example.com" />
              </div>

              <div>
                <label htmlFor="phone" className="mb-1 block text-sm font-semibold">
                  Phone number
                </label>
                <input id="phone" type="tel" autoComplete="tel" required maxLength={25}
                  value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  placeholder="e.g. 024 XXX XXXX" />
              </div>

              <div>
                <label htmlFor="licence" className="mb-1 block text-sm font-semibold">
                  Driver’s licence number
                </label>
                <input id="licence" required maxLength={80}
                  value={licenceNumber} onChange={(e) => setLicenceNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  placeholder="Enter your licence number" />
              </div>

              <div className="border-t pt-5">
                <h2 className="text-xl font-extrabold">Choose your delivery role</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Riders carry only items suitable for a motorbike. Cargo drivers
                  can carry small items too, as well as suitable large and heavy goods.
                </p>
                <label htmlFor="role" className="mb-1 mt-4 block text-sm font-semibold">
                  Delivery personnel type
                </label>
                <select id="role" value={personnelType}
                  onChange={(e) => {
                    const next = e.target.value as "MOTORBIKE_RIDER" | "CARGO_DRIVER";
                    setPersonnelType(next);
                    setVehicleType(next === "MOTORBIKE_RIDER" ? "MOTORBIKE" : "VAN");
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3">
                  <option value="MOTORBIKE_RIDER">Motorbike Rider — small compatible items</option>
                  <option value="CARGO_DRIVER">Cargo Driver — small and cargo items</option>
                </select>
              </div>

              <div>
                <label htmlFor="vehicleType" className="mb-1 block text-sm font-semibold">
                  Vehicle type
                </label>
                <select id="vehicleType" value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3">
                  {personnelType === "MOTORBIKE_RIDER" ? (
                    <option value="MOTORBIKE">Motorbike</option>
                  ) : (
                    <>
                      <option value="CAR">Car</option>
                      <option value="PICKUP">Pickup</option>
                      <option value="VAN">Van</option>
                      <option value="TRUCK">Truck</option>
                      <option value="OTHER">Other suitable cargo vehicle</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label htmlFor="vehicleModel" className="mb-1 block text-sm font-semibold">
                  Vehicle make and model
                </label>
                <input id="vehicleModel" maxLength={120}
                  value={vehicleModel} onChange={(e) => setVehicleModel(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  placeholder="e.g. Honda, Toyota Hilux, delivery van" />
              </div>

              <div>
                <label htmlFor="registration" className="mb-1 block text-sm font-semibold">
                  Vehicle registration number / number plate
                </label>
                <input id="registration" required maxLength={40}
                  value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  placeholder="Enter the vehicle number plate" />
              </div>

              <div>
                <label htmlFor="capacity" className="mb-1 block text-sm font-semibold">
                  Safe carrying capacity (kg)
                </label>
                <input id="capacity" type="number" min="0.1" step="0.1"
                  value={capacity} onChange={(e) => setCapacity(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3"
                  placeholder="Enter the vehicle's safe capacity" />
                <p className="mt-1 text-xs text-slate-500">
                  Use the vehicle’s safe carrying limit. Leave blank if you do not know it yet.
                  The administrator must verify suitability before approval.
                </p>
              </div>

              <div className="border-t pt-5">
                <h2 className="text-xl font-extrabold">Create your login</h2>
                <div className="mt-4">
                  <label htmlFor="password" className="mb-1 block text-sm font-semibold">
                    Password
                  </label>
                  <input id="password" type="password" autoComplete="new-password"
                    required minLength={8} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                    placeholder="At least 8 characters" />
                </div>

                <div className="mt-4">
                  <label htmlFor="confirmPassword" className="mb-1 block text-sm font-semibold">
                    Confirm password
                  </label>
                  <input id="confirmPassword" type="password" autoComplete="new-password"
                    required minLength={8} value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3"
                    placeholder="Enter the password again" />
                </div>
              </div>

              {status === "error" && (
                <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                  {message}
                </p>
              )}

              <button type="submit" disabled={loading}
                className="w-full rounded-xl bg-blue-700 px-5 py-3.5 font-bold text-white hover:bg-blue-800 disabled:opacity-60">
                {loading ? "Submitting…" : "Create account and submit application"}
              </button>

              <p className="text-center text-xs leading-5 text-slate-500">
                Your application remains pending until an administrator verifies
                your identity, licence and vehicle. Never share your password.
              </p>
            </form>
          )}
        </section>

        <p className="mt-6 text-center text-sm text-slate-500">
          BEST SALES GHANA · All Prominent Ghana Limited
        </p>
      </div>
    </main>
  );
}
