"use client";

import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// 1. Komponen Interaktif untuk Marker (Bulatan) di Peta
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
  const map = useMap(); // Hook untuk mengambil alih kontrol pergerakan peta

  return (
    <CircleMarker
      center={position}
      pathOptions={{ color: color, fillColor: color, fillOpacity: 0.8 }}
      radius={12}
      eventHandlers={{
        click: () => {
          // Animasi "Terbang" dan Zoom In ke lokasi (Level 16 cocok untuk area gedung pabrik)
          map.flyTo(position, 16, {
            animate: true,
            duration: 1.5, // Durasi animasi 1.5 detik
          });
        },
      }}
    >
      {/* Kotak Informasi yang muncul saat marker di-klik */}
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

          {/* Tombol untuk kembali ke tampilan awal */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // Mencegah bentrok dengan klik marker
              // Terbang kembali ke titik koordinat awal (Jawa Tengah/Semarang)
              map.flyTo([-6.9825, 110.4251], 9, {
                animate: true,
                duration: 1.5,
              });
            }}
            className="mt-2 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-1.5 rounded transition-all"
          >
            Reset Zoom (Tampilan Regional)
          </button>
        </div>
      </Popup>
    </CircleMarker>
  );
};

// 2. Komponen Peta Utama
export default function MapLayer() {
  // Titik tengah awal kamera peta (Misal: Koordinat tengah Jawa Tengah)
  const defaultCenter: [number, number] = [-6.9825, 110.4251];

  // Data Lokasi Aset (Nanti bisa diganti dengan tarikan data dari Node-RED / PostgreSQL)
  const factoryLocations = [
    {
      id: 1,
      name: "Plant SMU 1",
      pos: [-6.9533, 110.4350] as [number, number],
      color: "#ef4444", // Merah (Critical)
      status: "Critical Alarm",
      oee: "45.2%",
    },
    {
      id: 2,
      name: "Sayap Mas Warehouse",
      pos: [-6.8048, 110.8405] as [number, number],
      color: "#10b981", // Hijau (Normal)
      status: "Running Normal",
      oee: "89.5%",
    },
  ];

  return (
    <div className="relative w-full h-[500px] rounded-xl overflow-hidden shadow-lg border border-slate-800/50 z-0">
      <MapContainer
        center={defaultCenter}
        zoom={9}
        scrollWheelZoom={true} // Memungkinkan user zoom pakai scroll mouse
        className="w-full h-full"
      >
        {/* TileLayer menggunakan OpenStreetMap standar (seperti screenshotmu) */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {/* Melakukan looping untuk menampilkan semua marker dari array factoryLocations */}
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