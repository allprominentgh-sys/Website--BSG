
"use client";

import { useState } from "react";

export default function EnablePushNotifications() {
  const [status, setStatus] = useState("");

  async function enableNotifications() {
    if (!("Notification" in window)) {
      setStatus("Your browser does not support notifications.");
      return;
    }

    if (!("serviceWorker" in navigator)) {
      setStatus("Your browser does not support service workers.");
      return;
    }

    if (Notification.permission === "denied") {
      setStatus(
        "Notifications are blocked. Please allow them in your browser settings."
      );
      return;
    }

    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        await navigator.serviceWorker.ready;
        setStatus("Notification permission granted. Final connection is still pending.");
      } else {
        setStatus("Notification permission was not granted.");
      }
    } catch (error) {
      console.error("Notification permission error:", error);
      setStatus("Could not enable notifications. Please try again.");
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={enableNotifications}
        className="rounded-lg bg-blue-700 px-4 py-2 font-semibold text-white hover:bg-blue-800"
      >
        Enable Notifications
      </button>

      {status && (
        <p className="mt-2 text-sm" role="status">
          {status}
        </p>
      )}
    </div>
  );
}
