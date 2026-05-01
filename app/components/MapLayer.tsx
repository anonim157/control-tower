"use client";

import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// 1. Komponen Interaktif untuk Animasi Zoom Peta
const InteractiveMarker = ({
  position,
  color,
  name,
  status,
  oee,
}: {
  position: [number, number];
  color: string;
  name: string;
  status: string;
  oee: string;
}) => {
  const map = useMap(); 

  return (
    <CircleMarker
      center={position}
      pathOptions={{ color: color, fillColor: color, fillOpacity: 0.8 }}
      radius={12}
      eventHandlers={{
        click: () => {
          // Animasi zoom in ke area pabrik (Level 16)
          map.flyTo(position, 16, {
            animate: true,
            duration: 1.5, 
          });
        },
      }}
    >
      <Popup className="custom-popup">
        <div className="flex flex-col gap-1 p-1 min-w-[160px]">
          <span className="font-bold text-slate-800 text-base border-b pb-1 mb-1">
            {name}
          </span>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Status Mesin:</span>
            <span className="font-bold" style={{ color: color }}>
              {status}
            </span>
          </div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-slate-500">OEE Live:</span>
            <span className="font-semibold text-slate-700">{oee}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation(); 
              // Reset zoom ke wilayah Jabodetabek/Jawa Barat
              map.flyTo([-6.2000, 106.8166], 9, {
                animate: true,
                duration: 1.5,
              });
            }}
            className="mt-2 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-1.5 rounded transition-all"
          >
            Reset Zoom
          </button>
        </div>
      </Popup>
    </CircleMarker>
  );
};

// 2. Peta Layer Utama
export default function MapLayer() {
  // Titik tengah awal (Area Jakarta/Bekasi)
  const defaultCenter: [number, number] = [-6.2000, 106.8166];

  // Data lokasi plant PT Sayap Mas Utama
  const factoryLocations = [
    {
      id: 1,
      name: "Plant SMU 1",
      pos: [-6.185, 106.915] as [number, number],
      color: "#ef4444", // Merah
      status: "Critical Alarm",
      oee: "45.2%",
    },
    {
      id: 2,
      name: "Plant SMU 2",
      pos: [-6.170, 106.910] as [number, number],
      color: "#10b981", // Hijau
      status: "Running Normal",
      oee: "89.5%",
    },
    {
      id: 3,
      name: "Warehouse TAS",
      pos: [-6.300, 107.150] as [number, number],
      color: "#f59e0b", // Kuning/Amber
      status: "Warning",
      oee: "72.1%",
    },
  ];

  return (
    // Container dirubah menjadi h-screen agar memenuhi layar penuh
    <div className="relative w-full h-screen overflow-hidden z-0">
      <MapContainer
        center={defaultCenter}
        zoom={9}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {factoryLocations.map((plant) => (
          <InteractiveMarker
            key={plant.id}
            position={plant.pos}
            color={plant.color}
            name={plant.name}
            status={plant.status}
            oee={plant.oee}
          />
        ))}
      </MapContainer>
    </div>
  );
}