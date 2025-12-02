import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Thermometer, Droplets, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import AIChatButton from '@/components/AIChatButton';
import SensorDetailSheet from '@/components/SensorDetailSheet';
import { getTodayData, needsRegeneration } from '@/utils/timeSeries';
import { createGuestDemoDevices } from '@/lib/guestDemoData';

interface Device {
  id: string;
  name: string;
  sensor_id: string;
}

interface LatestReading {
  temperature: number;
  humidity: number;
  timestamp: string;
}

export default function Dashboard() {
  const { user, isGuest } = useAuth();
  const { t } = useLanguage();
  const [devices, setDevices] = useState<Device[]>([]);
  const [readings, setReadings] = useState<Record<string, LatestReading>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<{
    id: string;
    name: string;
    sensor_id: string;
    temperature: number;
    humidity: number;
    status: 'optimal' | 'warning' | 'critical';
    timestamp: string;
  } | null>(null);

  const fetchDevices = async () => {
    if (!user) return;

    if (isGuest) {
      const guestDevices = createGuestDemoDevices(user.id);
      setDevices(guestDevices as any);
      fetchLatestReadings(guestDevices as any);
      return;
    }

    const { data } = await supabase
      .from('devices')
      .select('id, name, sensor_id')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (data) {
      setDevices(data);
      fetchLatestReadings(data);
    }
  };

  const fetchLatestReadings = async (deviceList: Device[]) => {
    const readingsMap: Record<string, LatestReading> = {};

    for (const device of deviceList) {
      const isOffice = device.sensor_id.includes('001') || device.name.toLowerCase().includes('office');
      const baseTemp = isOffice ? 22 : 18;
      const baseHum = isOffice ? 45 : 55;

      const todayData = getTodayData(device.sensor_id, baseTemp, baseHum);
      readingsMap[device.id] = {
        temperature: todayData.temp,
        humidity: todayData.hum,
        timestamp: todayData.timestamp,
      };
    }

    setReadings(readingsMap);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDevices();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchDevices();
  }, [user]);

  const getStatus = (temp: number, humidity: number) => {
    if (temp < 18 || temp > 26 || humidity < 30 || humidity > 60) {
      return { label: t.warning, color: '#f59e0b', icon: AlertTriangle, status: 'warning' as const };
    }
    return { label: t.optimal, color: '#10b981', icon: CheckCircle, status: 'optimal' as const };
  };

  const handleCardPress = (device: Device, reading: LatestReading) => {
    const status = getStatus(reading.temperature, reading.humidity);
    setSelectedDevice({
      id: device.id,
      name: device.name,
      sensor_id: device.sensor_id,
      temperature: reading.temperature,
      humidity: reading.humidity,
      status: status.status,
      timestamp: reading.timestamp,
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t.dashboardTitle}</Text>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>{t.loading}</Text>
        </View>
        <AIChatButton />
      </View>
    );
  }

  if (devices.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t.dashboardTitle}</Text>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.emptyTitle}>{t.noDevicesFound}</Text>
          <Text style={styles.emptySubtitle}>{t.addDevice}</Text>
        </View>
        <AIChatButton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.dashboardTitle}</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
          <RefreshCw size={24} color="#14b8a6" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {devices.map((device) => {
          const reading = readings[device.id];
          if (!reading) return null;

          const status = getStatus(reading.temperature, reading.humidity);
          const StatusIcon = status.icon;

          return (
            <TouchableOpacity
              key={device.id}
              style={styles.card}
              onPress={() => handleCardPress(device, reading)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.deviceName}>{device.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: status.color + '20' }]}>
                  <StatusIcon size={16} color={status.color} />
                  <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
                </View>
              </View>

              <View style={styles.readingsContainer}>
                <View style={styles.readingCard}>
                  <View style={styles.readingIconContainer}>
                    <Thermometer size={32} color="#14b8a6" />
                  </View>
                  <View style={styles.readingInfo}>
                    <Text style={styles.readingLabel}>{t.temperature}</Text>
                    <Text style={styles.readingValue}>{reading.temperature.toFixed(1)}°C</Text>
                  </View>
                </View>

                <View style={styles.readingCard}>
                  <View style={styles.readingIconContainer}>
                    <Droplets size={32} color="#3b82f6" />
                  </View>
                  <View style={styles.readingInfo}>
                    <Text style={styles.readingLabel}>{t.humidity}</Text>
                    <Text style={styles.readingValue}>{reading.humidity.toFixed(1)}%</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.timestamp}>
                {t.lastUpdated}: {new Date(reading.timestamp).toLocaleString()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <AIChatButton />

      {selectedDevice && (
        <SensorDetailSheet
          visible={true}
          onClose={() => setSelectedDevice(null)}
          sensorId={selectedDevice.sensor_id}
          sensorName={selectedDevice.name}
          temperature={selectedDevice.temperature}
          humidity={selectedDevice.humidity}
          status={selectedDevice.status}
          lastUpdated={selectedDevice.timestamp}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 30,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#14b8a6',
  },
  refreshButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  deviceName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  readingsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  readingCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  readingIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  readingInfo: {
    flex: 1,
  },
  readingLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  readingValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
});
