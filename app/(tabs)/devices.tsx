import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';
import { MapPin, Battery, Power, Plus, X, Trash2 } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import AIChatButton from '@/components/AIChatButton';
import { createGuestDemoDevices } from '@/lib/guestDemoData';

interface Device {
  id: string;
  sensor_id: string;
  name: string;
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  battery_level: number;
  is_active: boolean;
}

export default function Devices() {
  const { user, isGuest } = useAuth();
  const { t } = useLanguage();
  const [devices, setDevices] = useState<Device[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deviceToDelete, setDeviceToDelete] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);

  const [newDevice, setNewDevice] = useState({
    sensor_id: '',
    name: '',
    location_name: '',
    latitude: '',
    longitude: '',
  });

  const fetchDevices = async () => {
    if (!user) return;

    if (isGuest) {
      const guestDevices = createGuestDemoDevices(user.id);
      setDevices(guestDevices as any);
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('devices')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setDevices(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDevices();
  }, [user]);

  const handleAddDevice = async () => {
    if (!user || !newDevice.sensor_id || !newDevice.name) return;

    await supabase.from('devices').insert({
      user_id: user.id,
      sensor_id: newDevice.sensor_id,
      name: newDevice.name,
      location_name: newDevice.location_name,
      latitude: newDevice.latitude ? parseFloat(newDevice.latitude) : null,
      longitude: newDevice.longitude ? parseFloat(newDevice.longitude) : null,
    });

    setNewDevice({
      sensor_id: '',
      name: '',
      location_name: '',
      latitude: '',
      longitude: '',
    });
    setModalVisible(false);
    fetchDevices();
  };

  const toggleDeviceStatus = async (deviceId: string, currentStatus: boolean) => {
    await supabase
      .from('devices')
      .update({ is_active: !currentStatus })
      .eq('id', deviceId);
    fetchDevices();
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return '#10b981';
    if (level > 20) return '#f59e0b';
    return '#ef4444';
  };

  const handleDeleteDevice = async () => {
    if (!deviceToDelete) return;

    await supabase
      .from('devices')
      .delete()
      .eq('id', deviceToDelete.id);

    setDeleteModalVisible(false);
    setDeviceToDelete(null);
    fetchDevices();
  };

  const openDeleteModal = (device: Device) => {
    setDeviceToDelete(device);
    setDeleteModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t.devicesTitle}</Text>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>{t.loading}</Text>
        </View>
        <AIChatButton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.devicesTitle}</Text>
        {!isGuest && (
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Plus size={24} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView style={styles.scrollView}>
        {devices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>{t.noDevicesFound}</Text>
            <Text style={styles.emptySubtitle}>{t.addDevice}</Text>
          </View>
        ) : (
          devices.map((device) => (
            <View key={device.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.deviceName}>{device.name}</Text>
                  <Text style={styles.sensorId}>ID: {device.sensor_id}</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    { backgroundColor: device.is_active ? '#10b98120' : '#ef444420' },
                  ]}
                  onPress={() => toggleDeviceStatus(device.id, device.is_active)}
                >
                  <Power
                    size={20}
                    color={device.is_active ? '#10b981' : '#ef4444'}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.infoRow}>
                <MapPin size={18} color="#6b7280" />
                <Text style={styles.infoText}>
                  {device.location_name || 'No location set'}
                </Text>
              </View>

              {device.latitude && device.longitude && (
                <View style={styles.mapPlaceholder}>
                  <Text style={styles.coordinatesText}>
                    {device.latitude.toFixed(6)}, {device.longitude.toFixed(6)}
                  </Text>
                </View>
              )}

              <View style={styles.batteryContainer}>
                <Battery size={18} color={getBatteryColor(device.battery_level)} />
                <View style={styles.batteryBar}>
                  <View
                    style={[
                      styles.batteryFill,
                      {
                        width: `${device.battery_level}%`,
                        backgroundColor: getBatteryColor(device.battery_level),
                      },
                    ]}
                  />
                </View>
                <Text style={styles.batteryText}>{device.battery_level}%</Text>
              </View>

              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => openDeleteModal(device)}
              >
                <Trash2 size={18} color="#ef4444" />
                <Text style={styles.deleteButtonText}>Delete Device</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New Device</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Sensor ID *"
              value={newDevice.sensor_id}
              onChangeText={(text) => setNewDevice({ ...newDevice, sensor_id: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Device Name *"
              value={newDevice.name}
              onChangeText={(text) => setNewDevice({ ...newDevice, name: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Location Name"
              value={newDevice.location_name}
              onChangeText={(text) => setNewDevice({ ...newDevice, location_name: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Latitude"
              value={newDevice.latitude}
              onChangeText={(text) => setNewDevice({ ...newDevice, latitude: text })}
              keyboardType="numeric"
            />

            <TextInput
              style={styles.input}
              placeholder="Longitude"
              value={newDevice.longitude}
              onChangeText={(text) => setNewDevice({ ...newDevice, longitude: text })}
              keyboardType="numeric"
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleAddDevice}>
              <Text style={styles.submitButtonText}>Add Device</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={deleteModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <Text style={styles.deleteModalTitle}>Delete Device</Text>
            <Text style={styles.deleteModalMessage}>
              Are you sure you want to delete this device? All related data will be removed.
            </Text>
            <View style={styles.deleteModalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setDeleteModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmDeleteButton}
                onPress={handleDeleteDevice}
              >
                <Text style={styles.confirmDeleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  addButton: {
    backgroundColor: '#14b8a6',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
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
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  deviceName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  sensorId: {
    fontSize: 14,
    color: '#6b7280',
  },
  statusButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6b7280',
  },
  mapPlaceholder: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  coordinatesText: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  batteryBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  batteryFill: {
    height: '100%',
    borderRadius: 4,
  },
  batteryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    width: 40,
    textAlign: 'right',
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
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  submitButton: {
    backgroundColor: '#14b8a6',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fee2e2',
    backgroundColor: '#fef2f2',
  },
  deleteButtonText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteModalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  deleteModalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  deleteModalMessage: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  deleteModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  confirmDeleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
