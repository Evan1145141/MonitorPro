import { supabase } from './supabase';

export async function createDemoDevicesForUser(userId: string) {
  try {
    const { data: existingDevices } = await supabase
      .from('devices')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (existingDevices && existingDevices.length > 0) {
      return;
    }

    const demoDevices = [
      {
        user_id: userId,
        sensor_id: 'DEMO-001',
        name: 'Office Sensor',
        location_name: 'XJTLU-TC-C4019',
        latitude: null,
        longitude: null,
        battery_level: 85,
        is_active: true,
      },
      {
        user_id: userId,
        sensor_id: 'DEMO-002',
        name: 'Outdoor Sensor',
        location_name: 'Campus Entrance',
        latitude: null,
        longitude: null,
        battery_level: 92,
        is_active: true,
      },
    ];

    const { data: insertedDevices, error: deviceError } = await supabase
      .from('devices')
      .insert(demoDevices)
      .select();

    if (deviceError || !insertedDevices) {
      console.error('Error creating demo devices:', deviceError);
      return;
    }

    const now = new Date();
    const readings = [];

    for (const device of insertedDevices) {
      const isOffice = device.sensor_id === 'DEMO-001';

      for (let day = 10; day >= 0; day--) {
        for (let hour = 0; hour < 24; hour += 2) {
          const timestamp = new Date(now);
          timestamp.setDate(timestamp.getDate() - day);
          timestamp.setHours(hour, 0, 0, 0);

          const baseTemp = isOffice ? 22 : 20;
          const tempVariation = isOffice ? 3 : 8;
          const temperature = baseTemp + (Math.random() * tempVariation - tempVariation / 2);

          const baseHumidity = isOffice ? 45 : 55;
          const humidityVariation = isOffice ? 15 : 25;
          const humidity = baseHumidity + (Math.random() * humidityVariation - humidityVariation / 2);

          readings.push({
            device_id: device.id,
            temperature: Math.round(temperature * 10) / 10,
            humidity: Math.round(humidity * 10) / 10,
            timestamp: timestamp.toISOString(),
          });
        }
      }
    }

    const { error: readingsError } = await supabase
      .from('sensor_readings')
      .insert(readings);

    if (readingsError) {
      console.error('Error creating demo readings:', readingsError);
    }

    console.log('Demo data created successfully');
  } catch (error) {
    console.error('Error in createDemoDevicesForUser:', error);
  }
}
