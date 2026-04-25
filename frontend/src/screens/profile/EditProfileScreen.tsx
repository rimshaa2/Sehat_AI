import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  SafeAreaView, StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from "react-native";
import {
  ChevronLeft, User, Phone, Heart, Droplets,
  AlertTriangle, FileText, Ruler, Weight, Calendar,
  Save, CheckCircle,
} from "lucide-react-native";
import { getAuth, updateProfile } from "@react-native-firebase/auth";
import { updateUserProfile } from "../../services/api";

const BLOOD_TYPES = ["A+", "A−", "B+", "B−", "AB+", "AB−", "O+", "O−"];
const GENDERS     = ["Male", "Female", "Other"];
const LANGUAGES   = [
  { code: "en", label: "English" },
  { code: "ur", label: "اردو" },
  
];

// ─── Pill selector ────────────────────────────────────────────────────────────
function PillSelect({
  options, value, onChange, color = "#199A8E",
}: { options: string[]; value: string; onChange: (v: string) => void; color?: string }) {
  return (
    <View style={pill.row}>
      {options.map(opt => {
        const active = value === opt;
        return (
          <TouchableOpacity
            key={opt}
            style={[pill.btn, active && { backgroundColor: color, borderColor: color }]}
            onPress={() => onChange(opt)}
          >
            <Text style={[pill.text, active && { color: "#FFF" }]}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
const pill = StyleSheet.create({
  row:  { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  btn:  { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, borderWidth: 1.5, borderColor: "#E5E7EB", backgroundColor: "#FFF" },
  text: { fontSize: 13, fontWeight: "600", color: "#6B7280" },
});

// ─── Section wrapper ─────────────────────────────────────────────────────────
function Section({ icon, title, children }: { icon: any; title: string; children: any }) {
  return (
    <View style={s.section}>
      <View style={s.sectionHeader}>
        {icon}
        <Text style={s.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({ label, children, hint }: { label: string; children: any; hint?: string }) {
  return (
    <View style={s.field}>
      <Text style={s.label}>{label}</Text>
      {children}
      {hint ? <Text style={s.hint}>{hint}</Text> : null}
    </View>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function EditProfileScreen({ navigation, route }: any) {
  const { userData } = route.params || {};

  // Personal
  const [fullName,  setFullName]  = useState(userData?.fullName  ?? "");
  const [phone,     setPhone]     = useState(userData?.phoneNumber ?? "");

  // Health vitals
  const [dob,       setDob]       = useState(userData?.dateOfBirth ?? "");
  const [gender,    setGender]    = useState(userData?.gender      ?? "");
  const [weight,    setWeight]    = useState(userData?.weight != null ? String(userData.weight) : "");
  const [height,    setHeight]    = useState(userData?.height != null ? String(userData.height) : "");
  const [bloodType, setBloodType] = useState(userData?.bloodType   ?? "");

  // Medical info
  const [medHistory,    setMedHistory]    = useState(userData?.medicalHistory  ?? "");
  const [allergies,     setAllergies]     = useState(userData?.allergies       ?? "");
  const [emergencyContact, setEmergency]  = useState(userData?.emergencyContact ?? "");

  // Preferences
  const [language,  setLanguage]  = useState(userData?.preferredLanguage ?? "en");

  const [saving, setSaving] = useState(false);

  // ── BMI preview ─────────────────────────────────────────────────────────────
  const bmiPreview = (() => {
    const w = parseFloat(weight), h = parseFloat(height);
    if (!w || !h || h === 0) return null;
    const val = (w / ((h / 100) ** 2)).toFixed(1);
    const v = parseFloat(val);
    const label = v < 18.5 ? "Underweight" : v < 25 ? "Normal weight" : v < 30 ? "Overweight" : "Obese";
    const color = v < 18.5 ? "#F59E0B" : v < 25 ? "#10B981" : v < 30 ? "#F97316" : "#EF4444";
    return { val, label, color };
  })();

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (fullName.trim().length < 2) {
      Alert.alert("Validation", "Full name must be at least 2 characters.");
      return;
    }
    if (dob && !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      Alert.alert("Validation", "Date of birth must be YYYY-MM-DD (e.g. 1995-03-20).");
      return;
    }

    setSaving(true);
    try {
      const auth   = getAuth();
      const fbUser = auth.currentUser;
      if (!fbUser) return;

      await updateProfile(fbUser, { displayName: fullName });

      await updateUserProfile(fbUser.uid, {
        fullName:         fullName.trim(),
        phoneNumber:      phone.trim()       || null,
        dateOfBirth:      dob.trim()         || null,
        gender:           gender             || null,
        weight:           weight             ? parseFloat(weight)  : null,
        height:           height             ? parseFloat(height)  : null,
        bloodType:        bloodType          || null,
        medicalHistory:   medHistory.trim()  || null,
        allergies:        allergies.trim()   || null,
        emergencyContact: emergencyContact.trim() || null,
        preferredLanguage: language,
      });

      Alert.alert("✓ Saved", "Your health profile has been updated.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.error || err.message || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={s.root}>

        {/* Header */}
        <SafeAreaView style={s.header}>
          <View style={s.headerRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
              <ChevronLeft color="#FFF" size={26} />
            </TouchableOpacity>
            <Text style={s.headerTitle}>Edit Health Profile</Text>
            <TouchableOpacity style={s.saveBtn} onPress={handleSave} disabled={saving}>
              {saving
                ? <ActivityIndicator size="small" color="#FFF" />
                : <><Save size={15} color="#FFF" /><Text style={s.saveBtnText}>Save</Text></>
              }
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        <ScrollView
          style={s.sheet}
          contentContainerStyle={s.sheetContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Personal ─────────────────────────────────────────────────── */}
          <Section icon={<User size={16} color="#199A8E" />} title="Personal Details">
            <Field label="Full Name *">
              <TextInput style={s.input} value={fullName} onChangeText={setFullName} placeholder="Your full name" placeholderTextColor="#9CA3AF" />
            </Field>
            <Field label="Email (cannot change)">
              <TextInput style={[s.input, s.disabled]} value={userData?.email} editable={false} />
            </Field>
            <Field label="Phone Number">
              <TextInput style={s.input} value={phone} onChangeText={setPhone} placeholder="+92 300 000 0000" placeholderTextColor="#9CA3AF" keyboardType="phone-pad" />
            </Field>
          </Section>

          {/* ── Health Vitals ─────────────────────────────────────────────── */}
          <Section icon={<Heart size={16} color="#EF4444" />} title="Health Vitals">
            <Field label="Date of Birth" hint="Format: YYYY-MM-DD">
              <TextInput
                style={s.input}
                value={dob}
                onChangeText={setDob}
                placeholder="1995-03-20"
                placeholderTextColor="#9CA3AF"
                keyboardType="numbers-and-punctuation"
                maxLength={10}
              />
            </Field>

            <Field label="Gender">
              <PillSelect options={GENDERS} value={gender} onChange={setGender} color="#DB2777" />
            </Field>

            <View style={s.twoCol}>
              <View style={{ flex: 1 }}>
                <Field label="Weight (kg)" hint="e.g. 72.5">
                  <TextInput style={s.input} value={weight} onChangeText={setWeight} placeholder="kg" placeholderTextColor="#9CA3AF" keyboardType="decimal-pad" />
                </Field>
              </View>
              <View style={{ width: 12 }} />
              <View style={{ flex: 1 }}>
                <Field label="Height (cm)" hint="e.g. 170">
                  <TextInput style={s.input} value={height} onChangeText={setHeight} placeholder="cm" placeholderTextColor="#9CA3AF" keyboardType="decimal-pad" />
                </Field>
              </View>
            </View>

            {bmiPreview && (
              <View style={[s.bmiBox, { borderColor: bmiPreview.color + "40", backgroundColor: bmiPreview.color + "10" }]}>
                <CheckCircle size={16} color={bmiPreview.color} />
                <Text style={[s.bmiText, { color: bmiPreview.color }]}>
                  BMI: {bmiPreview.val} — {bmiPreview.label}
                </Text>
              </View>
            )}

            <Field label="Blood Type">
              <PillSelect options={BLOOD_TYPES} value={bloodType} onChange={setBloodType} color="#EF4444" />
            </Field>
          </Section>

          {/* ── Medical Info ─────────────────────────────────────────────── */}
          <Section icon={<FileText size={16} color="#2563EB" />} title="Medical Information">
            <Field label="Medical History / Chronic Conditions" hint="e.g. Diabetes Type 2, Hypertension">
              <TextInput
                style={[s.input, s.textArea]}
                value={medHistory}
                onChangeText={setMedHistory}
                placeholder="List any chronic conditions, past surgeries, or ongoing treatments…"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </Field>
            <Field label="Allergies" hint="e.g. Penicillin, Peanuts, Dust">
              <TextInput
                style={[s.input, s.textArea]}
                value={allergies}
                onChangeText={setAllergies}
                placeholder="List any known drug or food allergies…"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </Field>
            <Field label="Emergency Contact" hint="Name and phone number">
              <TextInput
                style={s.input}
                value={emergencyContact}
                onChangeText={setEmergency}
                placeholder="e.g. Ali Khan — 0300-1234567"
                placeholderTextColor="#9CA3AF"
              />
            </Field>
          </Section>

          {/* ── Preferences ──────────────────────────────────────────────── */}
          <Section icon={<Globe size={16} color="#10B981" />} title="Preferences">
            <Field label="Preferred Language">
              <PillSelect
                options={LANGUAGES.map(l => l.label)}
                value={LANGUAGES.find(l => l.code === language)?.label ?? "English"}
                onChange={label => setLanguage(LANGUAGES.find(l => l.label === label)?.code ?? "en")}
                color="#10B981"
              />
            </Field>
          </Section>

          {/* Save button */}
          <TouchableOpacity style={s.saveFullBtn} onPress={handleSave} disabled={saving}>
            {saving
              ? <ActivityIndicator color="#FFF" />
              : <Text style={s.saveFullBtnText}>Save Health Profile</Text>
            }
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

// missing import from above
function Globe({ size, color }: { size: number; color: string }) {
  const { Globe: G } = require("lucide-react-native");
  return <G size={size} color={color} />;
}

const s = StyleSheet.create({
  root:  { flex: 1, backgroundColor: "#F9FAFB" },
  header: { backgroundColor: "#199A8E" },
  headerRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  backBtn: { padding: 6, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10 },
  headerTitle: { flex: 1, color: "#FFF", fontSize: 17, fontWeight: "700", marginLeft: 12 },
  saveBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.22)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  saveBtnText: { color: "#FFF", fontWeight: "700", fontSize: 13 },

  sheet: { flex: 1, backgroundColor: "#F9FAFB" },
  sheetContent: { padding: 20, paddingBottom: 50 },

  section: { backgroundColor: "#FFF", borderRadius: 18, padding: 18, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1F2937" },

  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 8 },
  hint:  { fontSize: 11, color: "#9CA3AF", marginTop: 4 },
  input: { backgroundColor: "#F9FAFB", borderWidth: 1.5, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, color: "#1F2937" },
  disabled: { backgroundColor: "#F3F4F6", color: "#9CA3AF" },
  textArea: { height: 90, paddingTop: 13 },

  twoCol: { flexDirection: "row" },

  bmiBox: { flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 16 },
  bmiText: { fontWeight: "700", fontSize: 14 },

  saveFullBtn: { backgroundColor: "#199A8E", borderRadius: 16, paddingVertical: 17, alignItems: "center", marginTop: 8, shadowColor: "#199A8E", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  saveFullBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
});
