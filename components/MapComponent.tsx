"use client";

import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

export default function MapComponent() {
  useEffect(() => {
    // Configurer les icônes par défaut de Leaflet côté client uniquement
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x.src,
      iconUrl: markerIcon.src,
      shadowUrl: markerShadow.src,
    });
  }, []);

  return (
    <MapContainer
              center={[45.919, 6.631] as [number, number]}
              zoom={13}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%" }}
            >
       <TileLayer
              attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
      <Marker position={[45.919, 6.631]}>
              <Popup>Combloux, Rhône-Alpes</Popup>
            </Marker>

    </MapContainer>
  );
}
