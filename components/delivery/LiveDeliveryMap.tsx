
"use client";

import { useEffect, useState } from "react";
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

type Coordinates = {
  latitude: number;
  longitude: number;
};

type Props = {
  riderLocation?: Coordinates | null;
  destination?: Coordinates | null;
  riderName?: string;
};

function MapUpdater({
  center,
}: {
  center: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, Math.max(map.getZoom(), 14));
  }, [center, map]);

  return null;
}

const riderIcon = L.divIcon({
  className: "live-rider-marker",
  html: '<div style="font-size:30px">🛵</div>',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

export default function LiveDeliveryMap({
  riderLocation,
  destination,
  riderName = "Delivery rider",
}: Props) {
  const fallback: [number, number] = [5.6037, -0.1870];

  const center: [number, number] = riderLocation
    ? [riderLocation.latitude, riderLocation.longitude]
    : destination
      ? [destination.latitude, destination.longitude]
      : fallback;

  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setMapReady(true);
  }, []);

  if (!mapReady) {
    return (
      <div className="flex h-[420px] items-center justify-center rounded-xl bg-slate-100">
        Loading delivery map…
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200">
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
            <Popup>{riderName} — latest reported location</Popup>
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
              color: "#dc2626",
              fillColor: "#ef4444",
              fillOpacity: 1,
            }}
          >
            <Popup>Customer delivery destination</Popup>
          </CircleMarker>
        )}
      </MapContainer>

      <div className="bg-white px-4 py-3 text-sm text-slate-600">
        {riderLocation
          ? "Showing the rider's latest reported GPS position."
          : "Waiting for the rider's location."}
        {!destination && (
          <p className="mt-1">
            Exact customer coordinates are not available yet.
          </p>
        )}
      </div>
    </div>
  );
}
