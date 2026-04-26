// lib/mockData.ts

export type Status = "normal" | "warning" | "critical";

export interface Machine {
  id: string;
  name: string;
  oee: number;
  status: Status;
}

export interface Plant {
  id: string;
  name: string;
  location: string;
  coordinates: [number, number];
  overallOEE: number;
  status: Status;
  machines: Machine[];
}

export const DATABASE: Record<string, Plant> = {
  JKT: {
    id: "JKT",
    name: "Jakarta Assembly Plant",
    location: "Jakarta, DKI Jakarta",
    coordinates: [-6.2088, 106.8456],
    overallOEE: 76,
    status: "warning",
    machines: [
      { id: "JKT-L1", name: "Lini Perakitan Robotic", oee: 65, status: "warning" },
      { id: "JKT-L2", name: "Lini Pengemasan B", oee: 92, status: "normal" },
    ],
  },
  KDS: {
    id: "KDS",
    name: "Kudus Electronics & EV Support",
    location: "Kudus, Jawa Tengah",
    coordinates: [-6.8048, 110.8405],
    overallOEE: 94,
    status: "normal",
    machines: [
      { id: "KDS-L1", name: "EV Controller Assembly", oee: 95, status: "normal" },
      { id: "KDS-L2", name: "IoT Board SMT Line", oee: 93, status: "normal" },
    ],
  },
  SMG: {
    id: "SMG",
    name: "Semarang Integrated Terminal",
    location: "Semarang, Jawa Tengah",
    coordinates: [-6.9666, 110.4166],
    overallOEE: 54,
    status: "critical",
    machines: [
      { id: "SMG-L1", name: "Radar Sensor Network", oee: 45, status: "critical" },
      { id: "SMG-L2", name: "Pump Control System", oee: 89, status: "normal" },
    ],
  },
};