import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import AIChatButton from '@/components/AIChatButton';
import { genSeries, genHourlySeries } from '@/utils/timeSeries';
import { createGuestDemoDevices } from '@/lib/guestDemoData';

interface Device {
  id: string;
  name: string;
  sensor_id?: string;
}

interface Reading {
  temperature: number;
  humidity: number;
  timestamp: string;
}

export default function History() {
  const { user, isGuest } = useAuth();
  const { t } = useLanguage();
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'hourly' | 'daily'>('hourly');
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDeviceData, setSelectedDeviceData] = useState<Device | null>(null);

  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    fetchDevices();
  }, [user]);

  useEffect(() => {
    if (selectedDevice) {
      const device = devices.find((d) => d.id === selectedDevice);
      if (device) {
        setSelectedDeviceData(device);
      }
      fetchReadings();
    }
  }, [selectedDevice, timeRange]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDevices();
    await fetchReadings();
    setRefreshing(false);
  };

  const fetchDevices = async () => {
    if (!user) return;

    if (isGuest) {
      const guestDevices = createGuestDemoDevices(user.id);
      const devicesData = guestDevices.map((d) => ({ id: d.id, name: d.name, sensor_id: d.sensor_id }));
      setDevices(devicesData);
      setSelectedDevice(devicesData[0].id);
      setSelectedDeviceData(devicesData[0]);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('devices')
      .select('id, name, sensor_id')
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (data && data.length > 0) {
      setDevices(data);
      setSelectedDevice(data[0].id);
      setSelectedDeviceData(data[0]);
    }
    setLoading(false);
  };

  const fetchReadings = async () => {
    if (!selectedDevice || !selectedDeviceData) return;

    const device = devices.find((d) => d.id === selectedDevice);
    if (!device) return;

    const isOffice =
      device.sensor_id?.includes('001') || device.name.toLowerCase().includes('office');
    const baseTemp = isOffice ? 22 : 18;
    const baseHum = isOffice ? 45 : 55;

    let finalSeries;

    if (timeRange === 'hourly') {
      finalSeries = genHourlySeries({
        hours: 24,
        baseTemp,
        tempRange: 5,
        baseHum,
        humRange: 12,
        deviceId: device.sensor_id || device.id,
      });
    } else {
      finalSeries = genSeries({
        days: 30,
        baseTemp,
        tempRange: 5,
        baseHum,
        humRange: 12,
        trend: 0.02,
        deviceId: device.sensor_id || device.id,
      });
    }

    const readingsData: Reading[] = finalSeries.labels.map((label, index) => ({
      temperature: finalSeries.temps[index],
      humidity: finalSeries.hums[index],
      timestamp: new Date().toISOString(),
    }));

    setReadings(readingsData);
  };

  /** 这里是修改重点：对 labels 做稀疏处理 + 用更小的点 */
  const getChartData = (type: 'temperature' | 'humidity') => {
    if (readings.length === 0) {
      return {
        labels: [''],
        datasets: [{ data: [0] }],
      };
    }

    if (!selectedDeviceData) {
      return {
        labels: [''],
        datasets: [{ data: [0] }],
      };
    }

    const device = devices.find((d) => d.id === selectedDevice);
    if (!device) {
      return {
        labels: [''],
        datasets: [{ data: [0] }],
      };
    }

    const isOffice =
      device.sensor_id?.includes('001') || device.name.toLowerCase().includes('office');
    const baseTemp = isOffice ? 22 : 18;
    const baseHum = isOffice ? 45 : 55;

    let finalSeries;

    if (timeRange === 'hourly') {
      finalSeries = genHourlySeries({
        hours: 24,
        baseTemp,
        tempRange: 5,
        baseHum,
        humRange: 12,
        deviceId: device.sensor_id || device.id,
      });
    } else {
      finalSeries = genSeries({
        days: 30,
        baseTemp,
        tempRange: 5,
        baseHum,
        humRange: 12,
        trend: 0.02,
        deviceId: device.sensor_id || device.id,
      });
    }

    if (finalSeries.labels.length < 2) {
      return {
        labels: [''],
        datasets: [{ data: [0] }],
      };
    }

    // === 对 X 轴标签做稀疏处理 ===
    let labels = finalSeries.labels;

    if (timeRange === 'hourly') {
      // 24 小时：每 2 小时显示一个标签
      labels = labels.map((label, index) => {
        if (index % 2 === 0) {
          // 例如 "01:00" -> "01"
          return label.slice(0, 2);
        }
        return '';
      });
    } else {
      // 30 天：每 3 天显示一个标签（可按需调）
      labels = labels.map((label, index) => (index % 3 === 0 ? label : ''));
    }

    return {
      labels,
      datasets: [
        {
          data: type === 'temperature' ? finalSeries.temps : finalSeries.hums,
        },
      ],
    };
  };

  const getTimeRangeLabel = () => {
    if (timeRange === 'hourly') return t.last24Hours;
    return t.last30Days;
  };

  const getCurrentDeviceName = () => {
    const device = devices.find((d) => d.id === selectedDevice);
    return device ? device.name : 'Unknown Device';
  };

  const getChartConfig = (type: 'temperature' | 'humidity') => ({
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: type === 'temperature' ? 1 : 0,
    color: (opacity = 1) => {
      const baseColor =
        type === 'temperature' ? 'rgba(20, 184, 166, ' : 'rgba(59, 130, 246, ';
      return baseColor + opacity + ')';
    },
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4', // 原来是 6，现在改小
      strokeWidth: '2',
      stroke: type === 'temperature' ? '#14b8a6' : '#3b82f6',
    },
    fillShadowGradient: type === 'temperature' ? '#14b8a6' : '#3b82f6',
    fillShadowGradientOpacity: 0.15,
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#e5e7eb',
      strokeWidth: 1,
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t.historyTitle}</Text>
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
          <Text style={styles.headerTitle}>{t.historyTitle}</Text>
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
        <Text style={styles.headerTitle}>{t.historyTitle}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.deviceSelector}>
          {devices.map((device) => (
            <TouchableOpacity
              key={device.id}
              style={[
                styles.deviceTab,
                selectedDevice === device.id && styles.deviceTabActive,
              ]}
              onPress={() => setSelectedDevice(device.id)}
            >
              <Text
                style={[
                  styles.deviceTabText,
                  selectedDevice === device.id && styles.deviceTabTextActive,
                ]}
              >
                {device.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.timeRangeSelector}>
          {(['hourly', 'daily'] as const).map((range) => (
            <TouchableOpacity
              key={range}
              style={[styles.rangeButton, timeRange === range && styles.rangeButtonActive]}
              onPress={() => setTimeRange(range)}
            >
              <Text
                style={[
                  styles.rangeButtonText,
                  timeRange === range && styles.rangeButtonTextActive,
                ]}
              >
                {range === 'hourly' ? t.hourly : t.daily}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {readings.length === 0 || getChartData('temperature').labels[0] === '' ? (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>{t.noDataAvailable}</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>{t.statistics}</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>{t.avgTemperature}</Text>
                  <Text style={styles.statValue}>
                    {(
                      readings.reduce((sum, r) => sum + r.temperature, 0) / readings.length
                    ).toFixed(1)}
                    °C
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>{t.avgHumidity}</Text>
                  <Text style={styles.statValue}>
                    {(
                      readings.reduce((sum, r) => sum + r.humidity, 0) / readings.length
                    ).toFixed(1)}
                    %
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>{t.maxTemperature}</Text>
                  <Text style={styles.statValue}>
                    {Math.max(...readings.map((r) => r.temperature)).toFixed(1)}°C
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>{t.minTemperature}</Text>
                  <Text style={styles.statValue}>
                    {Math.min(...readings.map((r) => r.temperature)).toFixed(1)}°C
                  </Text>
                </View>
              </View>
            </View>

            {/* 温度趋势 */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>{t.temperatureTrend}</Text>
                <Text style={styles.chartSubtitle}>
                  {getTimeRangeLabel()} · {getCurrentDeviceName()}
                </Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <LineChart
                  data={getChartData('temperature')}
                  width={Math.max(
                    screenWidth - 64,
                    getChartData('temperature').labels.length * 40,
                  )}
                  height={240}
                  chartConfig={getChartConfig('temperature')}
                  bezier
                  style={styles.chart}
                  withInnerLines={true}
                  withOuterLines={true}
                  withVerticalLines={false}
                  withHorizontalLines={true}
                  withDots={true}
                  withShadow={false}
                  fromZero={true}
                  segments={6}
                  yAxisSuffix="°C"
                  yAxisInterval={1}
                  horizontalLabelRotation={-45}
                />
              </ScrollView>
            </View>

            {/* 湿度趋势 */}
            <View style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>{t.humidityTrend}</Text>
                <Text style={styles.chartSubtitle}>
                  {getTimeRangeLabel()} · {getCurrentDeviceName()}
                </Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <LineChart
                  data={getChartData('humidity')}
                  width={Math.max(
                    screenWidth - 64,
                    getChartData('humidity').labels.length * 40,
                  )}
                  height={240}
                  chartConfig={getChartConfig('humidity')}
                  bezier
                  style={styles.chart}
                  withInnerLines={true}
                  withOuterLines={true}
                  withVerticalLines={false}
                  withHorizontalLines={true}
                  withDots={true}
                  withShadow={false}
                  fromZero={true}
                  segments={5}
                  yAxisSuffix="%"
                  yAxisInterval={1}
                  horizontalLabelRotation={-45}
                />
              </ScrollView>
            </View>
          </>
        )}
      </ScrollView>

      <AIChatButton />
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
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#14b8a6',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  deviceSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  deviceTab: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  deviceTabActive: {
    backgroundColor: '#14b8a6',
    borderColor: '#14b8a6',
  },
  deviceTabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  deviceTabTextActive: {
    color: '#fff',
  },
  timeRangeSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  rangeButtonActive: {
    backgroundColor: '#14b8a6',
  },
  rangeButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  rangeButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  chartHeader: {
    width: '100%',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '400',
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  statsCard: {
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
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#14b8a6',
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
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    backgroundColor: '#fff',
    borderRadius: 16,
  },
  noDataText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
});
 