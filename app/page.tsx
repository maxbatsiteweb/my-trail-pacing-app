"use client";

import React, { useState, useEffect, useMemo } from "react";
import "leaflet/dist/leaflet.css";
import dynamic from "next/dynamic";
import GeoJsonTable from "@/components/PacingCalculator";
import { TooltipItem,Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  CategoryScale,
  registerables,
  Filler } from 'chart.js';
import {
  
} from 'chart.js';

// Register components
Chart.register(LineController, LineElement, PointElement, LinearScale, Title, Tooltip, CategoryScale, Filler);



declare global {
  interface Window {
    elevationChartInstance?: Chart;
  }
}

const DynamicMap = dynamic(
  
  () => import("../components/MapComponent"), // Met ta map dans un fichier séparé, exemple MapComponent.tsx
  { ssr: false } // <-- Désactive le SSR pour ce composant
);

// Import dynamique du MapContainer et composants Leaflet, désactivé côté serveur




// Correction icône par défaut Leaflet pour Next.js/React
// import L from "leaflet";
// import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
// import markerIcon from "leaflet/dist/images/marker-icon.png";
// import markerShadow from "leaflet/dist/images/marker-shadow.png";




export default function Home() {
  const courses = [
    { id: "course1", name: "XL", km: 42.9, d_plus: 2832, d_moins: 2832},
    { id: "course2", name: "L", km: 25, d_plus: 1586, d_moins: 1586},
    { id: "course3", name: "M", km: 15, d_plus: 982, d_moins: 982},
    { id: "course4", name: "S", km: 7, d_plus: 246, d_moins: 246},
  ];

  // useEffect(() => {
  //   // Cette ligne doit être exécutée uniquement côté client, ici dans useEffect
  //   L.Icon.Default.mergeOptions({
  //     iconRetinaUrl: markerIcon2x.src,
  //     iconUrl: markerIcon.src,
  //     shadowUrl: markerShadow.src,
  //   });
  // }, []);

 




  const [selectedCourse, setSelectedCourse] = useState(courses[0].id);
  const [activeTab, setActiveTab] = useState<"ravitos" | "kilometre">("ravitos");

  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");
  const [totalSeconds, setTotalSeconds] = useState(0);


  type MetaData = {
    xl: {
      difficulty: number;
      checkpoint_distance: [number];
      checkpoint_name: [string];
    };
    l: {
      difficulty: number;
      checkpoint_distance: [number];
      checkpoint_name: [string];
    };
    m: {
      difficulty: number;
      checkpoint_distance: [number];
      checkpoint_name: [string];
    };
    s: {
      difficulty: number;
      checkpoint_distance: [number];
      checkpoint_name: [string];
    };
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



  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "").slice(0, 2); 
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

  useEffect(() => {
    const h = parseInt(hours || "0", 10);
    const m = parseInt(minutes || "0", 10);
    const s = parseInt(seconds || "0", 10);

    const total = h * 3600 + m * 60 + s;
    setTotalSeconds(total);
  }, [hours, minutes, seconds]);


  let vap = 0;
  let vap_string = "";


    const selected = courses.find(c => c.id === selectedCourse);
    const courseKey = selected ? selected.name.toLowerCase() : ""; 
    const geojsonPath = courseKey ? `data/races/combloux_${courseKey}.geojson` : "";


  if (metaData) {

    const courseKey = selected?.name.toLowerCase() as keyof typeof metaData;

    if (courseKey && metaData[courseKey]) {
      const difficulty = metaData[courseKey].difficulty;
      vap = difficulty / totalSeconds;
    
      if (vap > 0) {
        const secondsPerKm = 1000 / vap;
        const minutes = Math.floor(secondsPerKm / 60);
        const seconds = Math.round(secondsPerKm % 60);
        vap_string = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      } else {
        vap_string = "N/A";
      }
    } else {
      vap_string = "N/A";
   } 
  }

  useEffect(() => {
  fetch(geojsonPath)
    .then((res) => res.json())
    .then((data) => {

      const properties = data.geometry;
      const deltaDistance = properties.delta_distance;
      const coef = properties.coef;

      if (deltaDistance && coef && deltaDistance.length === coef.length) {
        const resultats = deltaDistance.map((dist: number, i: number) => {
          return (dist * coef[i]) / vap;
        });


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

  return (_cum_distance: number, _coef: number, _dist: number, i: number): string => {
    return resultats[i] ?? "-";
  };
}, [resultats]);


//type Point = { lat: number; lng: number };
//const [polylinePoints, setPolylinePoints] = useState<Point[]>([]);

// useEffect(() => {
//   fetch(geojsonPath)
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


// Exemple de données

Chart.register(...registerables);

const [distances, setDistances] = useState<number[]>([]);
const [altitudes, setAltitudes] = useState<number[]>([]);

useEffect(() => {
  fetch(geojsonPath)
    .then((res) => res.json())
    .then((geojson) => {
      if (
        geojson &&
        geojson.geometry &&
        geojson.geometry.type === "LineString" &&
        Array.isArray(geojson.geometry.coordinates)
      ) {
        // Utiliser cum_horizontal_distance et altitude du geojson
        const cumDistances = geojson.geometry.cum_horizontal_distance || [];
        const alts = geojson.geometry.coordinates.map((coord: number[]) => coord[2] ?? 0);

        setDistances(cumDistances);
        setAltitudes(alts);
      }
    })
    .catch((err) => console.error("Erreur de chargement du GeoJSON :", err));
}, [geojsonPath]);



useEffect(() => {
  const canvas = document.getElementById('elevationChart') as HTMLCanvasElement | null;
  
  if (canvas) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Destroy previous chart instance if it exists to avoid duplicates
      if (window.elevationChartInstance) {
        window.elevationChartInstance.destroy();
      }
      
      window.elevationChartInstance = new Chart(ctx, {
        type: 'line',
        
        data: {
          labels: distances.map((d) => d / 1000),
          datasets: [{
            label: 'Altitude (m)',
            data: altitudes,
            borderColor: '#3e95cd',
            backgroundColor: 'rgba(62,149,205,0.2)',
            tension: 0.1,
            pointRadius: 0, // pas de points pour lisser le tracé
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              type: 'linear',
              title: {
                display: true,
                text: 'Distance (km)'
              }
            },
            y: {
              title: {
                display: true,
                text: 'Altitude (m)'
              }
            }
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              callbacks: {
                  title: (context: TooltipItem<'line'>[]) => `Distance : ${context[0].label} km`,
                  label: (context: TooltipItem<'line'>) => `Altitude : ${context.formattedValue} m`
              }
            }
          }
        }
      });
    }
  }
  // Cleanup on unmount
  return () => {
    if (window.elevationChartInstance) {
      window.elevationChartInstance.destroy();
      window.elevationChartInstance = undefined;
    }
  };
}, [altitudes, distances]);


  return (
    <>
      <div className="container">
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


        <section className="profile box">
          <h2><strong>Profil</strong></h2>
          
          <div style={{ height: "200px" }}>
          <canvas id="elevationChart"></canvas>
          </div>

        </section>


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
           
            <div className="map">
            <DynamicMap />
           {/* <Polyline positions={polylinePoints} color="blue" /> */}
            
            </div>
       

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
                    extraColumnPoint={metaData && selected
                        ? metaData[selected.name.toLowerCase() as keyof typeof metaData].checkpoint_distance
                        : []}
                    extraColumnPointName={metaData && selected
                        ? metaData[selected.name.toLowerCase() as keyof typeof metaData].checkpoint_name
                        : []}
                    geojsonPath={geojsonPath}
                  />

              </div>
            ) : (
              <div>
                <GeoJsonTable
                    extraColumnName="Temps"
                    extraColumnFn={extraColumnFn}
                    extraColumnPoint={
                      metaData && selected
                        ? metaData[selected.name.toLowerCase() as keyof typeof metaData].checkpoint_distance
                        : []
                    }
                    extraColumnPointName={
                      metaData && selected
                        ? metaData[selected.name.toLowerCase() as keyof typeof metaData].checkpoint_name
                        : []
                    }
                  />
              </div>
            )}
          </div>

        </section>
      </div>
    </>
  );
}
