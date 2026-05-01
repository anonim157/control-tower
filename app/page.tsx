"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { 
  Card, Text, Metric, Flex, BadgeDelta, Tracker, 
  CategoryBar, BarList, AreaChart, Table, 
  TableHead, TableHeaderCell, TableBody, TableRow, TableCell, Badge
} from "@tremor/react";

// Import peta tanpa SSR
const MapLayer = dynamic(() => import("./components/MapLayer"), { ssr: false });

// ==========================================
// DATA DUMMY EKSTENSIF UNTUK MENGISI DASHBOARD
// ==========================================

const uptimeHistory = [
  { color: "emerald", tooltip: "00:00 - Normal" }, { color: "emerald", tooltip: "01:00 - Normal" }, 
  { color: "emerald", tooltip: "02:00 - Normal" }, { color: "emerald", tooltip: "03:00 - Normal" }, 
  { color: "emerald", tooltip: "04:00 - Normal" }, { color: "emerald", tooltip: "05:00 - Normal" }, 
  { color: "rose", tooltip: "06:00 - Motor Trip" }, { color: "rose", tooltip: "07:00 - Repair" }, 
  { color: "amber", tooltip: "08:00 - Setup" }, { color: "emerald", tooltip: "09:00 - Normal" }, 
  { color: "emerald", tooltip: "10:00 - Normal" }, { color: "emerald", tooltip: "11:00 - Normal" },
  { color: "emerald", tooltip: "12:00 - Normal" }, { color: "emerald", tooltip: "13:00 - Normal" }, 
  { color: "amber", tooltip: "14:00 - Material Shortage" }, { color: "emerald", tooltip: "15:00 - Normal" },
  { color: "emerald", tooltip: "16:00 - Normal" }, { color: "emerald", tooltip: "17:00 - Normal" },
];

const batchProductionData = [
  { name: "Liquid Detergent - Line A", value: 8540 },
  { name: "Fabric Softener - Line B", value: 6500 },
  { name: "Dishwashing Liquid - Line C", value: 4300 },
  { name: "Powder Base - Line D", value: 3120 },
  { name: "Packaging Unit - Auto Batching", value: 2900 },
];

const oeeTrendData = [
  { time: "08:00", SMU1: 45, SMU2: 88, TAS: 70 },
  { time: "09:00", SMU1: 48, SMU2: 89, TAS: 71 },
  { time: "10:00", SMU1: 30, SMU2: 90, TAS: 75 },
  { time: "11:00", SMU1: 25, SMU2: 87, TAS: 74 },
  { time: "12:00", SMU1: 40, SMU2: 85, TAS: 72 },
  { time: "13:00", SMU1: 45, SMU2: 89, TAS: 68 },
  { time: "14:00", SMU1: 45, SMU2: 91, TAS: 70 },
  { time: "15:00", SMU1: 47, SMU2: 90, TAS: 72 },
];

const alarmLogs = [
  { id: "ALM-001", time: "15:42:11", plant: "SMU 1", machine: "Mixer Tank 3", type: "High Temp", status: "Active", severity: "Critical" },
  { id: "ALM-002", time: "15:30:05", plant: "SMU 2", machine: "JAKA Zu Palletizer", type: "Payload Warning", status: "Ack", severity: "Warning" },
  { id: "ALM-003", time: "14:15:22", plant: "TAS", machine: "Conveyor Belt B", type: "Vibration High", status: "Resolved", severity: "Info" },
  { id: "ALM-004", time: "13:05:10", plant: "SMU 1", machine: "Node-RED Gateway", type: "Comm Loss", status: "Resolved", severity: "Critical" },
  { id: "ALM-005", time: "11:50:00", plant: "SMU 2", machine: "YOLOv8 Vision", type: "Low Light Conf", status: "Ack", severity: "Warning" },
  { id: "ALM-006", time: "10:20:44", plant: "SMU 1", machine: "Pneumatic Valve 2", type: "Air Leak", status: "Active", severity: "Critical" },
];

// ==========================================
// KOMPONEN UTAMA DASHBOARD
// ==========================================
export default function Home() {
  const [currentTime, setCurrentTime] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  // Jam Digital Real-time di Header
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour12: false }) + " WIB");
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="relative h-screen w-full overflow-hidden bg-[#020617] font-sans selection:bg-emerald-500/30 text-slate-200">
      
      {/* ==========================================
          LAYER 1: BACKGROUND PETA (Z-INDEX 0)
          ========================================== */}
      <div className="absolute inset-0 z-0">
        <MapLayer />
        {/* Shadow Overlay untuk transisi halus antara UI dan Peta */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/80 to-transparent pointer-events-none z-0 w-1/2" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent pointer-events-none z-0 h-full" />
      </div>

      {/* ==========================================
          LAYER 2: FOREGROUND UI (Z-INDEX 10)
          ========================================== */}
      <div className="relative z-10 pointer-events-none h-full flex flex-col justify-between">
        
        {/* --- HEADER NAVBAR --- */}
        <div className="pointer-events-auto w-full px-6 py-4 flex justify-between items-start lg:items-center bg-slate-900/60 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl">
          <div className="flex flex-col">
            <Text className="text-emerald-500 font-bold tracking-[0.2em] text-[10px] uppercase">
              Sayap Mas Utama • Manufacture Digitalization
            </Text>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1 flex items-center gap-3">
              Geospatial Control Tower
              <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded border border-slate-700 font-mono font-normal">
                v2.4.1
              </span>
            </h1>
          </div>

          <div className="flex gap-6 items-center">
            {/* Tab Navigasi */}
            <div className="hidden lg:flex bg-slate-950/50 p-1 rounded-lg border border-slate-800">
              <button 
                onClick={() => setActiveTab("overview")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'overview' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Plant Overview
              </button>
              <button 
                onClick={() => setActiveTab("telemetry")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'telemetry' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Live Telemetry
              </button>
              <button 
                onClick={() => setActiveTab("ai")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'ai' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
              >
                AI & Vision
              </button>
            </div>

            {/* Indikator Sistem */}
            <div className="flex flex-col items-end border-l border-slate-700 pl-6">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <Text className="text-emerald-400 text-xs font-bold uppercase tracking-wider">System Online</Text>
              </div>
              <Text className="text-slate-400 font-mono text-sm mt-1">{currentTime || "Loading..."}</Text>
            </div>
          </div>
        </div>

        {/* --- MAIN CONTENT AREA (Kiri dan Bawah) --- */}
        <div className="flex-1 p-6 flex flex-col gap-6 justify-between overflow-hidden">
          
          {/* PANEL KIRI (SIDEBAR ANALITIK) */}
          <div className="pointer-events-auto w-full md:w-[420px] flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-hide max-h-[calc(100vh-280px)]">
            
            {/* KPI CARD: OVERALL OEE */}
            <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700/50 ring-1 ring-white/5 shadow-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <Text className="text-slate-400 uppercase text-[10px] font-bold tracking-widest">Enterprise OEE Average</Text>
                  <Flex className="mt-1 items-baseline gap-2">
                    <Metric className="text-white text-5xl font-black">78.4%</Metric>
                    <BadgeDelta deltaType="moderateIncrease" size="xs">+2.1%</BadgeDelta>
                  </Flex>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <Text className="text-slate-500 text-[10px] uppercase text-center mb-1">Target</Text>
                  <Text className="text-emerald-500 font-mono text-sm">85.0%</Text>
                </div>
              </div>
              
              <Text className="text-slate-500 text-xs mt-6 mb-2 flex justify-between">
                <span>Availability: 82%</span>
                <span>Performance: 98%</span>
                <span>Quality: 99.5%</span>
              </Text>
              <CategoryBar
                values={[40, 30, 15, 15]}
                colors={["rose", "orange", "yellow", "emerald"]}
                markerValue={78.4}
                className="mt-2"
                showLabels={false}
              />
            </Card>

            {/* KPI CARD: HISTORIS TREND */}
            <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700/50 ring-1 ring-white/5 shadow-2xl">
              <Text className="text-slate-400 uppercase text-[10px] font-bold tracking-widest mb-4">OEE Trend Analysis (Real-time)</Text>
              <AreaChart
                className="h-40 mt-4"
                data={oeeTrendData}
                index="time"
                categories={["SMU1", "SMU2", "TAS"]}
                colors={["rose", "emerald", "amber"]}
                valueFormatter={(number: number) => `${number}%`}
                showLegend={false}
                showGridLines={false}
                showYAxis={false}
              />
            </Card>

            {/* KPI CARD: PRODUCTION BATCH */}
            <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700/50 ring-1 ring-white/5 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <Text className="text-slate-400 uppercase text-[10px] font-bold tracking-widest">Live Batch Output (Kg)</Text>
                <Badge color="blue" size="xs">Shift 1</Badge>
              </div>
              <BarList 
                data={batchProductionData} 
                className="mt-2 text-slate-300 font-mono text-xs" 
                color="blue" 
                valueFormatter={(number: number) => Intl.NumberFormat("id").format(number).toString()}
              />
            </Card>

            {/* KPI CARD: MACHINE UPTIME TRACKER */}
            <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-700/50 ring-1 ring-white/5 shadow-2xl mb-4">
              <Text className="text-slate-400 uppercase text-[10px] font-bold tracking-widest mb-3">Critical Asset Uptime (24h)</Text>
              <Text className="text-white text-sm mb-1">Main Liquid Mixer - Plant 1</Text>
              <Tracker data={uptimeHistory} className="mt-2 w-full" />
            </Card>
          </div>

          {/* PANEL BAWAH (LOG ALARM TABLE) */}
          <div className="pointer-events-auto w-full max-h-[220px]">
            <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-700 ring-1 ring-white/5 shadow-2xl h-full flex flex-col p-0 overflow-hidden">
              <div className="px-6 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-950/50">
                <Text className="text-slate-300 font-bold uppercase tracking-wider text-xs">Centralized Alarm Log (FIFO)</Text>
                <button className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1 rounded border border-slate-600 transition-colors">
                  Export to CSV
                </button>
              </div>
              <div className="overflow-y-auto scrollbar-hide px-6 py-2 flex-1">
                <Table className="mt-2 text-xs">
                  <TableHead>
                    <TableRow className="border-slate-800 text-slate-500">
                      <TableHeaderCell className="font-semibold uppercase tracking-wider text-[10px]">Time</TableHeaderCell>
                      <TableHeaderCell className="font-semibold uppercase tracking-wider text-[10px]">Plant</TableHeaderCell>
                      <TableHeaderCell className="font-semibold uppercase tracking-wider text-[10px]">Asset Node</TableHeaderCell>
                      <TableHeaderCell className="font-semibold uppercase tracking-wider text-[10px]">Alarm Type</TableHeaderCell>
                      <TableHeaderCell className="font-semibold uppercase tracking-wider text-[10px] text-right">Status</TableHeaderCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {alarmLogs.map((item) => (
                      <TableRow key={item.id} className="border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                        <TableCell className="text-slate-400 font-mono">{item.time}</TableCell>
                        <TableCell className="text-slate-300 font-semibold">{item.plant}</TableCell>
                        <TableCell className="text-slate-300">{item.machine}</TableCell>
                        <TableCell>
                           <span className={`${item.severity === 'Critical' ? 'text-rose-400' : item.severity === 'Warning' ? 'text-amber-400' : 'text-blue-400'}`}>
                              {item.type}
                           </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge 
                            color={item.status === "Active" ? "rose" : item.status === "Ack" ? "amber" : "emerald"} 
                            size="xs"
                          >
                            {item.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>

        </div>
      </div>
    </main>
  );
}