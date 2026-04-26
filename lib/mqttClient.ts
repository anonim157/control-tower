import mqtt from 'mqtt';
import { useScadaStore } from '../store/useScadaStore';

let client: mqtt.MqttClient | null = null;

export const initMQTT = () => {
  if (client?.connected) return;

  const options = {
    keepalive: 60,
    clientId: `tower_dicky_${Math.random().toString(16).slice(2, 8)}`,
    clean: true,
    reconnectPeriod: 5000, // Reconnect setiap 5 detik jika putus
    connectTimeout: 30 * 1000,
  };

  client = mqtt.connect('wss://broker.emqx.io:8084/mqtt', options);

  client.on('connect', () => {
    console.log("%c[MQTT] System Connected", "color: #10b981; font-weight: bold");
    client?.subscribe('vokasi/undip/pabrik/+/telemetry');
  });

  client.on('message', (topic, message) => {
    try {
      const payload = JSON.parse(message.toString());
      const machineId = topic.split('/')[3];
      
      // Mengirim data ke Zustand Store
      useScadaStore.getState().ingestMqttData(machineId, payload);
    } catch (e) {
      console.error("[MQTT] Payload Error", e);
    }
  });

  client.on('close', () => console.log("[MQTT] Connection Closed"));
};

export const disconnectMQTT = () => {
  if (client) {
    client.end();
    client = null;
    console.log("[MQTT] Disconnected manually");
  }
};