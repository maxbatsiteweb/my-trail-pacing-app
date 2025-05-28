"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from "react-leaflet";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import { DivIcon } from "leaflet";
import ReactDOMServer from "react-dom/server";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faLocationDot } from '@fortawesome/free-solid-svg-icons'
import { useMap } from 'react-leaflet';

import type { ReactElement } from "react";

const createIcon = (icon: ReactElement) => {
  return new DivIcon({
    html: ReactDOMServer.renderToString(icon),
    className: "",
    iconSize: [500, 500],
    iconAnchor: [15, 30],
  });
};

const startIcon = createIcon(<FontAwesomeIcon icon={faLocationDot} color="green" style={{ fontSize: '30px' }}/>);
const finishIcon = createIcon(<FontAwesomeIcon icon={faLocationDot} color="red" style={{ fontSize: '30px' }}/>);
const checkPointIcon = createIcon(<FontAwesomeIcon icon={faLocationDot} color="blue" style={{ fontSize: '30px' }}/>);

type MapComponentProps = {
  points: [number, number][];
  checkPoints: [number, number][];
  checkPointsNames: string[]
};

export default function MapComponent({ points, checkPoints, checkPointsNames }: MapComponentProps) {
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  useEffect(() => {
    // Import de leaflet dynamiquement pour éviter les erreurs SSR
    import("leaflet").then(L => {
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: markerIcon2x.src,
        iconUrl: markerIcon.src,
        shadowUrl: markerShadow.src,
      });
      setLeafletLoaded(true); // pour forcer le rendu seulement après que leaflet est bien chargé
    });
  }, []);

  if (!leafletLoaded) return null; // éviter le rendu avant que Leaflet soit prêt

function MapInvalidateSize() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100); // petit délai pour laisser le DOM se stabiliser
  }, [map]);
  return null;
}

  return (
    <MapContainer
      center={points[0] as [number, number]}
      zoom={10}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Polyline positions={points} color="blue" />

      {points.length > 0 && (
        <Marker position={points[0]} icon={startIcon}>
          <Tooltip  direction="top" offset={[0, -10]}>
              Départ
            </Tooltip>
        </Marker>
      )}

      {points.length > 1 && (
        <Marker position={points[points.length - 1] } icon={finishIcon}>
          <Tooltip  direction="top" offset={[0, -10]}>
                Arrivée
              </Tooltip>
        </Marker>
      )}


      {checkPoints.map((pos, idx) => (
        <Marker key={idx} position={pos} icon={checkPointIcon}>
          <Tooltip  direction="top" offset={[0, -10]} interactive={false}>
              {checkPointsNames[idx]}
            </Tooltip>
        </Marker>
      ))}

      <MapInvalidateSize />

    </MapContainer>
  );
}
