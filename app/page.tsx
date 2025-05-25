"use client";

import React, { useState, useEffect, useMemo } from "react";
import "leaflet/dist/leaflet.css";

import dynamic from "next/dynamic";

// const DynamicMap = dynamic(
  
//   () => import("../components/MapComponent"), // Met ta map dans un fichier séparé, exemple MapComponent.tsx
//   { ssr: false } // <-- Désactive le SSR pour ce composant
// );

// Import dynamique du MapContainer et composants Leaflet, désactivé côté serveur




// Correction icône par défaut Leaflet pour Next.js/React
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import GeoJsonTable from "@/components/PacingCalculator";


export default function Home() {
  const courses = [
    { id: "course1", name: "XL", km: 42.9, d_plus: 2832, d_moins: 2832},
    { id: "course2", name: "L", km: 25, d_plus: 1586, d_moins: 1586},
    { id: "course3", name: "M", km: 15, d_plus: 982, d_moins: 982},
    { id: "course4", name: "S", km: 7, d_plus: 246, d_moins: 246},
  ];

  useEffect(() => {
    // Cette ligne doit être exécutée uniquement côté client, ici dans useEffect
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x.src,
      iconUrl: markerIcon.src,
      shadowUrl: markerShadow.src,
    });
  }, []);



  const [selectedCourse, setSelectedCourse] = useState(courses[0].id);
  const [activeTab, setActiveTab] = useState<"ravitos" | "kilometre">("ravitos");

  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [totalSeconds, setTotalSeconds] = useState(0);

  type MetaData = {
    maratrail: {
      difficulty: number;
      // Ajoutez d'autres propriétés ici si nécessaire
    };
    // Ajoutez d'autres propriétés ici si nécessaire
  };

  const [metaData, setMetaData] = useState<MetaData | null>(null);
  const [resultats, setResultats] = useState<string[] | null>(null);


  function secondsToHHMMSS(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}

  useEffect(() => {
    fetch("/data/combloux_metadata.json")
      .then((res) => res.json())
      .then((data) => setMetaData(data))
      .catch((err) => console.error("Erreur de chargement :", err));
  }, []);


 


  // Gestion simple pour limiter les valeurs et n'accepter que des chiffres
  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 2); // que des chiffres, max 2 chiffres
    if (val !== "") {
      const num = Math.min(parseInt(val, 10), 23);
      val = num.toString();
    }
    setHours(val);
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 2);
    if (val !== "") {
      const num = Math.min(parseInt(val, 10), 59);
      val = num.toString();
    }
    setMinutes(val);
  };

  const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 2);
    if (val !== "") {
      const num = Math.min(parseInt(val, 10), 59);
      val = num.toString();
    }
    setSeconds(val);
  };

  // Utilise useEffect pour recalculer totalSeconds à chaque changement des inputs
  useEffect(() => {
    const h = parseInt(hours || "0", 10);
    const m = parseInt(minutes || "0", 10);
    const s = parseInt(seconds || "0", 10);

    const total = h * 3600 + m * 60 + s;
    setTotalSeconds(total);
  }, [hours, minutes, seconds]);

  let vap = 0;
  let vap_string = "";
  if (metaData) {
    const difficulty = metaData.maratrail.difficulty;
    vap = difficulty / totalSeconds;
    
    if (vap > 0) {
      const secondsPerKm = 1000 / vap;
      const minutes = Math.floor(secondsPerKm / 60);
      const seconds = Math.round(secondsPerKm % 60);
      vap_string = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } else {
      vap_string = "N/A";
    }
  }

  useEffect(() => {
  fetch("data/combloux_42.geojson")
    .then((res) => res.json())
    .then((data) => {

      // Accès aux propriétés
      const properties = data.geometry;
      const deltaDistance = properties.delta_distance;
      const coef = properties.coef;

      if (deltaDistance && coef && deltaDistance.length === coef.length) {
        // Calcul élément par élément
        const resultats = deltaDistance.map((dist: number, i: number) => {
          return (dist * coef[i]) / vap;
        });


      // Résultats cumulés
        const cumul = resultats.reduce((acc: number[], val: number, i: number) => {
          if (i === 0) {
            acc.push(val);
          } else {
            acc.push(acc[i - 1] + val);
          }
          return acc;
        }, []);

       const cumulFormate = cumul.map(secondsToHHMMSS);  

        setResultats(cumulFormate);

      } else {
        console.error("Problème de longueur ou données manquantes");
      }
    })
    .catch((error) => console.error("Erreur de chargement du GeoJSON :", error));
  }, [vap]);

const extraColumnFn = useMemo(() => {
  if (!resultats) return undefined;

  // tu peux créer une fonction qui va piocher dans le tableau `resultats`
  return (_cum_distance: number, _coef: number, _dist: number, i: number): string => {
    return resultats[i] ?? "-";
  };
}, [resultats]);


//type Point = { lat: number; lng: number };

//const [polylinePoints, setPolylinePoints] = useState<Point[]>([]);

// useEffect(() => {
//   fetch("/data/combloux_42.geojson")
//     .then((res) => res.json())
//     .then((geojson) => {
//       if (
//         geojson &&
//         geojson.geometry &&
//         geojson.geometry.type === "LineString" &&
//         Array.isArray(geojson.geometry.coordinates)
//       ) {
//         const points = geojson.geometry.coordinates.map((coord: number[]) => ({
//           lng: coord[0],
//           lat: coord[1],
//         }));
//         setPolylinePoints(points);
//       }
//     })
//     .catch((err) => console.error("Erreur de chargement du GeoJSON :", err));
// }, []);

  return (
    <>
      <div className="container">
        {/* Choix de la course */}
        <section className="choice box">
          <label htmlFor="course-select">Sélectionnez une course :</label>
          <select
            id="course-select"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
        </section>

        {/* Profil de la course */}
        <section className="profile box">
          <h2><strong>Profil</strong></h2>
        </section>

        {/* Temps estimé utilisateur */}
        <section className="time box">
          <label htmlFor="estimated-time">Entrez votre temps estimé (hh:mm):</label>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>

            <div>

          <input
            id="hours"
            type="number"
            min={0}
            max={23}
            value={hours}
            onChange={handleHoursChange}
            placeholder="hh"
            style={{ width: 50 }}
          />
        </div>

        <div>
            <input
              id="minutes"
              type="number"
              min={0}
              max={59}
              value={minutes}
              onChange={handleMinutesChange}
              placeholder="mm"
              style={{ width: 50 }}
            />
          </div>

            <div>
              <input
              id="seconds"
              type="number"
              min={0}
              max={59}
              value={seconds}
              onChange={handleSecondsChange}
              placeholder="ss"
              style={{ width: 50 }}
            />
            </div>
            

          </div>
        </section>

        {/* Allure */}
        <section className="resume box">
          <h2><strong>Détails</strong></h2>
        
            <br />
            Temps estimé : <strong>{secondsToHHMMSS(totalSeconds)}</strong><br /> 
            <div className="tooltip-wrapper">
              Allure ajustée à la pente et au terrain: <strong>{vap_string}  </strong> 
              <div className="tooltip-icon">?</div>
              <div className="tooltip-text">Ceci est votre l&apos;allure normalisée, si le terrain est plat et facile</div>
            </div> <br />

            Distance : <strong>{courses.find((c) => c.id === selectedCourse)?.km} Km</strong><br />
            Dénivelé positif : <strong>{courses.find((c) => c.id === selectedCourse)?.d_plus} m</strong><br />
            Dénivelé négatif : <strong>{courses.find((c) => c.id === selectedCourse)?.d_moins} m</strong><br />

          
        </section>

        {/* Carte de la course
           
          <div className="map">
          <DynamicMap />
          
          </div> */}
       

        {/* Panneau temps ravitos et km */}
        <section className="data box">
          <div style={{ marginBottom: "16px" }}>
            <button
              type="button"
              onClick={() => setActiveTab("ravitos")}
              style={{
                padding: "8px 16px",
                border: "none",
                borderBottom: activeTab === "ravitos" ? "2px solid #0070f3" : "2px solid transparent",
                background: "none",
                fontWeight: activeTab === "ravitos" ? "bold" : "normal",
                cursor: "pointer",
                marginRight: "8px"
              }}
            >
              Temps aux ravitos
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("kilometre")}
              style={{
                padding: "8px 16px",
                border: "none",
                borderBottom: activeTab === "kilometre" ? "2px solid #0070f3" : "2px solid transparent",
                background: "none",
                fontWeight: activeTab === "kilometre" ? "bold" : "normal",
                cursor: "pointer"
              }}
            >
              Temps par kilomètre
            </button>
          </div>
          <div>
            {activeTab === "ravitos" ? (
              <div>
                <GeoJsonTable
                    extraColumnName="Temps"
                    extraColumnFn={extraColumnFn}
                    extraColumnPoint={[10000, 15000, 30000, 40000]}
                    extraColumnPointName={["Un", "Deux", "Trois", "Quatre"]}
                  />

              </div>
            ) : (
              <div>
                <GeoJsonTable
                    extraColumnName="Temps"
                    extraColumnFn={extraColumnFn}
                    extraColumnPoint={[10000, 15000, 30000, 40000]}
                    extraColumnPointName={["Un", "Deux", "Trois", "Quatre"]}
                  />
              </div>
            )}
          </div>

        </section>
      </div>
    </>
  );
}
