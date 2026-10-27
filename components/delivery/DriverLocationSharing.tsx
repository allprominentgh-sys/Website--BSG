
"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  deliveryId: string;
};

type TrackingState =
  | "idle"
  | "sharing"
  | "stopped"
  | "error";

export default function DriverLocationSharing({
  deliveryId,
}: Props) {
  const [tracking, setTracking] = useState<TrackingState>("idle");
  const [message, setMessage] = useState(
    "Location sharing is off."
  );
  const [accuracy, setAccuracy] = useState<number | null>(null);

  const watchId = useRef<number | null>(null);
  const lastSentAt = useRef<number>(0);
  const active = useRef(false);

  useEffect(() => {
    return () => {
      active.current = false;

      if (watchId.current !== null) {
        navigator.geolocation?.clearWatch(watchId.current);
      }
    };
  }, []);

  function stopSharing() {
    active.current = false;

    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }

    setTracking("stopped");
    setMessage(
      "Location sharing stopped. Your last saved position may remain visible."
    );
  }

  function startSharing() {
    if (!deliveryId.trim()) {
      setTracking("error");
      setMessage("A valid assigned delivery is required.");
      return;
    }

    if (!navigator.geolocation) {
      setTracking("error");
      setMessage("This browser does not support GPS location sharing.");
      return;
    }

    if (!window.isSecureContext) {
      setTracking("error");
      setMessage(
        "GPS sharing requires HTTPS. Open the secure website address."
      );
      return;
    }

    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }

    active.current = true;
    lastSentAt.current = 0;
    setTracking("sharing");
    setMessage("Requesting location permission…");

    watchId.current = navigator.geolocation.watchPosition(
      async (position) => {
        if (!active.current) return;

        setAccuracy(position.coords.accuracy);

        const now = Date.now();

        // Avoid sending more than one update every 5 seconds.
        if (now - lastSentAt.current < 5000) return;

        lastSentAt.current = now;
        setMessage("Sending your latest location…");

        try {
          const response = await fetch(
            "/api/delivery/location",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              credentials: "same-origin",
              body: JSON.stringify({
                deliveryId,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracyMeters: position.coords.accuracy,
                headingDegrees: position.coords.heading,
                speedMetersPerSecond: position.coords.speed,
              }),
            }
          );

          if (!active.current) return;

          if (!response.ok) {
            setMessage(
              response.status === 401
                ? "Please sign in again to share your location."
                : response.status === 403
                  ? "You are not authorised to share location for this delivery."
                  : "Location could not be saved. Please try again."
            );
            return;
          }

          setMessage("Your location is being shared.");
        } catch {
          if (active.current) {
            setMessage(
              "Connection problem. Waiting for network access."
            );
          }
        }
      },
      (error) => {
        if (!active.current) return;

        setTracking("error");

        if (error.code === error.PERMISSION_DENIED) {
          setMessage(
            "Location permission was denied. Allow location access in your browser settings."
          );
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setMessage("Your phone could not determine its location.");
        } else {
          setMessage("GPS timed out. Check your location settings and retry.");
        }

        if (watchId.current !== null) {
          navigator.geolocation.clearWatch(watchId.current);
          watchId.current = null;
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 20000,
      }
    );
  }

  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-slate-900">
          Driver GPS sharing
        </h2>

        <p className="mt-1 text-sm text-slate-600">
          Share your current position while completing this delivery.
          Your browser must remain open for continuous tracking.
        </p>
      </div>

      <div
        className="rounded-lg bg-slate-50 p-3 text-sm text-slate-700"
        role="status"
        aria-live="polite"
      >
        <p>{message}</p>

        {accuracy !== null && tracking === "sharing" && (
          <p className="mt-1 text-xs text-slate-500">
            GPS accuracy estimate: approximately{" "}
            {Math.round(accuracy)} metres
          </p>
        )}
      </div>

      {tracking !== "sharing" ? (
        <button
          type="button"
          onClick={startSharing}
          className="w-full rounded-xl bg-blue-700 px-4 py-3 font-semibold text-white hover:bg-blue-800"
        >
          Start sharing location
        </button>
      ) : (
        <button
          type="button"
          onClick={stopSharing}
          className="w-full rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700"
        >
          Stop sharing location
        </button>
      )}

      <p className="text-xs text-slate-500">
        Location sharing requires your permission. Only share while
        you are carrying out an authorised delivery.
      </p>
    </section>
  );
}
