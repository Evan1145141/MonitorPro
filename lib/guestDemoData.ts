import { getTodayData } from '@/utils/timeSeries';

export interface GuestDevice {
  id: string;
  sensor_id: string;
  name: string;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  battery_level: number;
  is_active: boolean;
  user_id: string;
}

export interface GuestReading {
  device_id: string;
  temperature: number;
  humidity: number;
  timestamp: string;
}

export function createGuestDemoDevices(userId: string): GuestDevice[] {
  return [
    {
      id: `guest_device_001_${Date.now()}`,
      sensor_id: 'DEMO-001',
      name: 'Office Sensor',
      location_name: 'XJTLU-TC-C4019',
      latitude: null,
      longitude: null,
      battery_level: 85,
      is_active: true,
      user_id: userId,
    },
    {
      id: `guest_device_002_${Date.now()}`,
      sensor_id: 'DEMO-002',
      name: 'Outdoor Sensor',
      location_name: 'Campus Entrance',
      latitude: null,
      longitude: null,
      battery_level: 92,
      is_active: true,
      user_id: userId,
    },
  ];
}

export function getGuestDeviceReading(device: GuestDevice): GuestReading {
  const isOffice = device.sensor_id.includes('001') || device.name.toLowerCase().includes('office');
  const baseTemp = isOffice ? 22 : 18;
  const baseHum = isOffice ? 45 : 55;

  const todayData = getTodayData(device.sensor_id, baseTemp, baseHum);

  return {
    device_id: device.id,
    temperature: todayData.temp,
    humidity: todayData.hum,
    timestamp: todayData.timestamp,
  };
}
