"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, Polygon, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Styling Custom untuk Popup agar tetap modern
const MapCustomStyles = () => (
  <style>{`
    .leaflet-popup-content-wrapper {
      background-color: rgba(15, 23, 42, 0.95) !important;
      backdrop-filter: blur(12px);
      color: #f8fafc !important;
      border: 1px solid #1e293b;
      border-radius: 0.75rem;
      box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.7) !important;
      padding: 0;
    }
    .leaflet-popup-content {
      margin: 0;
      width: 280px !important;
    }
    .leaflet-popup-tip {
      background-color: #0f172a !important;
      border: 1px solid #1e293b;
    }
    .leaflet-control-zoom a {
      background-color: #ffffff !important;
      color: #334155 !important;
    }
    .pulse-animation {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `}</style>
);

const defaultCenter: [number, number] = [-6.2100, 106.9000];

const smu1Polygon: [number, number][] = [
  [-6.183, 106.913], [-6.183, 106.917], [-6.187, 106.917], [-6.187, 106.913]
];
const smu2Polygon: [number, number][] = [
  [-6.168, 106.908], [-6.168, 106.912], [-6.172, 106.912], [-6.172, 106.908]
];
const tasPolygon: [number, number][] = [
  [-6.298, 107.148], [-6.298, 107.152], [-6.302, 107.152], [-6.302, 107.148]
];

const supplyRoute: [number, number][] = [
  [-6.185, 106.915], [-6.200, 106.950], [-6.250, 107.050], [-6.300, 107.150]
];

const initialFactoryData = [
  { 
    id: "Plant1", 
    name: "Plant 1 - Liquid", 
    pos: [-6.185, 106.915] as [number, number], 
    color: "#ef4444", 
    status: "CRITICAL", 
    oee: 45.2,
    details: {
      mixers: "2/5 Online",
      palletizer: "Fault - JAKA Zu Err: 0x4A",
      energy: "4.2 MW",
      vision: "YOLOv8 Active (85% Conf)"
    }
  },
  { 
    id: "Plant2", 
    name: "Plant 2 - Powder", 
    pos: [-6.170, 106.910] as [number, number], 
    color: "#10b981", 
    status: "RUNNING", 
    oee: 89.5,
    details: {
      mixers: "8/8 Online",
      palletizer: "Running Normal",
      energy: "7.8 MW",
      vision: "QuadX Area Scan: Clear"
    }
  },
  { 
    id: "Whse", 
    name: "Mega Warehouse", 
    pos: [-6.300, 107.150] as [number, number], 
    color: "#f59e0b", 
    status: "WARNING", 
    oee: 72.1,
    details: {
      mixers: "N/A",
      palletizer: "AGV Traffic Congestion",
      energy: "1.1 MW",
      vision: "Loading Dock Full"
    }
  },
];

const InteractiveMarker = ({ data, mapControl }: { data: any, mapControl: any }) => {
  return (
    <CircleMarker
      center={data.pos}
      pathOptions={{ 
        color: data.color, 
        fillColor: data.color, 
        fillOpacity: data.status === "CRITICAL" ? 1 : 0.6,
        weight: data.status === "CRITICAL" ? 4 : 2
      }}
      radius={data.status === "CRITICAL" ? 16 : 12}
      className={data.status === "CRITICAL" ? "pulse-animation" : ""}
      eventHandlers={{
        click: () => {
          mapControl.flyTo(data.pos, 16, { animate: true, duration: 1.2 });
        },
      }}
    >
      <Popup className="custom-popup">
        <div className="flex flex-col bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
          <div className="bg-slate-800 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
            <span className="font-bold text-slate-100 text-sm uppercase tracking-wider">
              {data.name}
            </span>
            <span 
              className="text-xs font-bold px-2 py-1 rounded-md" 
              style={{ backgroundColor: `${data.color}20`, color: data.color, border: `1px solid ${data.color}50` }}
            >
              {data.status}
            </span>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400 text-xs uppercase font-semibold">Live OEE</span>
              <span className="font-mono text-2xl font-bold" style={{ color: data.color }}>
                {data.oee.toFixed(1)}%
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <div className="bg-slate-800/50 p-2 rounded border border-slate-700">
                <span className="block text-[10px] text-slate-500 uppercase">Energy Load</span>
                <span className="block text-xs text-slate-200 font-semibold">{data.details.energy}</span>
              </div>
              <div className="bg-slate-800/50 p-2 rounded border border-slate-700">
                <span className="block text-[10px] text-slate-500 uppercase">Process Mixers</span>
                <span className="block text-xs text-slate-200 font-semibold">{data.details.mixers}</span>
              </div>
              <div className="bg-slate-800/50 p-2 rounded border border-slate-700 col-span-2">
                <span className="block text-[10px] text-slate-500 uppercase">Robotics / Conveyor</span>
                <span className="block text-xs text-slate-200 font-semibold">{data.details.palletizer}</span>
              </div>
              <div className="bg-slate-800/50 p-2 rounded border border-slate-700 col-span-2">
                <span className="block text-[10px] text-slate-500 uppercase">AI Vision Node</span>
                <span className="block text-xs text-slate-200 font-semibold">{data.details.vision}</span>
              </div>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  alert(`Sending Ping to ${data.id}...`);
                }}
                className="flex-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-600/50 text-[11px] font-semibold py-2 rounded transition-all"
              >
                Ping Device
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  mapControl.flyTo(defaultCenter, 10, { animate: true, duration: 1.5 });
                }}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-600 text-[11px] font-semibold py-2 rounded transition-all"
              >
                Reset View
              </button>
            </div>
          </div>
        </div>
      </Popup>
    </CircleMarker>
  );
};

const MapController = ({ factoryData }: { factoryData: any[] }) => {
  const map = useMap();
  
  return (
    <>
      <Polygon positions={smu1Polygon} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.1, weight: 1, dashArray: '4' }} />
      <Polygon positions={smu2Polygon} pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.1, weight: 1, dashArray: '4' }} />
      <Polygon positions={tasPolygon} pathOptions={{ color: '#f59e0b', fillColor: '#f59e0b', fillOpacity: 0.1, weight: 1, dashArray: '4' }} />
      <Polyline positions={supplyRoute} pathOptions={{ color: '#3b82f6', weight: 2, opacity: 0.5, dashArray: '10, 10' }} />
      {factoryData.map((plant) => (
        <InteractiveMarker key={plant.id} data={plant} mapControl={map} />
      ))}
    </>
  );
};

export default function MapLayer() {
  const [factories, setFactories] = useState(initialFactoryData);

  useEffect(() => {
    const interval = setInterval(() => {
      setFactories((prev) => 
        prev.map((factory) => {
          const fluctuation = (Math.random() * 2 - 1);
          let newOee = factory.oee + fluctuation;
          if (newOee > 100) newOee = 100;
          if (newOee < 0) newOee = 0;

          let newStatus = factory.status;
          let newColor = factory.color;
          
          if (factory.id !== "Plant1") { 
            if (newOee >= 85) {
              newStatus = "RUNNING"; newColor = "#10b981";
            } else if (newOee >= 60) {
              newStatus = "WARNING"; newColor = "#f59e0b";
            } else {
              newStatus = "CRITICAL"; newColor = "#ef4444";
            }
          }
          return { ...factory, oee: newOee, status: newStatus, color: newColor };
        })
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden z-0">
      <MapCustomStyles />
      <div className="absolute bottom-6 left-6 z-[400] bg-slate-900/80 backdrop-blur border border-slate-700 px-3 py-2 rounded-lg flex items-center gap-3">
        <div className="flex space-x-1">
          <div className="w-2 h-4 bg-emerald-500 animate-pulse rounded-sm"></div>
          <div className="w-2 h-4 bg-emerald-500 animate-pulse rounded-sm" style={{ animationDelay: '200ms' }}></div>
          <div className="w-2 h-4 bg-emerald-500 animate-pulse rounded-sm" style={{ animationDelay: '400ms' }}></div>
        </div>
        <span className="text-xs text-emerald-400 font-mono tracking-widest uppercase">PostgreSQL Syncing</span>
      </div>

      <MapContainer center={defaultCenter} zoom={11} zoomControl={true} className="w-full h-full">
        {/* Menggunakan peta terang (OpenStreetMap standard) */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapController factoryData={factories} />
      </MapContainer>
    </div>
  );
}