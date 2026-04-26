import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Linking,
  Alert,
  ActivityIndicator,
  Animated,
  Vibration,
  Platform,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAuth } from "@react-native-firebase/auth";
import io from "socket.io-client";
import BottomNavBar from "../../components/BottomNavBar";

// ── Config ────────────────────────────────────────────────────────────────────
// Replace with your backend IP (same as EXPO_PUBLIC_API_URL but without /api)
const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL?.replace("/api", "") 
  || "http://192.168.1.13:5000";

// ── Pakistan Emergency Services ───────────────────────────────────────────────
const EMERGENCY_SERVICES = [
  {
    name: "Rescue 1122",
    number: "1122",
    desc: "Emergency Rescue & Ambulance",
    available: "24/7",
    icon: "car-outline" as const,
    color: "#D32F2F",
  },
  {
    name: "Police Emergency",
    number: "15",
    desc: "Police & Security Emergency",
    available: "24/7",
    icon: "shield-outline" as const,
    color: "#1565C0",
  },
  {
    name: "Edhi Ambulance",
    number: "115",
    desc: "Free Ambulance & Welfare",
    available: "24/7",
    icon: "medkit-outline" as const,
    color: "#2E7D32",
  },
  {
    name: "Fire Brigade",
    number: "16",
    desc: "Fire & Disaster Response",
    available: "24/7",
    icon: "flame-outline" as const,
    color: "#E65100",
  },
  {
    name: "PEMRA Helpline",
    number: "111-111-329",
    desc: "Medical Emergency Helpline",
    available: "24/7",
    icon: "call-outline" as const,
    color: "#6A1B9A",
  },
  {
    name: "NADRA Helpline",
    number: "051-111-786-100",
    desc: "Identity & Emergency Support",
    available: "Mon-Sat",
    icon: "person-outline" as const,
    color: "#00695C",
  },
];

// ── Emergency Types ───────────────────────────────────────────────────────────
const EMERGENCY_TYPES = [
  { id: "medical", label: "Medical", icon: "medkit" as const, color: "#D32F2F" },
  { id: "accident", label: "Accident", icon: "car" as const, color: "#E65100" },
  { id: "fire", label: "Fire", icon: "flame" as const, color: "#F57F17" },
  { id: "mental", label: "Mental Crisis", icon: "heart" as const, color: "#6A1B9A" },
];

// ── First Aid Tips ─────────────────────────────────────────────────────────────
const FIRST_AID_TIPS = [
  {
    icon: "heart-outline" as const,
    title: "CPR — Cardiac Arrest",
    steps: [
      "Call 1122 immediately",
      "Place heel of hand on centre of chest",
      "Push hard and fast — 100-120 compressions/min",
      "Give 2 rescue breaths after every 30 compressions",
      "Continue until help arrives",
    ],
    color: "#FFEBEE",
    iconColor: "#D32F2F",
  },
  {
    icon: "water-outline" as const,
    title: "Choking",
    steps: [
      "Encourage coughing if mild",
      "Give 5 back blows between shoulder blades",
      "Give 5 abdominal thrusts (Heimlich)",
      "Alternate back blows and abdominal thrusts",
      "Call 1122 if unconscious",
    ],
    color: "#FFF3E0",
    iconColor: "#E65100",
  },
  {
    icon: "bandage-outline" as const,
    title: "Severe Bleeding",
    steps: [
      "Apply firm direct pressure with clean cloth",
      "Do not remove cloth — add more on top",
      "Elevate the injured area if possible",
      "Keep patient warm and calm",
      "Call 1122 for severe/uncontrolled bleeding",
    ],
    color: "#FCE4EC",
    iconColor: "#C62828",
  },
  {
    icon: "thermometer-outline" as const,
    title: "Heatstroke",
    steps: [
      "Move person to cool, shaded area",
      "Remove excess clothing",
      "Apply cool water or ice packs to neck, armpits, groin",
      "Fan the person vigorously",
      "Give cool water if conscious — call 1122",
    ],
    color: "#FFF8E1",
    iconColor: "#F57F17",
  },
];

// ── Component ──────────────────────────────────────────────────────────────────
export default function EmergencyScreen({ navigation }: { navigation: any }) {
  const [sosActive, setSosActive] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(5);
  const [sosSent, setSosSent] = useState(false);
  const [selectedType, setSelectedType] = useState("medical");
  const [sending, setSending] = useState(false);
  const [expandedTip, setExpandedTip] = useState<number | null>(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [locationNote, setLocationNote] = useState("");

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const socketRef = useRef<any>(null);

  // ── Connect to Socket ────────────────────────────────────────────────────────
  useEffect(() => {
    const socket = io(BACKEND_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketConnected(true);
      console.log("✅ Emergency socket connected");
    });

    socket.on("EMERGENCY_ACKNOWLEDGED", (data: any) => {
      Alert.alert(
        "✅ Help is Coming!",
        "Emergency responders have been notified. Stay calm and stay on the line.",
        [{ text: "OK" }]
      );
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    return () => {
      socket.disconnect();
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // ── SOS Pulse Animation ──────────────────────────────────────────────────────
  useEffect(() => {
    if (sosActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [sosActive]);

  // ── Start SOS Countdown ──────────────────────────────────────────────────────
  const startSOS = () => {
    if (sosSent) return;
    setSosActive(true);
    setSosCountdown(5);
    Vibration.vibrate([0, 200, 100, 200]);

    countdownRef.current = setInterval(() => {
      setSosCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          sendEmergencyAlert();
          return 0;
        }
        Vibration.vibrate(100);
        return prev - 1;
      });
    }, 1000);
  };

  // ── Cancel SOS ───────────────────────────────────────────────────────────────
  const cancelSOS = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setSosActive(false);
    setSosCountdown(5);
    Vibration.cancel();
  };

  // ── Send Emergency Alert ─────────────────────────────────────────────────────
  const sendEmergencyAlert = async () => {
    setSending(true);
    const auth = getAuth();
    const user = auth.currentUser;
    const patientId = user?.uid || "anonymous";

    try {
      // Emit via Socket.IO to backend
      if (socketRef.current?.connected) {
        const locationText = locationNote.trim()
          ? locationNote.trim()
          : "Location not shared - caller will provide verbally.";
        socketRef.current.emit("EMERGENCY_TRIGGER", {
          patientId,
          location: locationText,
          type: EMERGENCY_TYPES.find((t) => t.id === selectedType)?.label || "General Emergency",
          timestamp: new Date().toISOString(),
        });
      }

      setSosSent(true);
      setSosActive(false);
      Vibration.vibrate([0, 500, 200, 500, 200, 500]);

    } catch (error) {
      console.error("SOS Error:", error);
      Alert.alert("Error", "Could not send alert. Please call 1122 directly.");
    } finally {
      setSending(false);
    }
  };

  // ── Reset SOS ────────────────────────────────────────────────────────────────
  const resetSOS = () => {
    setSosSent(false);
    setSosActive(false);
    setSosCountdown(5);
  };

  // ── Call Number ───────────────────────────────────────────────────────────────
  const callNumber = (number: string) => {
    Linking.openURL(`tel:${number}`).catch(() =>
      Alert.alert("Error", "Could not open phone dialer.")
    );
  };

  const confirmAndStartSOS = () => {
    if (!locationNote.trim()) {
      Alert.alert(
        "Add your location details",
        "Please provide landmark/area or a Google Maps link before sending SOS.",
      );
      return;
    }
    startSOS();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Emergency Alert</Text>
            <Text style={styles.headerSub}>
              {socketConnected ? "🟢 Connected to emergency network" : "🔴 Connecting..."}
            </Text>
          </View>
        </View>

        {/* ── SOS Button Area ────────────────────────────────────────────────── */}
        <View style={styles.sosSection}>
          <Text style={styles.sectionLabel}>Location Confirmation</Text>
          <View style={styles.locationCard}>
            <View style={styles.locationRow}>
              <Ionicons
                name={locationNote.trim() ? "location" : "location-outline"}
                size={16}
                color={locationNote.trim() ? "#2E7D32" : "#9E9E9E"}
              />
              <Text style={styles.locationText}>
                {locationNote.trim()
                  ? "Location details ready for responders"
                  : "Enter area, landmark, house number, or maps link"}
              </Text>
            </View>
            <TextInput
              style={styles.locationInput}
              placeholder="Example: House 23, Street 7, G-10 Islamabad or maps link"
              placeholderTextColor="#9E9E9E"
              value={locationNote}
              onChangeText={setLocationNote}
              multiline
            />
            <Text style={styles.locationMeta}>
              Tip: Paste a Google Maps share link for faster rescue.
            </Text>
          </View>

          {/* Emergency Type Selector */}
          <Text style={styles.sectionLabel}>Select Emergency Type</Text>
          <View style={styles.typeRow}>
            {EMERGENCY_TYPES.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeChip,
                  selectedType === type.id && { backgroundColor: type.color, borderColor: type.color },
                ]}
                onPress={() => !sosActive && setSelectedType(type.id)}
              >
                <Ionicons
                  name={type.icon}
                  size={14}
                  color={selectedType === type.id ? "white" : "#666"}
                />
                <Text style={[
                  styles.typeChipText,
                  selectedType === type.id && { color: "white" },
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* SOS Button */}
          {!sosSent ? (
            <View style={styles.sosContainer}>
              <Animated.View style={[styles.sosRing, { transform: [{ scale: pulseAnim }] }]}>
                <TouchableOpacity
                  style={[styles.sosButton, sosActive && styles.sosButtonActive]}
                  onPress={sosActive ? cancelSOS : confirmAndStartSOS}
                  activeOpacity={0.85}
                >
                  {sending ? (
                    <ActivityIndicator color="white" size="large" />
                  ) : (
                    <>
                      <Ionicons
                        name={sosActive ? "close" : "warning"}
                        size={40}
                        color="white"
                      />
                      <Text style={styles.sosText}>
                        {sosActive ? `CANCEL (${sosCountdown})` : "SOS"}
                      </Text>
                      <Text style={styles.sosSubText}>
                        {sosActive ? "Tap to cancel" : "Hold to trigger"}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </Animated.View>

              {sosActive && (
                <View style={styles.countdownBanner}>
                  <Ionicons name="warning" size={16} color="#D32F2F" />
                  <Text style={styles.countdownText}>
                    Sending emergency alert in {sosCountdown} seconds...
                  </Text>
                </View>
              )}

              {!sosActive && (
                <Text style={styles.sosHint}>
                  Tap SOS to trigger a {sosCountdown}-second countdown.{"\n"}
                  Emergency responders will be notified immediately.
                </Text>
              )}
            </View>
          ) : (
            /* ── SOS Sent Confirmation ──────────────────────────────────────── */
            <View style={styles.sentCard}>
              <View style={styles.sentIcon}>
                <Ionicons name="checkmark-circle" size={48} color="#2E7D32" />
              </View>
              <Text style={styles.sentTitle}>🚨 Emergency Alert Sent!</Text>
              <Text style={styles.sentType}>
                Type: {EMERGENCY_TYPES.find((t) => t.id === selectedType)?.label}
              </Text>
              <Text style={styles.sentDesc}>
                Emergency responders have been notified. Please stay calm and call 1122 if you need immediate ambulance assistance.
              </Text>
              <TouchableOpacity style={styles.callNowBtn} onPress={() => callNumber("1122")}>
                <Ionicons name="call" size={18} color="white" />
                <Text style={styles.callNowText}>Call 1122 Now</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.resetBtn} onPress={resetSOS}>
                <Text style={styles.resetText}>Send Another Alert</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── Quick Call Buttons ──────────────────────────────────────────────── */}
        <View style={styles.quickCallSection}>
          <Text style={styles.sectionTitle}>Quick Emergency Calls</Text>
          <View style={styles.quickCallRow}>
            {[
              { label: "Rescue", number: "1122", color: "#D32F2F" },
              { label: "Police", number: "15", color: "#1565C0" },
              { label: "Ambulance", number: "115", color: "#2E7D32" },
              { label: "Fire", number: "16", color: "#E65100" },
            ].map((item) => (
              <TouchableOpacity
                key={item.number}
                style={[styles.quickCallBtn, { backgroundColor: item.color }]}
                onPress={() => callNumber(item.number)}
              >
                <Ionicons name="call" size={16} color="white" />
                <Text style={styles.quickCallLabel}>{item.label}</Text>
                <Text style={styles.quickCallNumber}>{item.number}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Emergency Services List ─────────────────────────────────────────── */}
        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>All Emergency Services</Text>
          {EMERGENCY_SERVICES.map((svc, i) => (
            <View key={i} style={styles.serviceCard}>
              <View style={[styles.serviceIcon, { backgroundColor: svc.color + "18" }]}>
                <Ionicons name={svc.icon} size={22} color={svc.color} />
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{svc.name}</Text>
                <Text style={styles.serviceDesc}>{svc.desc}</Text>
                <View style={styles.serviceAvail}>
                  <Ionicons name="time-outline" size={11} color="#9E9E9E" />
                  <Text style={styles.serviceAvailText}>{svc.available}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.callBtn, { backgroundColor: svc.color }]}
                onPress={() => callNumber(svc.number)}
              >
                <Ionicons name="call" size={14} color="white" />
                <Text style={styles.callBtnText}>{svc.number}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* ── First Aid Guide ────────────────────────────────────────────────── */}
        <View style={styles.firstAidSection}>
          <Text style={styles.sectionTitle}>First Aid Guide</Text>
          <Text style={styles.sectionSubtitle}>
            Step-by-step instructions while waiting for help
          </Text>
          {FIRST_AID_TIPS.map((tip, i) => (
            <TouchableOpacity
              key={i}
              style={styles.tipCard}
              onPress={() => setExpandedTip(expandedTip === i ? null : i)}
              activeOpacity={0.85}
            >
              <View style={styles.tipHeader}>
                <View style={[styles.tipIcon, { backgroundColor: tip.color }]}>
                  <Ionicons name={tip.icon} size={20} color={tip.iconColor} />
                </View>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Ionicons
                  name={expandedTip === i ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#9E9E9E"
                />
              </View>
              {expandedTip === i && (
                <View style={styles.tipSteps}>
                  {tip.steps.map((step, j) => (
                    <View key={j} style={styles.tipStep}>
                      <View style={styles.stepNum}>
                        <Text style={styles.stepNumText}>{j + 1}</Text>
                      </View>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Safety Reminder ────────────────────────────────────────────────── */}
        <View style={styles.reminderCard}>
          <Ionicons name="information-circle" size={20} color="#1565C0" />
          <Text style={styles.reminderText}>
            Only use SOS in real emergencies. False alerts waste emergency resources that others may need.
          </Text>
        </View>

      </ScrollView>
      <BottomNavBar navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#B71C1C" },
  scroll: { paddingBottom: 40 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "white" },
  headerSub: { fontSize: 11, color: "rgba(255,255,255,0.75)", marginTop: 2 },

  // SOS Section
  sosSection: {
    backgroundColor: "white",
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 4,
  },
  sectionLabel: { fontSize: 13, fontWeight: "600", color: "#424242", marginBottom: 10 },
  locationCard: {
    backgroundColor: "#F7F7F7",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 12,
    color: "#424242",
  },
  locationMeta: {
    marginTop: 6,
    fontSize: 11,
    color: "#757575",
  },
  locationInput: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    minHeight: 54,
    fontSize: 12,
    color: "#333333",
  },

  // Emergency Type Chips
  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  typeChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#E0E0E0",
    backgroundColor: "#F5F5F5",
  },
  typeChipText: { fontSize: 12, fontWeight: "600", color: "#666" },

  // SOS Button
  sosContainer: { alignItems: "center", paddingVertical: 10 },
  sosRing: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#FFEBEE",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: "#FFCDD2",
  },
  sosButton: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#D32F2F",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
  sosButtonActive: { backgroundColor: "#B71C1C" },
  sosText: { fontSize: 22, fontWeight: "900", color: "white", marginTop: 4 },
  sosSubText: { fontSize: 10, color: "rgba(255,255,255,0.8)", marginTop: 2 },

  // Countdown
  countdownBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFEBEE",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    width: "100%",
  },
  countdownText: { fontSize: 13, fontWeight: "600", color: "#D32F2F", flex: 1 },
  sosHint: { fontSize: 12, color: "#9E9E9E", textAlign: "center", lineHeight: 18 },

  // SOS Sent Card
  sentCard: { alignItems: "center", padding: 10 },
  sentIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  sentTitle: { fontSize: 18, fontWeight: "800", color: "#B71C1C", marginBottom: 6 },
  sentType: { fontSize: 13, fontWeight: "600", color: "#666", marginBottom: 8 },
  sentDesc: { fontSize: 13, color: "#424242", textAlign: "center", lineHeight: 20, marginBottom: 16 },
  callNowBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#D32F2F",
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginBottom: 10,
    width: "100%",
    justifyContent: "center",
  },
  callNowText: { fontSize: 15, fontWeight: "700", color: "white" },
  resetBtn: { paddingVertical: 10 },
  resetText: { fontSize: 13, color: "#9E9E9E", textDecorationLine: "underline" },

  // Quick Call
  quickCallSection: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "white", marginBottom: 10 },
  sectionSubtitle: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 12 },
  quickCallRow: { flexDirection: "row", gap: 8 },
  quickCallBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 14,
    gap: 4,
    elevation: 2,
  },
  quickCallLabel: { fontSize: 10, fontWeight: "700", color: "white" },
  quickCallNumber: { fontSize: 13, fontWeight: "900", color: "white" },

  // Services
  servicesSection: { paddingHorizontal: 16, marginBottom: 16 },
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    elevation: 2,
  },
  serviceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 13, fontWeight: "700", color: "#212121" },
  serviceDesc: { fontSize: 11, color: "#757575", marginTop: 2 },
  serviceAvail: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 4 },
  serviceAvailText: { fontSize: 10, color: "#9E9E9E" },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  callBtnText: { fontSize: 11, fontWeight: "700", color: "white" },

  // First Aid
  firstAidSection: { paddingHorizontal: 16, marginBottom: 16 },
  tipCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
  },
  tipHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tipTitle: { flex: 1, fontSize: 14, fontWeight: "700", color: "#212121" },
  tipSteps: { marginTop: 14, gap: 10 },
  tipStep: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#D32F2F",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 1,
  },
  stepNumText: { fontSize: 11, fontWeight: "800", color: "white" },
  stepText: { flex: 1, fontSize: 13, color: "#424242", lineHeight: 19 },

  // Reminder
  reminderCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  reminderText: { flex: 1, fontSize: 12, color: "white", lineHeight: 18 },
});