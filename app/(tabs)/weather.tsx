import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Home, Calendar, Lightbulb } from 'lucide-react-native';
import { mockWeatherProvider } from '@/lib/weatherProvider';
import { getWeatherIcon } from '@/lib/weatherIcons';
import { generateRecommendations } from '@/lib/recommendations';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import AIChatButton from '@/components/AIChatButton';
import { createGuestDemoDevices, getGuestDeviceReading } from '@/lib/guestDemoData';

const PRIMARY_GREEN = '#10B981';
const INDOOR_TEMP_COLOR = '#10B981';
const OUTDOOR_TEMP_COLOR = '#0EA5E9';
const HIGH_TEMP_COLOR = '#F97316';
const LOW_TEMP_COLOR = '#4F46E5';
const TEXT_DARK = '#111827';
const TEXT_MUTED = '#6B7280';
const PM25_NORMAL = '#111827';
const PM25_MODERATE = '#FACC15';
const PM25_HIGH = '#EF4444';

interface IndoorData {
  temp: number;
  humidity: number;
  pm25?: number;
  deviceName?: string;
}

export default function Weather() {
  const { user, isGuest } = useAuth();
  const { t } = useLanguage();
  const [useMockData, setUseMockData] = useState(true);
  const [outdoorWeather, setOutdoorWeather] = useState(mockWeatherProvider.getWeatherNow());
  const [forecast, setForecast] = useState(mockWeatherProvider.getForecast());
  const [indoorData, setIndoorData] = useState<IndoorData | null>(null);

  useEffect(() => {
    fetchIndoorData();
  }, [user]);

  useEffect(() => {
    if (!useMockData) return;

    const interval = setInterval(() => {
      setOutdoorWeather(mockWeatherProvider.getWeatherNow(true));
    }, 12000);

    return () => clearInterval(interval);
  }, [useMockData]);

  const fetchIndoorData = async () => {
    if (!user) return;

    if (isGuest) {
      const guestDevices = createGuestDemoDevices(user.id);
      if (guestDevices.length > 0) {
        const device = guestDevices[0];
        const reading = getGuestDeviceReading(device);
        setIndoorData({
          temp: reading.temperature,
          humidity: reading.humidity,
          pm25: undefined,
          deviceName: device.name,
        });
      }
      return;
    }

    const { data: devices } = await supabase
      .from('devices')
      .select('id, name')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1);

    if (!devices || devices.length === 0) {
      setIndoorData(null);
      return;
    }

    const device = devices[0];

    const { data: reading } = await supabase
      .from('sensor_readings')
      .select('temperature, humidity')
      .eq('device_id', device.id)
      .order('timestamp', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (reading) {
      setIndoorData({
        temp: reading.temperature,
        humidity: reading.humidity,
        pm25: undefined,
        deviceName: device.name,
      });
    }
  };

  const recommendations = generateRecommendations(indoorData, outdoorWeather);

  const getPM25Color = (pm25: number): string => {
    if (pm25 <= 35) return PM25_NORMAL;
    if (pm25 <= 75) return PM25_MODERATE;
    return PM25_HIGH;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.weatherTitle} · Taicang</Text>
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setUseMockData(!useMockData)}
        >
          <Text style={styles.toggleText}>{useMockData ? 'Mock ON' : 'Mock OFF'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {!useMockData ? (
          <View style={styles.card}>
            <Text style={styles.placeholderText}>Real API not enabled</Text>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t.currentWeather}</Text>
              <View style={styles.row}>
                <View style={[styles.card, styles.halfCard]}>
                  <View style={styles.cardHeader}>
                    <Home size={20} color="#14b8a6" />
                    <Text style={styles.cardTitle}>Indoor</Text>
                  </View>
                  {indoorData ? (
                    <>
                      <Text style={[styles.mainValue, { color: INDOOR_TEMP_COLOR }]}>
                        {indoorData.temp.toFixed(1)}°C
                      </Text>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>{t.humidity}</Text>
                        <Text style={styles.detailValue}>{indoorData.humidity}%</Text>
                      </View>
                      {indoorData.pm25 !== undefined && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>PM2.5</Text>
                          <Text style={[styles.detailValue, { color: getPM25Color(indoorData.pm25) }]}>
                            {indoorData.pm25}
                          </Text>
                          <Text style={styles.detailLabel}> µg/m³</Text>
                        </View>
                      )}
                      <Text style={styles.timestamp}>{indoorData.deviceName}</Text>
                    </>
                  ) : (
                    <Text style={styles.noDataText}>No device data</Text>
                  )}
                </View>

                <View style={[styles.card, styles.halfCard]}>
                  <View style={styles.cardHeader}>
                    {(() => {
                      const { Icon, color } = getWeatherIcon(outdoorWeather.condition);
                      return <Icon size={20} color={color} />;
                    })()}
                    <Text style={styles.cardTitle}>Outdoor</Text>
                  </View>
                  <Text style={[styles.mainValue, { color: OUTDOOR_TEMP_COLOR }]}>
                    {outdoorWeather.temp.toFixed(1)}°C
                  </Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>{t.humidity}</Text>
                    <Text style={styles.detailValue}>{outdoorWeather.humidity}%</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>PM2.5</Text>
                    <Text style={[styles.detailValue, { color: getPM25Color(outdoorWeather.pm25) }]}>
                      {outdoorWeather.pm25}
                    </Text>
                    <Text style={styles.detailLabel}> µg/m³</Text>
                  </View>
                  <Text style={styles.conditionText}>
                    {outdoorWeather.condition.charAt(0).toUpperCase() +
                      outdoorWeather.condition.slice(1).replace('_', ' ')}
                  </Text>
                  <Text style={styles.timestamp}>
                    Updated {formatTime(outdoorWeather.timestamp)}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Calendar size={20} color="#14b8a6" />
                <Text style={styles.sectionTitle}>{t.forecast}</Text>
              </View>
              {forecast.map((day, index) => {
                const { Icon, color } = getWeatherIcon(day.condition);
                return (
                  <View key={index} style={styles.forecastCard}>
                    <View style={styles.forecastLeft}>
                      <Icon size={22} color={color} />
                      <View style={styles.forecastDate}>
                        <Text style={styles.forecastDateText}>{formatDate(day.date)}</Text>
                        <Text style={styles.forecastCondition}>
                          {day.condition.charAt(0).toUpperCase() +
                            day.condition.slice(1).replace('_', ' ')}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.forecastRight}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text style={[styles.forecastTemp, { color: HIGH_TEMP_COLOR }]}>
                          {day.tempHigh}°
                        </Text>
                        <Text style={[styles.forecastTemp, { color: TEXT_MUTED }]}>/</Text>
                        <Text style={[styles.forecastTemp, { color: LOW_TEMP_COLOR }]}>
                          {day.tempLow}°
                        </Text>
                      </View>
                      <Text style={styles.forecastDetail}>
                        Hum: {day.humidity}% · PM2.5:{' '}
                        <Text style={{ color: getPM25Color(day.pm25) }}>{day.pm25}</Text>
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Lightbulb size={20} color="#14b8a6" />
                <Text style={styles.sectionTitle}>Recommendations</Text>
              </View>
              <View style={styles.card}>
                {recommendations.map((rec, index) => (
                  <View key={index} style={styles.recommendationItem}>
                    <View style={styles.bullet} />
                    <View style={styles.recommendationContent}>
                      <Text style={styles.recommendationCategory}>{rec.category}</Text>
                      <Text style={styles.recommendationText}>{rec.text}</Text>
                    </View>
                  </View>
                ))}
              </View>
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
  toggleButton: {
    backgroundColor: '#14b8a6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  toggleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  halfCard: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  mainValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#14b8a6',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_DARK,
  },
  conditionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#14b8a6',
    marginTop: 6,
  },
  timestamp: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
  },
  noDataText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    paddingVertical: 20,
  },
  placeholderText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 40,
  },
  forecastCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  forecastLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  forecastDate: {
    gap: 2,
  },
  forecastDateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  forecastCondition: {
    fontSize: 13,
    color: '#6b7280',
  },
  forecastRight: {
    alignItems: 'flex-end',
    gap: 2,
  },
  forecastTemp: {
    fontSize: 18,
    fontWeight: '700',
  },
  forecastDetail: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#14b8a6',
    marginTop: 6,
    marginRight: 12,
  },
  recommendationContent: {
    flex: 1,
    gap: 2,
  },
  recommendationCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  recommendationText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});
