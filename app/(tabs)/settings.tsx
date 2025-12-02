import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { User, Globe, LogOut, Save, MessageSquare, UserPlus, ChevronRight } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { router } from 'expo-router';
import AIChatButton from '@/components/AIChatButton';

interface Profile {
  full_name: string;
  email: string;
}

export default function Settings() {
  const { user, signOut, isGuest } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState(false);
  const [showToast, setShowToast] = useState<null | { text: string }>(null);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user || isGuest) {
      setProfile({
        full_name: t.guestUser,
        email: t.notRegistered,
      });
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user || isGuest) return;

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: profile.full_name,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    setSaving(false);

    if (error) {
      Alert.alert('Error', 'Failed to update profile');
    } else {
      Alert.alert('Success', 'Profile updated successfully');
    }
  };

  const handleLanguageChange = (newLang: 'en' | 'zh') => {
    setLanguage(newLang);
  };

  const handleLogout = async () => {
    await signOut();
    router.replace('/auth/sign-in');
  };

  const handleSubmitFeedback = async () => {
    if (!user) return;

    if (!feedbackContent.trim()) {
      setFeedbackError(true);
      return;
    }

    setSubmittingFeedback(true);
    const { error } = await supabase.from('feedback').insert({
      user_id: user.id,
      email: feedbackEmail.trim() || profile.email,
      content: feedbackContent.trim(),
    });
    setSubmittingFeedback(false);

    if (error) {
      Alert.alert('Error', 'Failed to submit feedback. Please try again.');
      return;
    }

    setFeedbackEmail('');
    setFeedbackContent('');
    setFeedbackError(false);
    setShowFeedbackModal(false);

    setShowToast({ text: 'Submitted successfully. Thanks! Your feedback has been forwarded to the dev team.' });
    setTimeout(() => setShowToast(null), 3000);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t.settingsTitle}</Text>
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
        <Text style={styles.headerTitle}>{t.settingsTitle}</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {isGuest && (
          <View style={styles.guestBanner}>
            <Text style={styles.guestBannerText}>{t.guestBanner}</Text>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={20} color="#14b8a6" />
            <Text style={styles.sectionTitle}>{t.profile}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>{t.fullName}</Text>
            <TextInput
              style={[styles.input, isGuest && styles.inputDisabled]}
              value={profile.full_name}
              onChangeText={(text) => setProfile({ ...profile, full_name: text })}
              placeholder={t.fullName}
              editable={!isGuest}
            />

            <Text style={styles.label}>{t.email}</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={profile.email}
              editable={false}
            />
            {!isGuest && <Text style={styles.helperText}>{t.emailCannotChange}</Text>}
          </View>
        </View>


        {isGuest && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.completeSignupButton}
              onPress={handleLogout}
            >
              <UserPlus size={20} color="#fff" />
              <Text style={styles.completeSignupText}>{t.completeSignup}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Globe size={20} color="#14b8a6" />
            <Text style={styles.sectionTitle}>{t.language}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.languageOptions}>
              {[
                { code: 'en' as const, label: t.english },
                { code: 'zh' as const, label: t.chinese },
              ].map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageOption,
                    language === lang.code && styles.languageOptionActive,
                  ]}
                  onPress={() => handleLanguageChange(lang.code)}
                >
                  <Text
                    style={[
                      styles.languageText,
                      language === lang.code && styles.languageTextActive,
                    ]}
                  >
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MessageSquare size={20} color="#14b8a6" />
            <Text style={styles.sectionTitle}>{t.feedback}</Text>
          </View>

          <TouchableOpacity
            style={styles.feedbackCard}
            onPress={() => setShowFeedbackModal(true)}
          >
            <Text style={styles.feedbackText}>{t.submitFeedback}</Text>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {!isGuest && (
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <Save size={20} color="#fff" />
            <Text style={styles.saveButtonText}>{saving ? t.saving : t.saveChanges}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color="#ef4444" />
          <Text style={styles.logoutButtonText}>{t.signOut}</Text>
        </TouchableOpacity>

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>{t.disclaimerAlpha}</Text>
          <Text style={styles.disclaimerText}>{t.disclaimerDevelopers}</Text>
          <Text style={styles.disclaimerText}>{t.disclaimerPurpose}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>MonitorPro v1.0.0</Text>
          <Text style={styles.footerSubtext}>Environmental Monitoring System</Text>
        </View>
      </ScrollView>

      <AIChatButton />

      {showFeedbackModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.submitFeedback}</Text>
              <TouchableOpacity onPress={() => setShowFeedbackModal(false)}>
                <LogOut size={24} color="#6b7280" style={{ transform: [{ rotate: '180deg' }] }} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              <Text style={styles.label}>{t.email} (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder={t.email}
                placeholderTextColor="#9ca3af"
                value={feedbackEmail}
                onChangeText={setFeedbackEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={styles.helperText}>
                We recommend adding your email for follow-up.
              </Text>

              <Text style={styles.label}>{t.feedback} *</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  feedbackError && styles.inputError,
                ]}
                placeholder="Please share your thoughts, suggestions, or issues..."
                placeholderTextColor="#9ca3af"
                value={feedbackContent}
                onChangeText={(t) => {
                  setFeedbackContent(t);
                  if (feedbackError && t.trim()) setFeedbackError(false);
                }}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
              {feedbackError && (
                <Text style={styles.errorText}>Please enter your feedback.</Text>
              )}

              <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                <TouchableOpacity
                  style={[styles.cancelButton]}
                  onPress={() => {
                    setShowFeedbackModal(false);
                    setFeedbackError(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>{t.cancel}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.submitButton, submittingFeedback && styles.submitButtonDisabled]}
                  onPress={handleSubmitFeedback}
                  disabled={submittingFeedback}
                >
                  <Text style={styles.submitButtonText}>
                    {submittingFeedback ? 'Submitting...' : t.submitFeedback}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      )}
      {showToast && (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{showToast.text}</Text>
        </View>
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
  guestBanner: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  guestBannerText: {
    fontSize: 14,
    color: '#92400e',
    fontWeight: '500',
    textAlign: 'center',
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
    marginBottom: 16,
  },
  inputDisabled: {
    backgroundColor: '#f3f4f6',
    color: '#9ca3af',
  },
  helperText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: -12,
    marginBottom: 8,
  },
  languageOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  languageOptionActive: {
    backgroundColor: '#14b8a6',
    borderColor: '#14b8a6',
  },
  languageText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  languageTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  completeSignupButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completeSignupText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#14b8a6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#fee2e2',
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  disclaimerText: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 20,
    marginBottom: 8,
  },
  footer: {
    marginTop: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#d1d5db',
    marginTop: 4,
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
  feedbackCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    width: '90%',
    maxHeight: '80%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  modalScroll: {
    maxHeight: 500,
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#14b8a6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  toast: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 30,
    backgroundColor: 'rgba(128, 128, 128, 0.9)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  toastText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
