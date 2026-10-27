
"use client";

import { useCallback, useEffect, useState } from "react";
import LiveDeliveryMap from "./LiveDeliveryMapLoader";
import type { Coordinates } from "./LiveDeliveryMap";

type LocationResponse = {
  success: boolean;
  location: {
    latitude: number;
    longitude: number;
    updated_at: string;
    accuracy_meters?: number | null;
  } | null;
  message?: string;
};

type Destination = Coordinates & {
  address?: string;
};

type Props = {
  deliveryId: string;
  destination?: Destination | null;
  riderName?: string;
};

export default function LiveDeliveryTracking({
  deliveryId,
  destination = null,
  riderName = "Delivery rider",
}: Props) {
  const [riderLocation, setRiderLocation] =
    useState<Coordinates | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [message, setMessage] = useState("Connecting to live tracking…");
  const [loading, setLoading] = useState(true);

  const refreshLocation = useCallback(async () => {
    if (!deliveryId) {
      setMessage("A delivery ID is required.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/delivery/location?deliveryId=${encodeURIComponent(deliveryId)}`,
        {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
        }
      );

      const result: LocationResponse = await response.json();

      if (!response.ok || !result.success) {
        setMessage(
          result.message || "Unable to retrieve the rider's location."
        );
        return;
      }

      if (!result.location) {
        setRiderLocation(null);
        setLastUpdated(null);
        setMessage("Waiting for the rider to share their GPS location.");
        return;
      }

      const latitude = Number(result.location.latitude);
      const longitude = Number(result.location.longitude);

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        setMessage("The received GPS coordinates are invalid.");
        return;
      }

      setRiderLocation({ latitude, longitude });
      setLastUpdated(result.location.updated_at);
      setMessage("Latest rider location received.");
    } catch {
      setMessage("Connection problem. Retrying shortly.");
    } finally {
      setLoading(false);
    }
  }, [deliveryId]);

  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setInterval> | undefined;

    const refresh = async () => {
      if (!active) return;
      await refreshLocation();
    };

    void refresh();

    timer = setInterval(() => {
      void refresh();
    }, 5000);

    return () => {
      active = false;
      if (timer) clearInterval(timer);
    };
  }, [refreshLocation]);

  const isStale =
    !lastUpdated ||
    Date.now() - new Date(lastUpdated).getTime() > 30000;

  return (
    <section className="space-y-3">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-lg font-bold text-slate-900">
          Live delivery tracking
        </h2>

        <p className="mt-1 text-sm text-slate-600" role="status">
          {loading ? "Loading location…" : message}
        </p>

        {lastUpdated && (
          <p className="mt-2 text-xs text-slate-500">
            Last update: {new Date(lastUpdated).toLocaleString()}
          </p>
        )}

        {riderLocation && isStale && (
          <p className="mt-2 text-sm text-amber-700">
            This location may be out of date. Waiting for a newer GPS update.
          </p>
        )}
      </div>

      <LiveDeliveryMap
        riderLocation={riderLocation}
        destination={destination}
        riderName={riderName}
      />
    </section>
  );
}
