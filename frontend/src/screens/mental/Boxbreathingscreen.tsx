import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const PHASES = ["Inhale", "Hold", "Exhale", "Hold"];
const PHASE_DURATIONS = [4, 4, 4, 4];
const PHASE_INSTRUCTIONS = [
  "Breathe in slowly through your nose",
  "Hold — keep lungs full",
  "Breathe out slowly through your mouth",
  "Hold — keep lungs empty",
];

const BENEFITS = [
  "Improves focus and performance",
  "Used by Navy SEALs to stay calm",
  "Reduces stress hormones",
  "Balances the nervous system",
];

const STEPS = [
  "Sit upright in a comfortable chair or position",
  "Exhale all air from your lungs",
  "Inhale through your nose counting to 4",
  "Hold your breath counting to 4",
  "Exhale through your mouth counting to 4",
  "Hold your breath counting to 4",
  "Repeat for 4 rounds minimum",
];

// Box corners: top-left, top-right, bottom-right, bottom-left
const BOX_LABELS = ["↑ Inhale", "Hold →", "↓ Exhale", "← Hold"];

function BoxBreathingScreen({ navigation }: { navigation: any }) {
  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [count, setCount] = useState(PHASE_DURATIONS[0]);
  const [cycles, setCycles] = useState(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef(0);
  const countRef = useRef(PHASE_DURATIONS[0]);

  const pulseOnPhaseChange = () => {
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1.08, duration: 200, useNativeDriver: true }),
      Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  const startBreathing = () => {
    setIsRunning(true);
    phaseRef.current = 0;
    countRef.current = PHASE_DURATIONS[0];
    setPhaseIndex(0);
    setCount(PHASE_DURATIONS[0]);

    intervalRef.current = setInterval(() => {
      countRef.current -= 1;
      if (countRef.current <= 0) {
        const nextPhase = (phaseRef.current + 1) % PHASES.length;
        if (nextPhase === 0) setCycles(c => c + 1);
        phaseRef.current = nextPhase;
        countRef.current = PHASE_DURATIONS[nextPhase];
        setPhaseIndex(nextPhase);
        pulseOnPhaseChange();
      }
      setCount(countRef.current);
    }, 1000);
  };

  const stopBreathing = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhaseIndex(0);
    setCount(PHASE_DURATIONS[0]);
  };

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const PHASE_COLORS = ["#4FC3F7", "#CE93D8", "#80CBC4", "#FFB74D"];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Box Breathing</Text>
            <Text style={styles.headerSub}>4-4-4-4 Navy SEAL technique</Text>
          </View>
          <View style={styles.cycleBadge}>
            <Text style={styles.cycleText}>{cycles} cycles</Text>
          </View>
        </View>

        {/* Box Visual */}
        <View style={styles.boxContainer}>
          {/* The box */}
          <Animated.View style={[styles.box, { transform: [{ scale: pulseAnim }] }]}>
            {/* Top edge — Inhale */}
            <View style={[styles.boxEdge, styles.boxTop, phaseIndex === 0 && styles.boxEdgeActive]} />
            {/* Right edge — Hold after inhale */}
            <View style={[styles.boxEdge, styles.boxRight, phaseIndex === 1 && styles.boxEdgeActive]} />
            {/* Bottom edge — Exhale */}
            <View style={[styles.boxEdge, styles.boxBottom, phaseIndex === 2 && styles.boxEdgeActive]} />
            {/* Left edge — Hold after exhale */}
            <View style={[styles.boxEdge, styles.boxLeft, phaseIndex === 3 && styles.boxEdgeActive]} />

            {/* Center info */}
            <View style={styles.boxCenter}>
              <Text style={[styles.boxPhaseText, { color: PHASE_COLORS[phaseIndex] }]}>
                {PHASES[phaseIndex]}
              </Text>
              <Text style={styles.boxCountText}>{count}</Text>
            </View>
          </Animated.View>

          {/* Corner labels */}
          <Text style={[styles.cornerLabel, styles.cornerTL, phaseIndex === 0 && styles.cornerLabelActive]}>
            Inhale ↑
          </Text>
          <Text style={[styles.cornerLabel, styles.cornerTR, phaseIndex === 1 && styles.cornerLabelActive]}>
            → Hold
          </Text>
          <Text style={[styles.cornerLabel, styles.cornerBR, phaseIndex === 2 && styles.cornerLabelActive]}>
            ↓ Exhale
          </Text>
          <Text style={[styles.cornerLabel, styles.cornerBL, phaseIndex === 3 && styles.cornerLabelActive]}>
            Hold ←
          </Text>
        </View>

        {/* Instruction */}
        <View style={styles.instructionBox}>
          <Ionicons name="information-circle-outline" size={18} color="#C8EAE6" />
          <Text style={styles.instructionText}>{PHASE_INSTRUCTIONS[phaseIndex]}</Text>
        </View>

        {/* Controls */}
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={[styles.controlBtn, isRunning && styles.controlBtnStop]}
            onPress={isRunning ? stopBreathing : startBreathing}
          >
            <Ionicons name={isRunning ? "stop" : "play"} size={28} color="white" />
            <Text style={styles.controlBtnText}>{isRunning ? "Stop" : "Begin"}</Text>
          </TouchableOpacity>
        </View>

        {/* Benefits */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Benefits</Text>
          {BENEFITS.map((b, i) => (
            <View key={i} style={styles.benefitRow}>
              <View style={[styles.dot, { backgroundColor: PHASE_COLORS[i % PHASE_COLORS.length] }]} />
              <Text style={styles.benefitText}>{b}</Text>
            </View>
          ))}
        </View>

        {/* How to */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How to Practice</Text>
          {STEPS.map((s, i) => (
            <View key={i} style={styles.stepRow}>
              <View style={styles.stepNum}>
                <Text style={styles.stepNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.stepText}>{s}</Text>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

export default BoxBreathingScreen;

const BOX_SIZE = 180;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#4A6FA5" },
  scrollContent: { paddingBottom: 40 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "white" },
  headerSub: { fontSize: 12, color: "#C8D8F0", marginTop: 2 },
  cycleBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  cycleText: { fontSize: 12, fontWeight: "700", color: "white" },

  boxContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 280,
    position: "relative",
    marginBottom: 8,
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  boxEdge: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 4,
  },
  boxEdgeActive: { backgroundColor: "#4FC3F7" },
  boxTop: { top: 0, left: 0, right: 0, height: 4 },
  boxBottom: { bottom: 0, left: 0, right: 0, height: 4 },
  boxLeft: { top: 0, left: 0, bottom: 0, width: 4 },
  boxRight: { top: 0, right: 0, bottom: 0, width: 4 },
  boxCenter: { alignItems: "center" },
  boxPhaseText: { fontSize: 15, fontWeight: "700" },
  boxCountText: { fontSize: 56, fontWeight: "800", color: "white", lineHeight: 64 },

  cornerLabel: {
    position: "absolute",
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.45)",
  },
  cornerLabelActive: { color: "white", fontWeight: "800" },
  cornerTL: { top: 32, left: 52 },
  cornerTR: { top: 32, right: 52 },
  cornerBL: { bottom: 32, left: 52 },
  cornerBR: { bottom: 32, right: 52 },

  instructionBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: "rgba(0,0,0,0.15)",
    borderRadius: 12,
    padding: 12,
  },
  instructionText: { fontSize: 13, color: "#E3EAF8", flex: 1 },

  controlRow: { alignItems: "center", marginBottom: 24 },
  controlBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
  },
  controlBtnStop: { backgroundColor: "rgba(229,57,53,0.35)", borderColor: "rgba(229,57,53,0.5)" },
  controlBtnText: { fontSize: 16, fontWeight: "700", color: "white" },

  card: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 18,
    elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#212121", marginBottom: 14 },
  benefitRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  dot: { width: 7, height: 7, borderRadius: 4, marginRight: 10 },
  benefitText: { fontSize: 13, color: "#424242", flex: 1 },
  stepRow: { flexDirection: "row", marginBottom: 12, gap: 12 },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4A6FA5",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  stepNumText: { fontSize: 11, fontWeight: "800", color: "white" },
  stepText: { fontSize: 13, color: "#424242", flex: 1, lineHeight: 20 },
});