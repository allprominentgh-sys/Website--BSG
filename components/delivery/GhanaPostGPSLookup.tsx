
"use client";

import { useState } from "react";

type ResolvedAddress = {
  address: string;
  latitude: number;
  longitude: number;
  region?: string | null;
  district?: string | null;
  area?: string | null;
  street?: string | null;
};

type Props = {
  onResolved: (destination: ResolvedAddress) => void;
};

export default function GhanaPostGPSLookup({
  onResolved,
}: Props) {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resolved, setResolved] =
    useState<ResolvedAddress | null>(null);

  async function lookupAddress() {
    setError("");
    setResolved(null);

    const value = address.trim().toUpperCase();

    if (!value) {
      setError("Enter your GhanaPostGPS address.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/delivery/resolve-ghana-post-gps",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: value }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to find that address."
        );
      }

      const destination: ResolvedAddress = {
        address: result.address,
        latitude: result.latitude,
        longitude: result.longitude,
        region: result.region,
        district: result.district,
        area: result.area,
        street: result.street,
      };

      setResolved(destination);
      onResolved(destination);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Address lookup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          Delivery address
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Enter your GhanaPostGPS digital address to look up
          your delivery destination.
        </p>
      </div>

      <label
        htmlFor="ghana-post-gps"
        className="block text-sm font-medium text-slate-700"
      >
        GhanaPostGPS address
      </label>

      <input
        id="ghana-post-gps"
        value={address}
        onChange={(event) => {
          setAddress(event.target.value.toUpperCase());
          setResolved(null);
          setError("");
        }}
        placeholder="Example: GA-543-0125"
        autoComplete="off"
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
      />

      <button
        type="button"
        onClick={lookupAddress}
        disabled={loading}
        className="w-full rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Checking address…" : "Find my delivery location"}
      </button>

      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}

      {resolved && (
        <div className="space-y-2 rounded-xl bg-green-50 p-4 text-sm text-green-900">
          <p className="font-semibold">
            Address lookup returned a location
          </p>

          <p>Address: {resolved.address}</p>

          {resolved.region && <p>Region: {resolved.region}</p>}
          {resolved.district && (
            <p>District: {resolved.district}</p>
          )}
          {resolved.area && <p>Area: {resolved.area}</p>}

          <p>
            Coordinates: {resolved.latitude.toFixed(6)},{" "}
            {resolved.longitude.toFixed(6)}
          </p>

          <p className="text-xs">
            Check that the pin matches your intended delivery
            location before confirming the order.
          </p>
        </div>
      )}
    </section>
  );
}
