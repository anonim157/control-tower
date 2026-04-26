"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  Card, Grid, Title, Text, Flex, Badge, Metric, Button, TabGroup, TabList, Tab,
  AreaChart, BarList, DonutChart, Table, TableHead, TableRow, TableHeaderCell, 
  TableBody, TableCell, Icon, TextInput, ProgressBar
} from "@tremor/react";
import { 
  MapIcon, ChartBarIcon, CpuChipIcon, ExclamationTriangleIcon, 
  MagnifyingGlassIcon, BoltIcon, ShieldCheckIcon, BeakerIcon, 
  AdjustmentsHorizontalIcon, BellIcon, ClipboardDocumentListIcon, LightBulbIcon
} from "@heroicons/react/24/outline";

// --- Service & Store Integration ---
import { useScadaStore } from "../store/useScadaStore";
import { initMQTT, disconnectMQTT } from "../lib/mqttClient";
import { DATABASE } from "../lib/mockData";

// Lazy Load Map
const MapLayer = dynamic(() => import("./components/MapLayer"), { 
  ssr: false,
  loading: () => <div className="h-[600px] w-full bg-slate-900/50 animate-pulse rounded-xl border border-slate-800" />
});

export default function CentralControlTower() {
  const [view, setView] = useState<"global" | "plant" | "machine">("global");
  const [activePlantId, setActivePlantId] = useState<string | null>(null);
  const [activeMachineId, setActiveMachineId] = useState<string | null>(null);
  const [showAlarmModal, setShowAlarmModal] = useState(false);

  const { machines: liveMachines, globalMetrics } = useScadaStore();

  useEffect(() => {
    initMQTT();
    return () => disconnectMQTT();
  }, []);

  const handleSelectPlant = (id: string) => { setActivePlantId(id); setView("plant"); };
  const handleSelectMachine = (id: string) => { setActiveMachineId(id); setView("machine"); };
  const resetToGlobal = () => { setView("global"); setActivePlantId(null); setActiveMachineId(null); };

  return (
    <div className="min-h-screen bg-[#020617] p-6 md:p-10 text-slate-100 font-sans selection:bg-indigo-500/30">
      
      {/* SECTION 1: HEADER */}
      <header className="mb-10 flex flex-col xl:flex-row justify-between items-start xl:items-center border-b border-slate-800 pb-10 gap-8">
        <Flex justifyContent="start" className="space-x-6">
           <div className="relative group flex-shrink-0">
              <div className="absolute inset-0 bg-amber-500 rounded-full blur-3xl opacity-5 group-hover:opacity-15 transition-opacity"></div>
              <Image src="/logo-digibot.png" alt="Logo" width={80} height={80} className="relative z-10 p-2 bg-black rounded-2xl border border-slate-800 shadow-2xl" />
           </div>
           <div>
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-500 to-emerald-400">
                  Control Tower Terpusat
                </h1>
                <Badge size="md" color="indigo" className="rounded-full px-4 py-1">Enterprise AI v2.5</Badge>
              </div>
              <Flex className="space-x-4">
                <Text className="text-slate-400 font-semibold tracking-tight">Digitalization System by Dicky Ardiansyah</Text>
                <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <Text className="text-[10px] text-emerald-500 font-mono font-bold uppercase tracking-widest">Global Node Sync: Active</Text>
                </div>
              </Flex>
           </div>
        </Flex>

        <Grid numItems={1} numItemsSm={3} className="gap-6 w-full xl:w-auto">
          <TopHeaderStat label="Avg OEE Overall" value={`${globalMetrics.avgOee.toFixed(1)}%`} icon={ChartBarIcon} color="blue" />
          <TopHeaderStat label="Critical Alarms" value={globalMetrics.totalActiveAlarms.toString()} icon={ExclamationTriangleIcon} color="red" />
          <TopHeaderStat label="Total Energy" value={`${globalMetrics.totalPower} kW`} icon={BoltIcon} color="amber" />
        </Grid>
      </header>

      {/* SECTION 2: NAVIGATION */}
      <div className="flex flex-col lg:flex-row justify-between items-center mb-10 gap-6">
        <TabGroup index={view === "global" ? 0 : view === "plant" ? 1 : 2} className="w-full lg:w-auto">
          <TabList variant="solid" className="bg-slate-900 border-slate-800 p-1 rounded-2xl">
            <Tab icon={MapIcon} onClick={resetToGlobal}>Visualisasi Geo-Spasial</Tab>
            <Tab icon={ChartBarIcon} disabled={!activePlantId} onClick={() => setView("plant")}>Analitik Pabrik</Tab>
            <Tab icon={CpuChipIcon} disabled={!activeMachineId}>Live Telemetri SCADA</Tab>
          </TabList>
        </TabGroup>
        
        <div className="flex items-center gap-4 w-full lg:w-auto">
           <TextInput icon={MagnifyingGlassIcon} placeholder="Cari Asset / Lini Mesin..." className="md:w-72" />
           <Button variant="secondary" icon={BellIcon} onClick={() => setShowAlarmModal(!showAlarmModal)} className="bg-slate-900 border-slate-800 text-slate-300">
              Log Alarm ({globalMetrics.totalActiveAlarms})
           </Button>
        </div>
      </div>

      {/* SECTION 3: CONTENT */}
      <div className="space-y-12 min-h-[800px]">
        {view === "global" && (
          <Layer1Global plants={Object.values(DATABASE)} onSelect={handleSelectPlant} />
        )}

        {view === "plant" && activePlantId && (
          <Layer2Plant 
            plant={DATABASE[activePlantId]} 
            liveData={liveMachines}
            onSelectMachine={handleSelectMachine}
            onBack={resetToGlobal}
          />
        )}

        {view === "machine" && activeMachineId && (
          <Layer3Machine 
            machine={liveMachines[activeMachineId]} 
            onBack={() => setView("plant")}
          />
        )}
      </div>

      {/* SECTION 4: FOOTER */}
      <footer className="mt-24 border-t border-slate-900 pt-10 flex flex-col md:flex-row justify-between items-center text-slate-600 gap-6">
        <div className="flex items-center gap-3">
          <ShieldCheckIcon className="w-6 h-6 text-emerald-600" />
          <Text className="text-xs uppercase tracking-widest font-bold">Encrypted Industrial Network • Dicky Ardiansyah Architecture</Text>
        </div>
        <div className="flex gap-8 text-[10px] font-mono opacity-50 uppercase tracking-tighter">
          <span>Server: Vercel Production</span>
          <span>Protocol: MQTT v5.0</span>
          <span>Build: 2026-04-26-PROD</span>
        </div>
      </footer>
    </div>
  );
}

// LAYER 1
function Layer1Global({ plants, onSelect }: any) {
  return (
    <div className="animate-in fade-in zoom-in-[0.98] duration-700">
      <Grid numItemsLg={3} className="gap-8">
        <div className="col-span-2 space-y-8">
          <Card className="bg-slate-900/40 border-slate-800 p-0 overflow-hidden shadow-2xl rounded-3xl">
            <MapLayer plants={plants} onSelectPlant={onSelect} />
          </Card>
          
          <Card className="bg-slate-900/40 border-slate-800 rounded-3xl">
            <div className="flex justify-between items-center mb-8 px-2">
              <Title className="text-white text-xl flex items-center gap-3">
                <ClipboardDocumentListIcon className="w-6 h-6 text-blue-500" />
                Matriks Performa Antar-Fasilitas
              </Title>
              <Badge color="emerald">Update Real-time</Badge>
            </div>
            <Table>
              <TableHead>
                <TableRow className="border-b border-slate-800/50">
                  <TableHeaderCell className="text-slate-500 uppercase text-[10px] font-black tracking-widest">Fasilitas Pabrik</TableHeaderCell>
                  <TableHeaderCell className="text-slate-500 uppercase text-[10px] font-black tracking-widest">Lokasi Geografis</TableHeaderCell>
                  <TableHeaderCell className="text-slate-500 uppercase text-[10px] font-black tracking-widest text-center">OEE Aktual</TableHeaderCell>
                  <TableHeaderCell className="text-slate-500 uppercase text-[10px] font-black tracking-widest">Status Kesehatan</TableHeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {plants.map((p: any) => (
                  <TableRow key={p.id} className="hover:bg-slate-800/30 transition-all cursor-pointer">
                    <TableCell className="text-white font-bold py-6 text-lg">{p.name}</TableCell>
                    <TableCell className="text-slate-400 font-medium">{p.location}</TableCell>
                    <TableCell className="text-center">
                       <div className="flex flex-col items-center gap-2">
                         <span className="text-emerald-400 font-black text-xl">{p.overallOEE}%</span>
                         <ProgressBar value={p.overallOEE} color="emerald" className="w-24 h-1.5" />
                       </div>
                    </TableCell>
                    <TableCell>
                      {/* FIX: Variant dihapus */}
                      <Badge color={p.status === "critical" ? "red" : p.status === "warning" ? "yellow" : "emerald"} className="px-4 py-1 font-bold">
                        {p.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>

        <aside className="space-y-8">
          <Card className="bg-slate-900/40 border-slate-800 rounded-3xl">
            <Title className="text-white mb-6 font-black text-center uppercase tracking-widest">Kontribusi Efisiensi</Title>
            <DonutChart
              className="mt-8 h-80"
              data={plants.map((p: any) => ({ name: p.name, value: p.overallOEE }))}
              category="value"
              index="name"
              colors={["blue", "indigo", "emerald", "amber", "rose"]}
              variant="donut"
            />
          </Card>

          <Card className="bg-slate-900/40 border-slate-800 rounded-3xl">
            <Title className="text-white mb-6 flex items-center gap-3">
               <BellIcon className="w-6 h-6 text-red-500" />
               Log Alarm Kritis (FIFO)
            </Title>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((_, i) => (
                <div key={i} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl border-l-4 border-l-red-600 group hover:border-red-500/50 transition-all">
                  <Flex className="mb-1">
                    <Text className="text-white text-xs font-black">HIGH VIBRATION DETECTED</Text>
                    <Text className="text-[9px] text-slate-500">2m ago</Text>
                  </Flex>
                  <Text className="text-[10px] text-slate-500 uppercase font-mono tracking-tighter">Node: SMG-L1 • SEMARANG SITE</Text>
                </div>
              ))}
            </div>
            <Button variant="light" color="blue" size="xs" className="mt-6 w-full uppercase tracking-widest text-[10px] font-bold">Lihat Semua History →</Button>
          </Card>
        </aside>
      </Grid>
    </div>
  );
}

// LAYER 2
function Layer2Plant({ plant, liveData, onSelectMachine, onBack }: any) {
  return (
    <div className="animate-in fade-in slide-in-from-right-12 duration-700 space-y-10">
      <Flex justifyContent="between">
         <Button variant="secondary" onClick={onBack} size="xs" className="bg-slate-900 border-slate-800 text-slate-400">← Kembali ke Peta Global</Button>
         <Badge color="indigo" className="font-mono px-4 py-1">ENCRYPTION: AES-256-BIT</Badge>
      </Flex>

      <Grid numItemsLg={4} className="gap-8">
        <Card className="bg-slate-900/40 border-slate-800 col-span-3 rounded-3xl">
          <Flex justifyContent="between" className="mb-12">
            <div>
              <Title className="text-white text-4xl font-black">{plant.name}</Title>
              <Text className="text-slate-500 font-bold mt-1 tracking-tight">Manajemen Lini & Telemetri Asset Digital</Text>
            </div>
            <div className="text-right">
               <Text className="text-slate-500 text-[10px] uppercase font-black tracking-[0.2em] mb-1">Site Performance</Text>
               <Metric className="text-emerald-400 font-black">{plant.overallOEE}%</Metric>
            </div>
          </Flex>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {plant.machines.map((m: any) => {
              const live = liveData[m.id];
              return (
                <div key={m.id} onClick={() => onSelectMachine(m.id)} className="group p-8 bg-slate-950 border border-slate-800 rounded-[2.5rem] hover:border-indigo-500 transition-all cursor-pointer relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-indigo-500/15 transition-all" />
                  <Flex justifyContent="between" alignItems="start">
                    <div>
                      <Badge size="xs" color="indigo" className="mb-4 font-mono font-bold tracking-tighter uppercase px-3">{m.id}</Badge>
                      <Title className="text-white text-2xl group-hover:text-indigo-400 transition-colors leading-tight font-black">{m.name}</Title>
                    </div>
                    <div className="text-right">
                      <Metric className="text-white text-3xl font-black">{live?.telemetry?.suhu || m.telemetry?.suhu || '--'}°</Metric>
                      <Text className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">Thermal</Text>
                    </div>
                  </Flex>
                  <div className="mt-10 pt-8 border-t border-slate-900 flex justify-between items-center">
                    <Badge color={live?.status === 'critical' ? 'red' : 'emerald'} className="font-black px-4">
                      {live?.status?.toUpperCase() || 'ONLINE'}
                    </Badge>
                    <Text className="text-indigo-400 font-black text-xl tracking-tighter">OEE {m.oee}%</Text>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <aside className="space-y-8">
          <Card className="bg-slate-900/40 border-slate-800 rounded-3xl">
            <Title className="text-white mb-8 font-black flex items-center gap-3">
              <BeakerIcon className="w-6 h-6 text-rose-500" />
              Loss Pareto Analysis
            </Title>
            <BarList 
              data={[
                { name: "Unplanned Shutdown", value: 140 },
                { name: "Adjustment/Setup", value: 65 },
                { name: "Speed Variance", value: 45 },
                { name: "Process Failure", value: 20 },
              ]} 
              color="rose"
              valueFormatter={(v: number) => `${v}m`}
              className="mt-2"
            />
          </Card>
          
          <Card className="bg-slate-900/40 border-slate-800 rounded-3xl">
            <Title className="text-white mb-6 flex items-center gap-3">
               <LightBulbIcon className="w-6 h-6 text-amber-500" />
               Predictive Insights
            </Title>
            <div className="space-y-6">
               <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/20">
                  <Text className="text-amber-500 font-black text-xs mb-1">MAINTENANCE DUE</Text>
                  <Text className="text-[11px] text-slate-400 leading-relaxed">Filter oli pada unit SMG-L1 diprediksi mencapai batas jenuh dalam 14 jam operasional.</Text>
               </div>
               <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/20">
                  <Text className="text-emerald-500 font-black text-xs mb-1">OPTIMIZATION TIP</Text>
                  <Text className="text-[11px] text-slate-400 leading-relaxed">Penyesuaian speed motor 2% dapat menghemat daya sebesar 450W tanpa mengurangi output.</Text>
               </div>
            </div>
          </Card>
        </aside>
      </Grid>
    </div>
  );
}

// LAYER 3
function Layer3Machine({ machine, onBack }: any) {
  const [localHistory, setLocalHistory] = useState<any[]>([]);

  useEffect(() => {
    if (machine) {
      setLocalHistory(prev => [
        ...prev.slice(-34), 
        { 
          time: new Date().toLocaleTimeString(), 
          Suhu: machine.telemetry.suhu, 
          RPM: machine.telemetry.rpm,
          Energy: machine.telemetry.energy 
        }
      ]);
    }
  }, [machine]);

  if (!machine) return (
     <div className="flex flex-col items-center justify-center min-h-[600px] space-y-6">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <Text className="text-slate-500 font-mono tracking-widest animate-pulse uppercase">Syncing High-Frequency Data...</Text>
     </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-12 duration-700 space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-end mb-10 gap-8">
        <div>
          <Button variant="secondary" size="xs" onClick={onBack} className="mb-8 bg-slate-900 border-slate-800 text-slate-400">← Back to Production Line</Button>
          <div className="flex items-center gap-8">
            <Metric className="text-white text-7xl font-black tracking-tighter leading-none">{machine.name}</Metric>
            <Badge color={machine.status === 'critical' ? 'red' : 'emerald'} size="xl" className="py-3 px-8 font-black text-lg">
              {machine.status.toUpperCase()}
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <Text className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] mb-2">Network Node IP: 192.168.1.45</Text>
          <Title className="text-indigo-400 font-mono text-5xl font-black">{machine.id}</Title>
        </div>
      </header>

      <Grid numItemsLg={3} className="gap-10">
        <Card className="bg-slate-900/40 border-slate-800 col-span-2 rounded-[3rem] p-10 shadow-2xl">
          <Flex className="mb-8">
            <Title className="text-white text-xl font-black tracking-widest uppercase">Live Thermal Profile Stream</Title>
            <Badge color="orange" className="px-4 py-1">Sensor: Optic-S101</Badge>
          </Flex>
          <AreaChart
            className="h-[500px] mt-10"
            data={localHistory}
            index="time"
            categories={["Suhu"]}
            colors={["orange"]}
            showAnimation={false}
            showGridLines={true}
            valueFormatter={(v) => `${v.toFixed(1)}°C`}
            yAxisWidth={55}
          />
        </Card>

        <div className="space-y-10">
          <Card className="bg-slate-900/40 border-slate-800 flex flex-col items-center justify-center py-20 rounded-[3rem] relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent blur-3xl rounded-full animate-pulse group-hover:from-amber-500/10 transition-all" />
            <Icon icon={BoltIcon} size="xl" color="amber" variant="light" className="mb-8 animate-pulse" />
            <Text className="text-slate-500 uppercase text-xs font-black tracking-[0.4em] mb-4">Actual Rotational Speed</Text>
            <Metric className="text-white text-8xl font-black my-4 tracking-tighter">{machine.telemetry.rpm}</Metric>
            <Text className="text-slate-500 font-mono text-sm uppercase tracking-widest font-bold">RPM • Sub-System 01</Text>
          </Card>

          <Card className="bg-slate-900/40 border-slate-800 rounded-[3rem] p-10">
            <Title className="text-white mb-10 font-black flex items-center gap-4 text-xl">
               <AdjustmentsHorizontalIcon className="w-8 h-8 text-indigo-500" />
               Critical Component Health
            </Title>
            <div className="space-y-10">
              <HealthProgress label="Friction Index" value={92} color="emerald" />
              <HealthProgress label="Oil Pressure Level" value={78} color="amber" />
              <HealthProgress label="Phase Integrity" value={99} color="blue" />
              <HealthProgress label="Vibration Frequency" value={85} color="emerald" />
            </div>
          </Card>
        </div>
      </Grid>
    </div>
  );
}

// ATOMIC UI
function TopHeaderStat({ label, value, icon, color }: any) {
  return (
    <Card className={`bg-slate-900/40 border-slate-800 p-6 rounded-2xl shadow-2xl`}>
      <Flex justifyContent="start" className="space-x-5">
        <Icon icon={icon} color={color} variant="light" size="md" className="p-3" />
        <div>
          <Text className="text-[11px] text-slate-500 font-black uppercase tracking-[0.2em] mb-2">{label}</Text>
          <Text className={`text-3xl font-mono font-black text-${color}-400 tracking-tighter leading-none`}>
            {value}
          </Text>
        </div>
      </Flex>
    </Card>
  );
}

function HealthProgress({ label, value, color }: { label: string, value: number, color: any }) {
  return (
    <div className="space-y-4">
      <Flex>
        <Text className="text-[11px] text-slate-400 uppercase font-black tracking-[0.2em]">{label}</Text>
        <Text className={`text-sm text-${color}-400 font-black`}>{value}%</Text>
      </Flex>
      <ProgressBar value={value} color={color} className="h-2.5 rounded-full" />
    </div>
  );
}