import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MessageCircle, X, Send } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
}

export default function AIChatButton() {
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I can analyze your sensor data and provide recommendations. Ask me anything! I have connected to deepseek v1!',
      isUser: false,
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * 根据需要读取当前用户的传感器数据，生成一个 summary 作为上下文
   */
  const buildDataContext = async (): Promise<string> => {
    // 没登录：不查 supabase，返回一个说明
    if (!user) {
      return 'No user logged in. Provide general temperature and humidity advice only.';
    }

    const { data: devices, error: devicesError } = await supabase
      .from('devices')
      .select('id, name')
      .eq('user_id', user.id);

    if (devicesError) {
      console.warn('Error loading devices:', devicesError);
      return 'Failed to load device data. Provide general suggestions based on typical indoor conditions.';
    }

    if (!devices || devices.length === 0) {
      return 'User currently has no devices configured.';
    }

    const recentReadings: {
      deviceName: string;
      readings: { temperature: number; humidity: number; timestamp: string }[];
    }[] = [];

    for (const device of devices) {
      const { data, error } = await supabase
        .from('sensor_readings')
        .select('temperature, humidity, timestamp')
        .eq('device_id', device.id)
        .order('timestamp', { ascending: false })
        .limit(24); // 最近 24 条

      if (!error && data && data.length > 0) {
        recentReadings.push({
          deviceName: device.name,
          readings: data as any,
        });
      }
    }

    if (recentReadings.length === 0) {
      return 'Devices exist but no recent sensor readings are available.';
    }

    // 做一个简单的 summary，给大模型用
    const summary = recentReadings
      .map((device) => {
        const avgTemp =
          device.readings.reduce((sum, r) => sum + (r.temperature || 0), 0) /
          device.readings.length;
        const avgHumidity =
          device.readings.reduce((sum, r) => sum + (r.humidity || 0), 0) /
          device.readings.length;

        const latest = device.readings[0];
        return `${device.deviceName}: latest ${latest.temperature?.toFixed?.(1) ?? 'N/A'}°C, ${
          latest.humidity?.toFixed?.(1) ?? 'N/A'
        }% RH; avg ${avgTemp.toFixed(1)}°C, ${avgHumidity.toFixed(1)}% RH over last ${
          device.readings.length
        } samples`;
      })
      .join(' | ');

    return summary;
  };

  /**
   * 调用 DeepSeek 接口，让它根据用户问题 + 传感器 summary 给建议
   */
  const analyzeData = async (userMessage: string): Promise<string> => {
    const dataContext = await buildDataContext();
    const apiKey = process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY;

    // 没配置 key 的兜底逻辑：用本地 rule 生成一个模板回答
    if (!apiKey) {
      return (
        `Here is a quick analysis based on your data summary:\n\n` +
        `${dataContext}\n\n` +
        `General recommendations:\n` +
        `• Keep indoor temperature between 18–26°C when possible.\n` +
        `• Maintain humidity roughly in the 30–60% range.\n` +
        `• Avoid large temperature/humidity swings within a short time.\n` +
        `• If any room is far from these ranges, consider ventilation, dehumidifier or AC.\n\n` +
        `Note: DeepSeek API key is not configured. This is a simple rule-based suggestion.`
      );
    }

    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content:
                'You are an environmental monitoring expert. You receive a short summary of sensor readings (temperature and humidity, possibly multiple devices) and a user question. Decide yourself whether the data is relevant; if it is, use it for analysis. Give concrete, concise suggestions.',
            },
            {
              role: 'user',
              content: `User question: ${userMessage}\n\nSensor data summary: ${dataContext}\n\nPlease answer in clear, friendly language.`,
            },
          ],
          max_tokens: 400,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.warn('DeepSeek HTTP error:', response.status, text);
        throw new Error('HTTP error from DeepSeek');
      }

      const json = await response.json();
      if (json.choices && json.choices[0]?.message?.content) {
        return json.choices[0].message.content.trim();
      }

      console.warn('Unexpected DeepSeek response:', json);
    } catch (err) {
      console.error('DeepSeek API error:', err);
      return (
        `I could not reach the AI service just now.\n\n` +
        `Fallback suggestion based on your data summary:\n${dataContext}\n\n` +
        `Try again later or check your network / API key configuration.`
      );
    }

    return 'Sorry, something went wrong when analyzing the data. Please try again in a moment.';
  };

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    const reply = await analyzeData(inputText);

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: reply,
      isUser: false,
    };

    setMessages((prev) => [...prev, aiMsg]);
    setLoading(false);
  };

  return (
    <>
      {/* 右侧半隐藏的 AI 按钮 */}
      <TouchableOpacity
        style={styles.pillButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={['#14b8a6', '#3b82f6', '#8b5cf6']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.pillGradient}
        >
          <MessageCircle size={24} color="#fff" />
          <Text style={styles.pillText}>AI</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* 弹出的对话框 */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.headerLeft}>
                <LinearGradient
                  colors={['#14b8a6', '#3b82f6', '#8b5cf6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.headerIcon}
                >
                  <MessageCircle size={20} color="#fff" />
                </LinearGradient>
                <Text style={styles.modalTitle}>AI Assistant</Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.messagesContainer}>
              {messages.map((m) => (
                <View
                  key={m.id}
                  style={[
                    styles.messageBubble,
                    m.isUser ? styles.userMessage : styles.aiMessage,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      m.isUser ? styles.userMessageText : styles.aiMessageText,
                    ]}
                  >
                    {m.text}
                  </Text>
                </View>
              ))}
              {loading && (
                <View style={[styles.messageBubble, styles.aiMessage]}>
                  <Text style={styles.aiMessageText}>Analyzing...</Text>
                </View>
              )}
            </ScrollView>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Ask about your sensor data..."
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!inputText.trim() || loading) && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={!inputText.trim() || loading}
              >
                <LinearGradient
                  colors={['#14b8a6', '#3b82f6']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.sendButtonGradient}
                >
                  <Send size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pillButton: {
    position: 'absolute',
    right: 0,
    bottom: 100,
    width: 70,
    height: 56,
    borderTopLeftRadius: 28,
    borderBottomLeftRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  pillGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 8,
    gap: 6,
  },
  pillText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  messagesContainer: {
    flex: 1,
    padding: 20,
  },
  messageBubble: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
    maxWidth: '80%',
  },
  userMessage: {
    backgroundColor: '#14b8a6',
    alignSelf: 'flex-end',
  },
  aiMessage: {
    backgroundColor: '#f3f4f6',
    alignSelf: 'flex-start',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: '#fff',
  },
  aiMessageText: {
    color: '#1f2937',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  sendButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
