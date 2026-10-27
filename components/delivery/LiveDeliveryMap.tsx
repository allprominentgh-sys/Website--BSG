
"use client";

import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

type Props = {
  riderLocation: Coordinates | null;
  destination: Coordinates | null;
  riderName?: string;
};

const riderIcon = L.divIcon({
  className: "bsg-live-rider-marker",
  html: `
    <div style="
      width:40px;
      height:40px;
      display:flex;
      align-items:center;
      justify-content:center;
      border-radius:50%;
      background:#ffffff;
      border:3px solid #2563eb;
      box-shadow:0 2px 8px #0003;
      font-size:22px;
    ">🛵</div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

function MapUpdater({
  center,
}: {
  center: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, Math.max(map.getZoom(), 14), {
      animate: true,
    });
  }, [center, map]);

  return null;
}

export default function LiveDeliveryMap({
  riderLocation,
  destination,
  riderName = "Delivery rider",
}: Props) {
  const fallback: [number, number] = [5.6037, -0.187];

  const center: [number, number] = riderLocation
    ? [riderLocation.latitude, riderLocation.longitude]
    : destination
      ? [destination.latitude, destination.longitude]
      : fallback;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b p-4">
        <div>
          <h2 className="font-bold text-slate-900">
            Live delivery map
          </h2>
          <p className="text-sm text-slate-500">
            BEST SALES GHANA
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            riderLocation
              ? "bg-green-100 text-green-800"
              : "bg-amber-100 text-amber-800"
          }`}
        >
          {riderLocation ? "Location received" : "Waiting for rider"}
        </span>
      </div>

      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom
        style={{ height: "420px", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater center={center} />

        {riderLocation && (
          <Marker
            position={[
              riderLocation.latitude,
              riderLocation.longitude,
            ]}
            icon={riderIcon}
          >
            <Popup>
              <strong>{riderName}</strong>
              <br />
              Latest reported GPS location
            </Popup>
          </Marker>
        )}

        {destination && (
          <CircleMarker
            center={[
              destination.latitude,
              destination.longitude,
            ]}
            radius={9}
            pathOptions={{
              color: "#b91c1c",
              fillColor: "#ef4444",
              fillOpacity: 1,
            }}
          >
            <Popup>
              <strong>Customer destination</strong>
            </Popup>
          </CircleMarker>
        )}
      </MapContainer>

      <div className="space-y-1 p-4 text-sm text-slate-600">
        <p>
          <strong>Rider:</strong>{" "}
          {riderLocation
            ? `${riderLocation.latitude.toFixed(5)}, ${riderLocation.longitude.toFixed(5)}`
            : "Waiting for GPS coordinates"}
        </p>

        <p>
          <strong>Destination:</strong>{" "}
          {destination
            ? `${destination.latitude.toFixed(5)}, ${destination.longitude.toFixed(5)}`
            : "Exact customer coordinates not available"}
        </p>

        {!riderLocation && (
          <p className="text-amber-700">
            The map is waiting for the driver's location.
            The default view is Accra; it is not the driver's
            confirmed position.
          </p>
        )}
      </div>
    </section>
  );
}
