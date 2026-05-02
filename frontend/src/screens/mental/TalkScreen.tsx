import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getDoctors } from "../../services/api";

// ── Constants ─────────────────────────────────────────────────────────────────

// Chat and Voice only — Video removed
const SESSION_TYPES = [
  { label: "Chat",  icon: "chatbubble-outline" as const },
  { label: "Voice", icon: "call-outline"        as const },
];

const AVATAR_COLORS = [
  "#4CAF50", "#26C6DA", "#AB47BC",
  "#FF7043", "#5BA89D", "#EF5350",
  "#42A5F5", "#FFA726",
];

const getInitials = (fullName: string) => {
  const parts = (fullName || "Dr").trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// ── Types ─────────────────────────────────────────────────────────────────────

type Doctor = {
  id: number;
  specialization: string;
  consultationFee: number;
  experienceYears: number;
  availabilityStatus: boolean;
  verificationStatus: string;
  bio?: string;
  user: {
    fullName: string;
    email?: string;
    phoneNumber?: string;
  };
};

// ── Screen ────────────────────────────────────────────────────────────────────

function TalkScreen({ navigation }: { navigation: any }) {
  const [activeSession, setActiveSession] = useState(0);
  const [doctors, setDoctors]             = useState<Doctor[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    setError(false);
    try {
      // Fetch ALL doctors — no specialization filter so nothing gets hidden
      const data = await getDoctors();
      const list: Doctor[] = Array.isArray(data) ? data : [];
      setDoctors(list);
    } catch (err) {
      console.error("TalkScreen: Failed to load doctors:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  // ── Navigation ──────────────────────────────────────────────────────────────

  const handleBook = (doctor: Doctor) => {
    navigation.navigate("BookAppointment", { doctorId: doctor.id });
  };

  const handleChat = (doctor: Doctor) => {
    // Navigates to AI Assistant with doctor context.
    // When a dedicated DoctorChatScreen is built, swap the route name here.
    navigation.navigate("AiAssistant", {
      doctorId:   doctor.id,
      doctorName: doctor.user?.fullName,
    });
  };

  const handleSessionAction = (doctor: Doctor) => {
    if (activeSession === 0) {
      // Chat tab selected
      handleChat(doctor);
    } else {
      // Voice tab — no live call yet, guide to booking
      Alert.alert(
        "Voice Session",
        "Voice sessions take place at your scheduled appointment time. Would you like to book one?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Book Appointment", onPress: () => handleBook(doctor) },
        ],
      );
    }
  };

  // ── Card render ─────────────────────────────────────────────────────────────

  const renderCard = (doctor: Doctor, index: number) => {
    const name     = doctor.user?.fullName || "Doctor";
    const initials = getInitials(name);
    const color    = AVATAR_COLORS[index % AVATAR_COLORS.length];
    const isOnline = !!doctor.availabilityStatus;
    const fee      = Number(doctor.consultationFee) || 0;

    return (
      <View key={doctor.id} style={styles.card}>

        {/* Top row: avatar + info + status */}
        <View style={styles.cardTop}>
          <View style={[styles.avatar, { backgroundColor: color }]}>
            <Text style={styles.avatarText}>{initials}</Text>
            {isOnline && <View style={styles.onlineDot} />}
          </View>

          <View style={styles.info}>
            <Text style={styles.doctorName}>{name}</Text>
            <Text style={styles.specialization} numberOfLines={1}>
              {doctor.specialization || "General Practitioner"}
            </Text>
            <View style={styles.expRow}>
              <Ionicons name="briefcase-outline" size={12} color="#9E9E9E" />
              <Text style={styles.expText}>
                {doctor.experienceYears > 0
                  ? `${doctor.experienceYears} yrs experience`
                  : "New Expert"}
              </Text>
            </View>
          </View>

          <View style={[
            styles.statusPill,
            isOnline ? styles.statusPillOn : styles.statusPillOff,
          ]}>
            <Text style={[
              styles.statusPillText,
              isOnline ? styles.statusPillTextOn : styles.statusPillTextOff,
            ]}>
              {isOnline ? "Available" : "Offline"}
            </Text>
          </View>
        </View>

        {/* Bio */}
        {!!doctor.bio && (
          <Text style={styles.bio} numberOfLines={2}>{doctor.bio}</Text>
        )}

        {/* Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.feeRow}>
            <Ionicons name="cash-outline" size={14} color="#757575" />
            <Text style={styles.feeText}>
              {fee === 0 ? "Free" : `PKR ${fee.toLocaleString()}`}
            </Text>
          </View>

          <View style={styles.buttonsRow}>
            {/* Chat / Voice button — reflects selected session type */}
            <TouchableOpacity
              style={styles.outlineBtn}
              onPress={() => handleSessionAction(doctor)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={activeSession === 0 ? "chatbubble-outline" : "call-outline"}
                size={14}
                color="#5BA89D"
              />
              <Text style={styles.outlineBtnText}>
                {activeSession === 0 ? "Chat" : "Call"}
              </Text>
            </TouchableOpacity>

            {/* Book appointment */}
            <TouchableOpacity
              style={styles.bookBtn}
              onPress={() => handleBook(doctor)}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar-outline" size={14} color="white" />
              <Text style={styles.bookBtnText}>Book</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // ── Main render ─────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Talk to Expert</Text>
          <Text style={styles.headerSub}>Professional health support</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Session type selector */}
        <View style={styles.sessionCard}>
          <Text style={styles.sessionLabel}>Choose session type</Text>
          <View style={styles.sessionRow}>
            {SESSION_TYPES.map((type, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.sessionBtn,
                  activeSession === i && styles.sessionBtnActive,
                ]}
                onPress={() => setActiveSession(i)}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={type.icon}
                  size={22}
                  color={activeSession === i ? "white" : "#757575"}
                />
                <Text style={[
                  styles.sessionBtnText,
                  activeSession === i && { color: "white" },
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Heading */}
        <Text style={styles.sectionHeading}>
          {loading ? "Finding Doctors..." : `${doctors.length} Doctor${doctors.length !== 1 ? "s" : ""} Available`}
        </Text>

        {/* States */}
        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color="white" />
            <Text style={styles.stateText}>Loading doctors...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerState}>
            <Ionicons name="wifi-outline" size={40} color="rgba(255,255,255,0.6)" />
            <Text style={styles.stateText}>Could not connect to server.</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchDoctors}>
              <Text style={styles.retryBtnText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : doctors.length === 0 ? (
          <View style={styles.centerState}>
            <Ionicons name="person-outline" size={44} color="rgba(255,255,255,0.5)" />
            <Text style={styles.stateTitle}>No Doctors Found</Text>
            <Text style={styles.stateSubText}>
              No doctors are registered in the system yet.
            </Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchDoctors}>
              <Text style={styles.retryBtnText}>Refresh</Text>
            </TouchableOpacity>
          </View>
        ) : (
          doctors.map((doc, i) => renderCard(doc, i))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default TalkScreen;

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#5BA89D" },
  scroll:    { paddingBottom: 40 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
  },
  backBtn:     { padding: 6 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "white" },
  headerSub:   { fontSize: 13, color: "#C8EAE6", marginTop: 2 },

  // Session type card
  sessionCard: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 18,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  sessionLabel: { fontSize: 13, fontWeight: "600", color: "#757575", marginBottom: 12 },
  sessionRow:   { flexDirection: "row", gap: 12 },
  sessionBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: "#F5F5F5",
    gap: 6,
  },
  sessionBtnActive: { backgroundColor: "#5BA89D" },
  sessionBtnText:   { fontSize: 13, fontWeight: "600", color: "#757575" },

  // Section heading
  sectionHeading: {
    fontSize: 15,
    fontWeight: "700",
    color: "rgba(255,255,255,0.9)",
    marginHorizontal: 16,
    marginBottom: 12,
  },

  // Doctor card
  card: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 20,
    padding: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: "800", color: "white" },
  onlineDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "white",
  },
  info:           { flex: 1 },
  doctorName:     { fontSize: 15, fontWeight: "700", color: "#212121" },
  specialization: { fontSize: 12, color: "#757575", marginTop: 2, textTransform: "capitalize" },
  expRow:         { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  expText:        { fontSize: 12, color: "#9E9E9E" },

  // Status pill
  statusPill:       { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20, alignSelf: "flex-start" },
  statusPillOn:     { backgroundColor: "#E8F5E9" },
  statusPillOff:    { backgroundColor: "#F5F5F5" },
  statusPillText:   { fontSize: 11, fontWeight: "700" },
  statusPillTextOn: { color: "#2E7D32" },
  statusPillTextOff:{ color: "#9E9E9E" },

  // Bio
  bio: { fontSize: 13, color: "#616161", lineHeight: 18, marginBottom: 10 },

  // Card footer
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
    paddingTop: 12,
    marginTop: 2,
  },
  feeRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  feeText: { fontSize: 13, color: "#757575", fontWeight: "600" },

  buttonsRow: { flexDirection: "row", gap: 8 },

  outlineBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1.5,
    borderColor: "#5BA89D",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  outlineBtnText: { fontSize: 13, fontWeight: "700", color: "#5BA89D" },

  bookBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#5BA89D",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  bookBtnText: { fontSize: 13, fontWeight: "700", color: "white" },

  // Center states
  centerState: { alignItems: "center", paddingVertical: 48, paddingHorizontal: 32, gap: 10 },
  stateText:    { color: "rgba(255,255,255,0.85)", fontSize: 14, textAlign: "center" },
  stateTitle:   { color: "white", fontSize: 17, fontWeight: "700" },
  stateSubText: { color: "rgba(255,255,255,0.7)", fontSize: 13, textAlign: "center", lineHeight: 19 },

  retryBtn: {
    marginTop: 6,
    backgroundColor: "white",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryBtnText: { color: "#5BA89D", fontWeight: "700", fontSize: 14 },
});