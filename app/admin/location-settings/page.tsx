
"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

type PlatformLocation = {
  company_name: string;
  address: string;
  region: string;
  city: string;
  landmark: string;
  ghana_post_gps: string;
  latitude: string;
  longitude: string;
  is_configured: boolean;
};

const initialLocation: PlatformLocation = {
  company_name: "BestSalesGH",
  address: "",
  region: "",
  city: "",
  landmark: "",
  ghana_post_gps: "",
  latitude: "",
  longitude: "",
  is_configured: false,
};

const regions = [
  "Ahafo",
  "Ashanti",
  "Bono",
  "Bono East",
  "Central",
  "Eastern",
  "Greater Accra",
  "North East",
  "Northern",
  "Oti",
  "Savannah",
  "Upper East",
  "Upper West",
  "Volta",
  "Western",
  "Western North",
];

export default function AdminLocationSettingsPage() {
  const [location, setLocation] =
    useState<PlatformLocation>(initialLocation);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadLocation() {
      try {
        const response = await fetch(
          "/api/admin/platform-location",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              "Unable to load platform location settings."
          );
        }

        if (!cancelled && result.settings) {
          const saved = result.settings;

          setLocation({
            company_name: saved.company_name ?? "BestSalesGH",
            address: saved.address ?? "",
            region: saved.region ?? "",
            city: saved.city ?? "",
            landmark: saved.landmark ?? "",
            ghana_post_gps: saved.ghana_post_gps ?? "",
            latitude:
              saved.latitude == null
                ? ""
                : String(saved.latitude),
            longitude:
              saved.longitude == null
                ? ""
                : String(saved.longitude),
            is_configured: saved.is_configured ?? false,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load platform location settings."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadLocation();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateField(
    field: keyof PlatformLocation,
    value: string | boolean
  ) {
    setLocation((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveLocation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const latitude =
        location.latitude.trim() === ""
          ? null
          : Number(location.latitude);

      const longitude =
        location.longitude.trim() === ""
          ? null
          : Number(location.longitude);

      if (
        latitude !== null &&
        (!Number.isFinite(latitude) ||
          latitude < -90 ||
          latitude > 90)
      ) {
        throw new Error("Enter a valid latitude between -90 and 90.");
      }

      if (
        longitude !== null &&
        (!Number.isFinite(longitude) ||
          longitude < -180 ||
          longitude > 180)
      ) {
        throw new Error(
          "Enter a valid longitude between -180 and 180."
        );
      }

      if (
        (latitude === null) !== (longitude === null)
      ) {
        throw new Error(
          "Enter both latitude and longitude, or leave both empty."
        );
      }

      const response = await fetch(
        "/api/admin/platform-location",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            company_name: location.company_name.trim(),
            address: location.address.trim(),
            region: location.region,
            city: location.city.trim(),
            landmark: location.landmark.trim(),
            ghana_post_gps: location.ghana_post_gps.trim(),
            latitude,
            longitude,
            is_configured:
              Boolean(location.region && location.city.trim()),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            "Unable to save platform location settings."
        );
      }

      if (result.settings) {
        const saved = result.settings;

        setLocation((current) => ({
          ...current,
          ...saved,
          address: saved.address ?? "",
          region: saved.region ?? "",
          city: saved.city ?? "",
          landmark: saved.landmark ?? "",
          ghana_post_gps: saved.ghana_post_gps ?? "",
          latitude:
            saved.latitude == null
              ? ""
              : String(saved.latitude),
          longitude:
            saved.longitude == null
              ? ""
              : String(saved.longitude),
        }));
      }

      setMessage("Platform location settings saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save platform location settings."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/admin/settings"
          className="inline-flex rounded-xl border border-slate-300 bg-white px-4 py-2 font-bold hover:bg-slate-50"
        >
          ← Back to Marketplace Settings
        </Link>

        <header className="mt-6 rounded-3xl bg-gradient-to-r from-blue-800 to-sky-600 p-7 text-white sm:p-9">
          <p className="text-sm font-bold uppercase tracking-widest">
            BestSalesGH Administration
          </p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">
            Platform Location Settings
          </h1>
          <p className="mt-3 leading-7 text-white/90">
            Manage the official location used by the BestSalesGH
            platform. Ghana Post GPS and map coordinates are optional.
          </p>
        </header>

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {loading ? (
            <p className="text-slate-500">
              Loading platform location settings...
            </p>
          ) : (
            <form onSubmit={saveLocation} className="space-y-6">
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="font-bold text-blue-900">
                  Platform-wide location
                </p>
                <p className="mt-1 text-sm leading-6 text-blue-800">
                  This setting represents the platform’s official
                  location. It does not automatically represent every
                  seller’s shop or every product’s physical location.
                </p>
              </div>

              <div>
                <label
                  htmlFor="company-name"
                  className="mb-2 block text-sm font-bold"
                >
                  Platform / Company Name *
                </label>
                <input
                  id="company-name"
                  required
                  value={location.company_name}
                  onChange={(event) =>
                    updateField("company_name", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  placeholder="BestSalesGH"
                />
              </div>

              <div>
                <label
                  htmlFor="region"
                  className="mb-2 block text-sm font-bold"
                >
                  Region
                </label>
                <select
                  id="region"
                  value={location.region}
                  onChange={(event) =>
                    updateField("region", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                >
                  <option value="">Select region when known</option>
                  {regions.map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="city"
                  className="mb-2 block text-sm font-bold"
                >
                  City / Town
                </label>
                <input
                  id="city"
                  value={location.city}
                  onChange={(event) =>
                    updateField("city", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  placeholder="Enter when the official location is known"
                />
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="mb-2 block text-sm font-bold"
                >
                  Official Physical Address
                </label>
                <textarea
                  id="address"
                  rows={3}
                  value={location.address}
                  onChange={(event) =>
                    updateField("address", event.target.value)
                  }
                  className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  placeholder="Enter the official address when available"
                />
              </div>

              <div>
                <label
                  htmlFor="landmark"
                  className="mb-2 block text-sm font-bold"
                >
                  Landmark / Directions
                </label>
                <textarea
                  id="landmark"
                  rows={2}
                  value={location.landmark}
                  onChange={(event) =>
                    updateField("landmark", event.target.value)
                  }
                  className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  placeholder="Optional directions or nearby landmark"
                />
              </div>

              <details className="rounded-xl border border-slate-200 p-4">
                <summary className="cursor-pointer font-bold">
                  Optional Ghana Post GPS and map coordinates
                </summary>

                <div className="mt-4 space-y-4">
                  <div>
                    <label
                      htmlFor="ghana-post-gps"
                      className="mb-2 block text-sm font-bold"
                    >
                      Ghana Post GPS Address
                    </label>
                    <input
                      id="ghana-post-gps"
                      value={location.ghana_post_gps}
                      onChange={(event) =>
                        updateField(
                          "ghana_post_gps",
                          event.target.value
                        )
                      }
                      className="w-full rounded-xl border border-slate-300 px-4 py-3"
                      placeholder="Optional"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="latitude"
                        className="mb-2 block text-sm font-bold"
                      >
                        Latitude
                      </label>
                      <input
                        id="latitude"
                        type="number"
                        step="any"
                        value={location.latitude}
                        onChange={(event) =>
                          updateField("latitude", event.target.value)
                        }
                        className="w-full rounded-xl border border-slate-300 px-4 py-3"
                        placeholder="Optional"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="longitude"
                        className="mb-2 block text-sm font-bold"
                      >
                        Longitude
                      </label>
                      <input
                        id="longitude"
                        type="number"
                        step="any"
                        value={location.longitude}
                        onChange={(event) =>
                          updateField("longitude", event.target.value)
                        }
                        className="w-full rounded-xl border border-slate-300 px-4 py-3"
                        placeholder="Optional"
                      />
                    </div>
                  </div>
                </div>
              </details>

              {message && (
                <p
                  role="status"
                  className="rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800"
                >
                  {message}
                </p>
              )}

              {error && (
                <p
                  role="alert"
                  className="rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-800"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-blue-700 px-6 py-4 font-black text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {saving ? "Saving..." : "Save Platform Location"}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}
