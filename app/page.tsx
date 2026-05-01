"use client";
import dynamic from "next/dynamic";
import { Card, Text, Metric, Flex, BadgeDelta, Grid } from "@tremor/react";

// Peta dirender secara dinamis untuk menghindari SSR error di Next.js
const MapLayer = dynamic(() => import("./components/MapLayer"), {
  ssr: false,
});

export default function Home() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-slate-950">
      
      {/* LAYER 1: Peta Full Screen Background */}
      <div className="absolute inset-0 z-0">
        <MapLayer />
      </div>

      {/* LAYER 2: Panel Dashboard Melayang */}
      {/* pointer-events-none memastikan area transparan tetap bisa menembus klik ke peta */}
      <div className="relative z-10 p-6 pointer-events-none h-full flex flex-col justify-between">
        
        {/* Konten Atas: Header & Panel OEE */}
        <div className="pointer-events-auto w-full md:w-1/3">
          
          <Card className="bg-slate-900/85 backdrop-blur-md border-slate-800 mb-4 shadow-2xl ring-1 ring-white/10">
            <Text className="text-slate-400 font-medium tracking-widest uppercase text-xs">
              Manufacture Digitalization
            </Text>
            <Metric className="text-white mt-1">Control Tower</Metric>
          </Card>

          <Grid numItemsSm={2} className="gap-4">
            <Card className="bg-slate-900/85 backdrop-blur-md border-slate-800 ring-1 ring-white/10">
              <Text className="text-slate-400">Avg OEE Overall</Text>
              <Flex className="mt-2">
                <Metric className="text-white">78.4%</Metric>
                <BadgeDelta deltaType="moderateIncrease">+2.1%</BadgeDelta>
              </Flex>
            </Card>
            <Card className="bg-slate-900/85 backdrop-blur-md border-red-900/30 ring-1 ring-red-500/20">
              <Text className="text-red-400">Critical Alarms</Text>
              <Metric className="text-red-500">1 Active</Metric>
            </Card>
          </Grid>
        </div>

      </div>
    </main>
  );
}