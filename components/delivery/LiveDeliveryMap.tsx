
"use client";

import { useEffect, useState } from "react";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

type LiveDeliveryMapProps = {
  riderLocation?: Coordinates | null;
  destination?: Coordinates | null;
  riderName?: string;
};

export default function LiveDeliveryMap({
  riderLocation,
  destination,
  riderName = "Delivery person",
}: LiveDeliveryMapProps) {
  const [Map, setMap] = useState<React.ComponentType<any> | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;

    Promise.all([
      import("react-leaflet"),
      import("leaflet"),
    ])
      .then(([leafletReact, leaflet]) => {
        if (!active) return;

        const L = leaflet.default;

        const MapComponent = () => {
          const center: [number, number] = riderLocation
            ? [riderLocation.latitude, riderLocation.longitude]
            : destination
              ? [destination.latitude, destination.longitude]
              : [5.6037, -0.187];

          return (
            <leafletReact.MapContainer
              center={center}
              zoom={riderLocation || destination ? 13 : 7}
              scrollWheelZoom
              style={{ height: "400px", width: "100%" }}
            >
              <leafletReact.TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {riderLocation && (
                <leafletReact.Marker
                  position={[
                    riderLocation.latitude,
                    riderLocation.longitude,
                  ]}
                  icon={L.divIcon({
                    className: "bsg-map-marker",
                    html: '<div style="font-size:28px">🏍️</div>',
                    iconSize: [36, 36],
                    iconAnchor: [18, 18],
                  })}
                >
                  <leafletReact.Popup>
                    {riderName} — current location
                  </leafletReact.Popup>
                </leafletReact.Marker>
              )}

              {destination && (
                <leafletReact.Marker
                  position={[
                    destination.latitude,
                    destination.longitude,
                  ]}
                >
                  <leafletReact.Popup>
                    Delivery destination
                  </leafletReact.Popup>
                </leafletReact.Marker>
              )}
            </leafletReact.MapContainer>
          );
        };

        setMap(() => MapComponent);
      })
      .catch(() => {
        if (active) setLoadError(true);
      });

    return () => {
      active = false;
    };
  }, [riderLocation, destination, riderName]);

  if (loadError) {
    return (
      <div className="rounded-xl bg-slate-100 p-5 text-sm text-slate-700">
        The map could not be loaded. Please try again later.
      </div>
    );
  }

  if (!Map) {
    return (
      <div className="flex h-80 items-center justify-center rounded-xl bg-slate-100">
        Loading delivery map…
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl">
      <Map />
    </div>
  );
}
