import { useEffect, useState } from "react";



type ExtraColumnFunction = (cum_distance: number, cum_positive_elevation: number, dist: number, index: number) => number | string;

interface GeoJsonTableProps {
  extraColumnName?: string;
  extraColumnFn?: ExtraColumnFunction;
  extraColumnPoint?: (number | string)[];
  extraColumnPointName?: (number | string)[];
}


export default function GeoJsonTable({ extraColumnName, extraColumnFn, extraColumnPoint, extraColumnPointName }: GeoJsonTableProps) {
  const [rows, setRows] = useState<({
    pointName?: string;
    cum_distance: number;
    cum_positive_elevation: number;
    dist: number;
    extra?: string;
  })[]>([]);


  useEffect(() => {
  fetch("/data/combloux_42.geojson")
    .then(res => res.json())
    .then(data => {
      const cum_distance = data.geometry.cum_distance;
      const cum_positive_elevation = data.geometry.cum_positive_elevation;
      const dist = data.geometry.cum_negative_elevation;

      if (
        cum_distance && cum_positive_elevation && dist &&
        cum_positive_elevation.length === dist.length
      ) {
        // Toutes les lignes complètes
        interface RowData {
          cum_distance: number;
          cum_positive_elevation: number;
          dist: number;
        }

        // Trouver les indices les plus proches pour chaque valeur cible
        let selectedIndices: number[] = [];

        if (extraColumnPoint && extraColumnPoint.length > 0) {
          selectedIndices = extraColumnPoint.map((target) => {
            let closestIndex = 0;
            let minDiff = Infinity;

            cum_distance.forEach((val: number, i: number) => {
              const diff: number = Math.abs(val - (target as number));
              if (diff < minDiff) {
              minDiff = diff;
              closestIndex = i;
              }
            });

            return closestIndex;
          });
        } else {
          // Si aucune valeur cible fournie, on prend tout
            selectedIndices = cum_distance.map((_: number, i: number) => i);
        }

        // Supprimer les doublons d’index (au cas où)
        const uniqueIndices = [...new Set(selectedIndices)];

        // Construire les lignes filtrées avec éventuellement la colonne extra
        const filteredRows = uniqueIndices.map((i, idx) => {
          const baseRow = {
            cum_distance: Math.round((cum_distance[i] / 1000) * 100) / 100 % 1 === 0
              ? (Math.round((cum_distance[i] / 1000) * 100) / 100).toFixed(2)
              : Math.round((cum_distance[i] / 1000) * 100) / 100,
            cum_positive_elevation: Math.round(cum_positive_elevation[i]),
            dist: Math.round(dist[i]),
            pointName: extraColumnPointName?.[idx] ?? "", // associer le nom si dispo
          };

          return extraColumnFn
  ? {
      ...baseRow,
      extra: String(extraColumnFn(cum_distance[i], cum_positive_elevation[i], dist[i], i)),
    }
  : baseRow;

        });

        setRows(filteredRows);
      } else {
        console.error("Données manquantes ou longueurs incompatibles");
      }
    })
    .catch(err => console.error("Erreur de chargement GeoJSON :", err));
}, [extraColumnFn, extraColumnPoint]);

  

  return (
<div className="p-4">
  <div className="max-h-96 overflow-y-auto rounded">
    <table className="table-auto border-collapse w-full text-sm">
      <thead className="bg-gray-100 sticky top-0">
        <tr>
          <th className="px-2 py-1 text-left">Point</th>
          <th className="px-2 py-1 text-left">Distance</th>
          <th className="px-2 py-1 text-left">D +</th>
          <th className="px-2 py-1 text-left">D -</th>
          {extraColumnName && (
            <th className="px-2 py-1 text-left">{extraColumnName}</th>
          )}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="odd:bg-white even:bg-gray-50">
            <td className="px-2 py-1">{row.pointName || "-"}</td>
            <td className="px-2 py-1">{row.cum_distance}</td>
            <td className="px-2 py-1">{row.cum_positive_elevation}</td>
            <td className="px-2 py-1">{row.dist}</td>
            {extraColumnFn && (
              <td className="px-2 py-1">{row.extra}</td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

);

}
