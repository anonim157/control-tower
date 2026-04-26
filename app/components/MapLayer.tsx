"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Title, Text, Button, Badge } from "@tremor/react";
import { Plant } from "../../lib/mockData";

interface MapLayerProps {
  plants: Plant[];
  onSelectPlant: (id: string) => void;
}

export default function MapLayer({ plants, onSelectPlant }: MapLayerProps) {
  // Custom marker bercahaya. 
  // Border dikembalikan ke warna gelap (#1e293b) agar lebih kontras di atas peta geografis yang berwarna-warni.
  const getIcon = (status: string) => {
    const color = status === "critical" ? "#ef4444" : status === "warning" ? "#eab308" : "#10b981";
    return L.divIcon({
      className: "custom-marker",
      html: `
        <div style="
          background-color: ${color}; 
          width: 18px; 
          height: 18px; 
          border-radius: 50%; 
          border: 2px solid #1e293b; 
          box-shadow: 0 0 12px ${color}; 
          cursor: pointer;
        "></div>
      `,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
  };

  return (
    <div className="h-[600px] w-full rounded-xl overflow-hidden border border-slate-800 z-0 relative shadow-lg">
      <MapContainer 
        center={[-6.7, 109.5]} // Fokus awal di Pulau Jawa
        zoom={8} 
        style={{ height: "100%", width: "100%", zIndex: 0 }}
      >
        {/* TEMA PETA STANDAR GEOGRAFIS (OpenStreetMap) */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {plants.map((plant) => (
          <Marker key={plant.id} position={plant.coordinates} icon={getIcon(plant.status)}>
            <Popup 
              className="custom-leaflet-popup" 
              closeButton={false} 
            >
              <div className="min-w-[240px] bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-2xl -m-5">
                <Text className="text-slate-400 font-bold mb-1 text-xs uppercase tracking-wider">{plant.location}</Text>
                <Title className="text-white text-lg mb-4 leading-tight">{plant.name}</Title>
                
                <div className="flex justify-between items-center mb-5 bg-slate-800 p-2 rounded-lg border border-slate-700">
                  <span className="text-sm font-semibold text-slate-300">OEE: <span className="text-white">{plant.overallOEE}%</span></span>
                  <Badge color={plant.status === "critical" ? "red" : plant.status === "warning" ? "yellow" : "emerald"} size="xs">
                    {plant.status.toUpperCase()}
                  </Badge>
                </div>

                <Button 
                  size="sm" 
                  onClick={() => onSelectPlant(plant.id)} 
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium"
                >
                  Lihat Detail Pabrik →
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}