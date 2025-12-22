"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface BusinessMapProps {
  latitude?: number;
  longitude?: number;
  name?: string;
  address?: string;
}

const BusinessMap = ({
  latitude,
  longitude,
  name,
  address,
}: BusinessMapProps) => {
  const [hasError, setHasError] = useState(false);

  if (!latitude || !longitude) return null;
  if (hasError)
    return <p className="text-sm text-red-500">نقشه قابل نمایش نیست</p>;

  return (
    <div className="w-full h-60 sm:h-80 md:h-96 rounded-md overflow-hidden">
      <MapContainer
        center={[latitude, longitude]}
        zoom={15}
        scrollWheelZoom={false}
        className="w-full h-full"
        whenReady={() => setHasError(false)}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{
            tileerror: () => setHasError(true),
          }}
        />
        <Marker position={[latitude, longitude]}>
          <Popup>
            {name && <p className="font-bold">{name}</p>}
            {address && <p className="text-sm">{address}</p>}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default BusinessMap;
