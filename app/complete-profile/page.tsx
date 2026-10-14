
"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/supabase-browser";

type AccountType = "seller" | "business";

export default function CompleteProfilePage() {
  const router = useRouter();

  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [loadingPage, setLoadingPage] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [legalName, setLegalName] = useState("");
  const [niaNumber, setNiaNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [tinNumber, setTinNumber] = useState("");
  const [representativeName, setRepresentativeName] = useState("");
  const [representativeNia, setRepresentativeNia] = useState("");
  const [businessLocation, setBusinessLocation] = useState("");
  const [region, setRegion] = useState("");
  const [town, setTown] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [ghanaPostGps, setGhanaPostGps] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const supabase = supabaseBrowser();

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace("/login");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select(
            "account_type, profile_completed, full_name, phone, location, delivery_region, delivery_city, delivery_address, ghana_post_gps"
          )
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          throw new Error(
            "Could not load your profile. Please try again."
          );
        }

        const savedType =
          profile?.account_type || user.user_metadata?.account_type;

        if (savedType !== "seller" && savedType !== "business") {
          router.replace("/dashboard");
          return;
        }

        if (!active) return;

        setAccountType(savedType);
        setLegalName(profile?.full_name || "");
        setPhone(profile?.phone || "");
        setBusinessLocation(profile?.location || "");
        setRegion(profile?.delivery_region || "");
        setTown(profile?.delivery_city || "");
        setStreetAddress(profile?.delivery_address || "");
        setGhanaPostGps(profile?.ghana_post_gps || "");

        const { data: savedBusiness, error: savedBusinessError } =
          await supabase
            .from("seller_business_profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle();

        if (savedBusinessError) {
          throw new Error(
            "Could not load your saved seller details. Please try again."
          );
        }

        if (!active) return;

        if (savedBusiness) {
          setLegalName(savedBusiness.legal_name || profile?.full_name || "");
          setNiaNumber(savedBusiness.nia_number || "");
          setPhone(savedBusiness.phone || profile?.phone || "");
          setBusinessName(savedBusiness.business_name || "");
          setRegistrationNumber(
            savedBusiness.business_registration_number || ""
          );
          setTinNumber(savedBusiness.tin_number || "");
          setRepresentativeName(savedBusiness.representative_name || "");
          setRepresentativeNia(
            savedBusiness.representative_nia_number || ""
          );
          setBusinessLocation(
            savedBusiness.business_location || profile?.location || ""
          );
          setRegion(savedBusiness.region || profile?.delivery_region || "");
          setTown(savedBusiness.town || profile?.delivery_city || "");
          setStreetAddress(
            savedBusiness.street_address || profile?.delivery_address || ""
          );
          setGhanaPostGps(
            savedBusiness.ghana_post_gps || profile?.ghana_post_gps || ""
          );
        }

        if (profile?.profile_completed) {
          // Allow users to edit their profile from this page too.
          setSuccess("Your profile is already marked as complete. You can update your details below.");
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your profile."
          );
        }
      } finally {
        if (active) setLoadingPage(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!accountType) {
      setError("We could not determine your account type. Please sign in again.");
      return;
    }

    const cleanPhone = phone.trim();
    const cleanLocation = businessLocation.trim();
    const cleanRegion = region.trim();
    const cleanTown = town.trim();
    const cleanGps = ghanaPostGps.trim();

    if (!cleanPhone || !cleanLocation || !cleanRegion || !cleanTown) {
      setError("Please complete your phone number and business location details.");
      return;
    }

    if (accountType === "seller") {
      if (!legalName.trim() || !niaNumber.trim()) {
        setError("Individual sellers must enter their legal name and NIA/Ghana Card number.");
        return;
      }
    }

    if (accountType === "business") {
      if (
        !businessName.trim() ||
        !registrationNumber.trim() ||
        !tinNumber.trim() ||
        !representativeName.trim() ||
        !representativeNia.trim()
      ) {
        setError("Please complete the required company and authorised representative details.");
        return;
      }
    }

    setSaving(true);

    try {
      const supabase = supabaseBrowser();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      const profileData = {
        id: user.id,
        profile_kind: accountType,
        legal_name: accountType === "seller" ? legalName.trim() : null,
        nia_number: accountType === "seller" ? niaNumber.trim() : null,
        business_name:
          accountType === "business" ? businessName.trim() : null,
        business_registration_number:
          accountType === "business" ? registrationNumber.trim() : null,
        tin_number:
          accountType === "business" ? tinNumber.trim() : null,
        representative_name:
          accountType === "business" ? representativeName.trim() : null,
        representative_nia_number:
          accountType === "business" ? representativeNia.trim() : null,
        phone: cleanPhone,
        business_location: cleanLocation,
        region: cleanRegion,
        town: cleanTown,
        street_address: streetAddress.trim() || null,
        ghana_post_gps: cleanGps || null,
        verification_status: "pending",
        updated_at: new Date().toISOString(),
      };

      const { error: saveBusinessError } = await supabase
        .from("seller_business_profiles")
        .upsert(profileData, { onConflict: "id" });

      if (saveBusinessError) {
        console.error("Seller profile save error:", saveBusinessError);
        throw new Error(
          "We could not save your seller or business details. Please check your database permissions and try again."
        );
      }

      const displayName =
        accountType === "seller"
          ? legalName.trim()
          : businessName.trim();

      const { error: saveProfileError } = await supabase
        .from("profiles")
        .update({
          full_name: displayName,
          phone: cleanPhone,
          location: cleanLocation,
          delivery_region: cleanRegion,
          delivery_city: cleanTown,
          delivery_area: town.trim(),
          delivery_address: streetAddress.trim() || null,
          ghana_post_gps: cleanGps || null,
          profile_completed: true,
          verification_status: "pending",
          verified: false,
        })
        .eq("id", user.id);

      if (saveProfileError) {
        console.error("Main profile save error:", saveProfileError);
        throw new Error(
          "Your seller details were saved, but we could not update your main profile. Please try saving again."
        );
      }

      setSuccess(
        "Your profile has been saved and submitted for verification."
      );

      window.setTimeout(() => {
        router.replace("/dashboard");
        router.refresh();
      }, 1200);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving your profile."
      );
    } finally {
      setSaving(false);
    }
  }

  if (loadingPage) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <p className="text-sm text-slate-600">Loading your profile...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <header className="mb-8 text-center">
          <Link
            href="/"
            className="text-3xl font-extrabold tracking-tight text-blue-800"
          >
            BESTSALES<span className="text-sky-500">GH</span>
          </Link>

          <h1 className="mt-5 text-2xl font-bold text-slate-900">
            Complete your profile
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            Provide your details so we can review your seller or business account.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
          {error && (
            <div
              role="alert"
              className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {success && (
            <div
              role="status"
              className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {accountType === "seller" && (
              <>
                <h2 className="text-lg font-bold text-slate-900">
                  Individual seller details
                </h2>

                <div>
                  <label htmlFor="legalName" className="mb-2 block text-sm font-medium text-slate-700">
                    Full legal name *
                  </label>
                  <input
                    id="legalName"
                    autoComplete="name"
                    required
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none"
                    placeholder="Name as shown on your Ghana Card"
                  />
                </div>

                <div>
                  <label htmlFor="niaNumber" className="mb-2 block text-sm font-medium text-slate-700">
                    NIA / Ghana Card number *
                  </label>
                  <input
                    id="niaNumber"
                    required
                    autoComplete="off"
                    value={niaNumber}
                    onChange={(e) => setNiaNumber(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none"
                    placeholder="Enter your Ghana Card number"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    This number is private and must not appear on your public seller profile.
                  </p>
                </div>
              </>
            )}

            {accountType === "business" && (
              <>
                <h2 className="text-lg font-bold text-slate-900">
                  Business and company details
                </h2>

                <div>
                  <label htmlFor="businessName" className="mb-2 block text-sm font-medium text-slate-700">
                    Registered business / company name *
                  </label>
                  <input
                    id="businessName"
                    required
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none"
                    placeholder="Registered name"
                  />
                </div>

                <div>
                  <label htmlFor="registrationNumber" className="mb-2 block text-sm font-medium text-slate-700">
                    Business registration number *
                  </label>
                  <input
                    id="registrationNumber"
                    required
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none"
                    placeholder="Registration number"
                  />
                </div>

                <div>
                  <label htmlFor="tinNumber" className="mb-2 block text-sm font-medium text-slate-700">
                    TIN / applicable tax identification number *
                  </label>
                  <input
                    id="tinNumber"
                    required
                    value={tinNumber}
                    onChange={(e) => setTinNumber(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none"
                    placeholder="Tax identification number"
                  />
                </div>

                <div>
                  <label htmlFor="representativeName" className="mb-2 block text-sm font-medium text-slate-700">
                    Authorised representative's full name *
                  </label>
                  <input
                    id="representativeName"
                    required
                    value={representativeName}
                    onChange={(e) => setRepresentativeName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none"
                    placeholder="Director, owner or authorised representative"
                  />
                </div>

                <div>
                  <label htmlFor="representativeNia" className="mb-2 block text-sm font-medium text-slate-700">
                    Representative's NIA / Ghana Card number *
                  </label>
                  <input
                    id="representativeNia"
                    required
                    autoComplete="off"
                    value={representativeNia}
                    onChange={(e) => setRepresentativeNia(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none"
                    placeholder="Enter representative's Ghana Card number"
                  />
                </div>
              </>
            )}

            <h2 className="border-t border-slate-200 pt-5 text-lg font-bold text-slate-900">
              Contact and business location
            </h2>

            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium text-slate-700">
                Phone number *
              </label>
              <input
                id="phone"
                type="tel"
                autoComplete="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none"
                placeholder="e.g. 024 000 0000"
              />
            </div>

            <div>
              <label htmlFor="businessLocation" className="mb-2 block text-sm font-medium text-slate-700">
                Business location / area *
              </label>
              <input
                id="businessLocation"
                required
                value={businessLocation}
                onChange={(e) => setBusinessLocation(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none"
                placeholder="e.g. Madina, near the main market"
              />
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="region" className="mb-2 block text-sm font-medium text-slate-700">
                  Region *
                </label>
                <input
                  id="region"
                  required
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none"
                  placeholder="e.g. Greater Accra"
                />
              </div>

              <div>
                <label htmlFor="town" className="mb-2 block text-sm font-medium text-slate-700">
                  Town / city *
                </label>
                <input
                  id="town"
                  required
                  value={town}
                  onChange={(e) => setTown(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none"
                  placeholder="e.g. Accra"
                />
              </div>
            </div>

            <div>
              <label htmlFor="streetAddress" className="mb-2 block text-sm font-medium text-slate-700">
                Street address / landmark
              </label>
              <textarea
                id="streetAddress"
                rows={3}
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none"
                placeholder="House number, street, nearby landmark"
              />
            </div>

            <div>
              <label htmlFor="ghanaPostGps" className="mb-2 block text-sm font-medium text-slate-700">
                GhanaPost GPS digital address
              </label>
              <input
                id="ghanaPostGps"
                value={ghanaPostGps}
                onChange={(e) => setGhanaPostGps(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm focus:border-blue-600 focus:outline-none"
                placeholder="e.g. GA-123-4567"
              />
            </div>

            <p className="rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600">
              Your identity and business details are private. Your account will remain pending verification until the required checks are completed. Document uploads will be enabled separately after secure storage permissions are configured.
            </p>

            <button
              type="submit"
              disabled={saving || !accountType}
              className="w-full rounded-lg bg-blue-800 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving profile..." : "Save and submit profile"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Return to dashboard
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
