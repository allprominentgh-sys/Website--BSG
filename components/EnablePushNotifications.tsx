
"use client";

import { useState } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);

  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);

  const output = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }

  return output;
}

export default function EnablePushNotifications() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function enableNotifications() {
    if (loading) return;

    setLoading(true);
    setStatus("");

    try {
      if (!("Notification" in window)) {
        setStatus("Your browser does not support notifications.");
        return;
      }

      if (!("serviceWorker" in navigator)) {
        setStatus("Your browser does not support service workers.");
        return;
      }

      const vapidPublicKey =
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        setStatus("Push notification keys are not configured yet.");
        return;
      }

      if (Notification.permission === "denied") {
        setStatus(
          "Notifications are blocked. Please allow them in your browser settings."
        );
        return;
      }

      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setStatus("Notification permission was not granted.");
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      let subscription =
        await registration.pushManager.getSubscription();

      if (!subscription) {
        const applicationServerKey = urlBase64ToUint8Array(
          vapidPublicKey
        );

        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
      }

      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Could not save push subscription."
        );
      }

      setStatus(
        "Notifications enabled successfully on this device."
      );
    } catch (error) {
      console.error("Push notification setup error:", error);

      setStatus(
        error instanceof Error
          ? error.message
          : "Could not enable notifications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={enableNotifications}
        disabled={loading}
        className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
      >
        {loading ? "Enabling..." : "Enable Notifications"}
      </button>

      {status && (
        <p className="mt-2 text-sm" role="status">
          {status}
        </p>
      )}
    </div>
  );
}
