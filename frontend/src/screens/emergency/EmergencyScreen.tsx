import React, { useState, useEffect, useRef, useCallback } from "react";
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
  TextInput,
  Modal,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WebView } from "react-native-webview";
import { getAuth } from "@react-native-firebase/auth";
import io from "socket.io-client";
import { getUserProfile } from "../../services/api";
import BottomNavBar from "../../components/BottomNavBar";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ── Config ─────────────────────────────────────────────────────────────────────
const BACKEND_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace("/api", "") ||
  "http://192.168.18.38:5000";

// Replace with your actual Google Maps API key
// OpenStreetMap via Leaflet.js — no API key required

// ── Symptom Severity Engine ────────────────────────────────────────────────────
const SYMPTOMS = [
  {
    id: "chest_pain",
    label: "Chest Pain",
    severity: 5,
    icon: "heart",
    color: "#D32F2F",
  },
  {
    id: "breathing",
    label: "Difficulty Breathing",
    severity: 5,
    icon: "fitness",
    color: "#D32F2F",
  },
  {
    id: "unconscious",
    label: "Unconscious",
    severity: 5,
    icon: "warning",
    color: "#D32F2F",
  },
  {
    id: "stroke",
    label: "Stroke Signs",
    severity: 5,
    icon: "alert-circle",
    color: "#D32F2F",
  },
  {
    id: "severe_bleeding",
    label: "Severe Bleeding",
    severity: 4,
    icon: "water",
    color: "#E53935",
  },
  {
    id: "seizure",
    label: "Seizure",
    severity: 4,
    icon: "flash",
    color: "#E53935",
  },
  {
    id: "high_fever",
    label: "High Fever (40°C+)",
    severity: 3,
    icon: "thermometer",
    color: "#F57C00",
  },
  {
    id: "severe_pain",
    label: "Severe Pain",
    severity: 3,
    icon: "medkit",
    color: "#F57C00",
  },
  {
    id: "allergic",
    label: "Allergic Reaction",
    severity: 3,
    icon: "alert",
    color: "#F57C00",
  },
  {
    id: "vomiting",
    label: "Severe Vomiting",
    severity: 2,
    icon: "trending-down",
    color: "#FBC02D",
  },
  {
    id: "dizziness",
    label: "Dizziness",
    severity: 2,
    icon: "reload-circle",
    color: "#FBC02D",
  },
  {
    id: "mild_pain",
    label: "Mild Pain",
    severity: 1,
    icon: "bandage",
    color: "#66BB6A",
  },
];

const getTriageResult = (selectedSymptoms: string[]) => {
  if (selectedSymptoms.length === 0) return null;
  const maxSeverity = Math.max(
    ...selectedSymptoms.map(
      (id) => SYMPTOMS.find((s) => s.id === id)?.severity || 0,
    ),
  );
  if (maxSeverity >= 5)
    return {
      level: "CRITICAL",
      color: "#B71C1C",
      bg: "#FFEBEE",
      icon: "warning" as const,
      action: "Call 1122 immediately & send SOS",
      desc: "Life-threatening emergency detected. Activate SOS and call emergency services right now.",
      callNumber: "1122",
    };
  if (maxSeverity >= 4)
    return {
      level: "URGENT",
      color: "#D32F2F",
      bg: "#FCE4EC",
      icon: "alert-circle" as const,
      action: "Go to ER immediately",
      desc: "Serious condition requiring immediate hospital attention. Head to the nearest emergency room.",
      callNumber: "1122",
    };
  if (maxSeverity >= 3)
    return {
      level: "MODERATE",
      color: "#F57C00",
      bg: "#FFF3E0",
      icon: "medical" as const,
      action: "See a doctor within 2 hours",
      desc: "Your symptoms need prompt medical attention. Book an urgent appointment or visit a clinic.",
      callNumber: "115",
    };
  return {
    level: "MILD",
    color: "#2E7D32",
    bg: "#E8F5E9",
    icon: "checkmark-circle" as const,
    action: "Monitor & rest",
    desc: "Symptoms appear mild. Rest, stay hydrated, and monitor. See a doctor if symptoms worsen.",
    callNumber: null,
  };
};

// ── Emergency Services ─────────────────────────────────────────────────────────
const EMERGENCY_SERVICES = [
  {
    name: "Rescue 1122",
    number: "1122",
    desc: "Emergency Rescue & Ambulance",
    icon: "car-outline" as const,
    color: "#D32F2F",
  },
  {
    name: "Police Emergency",
    number: "15",
    desc: "Police & Security Emergency",
    icon: "shield-outline" as const,
    color: "#1565C0",
  },
  {
    name: "Edhi Ambulance",
    number: "115",
    desc: "Free Ambulance & Welfare",
    icon: "medkit-outline" as const,
    color: "#2E7D32",
  },
  {
    name: "Fire Brigade",
    number: "16",
    desc: "Fire & Disaster Response",
    icon: "flame-outline" as const,
    color: "#E65100",
  },
  {
    name: "PEMRA Helpline",
    number: "111-111-329",
    desc: "Medical Emergency Helpline",
    icon: "call-outline" as const,
    color: "#6A1B9A",
  },
];

const EMERGENCY_TYPES = [
  {
    id: "medical",
    label: "Medical",
    icon: "medkit" as const,
    color: "#D32F2F",
  },
  { id: "accident", label: "Accident", icon: "car" as const, color: "#E65100" },
  { id: "fire", label: "Fire", icon: "flame" as const, color: "#F57F17" },
  {
    id: "mental",
    label: "Mental Crisis",
    icon: "heart" as const,
    color: "#6A1B9A",
  },
];

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

// ── Google Maps WebView HTML Generator ────────────────────────────────────────
const buildMapHTML = (
  lat: number,
  lng: number,
  responderLat?: number,
  responderLng?: number,
) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100vh; }
    .legend {
      position: absolute;
      bottom: 16px;
      left: 16px;
      z-index: 1000;
      background: white;
      border-radius: 14px;
      padding: 10px 14px;
      font-family: -apple-system, sans-serif;
      font-size: 12px;
      box-shadow: 0 3px 12px rgba(0,0,0,0.2);
    }
    .legend-row { display: flex; align-items: center; margin-bottom: 4px; }
    .legend-row:last-child { margin-bottom: 0; }
    .dot { width: 11px; height: 11px; border-radius: 50%; margin-right: 8px; flex-shrink: 0; }
    .pulse-icon {
      width: 24px; height: 24px;
      background: #D32F2F;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 0 3px rgba(211,47,47,0.4);
      animation: pulse 1.5s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 0 3px rgba(211,47,47,0.4); }
      50% { box-shadow: 0 0 0 8px rgba(211,47,47,0.1); }
    }
    .responder-icon {
      width: 28px; height: 28px;
      background: #1565C0;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(21,101,192,0.5);
      display: flex; align-items: center; justify-content: center;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <div class="legend">
    <div class="legend-row">
      <div class="dot" style="background:#D32F2F"></div>
      <span>Your Location</span>
    </div>
    ${
      responderLat
        ? `
    <div class="legend-row" style="margin-top:6px">
      <div class="dot" style="background:#1565C0"></div>
      <span>Responder</span>
    </div>
    `
        : ""
    }
  </div>
  <script>
    const map = L.map('map', { zoomControl: true, attributionControl: false }).setView([${lat}, ${lng}], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // User location marker with pulse
    const userIcon = L.divIcon({
      html: '<div class="pulse-icon"></div>',
      className: '',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
    L.marker([${lat}, ${lng}], { icon: userIcon })
      .addTo(map)
      .bindPopup('<b>Your Location</b>')
      .openPopup();

    ${
      responderLat
        ? `
    // Responder marker
    const responderIcon = L.divIcon({
      html: '<div class="responder-icon">🚑</div>',
      className: '',
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });
    L.marker([${responderLat}, ${responderLng}], { icon: responderIcon })
      .addTo(map)
      .bindPopup('<b>Emergency Responder</b>');

    // Draw route line between responder and user
    const routeLine = L.polyline(
      [[${responderLat}, ${responderLng}], [${lat}, ${lng}]],
      { color: '#1565C0', weight: 4, opacity: 0.8, dashArray: '10, 6' }
    ).addTo(map);

    // Fit map to show both markers
    map.fitBounds([[${lat}, ${lng}], [${responderLat}, ${responderLng}]], { padding: [40, 40] });
    `
        : ""
    }
  </script>
</body>
</html>
`;

// ── Main Component ─────────────────────────────────────────────────────────────
export default function EmergencyScreen({ navigation }: { navigation: any }) {
  // ── State ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<
    "triage" | "sos" | "map" | "firstaid"
  >("triage");

  // Triage
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const triageResult = getTriageResult(selectedSymptoms);

  // SOS
  const [sosActive, setSosActive] = useState(false);
  const [sosCountdown, setSosCountdown] = useState(5);
  const [sosSent, setSosSent] = useState(false);
  const [selectedType, setSelectedType] = useState("medical");
  const [sending, setSending] = useState(false);
  const [locationNote, setLocationNote] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);

  // Location & Map
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [responderLocation, setResponderLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [mapVisible, setMapVisible] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [eta, setEta] = useState<string | null>(null);

  // Family alert
  const [userProfile, setUserProfile] = useState<any>(null);
  const [familyAlertSent, setFamilyAlertSent] = useState(false);

  // First aid
  const [expandedTip, setExpandedTip] = useState<number | null>(null);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const socketRef = useRef<any>(null);
  const responderPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Init: load profile, connect socket ────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const auth = getAuth();
        if (auth.currentUser) {
          const profile = await getUserProfile(auth.currentUser.uid);
          setUserProfile(profile);
        }
      } catch (e) {
        console.warn("Profile load error:", e);
      }
    };
    init();

    const socket = io(BACKEND_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => setSocketConnected(true));
    socket.on("disconnect", () => setSocketConnected(false));

    // FE-3: Listen for responder location updates
    socket.on(
      "RESPONDER_LOCATION_UPDATE",
      (data: { lat: number; lng: number; eta: string }) => {
        setResponderLocation({ lat: data.lat, lng: data.lng });
        setEta(data.eta);
      },
    );

    socket.on("EMERGENCY_ACKNOWLEDGED", () => {
      Alert.alert(
        "✅ Help is Coming!",
        "Emergency responders have been notified. Stay calm and stay on the line.",
      );
      // Start simulated responder tracking (replace with real data from socket)
      startResponderSimulation();
    });

    return () => {
      socket.disconnect();
      if (countdownRef.current) clearInterval(countdownRef.current);
      if (responderPollRef.current) clearInterval(responderPollRef.current);
    };
  }, []);

  // ── SOS Pulse Animation ───────────────────────────────────────────────────
  useEffect(() => {
    if (sosActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.18,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [sosActive]);

  // ── FE-2: Get user GPS location ───────────────────────────────────────────
  const getLocation = useCallback(async (): Promise<{
    lat: number;
    lng: number;
  } | null> => {
    setLocationLoading(true);
    return new Promise((resolve) => {
      // Use browser-based geolocation (works in Expo Go via WebView trick)
      // In production use expo-location with proper permissions
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setUserLocation(loc);
            setLocationLoading(false);
            resolve(loc);
          },
          () => {
            // Fallback: Islamabad coordinates
            const fallback = { lat: 33.6844, lng: 73.0479 };
            setUserLocation(fallback);
            setLocationLoading(false);
            resolve(fallback);
          },
        );
      } else {
        const fallback = { lat: 33.6844, lng: 73.0479 };
        setUserLocation(fallback);
        setLocationLoading(false);
        resolve(fallback);
      }
    });
  }, []);

  // ── FE-3: Simulate responder moving toward user ───────────────────────────
  const startResponderSimulation = () => {
    if (!userLocation) return;
    let step = 0;
    const startLat = userLocation.lat + 0.02;
    const startLng = userLocation.lng + 0.02;
    responderPollRef.current = setInterval(() => {
      step += 1;
      const progress = Math.min(step / 20, 1);
      const newLat = startLat + (userLocation.lat - startLat) * progress;
      const newLng = startLng + (userLocation.lng - startLng) * progress;
      const etaMins = Math.max(0, Math.round((1 - progress) * 8));
      setResponderLocation({ lat: newLat, lng: newLng });
      setEta(etaMins > 0 ? `${etaMins} min away` : "Arrived!");
      if (progress >= 1 && responderPollRef.current) {
        clearInterval(responderPollRef.current);
      }
    }, 3000);
  };

  // ── FE-4: Send family/caregiver alert ────────────────────────────────────
  const sendFamilyAlert = async (loc: { lat: number; lng: number } | null) => {
    const contact = userProfile?.emergencyContact;
    if (!contact) return;

    // Extract phone number from "Name — 0300-1234567" format
    const phoneMatch = contact.match(/03\d{2}[-\s]?\d{7}/);
    const name = userProfile?.fullName || "Your family member";
    const locStr = loc
      ? `https://www.openstreetmap.org/?mlat=${loc.lat}&mlon=${loc.lng}&zoom=16`
      : locationNote || "Location not available";
    const emergencyType =
      EMERGENCY_TYPES.find((t) => t.id === selectedType)?.label || "Emergency";
    const msg = [
      "🚨 EMERGENCY ALERT",
      name + " has triggered an SOS for: " + emergencyType,
      "Location: " + locStr,
      "Please respond immediately or call 1122.",
    ].join("\n");

    if (phoneMatch) {
      // Open SMS with pre-filled message to emergency contact
      const smsUrl =
        Platform.OS === "ios"
          ? `sms:${phoneMatch[0]}&body=${encodeURIComponent(msg)}`
          : `sms:${phoneMatch[0]}?body=${encodeURIComponent(msg)}`;

      Linking.openURL(smsUrl).catch(() => {
        // Fallback: WhatsApp
        const waUrl = `whatsapp://send?phone=+92${phoneMatch[0].replace(/^0/, "")}&text=${encodeURIComponent(msg)}`;
        Linking.openURL(waUrl).catch(() =>
          console.warn("Could not open messaging app"),
        );
      });
      setFamilyAlertSent(true);
    }
  };

  // ── SOS Flow ──────────────────────────────────────────────────────────────
  const confirmAndStartSOS = async () => {
    if (!locationNote.trim()) {
      Alert.alert(
        "Add Location Details",
        "Please enter your location or landmark before sending SOS.",
      );
      return;
    }
    const loc = await getLocation();
    setSosActive(true);
    setSosCountdown(5);
    Vibration.vibrate([0, 200, 100, 200]);

    countdownRef.current = setInterval(() => {
      setSosCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          sendEmergencyAlert(loc);
          return 0;
        }
        Vibration.vibrate(100);
        return prev - 1;
      });
    }, 1000);
  };

  const cancelSOS = () => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setSosActive(false);
    setSosCountdown(5);
    Vibration.cancel();
  };

  // ── FE-2: Send emergency with location + health info ─────────────────────
  const sendEmergencyAlert = async (
    loc: { lat: number; lng: number } | null,
  ) => {
    setSending(true);
    const auth = getAuth();
    const user = auth.currentUser;

    try {
      if (socketRef.current?.connected) {
        socketRef.current.emit("EMERGENCY_TRIGGER", {
          patientId: user?.uid || "anonymous",
          patientName: userProfile?.fullName || "Unknown",
          bloodType: userProfile?.bloodType || "Unknown",
          allergies: userProfile?.allergies || "None",
          medicalHistory: userProfile?.medicalHistory || "None",
          emergencyContact: userProfile?.emergencyContact || "Not provided",
          location: loc
            ? { lat: loc.lat, lng: loc.lng, address: locationNote }
            : { address: locationNote },
          mapsLink: loc
            ? `https://www.openstreetmap.org/?mlat=${loc.lat}&mlon=${loc.lng}&zoom=16`
            : null,
          type:
            EMERGENCY_TYPES.find((t) => t.id === selectedType)?.label ||
            "General",
          symptoms: selectedSymptoms,
          triageLevel: triageResult?.level || "UNKNOWN",
          timestamp: new Date().toISOString(),
        });
      }

      // FE-4: Alert family
      await sendFamilyAlert(loc);

      setSosSent(true);
      setSosActive(false);
      setMapVisible(true);
      setActiveTab("map");
      Vibration.vibrate([0, 500, 200, 500, 200, 500]);
      startResponderSimulation();
    } catch (error) {
      Alert.alert("Error", "Could not send alert. Please call 1122 directly.");
    } finally {
      setSending(false);
    }
  };

  const resetSOS = () => {
    setSosSent(false);
    setSosActive(false);
    setSosCountdown(5);
    setFamilyAlertSent(false);
    setResponderLocation(null);
    setEta(null);
    if (responderPollRef.current) clearInterval(responderPollRef.current);
  };

  const callNumber = (number: string) => {
    Linking.openURL(`tel:${number}`).catch(() =>
      Alert.alert("Error", "Could not open phone dialer."),
    );
  };

  const toggleSymptom = (id: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  // ── Tab Bar ───────────────────────────────────────────────────────────────
  const tabs = [
    { id: "triage", label: "Triage", icon: "pulse" as const },
    { id: "sos", label: "SOS", icon: "warning" as const },
    { id: "map", label: "Track", icon: "location" as const },
    { id: "firstaid", label: "First Aid", icon: "medkit" as const },
  ];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Emergency Center</Text>
          <Text style={styles.headerSub}>
            {socketConnected
              ? "🟢 Live emergency network connected"
              : "🔴 Connecting..."}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.callSOSHeaderBtn}
          onPress={() => callNumber("1122")}
        >
          <Ionicons name="call" size={16} color="white" />
          <Text style={styles.callSOSHeaderText}>1122</Text>
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && styles.tabActive]}
            onPress={() => setActiveTab(tab.id as any)}
          >
            <Ionicons
              name={tab.icon}
              size={18}
              color={activeTab === tab.id ? "#D32F2F" : "rgba(255,255,255,0.6)"}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.id && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
            {tab.id === "map" && eta && (
              <View style={styles.etaBadge}>
                <Text style={styles.etaBadgeText}>LIVE</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ══════════════════════════════════════════════════════════════════
            FE-1: SYMPTOM TRIAGE TAB
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "triage" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="pulse" size={20} color="white" />
              <Text style={styles.sectionTitle}>Symptom Triage</Text>
            </View>
            <Text style={styles.sectionSub}>
              Select all symptoms — AI will evaluate severity and recommend
              action
            </Text>

            {/* Symptom Grid */}
            <View style={styles.symptomGrid}>
              {SYMPTOMS.map((symptom) => {
                const selected = selectedSymptoms.includes(symptom.id);
                return (
                  <TouchableOpacity
                    key={symptom.id}
                    style={[
                      styles.symptomChip,
                      selected && {
                        backgroundColor: symptom.color,
                        borderColor: symptom.color,
                      },
                    ]}
                    onPress={() => toggleSymptom(symptom.id)}
                  >
                    <Ionicons
                      name={symptom.icon as any}
                      size={14}
                      color={selected ? "white" : symptom.color}
                    />
                    <Text
                      style={[
                        styles.symptomLabel,
                        selected && { color: "white" },
                      ]}
                    >
                      {symptom.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Triage Result */}
            {triageResult && (
              <View
                style={[
                  styles.triageResult,
                  {
                    backgroundColor: triageResult.bg,
                    borderColor: triageResult.color,
                  },
                ]}
              >
                <View style={styles.triageHeader}>
                  <Ionicons
                    name={triageResult.icon}
                    size={24}
                    color={triageResult.color}
                  />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[
                        styles.triageLevel,
                        { color: triageResult.color },
                      ]}
                    >
                      {triageResult.level} PRIORITY
                    </Text>
                    <Text
                      style={[
                        styles.triageAction,
                        { color: triageResult.color },
                      ]}
                    >
                      → {triageResult.action}
                    </Text>
                  </View>
                </View>
                <Text style={styles.triageDesc}>{triageResult.desc}</Text>
                <View style={styles.triageActions}>
                  {triageResult.callNumber && (
                    <TouchableOpacity
                      style={[
                        styles.triageCallBtn,
                        { backgroundColor: triageResult.color },
                      ]}
                      onPress={() => callNumber(triageResult.callNumber!)}
                    >
                      <Ionicons name="call" size={16} color="white" />
                      <Text style={styles.triageCallText}>
                        Call {triageResult.callNumber}
                      </Text>
                    </TouchableOpacity>
                  )}
                  {triageResult.level === "CRITICAL" && (
                    <TouchableOpacity
                      style={styles.triageSosBtn}
                      onPress={() => setActiveTab("sos")}
                    >
                      <Ionicons name="warning" size={16} color="#D32F2F" />
                      <Text style={styles.triageSosBtnText}>Activate SOS</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {selectedSymptoms.length === 0 && (
              <View style={styles.triagePlaceholder}>
                <Ionicons
                  name="hand-left-outline"
                  size={36}
                  color="rgba(255,255,255,0.3)"
                />
                <Text style={styles.triagePlaceholderText}>
                  Tap your symptoms above to get an instant triage assessment
                </Text>
              </View>
            )}

            {/* Quick Calls */}
            <Text
              style={[styles.sectionTitle, { marginTop: 20, marginBottom: 10 }]}
            >
              Quick Emergency Calls
            </Text>
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
        )}

        {/* ══════════════════════════════════════════════════════════════════
            FE-2: SOS ALERT TAB
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "sos" && (
          <View style={styles.section}>
            {/* Location Input */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="location" size={18} color="#D32F2F" />
                <Text style={styles.cardTitle}>Your Location</Text>
                <TouchableOpacity
                  style={styles.gpsBtn}
                  onPress={async () => {
                    const loc = await getLocation();
                    if (loc) {
                      setLocationNote(
                        `GPS: ${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`,
                      );
                      Alert.alert(
                        "📍 Location Captured",
                        "Your GPS coordinates will be shared with responders.",
                      );
                    }
                  }}
                >
                  {locationLoading ? (
                    <ActivityIndicator size="small" color="#D32F2F" />
                  ) : (
                    <>
                      <Ionicons name="navigate" size={13} color="#D32F2F" />
                      <Text style={styles.gpsBtnText}>Get GPS</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.locationInput}
                placeholder="House no., street, area, or paste maps link..."
                placeholderTextColor="#9E9E9E"
                value={locationNote}
                onChangeText={setLocationNote}
                multiline
              />
              <Text style={styles.inputHint}>
                💡 Tap "Get GPS" for automatic coordinates, or type your address
              </Text>
            </View>

            {/* Health Info Preview (FE-2) */}
            {userProfile && (
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="person" size={18} color="#1565C0" />
                  <Text style={styles.cardTitle}>
                    Health Info Shared with Responders
                  </Text>
                </View>
                <View style={styles.healthInfoGrid}>
                  {[
                    { label: "Name", value: userProfile.fullName },
                    {
                      label: "Blood Type",
                      value: userProfile.bloodType || "Unknown",
                    },
                    {
                      label: "Allergies",
                      value: userProfile.allergies || "None",
                    },
                    {
                      label: "Emergency Contact",
                      value: userProfile.emergencyContact || "Not set",
                    },
                  ].map((item) => (
                    <View key={item.label} style={styles.healthInfoItem}>
                      <Text style={styles.healthInfoLabel}>{item.label}</Text>
                      <Text style={styles.healthInfoValue}>{item.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Emergency Type */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="alert" size={18} color="#F57C00" />
                <Text style={styles.cardTitle}>Emergency Type</Text>
              </View>
              <View style={styles.typeRow}>
                {EMERGENCY_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.typeChip,
                      selectedType === type.id && {
                        backgroundColor: type.color,
                        borderColor: type.color,
                      },
                    ]}
                    onPress={() => !sosActive && setSelectedType(type.id)}
                  >
                    <Ionicons
                      name={type.icon}
                      size={14}
                      color={selectedType === type.id ? "white" : "#666"}
                    />
                    <Text
                      style={[
                        styles.typeChipText,
                        selectedType === type.id && { color: "white" },
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* SOS Button */}
            {!sosSent ? (
              <View style={styles.sosContainer}>
                <Animated.View
                  style={[
                    styles.sosRing,
                    { transform: [{ scale: pulseAnim }] },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.sosButton,
                      sosActive && styles.sosButtonActive,
                    ]}
                    onPress={sosActive ? cancelSOS : confirmAndStartSOS}
                    activeOpacity={0.85}
                  >
                    {sending ? (
                      <ActivityIndicator color="white" size="large" />
                    ) : (
                      <>
                        <Ionicons
                          name={sosActive ? "close" : "warning"}
                          size={44}
                          color="white"
                        />
                        <Text style={styles.sosText}>
                          {sosActive ? `CANCEL (${sosCountdown})` : "SOS"}
                        </Text>
                        <Text style={styles.sosSubText}>
                          {sosActive ? "Tap to cancel" : "Tap to trigger"}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </Animated.View>

                {sosActive && (
                  <View style={styles.countdownBanner}>
                    <Ionicons name="warning" size={16} color="#D32F2F" />
                    <Text style={styles.countdownText}>
                      Sending SOS in {sosCountdown} seconds...
                    </Text>
                  </View>
                )}

                <Text style={styles.sosHint}>
                  SOS sends your GPS, health info and alerts your family
                  instantly
                </Text>
              </View>
            ) : (
              <View style={styles.sentCard}>
                <Ionicons name="checkmark-circle" size={56} color="#2E7D32" />
                <Text style={styles.sentTitle}>🚨 SOS Alert Sent!</Text>
                <Text style={styles.sentType}>
                  {EMERGENCY_TYPES.find((t) => t.id === selectedType)?.label}{" "}
                  Emergency
                </Text>
                {familyAlertSent && (
                  <View style={styles.familyAlertBadge}>
                    <Ionicons name="people" size={14} color="#1565C0" />
                    <Text style={styles.familyAlertText}>
                      Family notified via SMS/WhatsApp
                    </Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.trackBtn}
                  onPress={() => setActiveTab("map")}
                >
                  <Ionicons name="location" size={16} color="white" />
                  <Text style={styles.trackBtnText}>Track Responder</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.callNowBtn}
                  onPress={() => callNumber("1122")}
                >
                  <Ionicons name="call" size={16} color="white" />
                  <Text style={styles.callNowText}>Call 1122 Now</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={resetSOS} style={styles.resetBtn}>
                  <Text style={styles.resetText}>Send Another Alert</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* All Emergency Services */}
            <Text
              style={[styles.sectionTitle, { marginTop: 8, marginBottom: 10 }]}
            >
              All Emergency Services
            </Text>
            {EMERGENCY_SERVICES.map((svc, i) => (
              <View key={i} style={styles.serviceCard}>
                <View
                  style={[
                    styles.serviceIcon,
                    { backgroundColor: svc.color + "18" },
                  ]}
                >
                  <Ionicons name={svc.icon} size={22} color={svc.color} />
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{svc.name}</Text>
                  <Text style={styles.serviceDesc}>{svc.desc}</Text>
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
        )}

        {/* ══════════════════════════════════════════════════════════════════
            FE-3: LIVE RESPONDER MAP TAB
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "map" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="location" size={20} color="white" />
              <Text style={styles.sectionTitle}>Live Responder Tracking</Text>
            </View>

            {/* ETA Banner */}
            {eta && (
              <View style={styles.etaBanner}>
                <View style={styles.etaDot} />
                <Text style={styles.etaText}>Responder is {eta}</Text>
                <Ionicons name="car" size={18} color="#1565C0" />
              </View>
            )}

            {!eta && (
              <View style={styles.mapPlaceholder}>
                <Ionicons
                  name="location-outline"
                  size={40}
                  color="rgba(255,255,255,0.4)"
                />
                <Text style={styles.mapPlaceholderTitle}>
                  No Active Emergency
                </Text>
                <Text style={styles.mapPlaceholderSub}>
                  Send an SOS alert to see responder location in real time
                </Text>
                <TouchableOpacity
                  style={styles.goToSosBtn}
                  onPress={() => setActiveTab("sos")}
                >
                  <Text style={styles.goToSosBtnText}>Go to SOS</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Google Maps WebView */}
            {userLocation && (
              <View style={styles.mapContainer}>
                <WebView
                  source={{
                    html: buildMapHTML(
                      userLocation.lat,
                      userLocation.lng,
                      responderLocation?.lat,
                      responderLocation?.lng,
                    ),
                  }}
                  style={styles.mapWebView}
                  javaScriptEnabled
                  domStorageEnabled
                  originWhitelist={["*"]}
                />
                {responderLocation && (
                  <View style={styles.mapLegend}>
                    <View style={styles.mapLegendRow}>
                      <View
                        style={[styles.mapDot, { backgroundColor: "#D32F2F" }]}
                      />
                      <Text style={styles.mapLegendText}>Your Location</Text>
                    </View>
                    <View style={styles.mapLegendRow}>
                      <View
                        style={[styles.mapDot, { backgroundColor: "#1565C0" }]}
                      />
                      <Text style={styles.mapLegendText}>
                        Responder {eta ? `• ${eta}` : ""}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* Open in Google Maps */}
            {userLocation && (
              <TouchableOpacity
                style={styles.openMapsBtn}
                onPress={() =>
                  Linking.openURL(
                    `https://www.openstreetmap.org/?mlat=${userLocation.lat}&mlon=${userLocation.lng}&zoom=16`,
                  )
                }
              >
                <Ionicons name="map" size={16} color="white" />
                <Text style={styles.openMapsBtnText}>
                  Open in OpenStreetMap
                </Text>
              </TouchableOpacity>
            )}

            {/* Family contact info */}
            {userProfile?.emergencyContact && (
              <View style={styles.familyCard}>
                <View style={styles.cardHeader}>
                  <Ionicons name="people" size={18} color="#1565C0" />
                  <Text style={styles.cardTitle}>Emergency Contact</Text>
                </View>
                <Text style={styles.familyName}>
                  {userProfile.emergencyContact}
                </Text>
                <TouchableOpacity
                  style={styles.smsBtn}
                  onPress={() => {
                    const msg = `I triggered an emergency SOS. My location: ${
                      userLocation
                        ? `https://www.openstreetmap.org/?mlat=${userLocation.lat}&mlon=${userLocation.lng}&zoom=16`
                        : locationNote
                    }`;
                    const phone =
                      userProfile.emergencyContact.match(/03\d{9}/)?.[0];
                    if (phone)
                      Linking.openURL(
                        `sms:${phone}?body=${encodeURIComponent(msg)}`,
                      );
                  }}
                >
                  <Ionicons name="chatbubble" size={14} color="white" />
                  <Text style={styles.smsBtnText}>Send Location via SMS</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            FIRST AID TAB
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === "firstaid" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="medkit" size={20} color="white" />
              <Text style={styles.sectionTitle}>First Aid Guide</Text>
            </View>
            <Text style={styles.sectionSub}>
              Step-by-step while waiting for help
            </Text>
            {FIRST_AID_TIPS.map((tip, i) => (
              <TouchableOpacity
                key={i}
                style={styles.tipCard}
                onPress={() => setExpandedTip(expandedTip === i ? null : i)}
              >
                <View style={styles.tipHeader}>
                  <View
                    style={[styles.tipIcon, { backgroundColor: tip.color }]}
                  >
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
        )}

        {/* Safety Reminder */}
        <View style={styles.reminderCard}>
          <Ionicons name="information-circle" size={18} color="#1565C0" />
          <Text style={styles.reminderText}>
            Only use SOS in real emergencies. False alerts delay help for people
            in genuine need.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <BottomNavBar navigation={navigation} />
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#B71C1C" },
  scroll: { paddingBottom: 40 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 10,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 19, fontWeight: "800", color: "white" },
  headerSub: { fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 1 },
  callSOSHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  callSOSHeaderText: { color: "white", fontWeight: "800", fontSize: 14 },

  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginBottom: 14,
    gap: 6,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 16,
    gap: 3,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  tabActive: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  tabLabel: { fontSize: 10, fontWeight: "600", color: "rgba(255,255,255,0.6)" },
  tabLabelActive: { color: "#D32F2F" },
  etaBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#D32F2F",
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  etaBadgeText: { fontSize: 7, fontWeight: "800", color: "white" },

  section: { paddingHorizontal: 16 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "white" },
  sectionSub: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 14,
    lineHeight: 17,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: { flex: 1, fontSize: 14, fontWeight: "700", color: "#212121" },

  // Triage
  symptomGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  symptomChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.25)",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  symptomLabel: { fontSize: 12, fontWeight: "600", color: "white" },
  triageResult: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 2,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  triageHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
  },
  triageLevel: { fontSize: 16, fontWeight: "900", letterSpacing: 0.5 },
  triageAction: { fontSize: 13, fontWeight: "700", marginTop: 2 },
  triageDesc: {
    fontSize: 13,
    color: "#424242",
    lineHeight: 19,
    marginBottom: 14,
  },
  triageActions: { flexDirection: "row", gap: 10 },
  triageCallBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  triageCallText: { color: "white", fontWeight: "700", fontSize: 14 },
  triageSosBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#D32F2F",
    backgroundColor: "#FFEBEE",
  },
  triageSosBtnText: { color: "#D32F2F", fontWeight: "700", fontSize: 14 },
  triagePlaceholder: { alignItems: "center", paddingVertical: 28, gap: 10 },
  triagePlaceholderText: {
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    fontSize: 13,
    lineHeight: 19,
  },
  quickCallRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  quickCallBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    borderRadius: 16,
    gap: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  quickCallLabel: { fontSize: 10, fontWeight: "700", color: "white" },
  quickCallNumber: { fontSize: 13, fontWeight: "900", color: "white" },

  // SOS
  gpsBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FFEBEE",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  gpsBtnText: { color: "#D32F2F", fontSize: 12, fontWeight: "700" },
  locationInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 54,
    fontSize: 13,
    color: "#333",
    backgroundColor: "#FAFAFA",
  },
  inputHint: { fontSize: 11, color: "#9E9E9E", marginTop: 6 },
  healthInfoGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  healthInfoItem: {
    width: "48%",
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  healthInfoLabel: { fontSize: 10, color: "#9E9E9E", marginBottom: 3 },
  healthInfoValue: { fontSize: 13, fontWeight: "700", color: "#212121" },
  typeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
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
  sosContainer: { alignItems: "center", paddingVertical: 20 },
  sosRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,235,238,0.5)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    borderWidth: 2,
    borderColor: "rgba(255,205,210,0.8)",
  },
  sosButton: {
    width: 144,
    height: 144,
    borderRadius: 72,
    backgroundColor: "#D32F2F",
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
    shadowColor: "#B71C1C",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
  sosButtonActive: { backgroundColor: "#B71C1C" },
  sosText: { fontSize: 20, fontWeight: "900", color: "white", marginTop: 4 },
  sosSubText: { fontSize: 10, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  countdownBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFEBEE",
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
    width: "100%",
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  countdownText: { fontSize: 13, fontWeight: "600", color: "#D32F2F", flex: 1 },
  sosHint: {
    fontSize: 12,
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    lineHeight: 19,
    marginTop: 10,
    paddingHorizontal: 20,
  },
  sentCard: {
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 24,
    padding: 28,
    marginBottom: 16,
    gap: 12,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  sentTitle: { fontSize: 18, fontWeight: "800", color: "#B71C1C" },
  sentType: { fontSize: 13, color: "#666", fontWeight: "600" },
  familyAlertBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#BBDEFB",
  },
  familyAlertText: { fontSize: 12, color: "#1565C0", fontWeight: "600" },
  trackBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#1565C0",
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
    width: "100%",
    justifyContent: "center",
  },
  trackBtnText: { color: "white", fontWeight: "700", fontSize: 14 },
  callNowBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#D32F2F",
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 12,
    width: "100%",
    justifyContent: "center",
  },
  callNowText: { color: "white", fontWeight: "700", fontSize: 14 },
  resetBtn: { paddingVertical: 6 },
  resetText: {
    color: "#9E9E9E",
    fontSize: 13,
    textDecorationLine: "underline",
  },
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
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
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  callBtnText: { fontSize: 11, fontWeight: "700", color: "white" },

  // Map
  etaBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    gap: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.09,
    shadowRadius: 8,
  },
  etaDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2E7D32",
  },
  etaText: { flex: 1, fontSize: 14, fontWeight: "700", color: "#212121" },
  mapContainer: {
    borderRadius: 20,
    overflow: "hidden",
    height: 350,
    marginBottom: 14,
    elevation: 5,
    backgroundColor: "#E0E0E0",
  },
  mapWebView: { flex: 1 },
  mapLegend: {
    position: "absolute",
    bottom: 12,
    left: 12,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 10,
    gap: 6,
    elevation: 4,
  },
  mapLegendRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  mapDot: { width: 10, height: 10, borderRadius: 5 },
  mapLegendText: { fontSize: 12, color: "#424242", fontWeight: "600" },
  mapPlaceholder: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 22,
    padding: 40,
    marginBottom: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  mapPlaceholderTitle: { color: "white", fontSize: 16, fontWeight: "700" },
  mapPlaceholderSub: {
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    fontSize: 13,
    lineHeight: 18,
  },
  goToSosBtn: {
    marginTop: 10,
    backgroundColor: "white",
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 16,
    elevation: 3,
  },
  goToSosBtnText: { color: "#D32F2F", fontWeight: "800", fontSize: 14 },
  openMapsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#1565C0",
    borderRadius: 16,
    paddingVertical: 14,
    marginBottom: 14,
    elevation: 4,
    shadowColor: "#1565C0",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  openMapsBtnText: { color: "white", fontWeight: "700", fontSize: 14 },
  familyCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
  },
  familyName: {
    fontSize: 14,
    color: "#212121",
    fontWeight: "600",
    marginBottom: 12,
  },
  smsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#1565C0",
    borderRadius: 12,
    paddingVertical: 10,
  },
  smsBtnText: { color: "white", fontWeight: "700", fontSize: 13 },

  // First Aid
  tipCard: {
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
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

  reminderCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.13)",
    borderRadius: 18,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  reminderText: { flex: 1, fontSize: 12, color: "white", lineHeight: 18 },
});
