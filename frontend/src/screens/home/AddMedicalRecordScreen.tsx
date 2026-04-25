import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ChevronLeft, Save, ClipboardList } from 'lucide-react-native';
import { getAuth } from '@react-native-firebase/auth';
import { saveMedicalRecord, updateMedicalRecord, getUserProfile } from '../../services/api';

// ─── Config ────────────────────────────────────────────────────────────────────
const RECORD_TYPES = ['AI Consultation', 'Lab Reports', 'Prescriptions', 'General'];

const TYPE_COLORS: Record<string, string> = {
  'AI Consultation': '#7C3AED',
  'Lab Reports':     '#2563EB',
  'Prescriptions':   '#059669',
  'General':         '#6B7280',
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function AddMedicalRecordScreen({ route, navigation }: any) {
  const editRecord = route?.params?.record ?? null;
  const isEditing  = Boolean(editRecord && editRecord.source === 'manual');

  const [title,      setTitle]      = useState(editRecord?.title       ?? '');
  const [doctorName, setDoctorName] = useState(editRecord?.doctor_name ?? editRecord?.doctor ?? '');
  const [recordDate, setRecordDate] = useState(
    editRecord?.record_date ?? editRecord?.rawDate ?? new Date().toISOString().split('T')[0]
  );
  const [recordType, setRecordType] = useState(editRecord?.record_type ?? editRecord?.type ?? RECORD_TYPES[0]);
  const [details,    setDetails]    = useState(editRecord?.details ?? '');
  const [saving,     setSaving]     = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Missing field', 'Please enter a record title.');
      return;
    }
    if (!recordDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      Alert.alert('Invalid date', 'Date must be in YYYY-MM-DD format, e.g. 2025-04-22');
      return;
    }

    setSaving(true);
    try {
      const auth       = getAuth();
      const firebaseUid = auth.currentUser?.uid;
      if (!firebaseUid) throw new Error('Not logged in');

      const profile = await getUserProfile(firebaseUid);
      const userId  = profile?.id;
      if (!userId) throw new Error('User profile not found');

      const payload = {
        userId,
        title:       title.trim(),
        doctor_name: doctorName.trim() || null,
        record_date: recordDate,
        record_type: recordType,
        details:     details.trim() || null,
        color_code:  null,
      };

      if (isEditing) {
        await updateMedicalRecord(editRecord.rawId, payload);
        Alert.alert('Saved', 'Record updated successfully.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await saveMedicalRecord(payload);
        Alert.alert('Saved', 'Medical record added successfully.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err: any) {
      Alert.alert('Error', err?.response?.data?.error || err.message || 'Could not save record.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.root}>
        {/* Header */}
        <SafeAreaView style={styles.header}>
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <ChevronLeft color="#FFF" size={26} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {isEditing ? 'Edit Record' : 'Add Medical Record'}
            </Text>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Save size={15} color="#FFF" />
                  <Text style={styles.saveBtnText}>Save</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <ScrollView
          style={styles.sheet}
          contentContainerStyle={styles.sheetContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <View style={styles.field}>
            <Text style={styles.label}>Record Title *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Blood Test Results, Follow-up Visit"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Doctor Name */}
          <View style={styles.field}>
            <Text style={styles.label}>Doctor / Lab Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Dr. Ahmed Khan"
              placeholderTextColor="#9CA3AF"
              value={doctorName}
              onChangeText={setDoctorName}
            />
          </View>

          {/* Date */}
          <View style={styles.field}>
            <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="2025-04-22"
              placeholderTextColor="#9CA3AF"
              value={recordDate}
              onChangeText={setRecordDate}
              keyboardType="numbers-and-punctuation"
              maxLength={10}
            />
          </View>

          {/* Record Type */}
          <View style={styles.field}>
            <Text style={styles.label}>Record Type</Text>
            <View style={styles.typeGrid}>
              {RECORD_TYPES.map((type) => {
                const active = recordType === type;
                const color  = TYPE_COLORS[type] ?? '#199A8E';
                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typePill,
                      active && { backgroundColor: color, borderColor: color },
                    ]}
                    onPress={() => setRecordType(type)}
                  >
                    <Text style={[styles.typePillText, active && { color: '#FFF' }]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Details */}
          <View style={styles.field}>
            <View style={styles.labelRow}>
              <ClipboardList size={14} color="#199A8E" />
              <Text style={[styles.label, { marginBottom: 0, marginLeft: 6 }]}>
                Notes & Details
              </Text>
            </View>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add diagnosis, prescription details, lab values, doctor notes…"
              placeholderTextColor="#9CA3AF"
              value={details}
              onChangeText={setDetails}
              multiline
              textAlignVertical="top"
              numberOfLines={6}
            />
          </View>

          {/* Save button */}
          <TouchableOpacity
            style={styles.saveButtonFull}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>
                {isEditing ? 'Update Record' : 'Save Record'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F9FAFB' },

  header: { backgroundColor: '#199A8E' },
  headerRow: {
    flexDirection:    'row',
    alignItems:       'center',
    paddingHorizontal: 20,
    paddingTop:        12,
    paddingBottom:     20,
  },
  backBtn:    { padding: 4 },
  headerTitle: {
    flex:       1,
    color:      '#FFF',
    fontSize:   18,
    fontWeight: '700',
    marginLeft: 12,
  },
  saveBtn: {
    flexDirection:   'row',
    alignItems:      'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical:   8,
    borderRadius:      20,
    gap:               6,
  },
  saveBtnText: { color: '#FFF', fontWeight: '700', fontSize: 14 },

  sheet: {
    flex:                 1,
    borderTopLeftRadius:  28,
    borderTopRightRadius: 28,
    marginTop:            -20,
    backgroundColor:      '#F9FAFB',
  },
  sheetContent: { padding: 24, paddingBottom: 60 },

  field:    { marginBottom: 22 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  label:    { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: {
    backgroundColor: '#FFF',
    borderRadius:    14,
    paddingHorizontal: 16,
    paddingVertical:   14,
    fontSize:        15,
    color:           '#1F2937',
    borderWidth:     1,
    borderColor:     '#E5E7EB',
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 1 },
    shadowOpacity:   0.04,
    shadowRadius:    4,
    elevation:       1,
  },
  textArea: { height: 130, paddingTop: 14 },

  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typePill: {
    paddingHorizontal: 18,
    paddingVertical:   10,
    borderRadius:      20,
    borderWidth:       1.5,
    borderColor:       '#E5E7EB',
    backgroundColor:   '#FFF',
  },
  typePillText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },

  saveButtonFull: {
    backgroundColor: '#199A8E',
    borderRadius:    16,
    paddingVertical: 16,
    alignItems:      'center',
    marginTop:       8,
    shadowColor:     '#199A8E',
    shadowOffset:    { width: 0, height: 4 },
    shadowOpacity:   0.3,
    shadowRadius:    8,
    elevation:       6,
  },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});