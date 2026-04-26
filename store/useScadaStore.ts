import { create } from 'zustand';

export type MachineStatus = "normal" | "warning" | "critical" | "offline";

export interface Machine {
  id: string;
  name: string;
  oee: number;
  status: MachineStatus;
  telemetry: {
    suhu: number;
    rpm: number;
    vibration: number;
    energy: number;
    lastUpdated: number;
  };
  history: { time: string; value: number }[];
}

interface ScadaState {
  machines: Record<string, Machine>;
  globalMetrics: {
    avgOee: number;
    totalActiveAlarms: number;
    totalPower: number;
  };
  
  // Actions
  ingestMqttData: (machineId: string, payload: any) => void;
  calculateGlobalMetrics: () => void;
}

export const useScadaStore = create<ScadaState>((set, get) => ({
  machines: {},
  globalMetrics: { avgOee: 0, totalActiveAlarms: 0, totalPower: 0 },

  ingestMqttData: (machineId, payload) => {
    set((state) => {
      const currentMachine = state.machines[machineId];
      if (!currentMachine) return state;

      const newHistory = [
        ...currentMachine.history.slice(-19),
        { time: new Date().toLocaleTimeString(), value: payload.temp }
      ];

      return {
        machines: {
          ...state.machines,
          [machineId]: {
            ...currentMachine,
            status: payload.temp > 90 ? "critical" : payload.temp > 75 ? "warning" : "normal",
            telemetry: {
              ...currentMachine.telemetry,
              suhu: payload.temp,
              rpm: payload.speed,
              energy: payload.power,
              lastUpdated: Date.now(),
            },
            history: newHistory
          }
        }
      };
    });
    get().calculateGlobalMetrics();
  },

  calculateGlobalMetrics: () => {
    const machines = Object.values(get().machines);
    const avgOee = machines.reduce((acc, m) => acc + m.oee, 0) / (machines.length || 1);
    const totalAlarms = machines.filter(m => m.status === 'critical').length;
    const totalPower = machines.reduce((acc, m) => acc + m.telemetry.energy, 0);

    set({ globalMetrics: { avgOee, totalActiveAlarms: totalAlarms, totalPower } });
  }
}));