import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  LayoutAnimation,
  Platform,
  UIManager,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  ActivityIndicator,
  Alert,
  StyleSheet,
  Modal,
  Animated,
  Easing,
} from "react-native";
import {
  ChevronLeft,
  Phone,
  PhoneOff,
  Mic,
  MicOff,
  Send,
  Square,
  Volume2,
  Pause,
  Stethoscope,
  ExternalLink,
  PhoneCall,
  Paperclip,
  FileText,
  X,
} from "lucide-react-native";
import { Audio } from "expo-av";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import {
  sendVoiceMessage,
  saveMedicalRecord,
  sendTextMessage,
  getUserProfile,
  fetchMedicalRecords,
  getMyMedicines,
  getWellnessEntries,
  getDoctors,
} from "../../services/api";
import { getAuth } from "@react-native-firebase/auth";
import styles from "./styles/AiAssistantStyles";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const INTRO_MESSAGES = [
  { id: 1, text: "Hello! I am your AI Health Assistant.", isUrdu: false },
  { id: 2, text: "Please select your preferred language!", isUrdu: false },
  { id: 3, text: "اپنی پسند کی زبان منتخب کریں۔", isUrdu: true },
];

const WELCOME_MESSAGES_EN = [
  { id: 101, text: "Hello 👋 I'm your personal health assistant!", isUrdu: false },
  { id: 102, text: "I have loaded your health profile. Ask me anything about your symptoms, medications, or health concerns.", isUrdu: false },
];

const WELCOME_MESSAGES_UR = [
  { id: 101, text: "السلام علیکم! میں آپ کی صحت کا ذاتی معاون ہوں۔", isUrdu: true },
  { id: 102, text: "میں نے آپ کا ہیلتھ پروفائل لوڈ کر لیا ہے۔ اپنی علامات یا صحت کے بارے میں کچھ بھی پوچھیں۔", isUrdu: true },
];

// ── Types ─────────────────────────────────────────────────────────────────────
interface UserProfile {
  name: string;
  age: number | null;
  gender: string | null;
  conditions: string | null;
  allergies: string | null;
  bloodType: string | null;
  weight: number | null;
  height: number | null;
  dateOfBirth: string | null;
  emergencyContact: string | null;
  recentMedicines: string | null;
  recentRecords: string | null;
  recentWellness: string | null;
}

interface AttachedFile {
  name: string;
  uri: string;
  type: string;
  size?: number;
}

interface Message {
  id: number;
  text: string;
  isUser?: boolean;
  isUrdu?: boolean;
  audioUrl?: string;
  isError?: boolean;
  attachedFile?: AttachedFile;
  urgency?: "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";  // ← NEW
}

type CallPhase = "idle" | "ringing" | "connected" | "ai_speaking" | "user_speaking" | "processing";

// ── Doctor Suggestion Card ────────────────────────────────────────────────────
const DoctorSuggestionCard = ({ doctor, onBook }: { doctor: any; onBook: (doctor: any) => void }) => (
  <View style={doctorCardStyles.card}>
    <View style={doctorCardStyles.iconWrap}>
      <Stethoscope size={20} color="#199A8E" />
    </View>
    <View style={doctorCardStyles.info}>
      <Text style={doctorCardStyles.name}>Dr. {doctor.name}</Text>
      <Text style={doctorCardStyles.specialty}>{doctor.specialization}</Text>
      <View style={doctorCardStyles.metaRow}>
        {doctor.experienceYears ? <Text style={doctorCardStyles.meta}>{doctor.experienceYears} yrs exp</Text> : null}
        {doctor.consultationFee ? <Text style={doctorCardStyles.meta}>PKR {doctor.consultationFee}</Text> : null}
      </View>
    </View>
    <TouchableOpacity style={doctorCardStyles.bookBtn} onPress={() => onBook(doctor)}>
      <ExternalLink size={13} color="#FFF" />
      <Text style={doctorCardStyles.bookBtnText}>Book</Text>
    </TouchableOpacity>
  </View>
);

const doctorCardStyles = StyleSheet.create({
  card:      { flexDirection: "row", alignItems: "center", backgroundColor: "#F0FDF4", borderRadius: 14, padding: 12, marginBottom: 8, marginHorizontal: 12, borderWidth: 1, borderColor: "#BBF7D0" },
  iconWrap:  { width: 40, height: 40, borderRadius: 12, backgroundColor: "#D1FAE5", alignItems: "center", justifyContent: "center", marginRight: 12 },
  info:      { flex: 1 },
  name:      { fontSize: 13, fontWeight: "700", color: "#065F46" },
  specialty: { fontSize: 11, color: "#047857", marginTop: 1 },
  metaRow:   { flexDirection: "row", gap: 6, marginTop: 4 },
  meta:      { fontSize: 10, color: "#6B7280", backgroundColor: "#ECFDF5", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  bookBtn:   { backgroundColor: "#199A8E", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, flexDirection: "row", alignItems: "center", gap: 4 },
  bookBtnText: { color: "#FFF", fontSize: 11, fontWeight: "700" },
});

// ── Urgency Badge ─────────────────────────────────────────────────────────────
const UrgencyBadge = ({ urgency }: { urgency: string }) => {
  if (!urgency || urgency === "LOW") return null;
  const config = {
    EMERGENCY: { bg: "#FEE2E2", color: "#DC2626", label: "🚨 EMERGENCY" },
    HIGH:      { bg: "#FEF3C7", color: "#D97706", label: "⚠️ High Urgency" },
    MEDIUM:    { bg: "#FFF7ED", color: "#EA580C", label: "⚡ Medium Urgency" },
  }[urgency] || null;
  if (!config) return null;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: "flex-start", backgroundColor: config.bg }}>
      <Text style={{ fontSize: 11, fontWeight: "800", color: config.color }}>{config.label}</Text>
    </View>
  );
};

// ── Pulse Animation ───────────────────────────────────────────────────────────
const PulseCircle = ({ active, color = "#66CDAA" }: { active: boolean; color?: string }) => {
  const pulse1   = useRef(new Animated.Value(1)).current;
  const pulse2   = useRef(new Animated.Value(1)).current;
  const opacity1 = useRef(new Animated.Value(0.7)).current;
  const opacity2 = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (!active) {
      pulse1.setValue(1); pulse2.setValue(1);
      opacity1.setValue(0.7); opacity2.setValue(0.5);
      return;
    }
    const anim1 = Animated.loop(Animated.sequence([
      Animated.parallel([
        Animated.timing(pulse1,   { toValue: 1.5, duration: 900, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity1, { toValue: 0,   duration: 900, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(pulse1,   { toValue: 1,   duration: 0, useNativeDriver: true }),
        Animated.timing(opacity1, { toValue: 0.7, duration: 0, useNativeDriver: true }),
      ]),
    ]));
    const anim2 = Animated.loop(Animated.sequence([
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(pulse2,   { toValue: 1.8, duration: 900, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(opacity2, { toValue: 0,   duration: 900, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(pulse2,   { toValue: 1,   duration: 0, useNativeDriver: true }),
        Animated.timing(opacity2, { toValue: 0.5, duration: 0, useNativeDriver: true }),
      ]),
    ]));
    anim1.start(); anim2.start();
    return () => { anim1.stop(); anim2.stop(); };
  }, [active]);

  return (
    <View style={{ alignItems: "center", justifyContent: "center", width: 140, height: 140 }}>
      <Animated.View style={{ position: "absolute", width: 140, height: 140, borderRadius: 70, backgroundColor: color, opacity: opacity2, transform: [{ scale: pulse2 }] }} />
      <Animated.View style={{ position: "absolute", width: 120, height: 120, borderRadius: 60, backgroundColor: color, opacity: opacity1, transform: [{ scale: pulse1 }] }} />
    </View>
  );
};

// ── AI Call Modal ─────────────────────────────────────────────────────────────
const AICallModal = ({
  visible, onClose, userName, selectedLanguage, userProfile, availableDoctors, onCallEnd, chatHistory,
}: {
  visible: boolean; onClose: () => void; userName: string; selectedLanguage: string;
  userProfile: UserProfile; availableDoctors: any[]; onCallEnd: (transcript: Message[]) => void;
  chatHistory: { role: string; content: string }[];
}) => {
  const [callPhase, setCallPhase]       = useState<CallPhase>("idle");
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted]           = useState(false);
  const [statusText, setStatusText]     = useState("Calling AI Health Assistant...");
  const [callRecording, setCallRecording] = useState<Audio.Recording | undefined>();
  const [callSound, setCallSound]       = useState<Audio.Sound | null>(null);
  const [callTranscript, setCallTranscript] = useState<Message[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (visible) {
      setCallPhase("ringing"); setCallDuration(0);
      setCallTranscript([]); setIsMuted(false); setStatusText("Ringing...");
      const t = setTimeout(() => {
        setCallPhase("connected");
        setStatusText("Connected — tap Speak to talk");
        startTimer(); speakAIGreeting();
      }, 2500);
      return () => clearTimeout(t);
    } else { resetCall(); }
  }, [visible]);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); if (callSound) callSound.unloadAsync(); };
  }, [callSound]);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
  };
  const resetCall = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCallPhase("idle"); setCallDuration(0);
    setStatusText("Calling AI Health Assistant..."); setIsMuted(false);
  };
  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const speakAIGreeting = async () => {
    setCallPhase("ai_speaking"); setStatusText("AI is greeting you...");
    const greetText = selectedLanguage.includes("ur")
      ? `السلام علیکم ${userName}! میں سیہت اے آئی ہیلتھ اسسٹنٹ ہوں۔ آج آپ کیسا محسوس کر رہے ہیں؟`
      : `Hello ${userName}! I am your Sehat AI Health Assistant. How are you feeling today?`;
    try {
      const response = await sendTextMessage(greetText, selectedLanguage, userProfile, availableDoctors, chatHistory);
      if (response?.audio_url) {
        if (callSound) await callSound.unloadAsync();
        const { sound } = await Audio.Sound.createAsync({ uri: response.audio_url }, { shouldPlay: true }, (status) => {
          if (status.isLoaded && status.didJustFinish) { setCallPhase("connected"); setStatusText("Tap 'Speak' to talk — I'm listening"); }
        });
        setCallSound(sound);
      } else { setCallPhase("connected"); setStatusText("Tap 'Speak' to talk — I'm listening"); }
    } catch { setCallPhase("connected"); setStatusText("Tap 'Speak' to talk — I'm listening"); }
  };

  const startCallRecording = async () => {
    if (isMuted || callPhase !== "connected") return;
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") { Alert.alert("Permission Required", "Please allow microphone access."); return; }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setCallRecording(recording); setCallPhase("user_speaking"); setStatusText("Listening... tap Stop when done");
    } catch (err) { Alert.alert("Error", "Could not start recording."); }
  };

  const stopCallRecording = async () => {
    if (!callRecording) return;
    setCallPhase("processing"); setStatusText("AI is thinking...");
    const rec = callRecording; setCallRecording(undefined);
    try {
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      if (!uri) throw new Error("No URI");
      // ← Pass chatHistory so call also benefits from conversation memory
      const response = await sendVoiceMessage(uri, selectedLanguage, userProfile, availableDoctors, chatHistory);
      if (response?.success) {
        const userMsg: Message = { id: Date.now(), text: `🎤 "${response.user_text}"`, isUser: true };
        setCallTranscript((prev) => [...prev, userMsg]);
        setCallPhase("ai_speaking"); setStatusText("AI is responding...");
        const botMsg: Message = { id: Date.now() + 1, text: response.ai_text, isUser: false, urgency: response.urgency };
        setCallTranscript((prev) => [...prev, botMsg]);
        if (response.audio_url) {
          if (callSound) await callSound.unloadAsync();
          await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
          const { sound } = await Audio.Sound.createAsync({ uri: response.audio_url }, { shouldPlay: true }, (status) => {
            if (status.isLoaded && status.didJustFinish) { setCallPhase("connected"); setStatusText("Tap 'Speak' to talk — I'm listening"); }
          });
          setCallSound(sound);
        } else { setCallPhase("connected"); setStatusText("Tap 'Speak' to talk — I'm listening"); }
      } else { setCallPhase("connected"); setStatusText("Couldn't hear that — tap Speak to try again"); }
    } catch (err: any) {
      setCallPhase("connected");
      setStatusText(err?.message?.includes("Network") ? "⚠️ Server unreachable — check Python server" : "Error — tap Speak to try again");
    }
  };

  const handleEndCall = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (callRecording) { try { await callRecording.stopAndUnloadAsync(); } catch {} }
    if (callSound) { try { await callSound.unloadAsync(); } catch {} }
    onCallEnd(callTranscript); onClose();
  };

  const getPhaseColor = () => ({
    idle: "#66CDAA", ringing: "#66CDAA", connected: "#199A8E", user_speaking: "#EF4444",
    ai_speaking: "#6366F1", processing: "#F59E0B",
  }[callPhase] || "#66CDAA");

  const isCallActive = callPhase !== "idle" && callPhase !== "ringing";

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <SafeAreaView style={callStyles.container}>
        <StatusBar backgroundColor="#0F172A" barStyle="light-content" />
        <View style={callStyles.topSection}>
          <View style={callStyles.callBadge}>
            <View style={callStyles.callBadgeDot} />
            <Text style={callStyles.callBadgeText}>AI HEALTH ASSISTANT</Text>
          </View>
          <Text style={callStyles.callerName}>Sehat AI</Text>
          <Text style={callStyles.callStatus}>{statusText}</Text>
          {isCallActive && (
            <View style={callStyles.timerPill}>
              <Text style={callStyles.timer}>{formatDuration(callDuration)}</Text>
            </View>
          )}
        </View>

        <View style={callStyles.avatarSection}>
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <PulseCircle active={callPhase === "ai_speaking" || callPhase === "ringing"} color={getPhaseColor()} />
            <View style={[callStyles.avatarCircle, { borderColor: getPhaseColor() }]}>
              <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/4712/4712035.png" }} style={callStyles.avatarImage} />
            </View>
          </View>
          {callPhase === "user_speaking" && (
            <View style={callStyles.phaseIndicator}>
              <View style={[callStyles.phaseDot, { backgroundColor: "#EF4444" }]} />
              <Text style={callStyles.phaseText}>Recording your voice...</Text>
            </View>
          )}
          {callPhase === "processing" && (
            <View style={callStyles.phaseIndicator}>
              <ActivityIndicator size="small" color="#F59E0B" />
              <Text style={callStyles.phaseText}>Processing...</Text>
            </View>
          )}
          {callPhase === "ai_speaking" && (
            <View style={callStyles.phaseIndicator}>
              <Volume2 size={16} color="#6366F1" />
              <Text style={callStyles.phaseText}>AI is speaking...</Text>
            </View>
          )}
        </View>

        {callTranscript.length > 0 && (
          <View style={callStyles.transcriptBox}>
            {callTranscript.slice(-2).map((msg) => (
              <Text key={msg.id} style={[callStyles.transcriptText, msg.isUser && callStyles.transcriptUser]} numberOfLines={2}>
                {msg.isUser ? "You: " : "AI: "}{msg.text.replace('🎤 "', "").replace('"', "")}
              </Text>
            ))}
          </View>
        )}

        <View style={callStyles.controlsWrapper}>
          <View style={callStyles.sideControlWrap}>
            <TouchableOpacity style={[callStyles.sideControlBtn, isMuted && callStyles.sideControlBtnActive]} onPress={() => setIsMuted((m) => !m)}>
              {isMuted ? <MicOff size={22} color="#FFF" /> : <Mic size={22} color="#FFF" />}
            </TouchableOpacity>
            <Text style={callStyles.controlLabel}>{isMuted ? "Unmute" : "Mute"}</Text>
          </View>
          <View style={callStyles.endCallWrap}>
            <TouchableOpacity style={callStyles.endCallBtn} onPress={handleEndCall}>
              <PhoneOff size={32} color="#FFF" />
            </TouchableOpacity>
            <Text style={callStyles.endCallLabel}>End Call</Text>
          </View>
          <View style={callStyles.sideControlWrap}>
            <TouchableOpacity
              style={[callStyles.sideControlBtn, callPhase === "user_speaking" && { backgroundColor: "#EF4444" }, (!isCallActive || callPhase === "ai_speaking" || callPhase === "processing") && callStyles.sideControlBtnDisabled]}
              onPress={callPhase === "user_speaking" ? stopCallRecording : startCallRecording}
              disabled={!isCallActive || callPhase === "ai_speaking" || callPhase === "processing"}
            >
              {callPhase === "user_speaking" ? <Square size={22} color="#FFF" fill="#FFF" /> : <Mic size={22} color="#FFF" />}
            </TouchableOpacity>
            <Text style={callStyles.controlLabel}>{callPhase === "user_speaking" ? "Stop" : "Speak"}</Text>
          </View>
        </View>

        <Text style={callStyles.hint}>
          {callPhase === "connected" ? "Tap 'Speak', talk, then tap 'Stop'" : callPhase === "ringing" ? "Connecting to AI Health Assistant..." : ""}
        </Text>
      </SafeAreaView>
    </Modal>
  );
};

const callStyles = StyleSheet.create({
  container:            { flex: 1, backgroundColor: "#0F172A", alignItems: "center", justifyContent: "space-between", paddingVertical: 40 },
  topSection:           { alignItems: "center", marginTop: 10 },
  callBadge:            { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#1E293B", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginBottom: 12 },
  callBadgeDot:         { width: 8, height: 8, borderRadius: 4, backgroundColor: "#22C55E" },
  callBadgeText:        { fontSize: 11, color: "#94A3B8", letterSpacing: 1.5, fontWeight: "600" },
  callerName:           { fontSize: 30, color: "#F1F5F9", fontWeight: "800", marginTop: 2, letterSpacing: 0.5 },
  callStatus:           { fontSize: 15, color: "#66CDAA", marginTop: 6 },
  timerPill:            { backgroundColor: "#1E293B", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 5, marginTop: 10, borderWidth: 1, borderColor: "#334155" },
  timer:                { fontSize: 20, color: "#F1F5F9", fontWeight: "300", letterSpacing: 3 },
  avatarSection:        { alignItems: "center", gap: 20 },
  avatarCircle:         { position: "absolute", width: 100, height: 100, borderRadius: 50, backgroundColor: "#1E293B", borderWidth: 3, alignItems: "center", justifyContent: "center" },
  avatarImage:          { width: 70, height: 70 },
  phaseIndicator:       { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#1E293B", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 60, borderWidth: 1, borderColor: "#334155" },
  phaseDot:             { width: 10, height: 10, borderRadius: 5 },
  phaseText:            { color: "#CBD5E1", fontSize: 13 },
  transcriptBox:        { width: "90%", backgroundColor: "#1E293B", borderRadius: 16, padding: 14, minHeight: 60, borderWidth: 1, borderColor: "#334155" },
  transcriptText:       { color: "#94A3B8", fontSize: 13, marginBottom: 4, lineHeight: 18 },
  transcriptUser:       { color: "#66CDAA" },
  controlsWrapper:      { flexDirection: "row", alignItems: "flex-end", justifyContent: "center", gap: 24, width: "100%", paddingHorizontal: 40 },
  sideControlWrap:      { alignItems: "center", gap: 8 },
  sideControlBtn:       { width: 60, height: 60, borderRadius: 30, backgroundColor: "#334155", alignItems: "center", justifyContent: "center" },
  sideControlBtnActive: { backgroundColor: "#475569" },
  sideControlBtnDisabled: { opacity: 0.35 },
  endCallWrap:          { alignItems: "center", gap: 8 },
  endCallBtn:           { width: 80, height: 80, borderRadius: 40, backgroundColor: "#EF4444", alignItems: "center", justifyContent: "center", shadowColor: "#EF4444", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 10 },
  endCallLabel:         { color: "#EF4444", fontSize: 11, fontWeight: "600" },
  controlLabel:         { color: "#64748B", fontSize: 11 },
  hint:                 { color: "#475569", fontSize: 12, textAlign: "center", paddingHorizontal: 30, lineHeight: 18 },
});

// ── File Attachment Preview ───────────────────────────────────────────────────
const FilePreview = ({ file, onRemove }: { file: AttachedFile; onRemove: () => void }) => (
  <View style={fileStyles.container}>
    <FileText size={16} color="#199A8E" />
    <Text style={fileStyles.name} numberOfLines={1}>{file.name}</Text>
    <TouchableOpacity onPress={onRemove} style={fileStyles.removeBtn}><X size={14} color="#9CA3AF" /></TouchableOpacity>
  </View>
);

const fileStyles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", backgroundColor: "#E0F2F1", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6, marginHorizontal: 12, marginBottom: 6, borderWidth: 1, borderColor: "#99D6D0", gap: 6 },
  name:      { flex: 1, fontSize: 12, color: "#065F46", fontWeight: "500" },
  removeBtn: { padding: 2 },
});

// ── Attach File Menu ──────────────────────────────────────────────────────────
const AttachMenu = ({ visible, onClose, onFilePicked }: { visible: boolean; onClose: () => void; onFilePicked: (file: AttachedFile) => void }) => {
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "*/*", copyToCacheDirectory: true, multiple: false });
      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        onFilePicked({ name: asset.name, uri: asset.uri, type: asset.mimeType || "application/octet-stream", size: asset.size });
      }
    } catch { Alert.alert("Error", "Could not pick file."); }
    onClose();
  };

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permission.status !== "granted") { Alert.alert("Permission Required", "Please allow photo library access."); onClose(); return; }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All, quality: 0.85 });
      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        const name = asset.fileName || `image_${Date.now()}.${asset.type === "video" ? "mp4" : "jpg"}`;
        onFilePicked({ name, uri: asset.uri, type: asset.type === "video" ? "video/mp4" : "image/jpeg" });
      }
    } catch { Alert.alert("Error", "Could not pick image."); }
    onClose();
  };

  const takePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.status !== "granted") { Alert.alert("Permission Required", "Please allow camera access."); onClose(); return; }
      const result = await ImagePicker.launchCameraAsync({ quality: 0.85 });
      if (!result.canceled && result.assets?.[0]) {
        const asset = result.assets[0];
        onFilePicked({ name: `photo_${Date.now()}.jpg`, uri: asset.uri, type: "image/jpeg" });
      }
    } catch { Alert.alert("Error", "Could not open camera."); }
    onClose();
  };

  if (!visible) return null;
  return (
    <View style={attachStyles.overlay}>
      <TouchableOpacity style={attachStyles.backdrop} onPress={onClose} activeOpacity={1} />
      <View style={attachStyles.menu}>
        <Text style={attachStyles.menuTitle}>Attach File</Text>
        <TouchableOpacity style={attachStyles.menuItem} onPress={pickDocument}>
          <View style={[attachStyles.menuIcon, { backgroundColor: "#EEF2FF" }]}><FileText size={20} color="#6366F1" /></View>
          <View><Text style={attachStyles.menuLabel}>Document</Text><Text style={attachStyles.menuSub}>PDF, Word, Excel, any file</Text></View>
        </TouchableOpacity>
        <TouchableOpacity style={attachStyles.menuItem} onPress={pickImage}>
          <View style={[attachStyles.menuIcon, { backgroundColor: "#FFF7ED" }]}><Paperclip size={20} color="#F59E0B" /></View>
          <View><Text style={attachStyles.menuLabel}>Photo / Video</Text><Text style={attachStyles.menuSub}>From your gallery</Text></View>
        </TouchableOpacity>
        <TouchableOpacity style={attachStyles.menuItem} onPress={takePhoto}>
          <View style={[attachStyles.menuIcon, { backgroundColor: "#F0FDF4" }]}><Phone size={20} color="#22C55E" /></View>
          <View><Text style={attachStyles.menuLabel}>Camera</Text><Text style={attachStyles.menuSub}>Take a photo now</Text></View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const attachStyles = StyleSheet.create({
  overlay:   { position: "absolute", bottom: 0, left: 0, right: 0, top: 0, zIndex: 100, justifyContent: "flex-end" },
  backdrop:  { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.3)" },
  menu:      { backgroundColor: "#FFF", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36, shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 10 },
  menuTitle: { fontSize: 16, fontWeight: "700", color: "#1C2A3A", marginBottom: 16, textAlign: "center" },
  menuItem:  { flexDirection: "row", alignItems: "center", gap: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  menuIcon:  { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  menuLabel: { fontSize: 14, fontWeight: "600", color: "#1C2A3A" },
  menuSub:   { fontSize: 12, color: "#9CA3AF", marginTop: 1 },
});

// ── Main Component ────────────────────────────────────────────────────────────
export default ({ navigation, route }: any) => {
  useEffect(() => {
    const prefillText = route?.params?.prefill;
    if (prefillText && typeof prefillText === "string") {
      setInputText(prefillText);
      setChatState("active_chat");
    }
  }, []);

  const [messages, setMessages]               = useState<Message[]>([]);
  const [isTyping, setIsTyping]               = useState(false);
  const [chatState, setChatState]             = useState<"intro" | "language_selection" | "active_chat">("intro");
  const [inputText, setInputText]             = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");
  const [recording, setRecording]             = useState<Audio.Recording | undefined>();
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const [playingSound, setPlayingSound]       = useState<Audio.Sound | null>(null);
  const [activeAudioUrl, setActiveAudioUrl]   = useState<string | null>(null);
  const [isPlaying, setIsPlaying]             = useState(false);
  const [callModalVisible, setCallModalVisible] = useState(false);
  const [dbUserId, setDbUserId]               = useState<number | null>(null);
  const [profileLoaded, setProfileLoaded]     = useState(false);
  const [availableDoctors, setAvailableDoctors] = useState<any[]>([]);
  const [suggestedDoctors, setSuggestedDoctors] = useState<any[]>([]);
  const [attachMenuVisible, setAttachMenuVisible] = useState(false);
  const [pendingFile, setPendingFile]         = useState<AttachedFile | null>(null);
  // ── NEW: conversation history so AI remembers previous messages ───────────
  const [chatHistory, setChatHistory]         = useState<{ role: string; content: string }[]>([]);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile>({
    name: "User", age: null, gender: null, conditions: null, allergies: null,
    bloodType: null, weight: null, height: null, dateOfBirth: null,
    emergencyContact: null, recentMedicines: null, recentRecords: null, recentWellness: null,
  });

  const scrollViewRef = useRef<ScrollView>(null);
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    const fetchUserProfile = async () => {
      const auth = getAuth();
      if (!auth.currentUser) return;
      try {
        const profile = await getUserProfile(auth.currentUser.uid);
        if (!profile) return;
        if (profile.id) setDbUserId(profile.id);

        const [medicines, records, wellness] = await Promise.allSettled([
          getMyMedicines(),
          fetchMedicalRecords(profile.id),
          getWellnessEntries(undefined, 20),
        ]);

        let recentMedicines: string | null = null;
        if (medicines.status === "fulfilled" && medicines.value?.length > 0)
          recentMedicines = medicines.value.slice(0, 5).map((m: any) => `${m.name} ${m.dose}${m.unit} (${m.freq})`).join(", ");

        let recentRecords: string | null = null;
        if (records.status === "fulfilled" && records.value?.length > 0)
          recentRecords = records.value.slice(0, 5).map((r: any) => `[${r.record_type}] ${r.title} on ${r.record_date}`).join(" | ");

        let recentWellness: string | null = null;
        if (wellness.status === "fulfilled" && wellness.value?.length > 0) {
          const wellnessMap: Record<string, number> = {};
          wellness.value.forEach((w: any) => { wellnessMap[w.type] = (wellnessMap[w.type] || 0) + 1; });
          recentWellness = Object.entries(wellnessMap).map(([type, count]) => `${type} (${count}x)`).join(", ");
        }

        setCurrentUserProfile({
          name: profile.fullName || "User", age: profile.age || null,
          gender: profile.gender || null, conditions: profile.medicalHistory || null,
          allergies: profile.allergies || null, bloodType: profile.bloodType || null,
          weight: profile.weight || null, height: profile.height || null,
          dateOfBirth: profile.dateOfBirth || null, emergencyContact: profile.emergencyContact || null,
          recentMedicines, recentRecords, recentWellness,
        });
        setProfileLoaded(true);

        try {
          const doctorList = await getDoctors(undefined);
          if (Array.isArray(doctorList)) {
            setAvailableDoctors(
              doctorList.filter((d: any) => d.availabilityStatus !== false).map((d: any) => ({
                id: String(d.id),
                name: d.user?.fullName || d.user?.name || "Doctor",
                specialization: d.specialization,
                experienceYears: d.experienceYears,
                consultationFee: d.consultationFee,
                availabilityStatus: d.availabilityStatus,
                bio: d.bio || "",
              }))
            );
          }
        } catch (e) { console.warn("Could not load doctors:", e); }
      } catch (e) { console.warn("Could not load profile:", e); setProfileLoaded(true); }
    };
    fetchUserProfile();
    runIntro();
  }, []);

  useEffect(() => {
    return () => { if (playingSound) playingSound.unloadAsync(); };
  }, [playingSound]);

  const runIntro = async () => {
    setIsTyping(true);
    await delay(1000);
    for (const msg of INTRO_MESSAGES) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setMessages((prev) => [...prev, msg]);
      scrollViewRef.current?.scrollToEnd({ animated: true });
      if (msg.id !== INTRO_MESSAGES.length) { setIsTyping(true); await delay(1200); }
    }
    setIsTyping(false);
    setChatState("language_selection");
  };

  const handleLanguageSelect = async (lang: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMessages([]); setChatState("active_chat");
    const langCode = lang === "Urdu" ? "ur-PK" : "en-US";
    setSelectedLanguage(langCode);
    setIsTyping(true);
    await delay(800);
    const welcomePack = lang === "Urdu" ? WELCOME_MESSAGES_UR : WELCOME_MESSAGES_EN;
    for (const msg of welcomePack) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
      setMessages((prev) => [...prev, msg]);
      await delay(1000);
    }
    if (profileLoaded && currentUserProfile.name !== "User") {
      await delay(500);
      setMessages((prev) => [...prev, {
        id: Date.now(),
        text: lang === "Urdu"
          ? `${currentUserProfile.name}، میں آپ کی صحت کی تاریخ سے واقف ہوں۔`
          : `I can see your profile, ${currentUserProfile.name}. I'll give you personalized advice based on your full health history.`,
        isUrdu: lang === "Urdu",
      }]);
    }
    setIsTyping(false);
  };

  const addErrorMessage = (text: string) => {
    setMessages((prev) => [...prev, { id: Date.now(), text, isUser: false, isError: true }]);
  };

  const saveToHistory = (userText: string, aiText: string, type: "Text" | "Voice" | "Call") => {
    if (!dbUserId) return;
    saveMedicalRecord({
      userId: dbUserId, title: `${type} Consultation`,
      doctor_name: "Sehat AI Assistant",
      record_date: new Date().toISOString().split("T")[0],
      record_type: "AI Consultation",
      details: `User: ${userText}\nAI: ${aiText}`,
      color_code: type === "Call" ? "#EDE9FE" : "#FEF9C3",
    }).catch((err) => console.warn("Save record error:", err));
  };

  // ── FIX: Book button goes directly to that doctor's details/booking screen
  const handleBookDoctor = (doctor: any) => navigation.navigate("DoctorDetails", { doctor });

  // ── Send text message with conversation history ───────────────────────────
  const handleSend = async () => {
    if (!inputText.trim() && !pendingFile) return;
    const textToSend = inputText.trim();
    const fileToSend = pendingFile;
    const displayText = fileToSend
      ? textToSend ? `${textToSend}\n📎 ${fileToSend.name}` : `📎 ${fileToSend.name}`
      : textToSend;

    setMessages((prev) => [...prev, { id: Date.now(), text: displayText, isUser: true, attachedFile: fileToSend || undefined }]);
    setSuggestedDoctors([]);
    setInputText(""); setPendingFile(null);
    Keyboard.dismiss(); setIsTyping(true);

    const queryText = textToSend || (fileToSend ? `I have attached a file: ${fileToSend.name}. Please help me with this.` : "");

    try {
      // ← Pass chatHistory for conversation memory
      const response = await sendTextMessage(queryText, selectedLanguage, currentUserProfile, availableDoctors, chatHistory);
      setIsTyping(false);
      if (response?.success) {
        const aiMsg: Message = {
          id: Date.now() + 1,
          text: response.ai_text,
          isUser: false,
          audioUrl: response.audio_url,
          urgency: response.urgency,   // ← NEW: store urgency on message
        };
        setMessages((prev) => [...prev, aiMsg]);
        // ← Update history for next turn
        setChatHistory((prev) => [
          ...prev,
          { role: "user",      content: queryText },
          { role: "assistant", content: response.ai_text },
        ]);
        saveToHistory(queryText, response.ai_text, "Text");
        if (response.suggested_doctors?.length > 0) setSuggestedDoctors(response.suggested_doctors);
      } else {
        addErrorMessage("I couldn't process that. Please try again.");
      }
    } catch (error: any) {
      setIsTyping(false);
      addErrorMessage(error?.message?.includes("Network")
        ? "⚠️ Cannot reach AI service. Make sure the Python server is running on port 5001."
        : "Something went wrong. Please try again."
      );
    }
  };

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Microphone Permission Required", "Please allow microphone access in your phone settings.");
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (err) {
      Alert.alert("Error", "Could not start voice recording. Please check microphone permissions.");
    }
  };

  // ── Stop recording and send with conversation history ─────────────────────
  const stopRecording = async () => {
    if (!recording) return;
    setRecording(undefined); setVoiceProcessing(true); setSuggestedDoctors([]);
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) throw new Error("No audio URI");
      // ← Pass chatHistory so voice also benefits from conversation memory
      const response = await sendVoiceMessage(uri, selectedLanguage, currentUserProfile, availableDoctors, chatHistory);
      if (response?.success) {
        setMessages((prev) => [...prev, { id: Date.now(), text: `🎤 "${response.user_text}"`, isUser: true }]);
        setIsTyping(true);
        await delay(500);
        setIsTyping(false);
        const aiMsg: Message = {
          id: Date.now() + 1,
          text: response.ai_text,
          isUser: false,
          audioUrl: response.audio_url,
          urgency: response.urgency,   // ← NEW
        };
        setMessages((prev) => [...prev, aiMsg]);
        // ← Update history
        setChatHistory((prev) => [
          ...prev,
          { role: "user",      content: response.user_text },
          { role: "assistant", content: response.ai_text },
        ]);
        saveToHistory(response.user_text, response.ai_text, "Voice");
        if (response.suggested_doctors?.length > 0) setSuggestedDoctors(response.suggested_doctors);
        if (response.audio_url) playSound(response.audio_url);
      } else {
        addErrorMessage("I couldn't understand the audio. Please try speaking again more clearly.");
      }
    } catch (error: any) {
      addErrorMessage(error?.message?.includes("Network")
        ? "⚠️ Cannot reach AI service. Make sure the Python server is running on port 5001."
        : "Could not process your voice message. Please try again."
      );
    } finally { setVoiceProcessing(false); }
  };

  const playSound = async (url: string) => {
    try {
      if (activeAudioUrl === url && playingSound) {
        if (isPlaying) { await playingSound.pauseAsync(); setIsPlaying(false); }
        else           { await playingSound.playAsync();  setIsPlaying(true);  }
        return;
      }
      if (playingSound) { await playingSound.unloadAsync(); setPlayingSound(null); setIsPlaying(false); }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: true }, (status) => {
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying);
          if (status.didJustFinish) { setIsPlaying(false); setActiveAudioUrl(null); }
        }
      });
      setPlayingSound(sound); setActiveAudioUrl(url); setIsPlaying(true);
    } catch (error) { console.warn("Audio playback error:", error); }
  };

  const handleCallAI = () => {
    if (chatState !== "active_chat") {
      Alert.alert("Select Language First", "Please select your preferred language before starting a call.");
      return;
    }
    setCallModalVisible(true);
  };

  const handleCallEnd = (transcript: Message[]) => {
    if (transcript.length > 0) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), text: `📞 AI Call ended (${transcript.length} exchanges). Transcript below:`, isUser: false },
        ...transcript,
      ]);
      const userMsg = transcript.find((m) => m.isUser);
      const aiMsg   = transcript.find((m) => !m.isUser);
      if (userMsg && aiMsg) saveToHistory(userMsg.text, aiMsg.text, "Call");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#66CDAA" barStyle="dark-content" />

      <AttachMenu visible={attachMenuVisible} onClose={() => setAttachMenuVisible(false)} onFilePicked={(file) => setPendingFile(file)} />

      {/* ← Pass chatHistory to call modal so call conversation also has memory */}
      <AICallModal
        visible={callModalVisible}
        onClose={() => setCallModalVisible(false)}
        userName={currentUserProfile.name}
        selectedLanguage={selectedLanguage}
        userProfile={currentUserProfile}
        availableDoctors={availableDoctors}
        onCallEnd={handleCallEnd}
        chatHistory={chatHistory}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft color="#1C2A3A" size={28} />
          </TouchableOpacity>
          <View style={styles.headerAvatarContainer}>
            <View style={styles.headerAvatar}>
              <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/4712/4712035.png" }} style={{ width: 40, height: 40 }} />
            </View>
            <View style={styles.onlineBadge} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>AI Health Assistant</Text>
            <Text style={styles.headerSubtitle}>
              {voiceProcessing ? "🎤 Processing voice..." : isTyping ? "Typing..." : profileLoaded && currentUserProfile.name !== "User" ? `Hi, ${currentUserProfile.name}` : "Online 24/7"}
            </Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={handleCallAI} style={headerCallStyles.callBtn} activeOpacity={0.85}>
            <View style={headerCallStyles.callIconCircle}><PhoneCall color="#FFF" size={16} /></View>
            <Text style={headerCallStyles.callBtnText}>Call AI</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.contentContainerStyle}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {/* Bot Avatar */}
          <View style={styles.largeBotContainer}>
            <View style={styles.largeBotCircle}>
              <View style={styles.innerBotCircle}>
                <Image source={{ uri: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png" }} style={styles.botImage} resizeMode="contain" />
              </View>
            </View>
            <TouchableOpacity style={headerCallStyles.avatarCallBtn} onPress={handleCallAI}>
              <View style={headerCallStyles.avatarCallIconCircle}><Phone size={14} color="#FFF" /></View>
              <Text style={headerCallStyles.avatarCallBtnText}>Tap to call AI</Text>
            </TouchableOpacity>
          </View>

          {/* Messages */}
          {messages.map((msg) => (
            <View key={msg.id} style={msg.isUser ? styles.userMessageWrapper : styles.messageWrapper}>
              {/* ── NEW: Urgency badge on AI messages ── */}
              {!msg.isUser && msg.urgency && <UrgencyBadge urgency={msg.urgency} />}
              <Text style={[
                msg.isUser ? styles.userMessageText : styles.messageText,
                msg.isUrdu && styles.urduText,
                msg.isError && { color: "#EF4444", fontStyle: "italic" },
              ]}>
                {msg.text}
              </Text>
              {!msg.isUser && msg.audioUrl && (
                <TouchableOpacity onPress={() => playSound(msg.audioUrl!)} style={{ marginTop: 5, alignSelf: "flex-start", padding: 4 }}>
                  {activeAudioUrl === msg.audioUrl && isPlaying ? <Pause size={18} color="#199A8E" /> : <Volume2 size={18} color="#199A8E" />}
                </TouchableOpacity>
              )}
            </View>
          ))}

          {/* Doctor Suggestions */}
          {suggestedDoctors.length > 0 && (
            <View style={{ marginTop: 8, marginBottom: 4 }}>
              <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 14, marginBottom: 8 }}>
                <Stethoscope size={13} color="#199A8E" />
                <Text style={{ marginLeft: 6, fontSize: 12, fontWeight: "700", color: "#199A8E" }}>Recommended Doctors</Text>
              </View>
              {suggestedDoctors.map((doc: any) => (
                <DoctorSuggestionCard key={doc.id} doctor={doc} onBook={handleBookDoctor} />
              ))}
            </View>
          )}

          {/* Typing Indicator */}
          {(isTyping || voiceProcessing) && (
            <View style={styles.typingContainer}>
              {voiceProcessing ? <ActivityIndicator size="small" color="#199A8E" /> : (
                <>
                  <View style={[styles.dot, { backgroundColor: "#9CA3AF" }]} />
                  <View style={[styles.dot, { backgroundColor: "#6B7280" }]} />
                  <View style={[styles.dot, { backgroundColor: "#374151" }]} />
                </>
              )}
            </View>
          )}
        </ScrollView>

        {/* Language Selection */}
        {chatState === "language_selection" && (
          <View style={styles.footer}>
            <TouchableOpacity style={styles.languageButton} onPress={() => handleLanguageSelect("English")}>
              <Text style={styles.languageButtonText}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.languageButton} onPress={() => handleLanguageSelect("Urdu")}>
              <Text style={styles.languageButtonText}>اردو</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input Bar */}
        {chatState === "active_chat" && (
          <View>
            {pendingFile && <FilePreview file={pendingFile} onRemove={() => setPendingFile(null)} />}
            <View style={styles.inputContainer}>
              <TouchableOpacity
                style={[styles.inputIcon, recording && { backgroundColor: "#fee2e2", borderRadius: 20 }, voiceProcessing && { opacity: 0.5 }]}
                onPress={recording ? stopRecording : startRecording}
                disabled={voiceProcessing}
              >
                {voiceProcessing ? <ActivityIndicator size="small" color="#199A8E" /> : recording ? <Square color="#EF4444" size={24} fill="#EF4444" /> : <Mic color="#199A8E" size={24} />}
              </TouchableOpacity>
              <TextInput
                style={styles.inputField}
                placeholder={voiceProcessing ? "⏳ Processing voice..." : recording ? "🔴 Recording... tap ■ to stop" : "Type or tap 🎤 to speak..."}
                placeholderTextColor="#9CA3AF"
                value={inputText}
                onChangeText={setInputText}
                multiline
                editable={!recording && !voiceProcessing}
                onSubmitEditing={handleSend}
              />
              {inputText.length === 0 && !pendingFile ? (
                <TouchableOpacity style={[styles.inputIcon, attachMenuVisible && { backgroundColor: "#E0F2F1", borderRadius: 20 }]} onPress={() => setAttachMenuVisible(true)} disabled={voiceProcessing}>
                  <Paperclip color="#199A8E" size={22} />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={handleSend} style={styles.inputIcon}>
                  <Send color="#199A8E" size={24} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const headerCallStyles = StyleSheet.create({
  callBtn:             { flexDirection: "row", alignItems: "center", backgroundColor: "#199A8E", paddingRight: 14, paddingLeft: 6, paddingVertical: 6, borderRadius: 22, gap: 8, shadowColor: "#199A8E", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.4, shadowRadius: 6, elevation: 4 },
  callIconCircle:      { width: 30, height: 30, borderRadius: 15, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  callBtnText:         { color: "#FFF", fontSize: 13, fontWeight: "700", letterSpacing: 0.3 },
  avatarCallBtn:       { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12, backgroundColor: "#199A8E", paddingHorizontal: 16, paddingVertical: 9, borderRadius: 22, shadowColor: "#199A8E", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 6, elevation: 4 },
  avatarCallIconCircle:{ width: 26, height: 26, borderRadius: 13, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" },
  avatarCallBtnText:   { color: "#FFF", fontSize: 13, fontWeight: "700" },
});