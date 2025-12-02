import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Pressable,
} from 'react-native';
import { X, Thermometer, Droplets, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import { useLanguage } from '@/contexts/LanguageContext';
import { getSuggestions, SensorType } from '@/utils/suggestions';
import { generateMiniTrend } from '@/utils/miniTrend';

interface SensorDetailSheetProps {
  visible: boolean;
  onClose: () => void;
  sensorId: string;
  sensorName: string;
  temperature: number;
  humidity: number;
  status: 'optimal' | 'warning' | 'critical';
  lastUpdated: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SensorDetailSheet({
  visible,
  onClose,
  sensorId,
  sensorName,
  temperature,
  humidity,
  status,
  lastUpdated,
}: SensorDetailSheetProps) {
  const { language } = useLanguage();

  const sensorType: SensorType = sensorName.toLowerCase().includes('outdoor') ? 'outdoor' : 'indoor';

  const trendData = useMemo(() => generateMiniTrend(temperature, humidity), [temperature, humidity]);

  const suggestions = useMemo(
    () => getSuggestions(temperature, humidity, sensorType),
    [temperature, humidity, sensorType]
  );

  const getStatusConfig = () => {
    switch (status) {
      case 'optimal':
        return {
          color: '#10b981',
          icon: CheckCircle,
          label: language === 'zh' ? '最佳' : 'Optimal',
        };
      case 'warning':
        return {
          color: '#f59e0b',
          icon: AlertTriangle,
          label: language === 'zh' ? '警告' : 'Warning',
        };
      case 'critical':
        return {
          color: '#ef4444',
          icon: AlertCircle,
          label: language === 'zh' ? '严重' : 'Critical',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  const getStatusExplanation = () => {
    if (language === 'zh') {
      return {
        optimal: {
          title: '最佳',
          description: '温度和湿度在舒适范围内（约 20–26°C 和 40–60% 相对湿度）。无需立即采取行动。',
        },
        warning: {
          title: '警告',
          description:
            '一个或多个值略微超出理想范围。您可能感到太热、太冷、太干燥或太潮湿。建议采取简单措施，如开窗或调节空调/加湿器。',
        },
        critical: {
          title: '严重',
          description:
            '数值远离推荐范围。长时间暴露可能导致不适或潜在健康问题。请尽快调整环境。',
        },
      };
    }

    return {
      optimal: {
        title: 'Optimal',
        description:
          'Temperature and humidity are within a comfortable range (approx. 20–26°C and 40–60% RH). No immediate action is needed.',
      },
      warning: {
        title: 'Warning',
        description:
          'One or more values are slightly outside the ideal range. You may feel too warm, too cold, too dry or too humid. Simple actions like opening a window or adjusting AC/humidifier are recommended.',
      },
      critical: {
        title: 'Critical',
        description:
          'Values are far from the recommended range. Long exposure may cause discomfort or potential health issues. Try to adjust the environment as soon as possible.',
      },
    };
  };

  const statusExplanations = getStatusExplanation();

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheetContainer} onPress={(e) => e.stopPropagation()}>
          <View style={styles.dragHandle} />

          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View>
                <Text style={styles.headerTitle}>{sensorName}</Text>
                <Text style={styles.headerSubtitle}>
                  {language === 'zh' ? '详细视图' : 'Detailed view'}
                </Text>
              </View>
            </View>
            <View style={styles.headerRight}>
              <View style={[styles.statusChip, { backgroundColor: statusConfig.color + '20' }]}>
                <StatusIcon size={16} color={statusConfig.color} />
                <Text style={[styles.statusChipText, { color: statusConfig.color }]}>
                  {statusConfig.label}
                </Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.currentReadingsBlock}>
              <View style={styles.readingCardLarge}>
                <View style={styles.readingIconLarge}>
                  <Thermometer size={40} color="#14b8a6" />
                </View>
                <View style={styles.readingContent}>
                  <Text style={styles.readingLabelLarge}>
                    {language === 'zh' ? '温度' : 'Temperature'}
                  </Text>
                  <Text style={styles.readingValueLarge}>{temperature.toFixed(1)}°C</Text>
                </View>
              </View>

              <View style={styles.readingCardLarge}>
                <View style={styles.readingIconLarge}>
                  <Droplets size={40} color="#3b82f6" />
                </View>
                <View style={styles.readingContent}>
                  <Text style={styles.readingLabelLarge}>
                    {language === 'zh' ? '湿度' : 'Humidity'}
                  </Text>
                  <Text style={styles.readingValueLarge}>{humidity.toFixed(1)}%</Text>
                </View>
              </View>
            </View>

            <Text style={styles.lastUpdatedText}>
              {language === 'zh' ? '最后更新：' : 'Last updated: '}
              {new Date(lastUpdated).toLocaleString()}
            </Text>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {language === 'zh' ? '过去 1 小时趋势' : 'Last 1 hour trend'}
              </Text>
              <View style={styles.chartCard}>
                <LineChart
                  data={{
                    labels: trendData.map((p) => p.time),
                    datasets: [
                      {
                        data: trendData.map((p) => p.temperature),
                        color: () => '#14b8a6',
                        strokeWidth: 2,
                      },
                    ],
                  }}
                  width={SCREEN_WIDTH - 64}
                  height={180}
                  chartConfig={{
                    backgroundColor: '#fff',
                    backgroundGradientFrom: '#fff',
                    backgroundGradientTo: '#fff',
                    decimalPlaces: 1,
                    color: () => '#14b8a6',
                    labelColor: () => '#6b7280',
                    style: {
                      borderRadius: 16,
                    },
                    propsForDots: {
                      r: '4',
                      strokeWidth: '2',
                      stroke: '#14b8a6',
                    },
                  }}
                  bezier
                  style={styles.chart}
                />
                <Text style={styles.chartLabel}>
                  {language === 'zh' ? '温度 (°C)' : 'Temperature (°C)'}
                </Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {language === 'zh' ? '状态说明' : 'Status Explanation'}
              </Text>
              <View style={styles.explanationCard}>
                {Object.entries(statusExplanations).map(([key, value]) => (
                  <View
                    key={key}
                    style={[
                      styles.explanationItem,
                      key === status && styles.explanationItemActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.explanationTitle,
                        key === status && styles.explanationTitleActive,
                      ]}
                    >
                      {value.title}
                    </Text>
                    <Text
                      style={[
                        styles.explanationDescription,
                        key === status && styles.explanationDescriptionActive,
                      ]}
                    >
                      {value.description}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {language === 'zh' ? '为您推荐' : 'Suggestions for you'}
              </Text>
              <View style={styles.suggestionsContainer}>
                {suggestions.map((suggestion, index) => (
                  <View key={index} style={styles.suggestionCard}>
                    <View style={styles.suggestionBullet} />
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 12,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#d1d5db',
    borderRadius: 999,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  currentReadingsBlock: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  readingCardLarge: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  readingIconLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  readingContent: {
    alignItems: 'center',
  },
  readingLabelLarge: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  readingValueLarge: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1f2937',
  },
  lastUpdatedText: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  chartLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  explanationCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  explanationItem: {
    opacity: 0.6,
  },
  explanationItemActive: {
    opacity: 1,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6,
  },
  explanationTitleActive: {
    color: '#14b8a6',
  },
  explanationDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  explanationDescriptionActive: {
    color: '#1f2937',
  },
  suggestionsContainer: {
    gap: 12,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f0fdfa',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#14b8a6',
  },
  suggestionBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#14b8a6',
    marginTop: 6,
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 40,
  },
});
