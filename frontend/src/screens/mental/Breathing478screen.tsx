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

const PHASES = ["Inhale", "Hold", "Exhale"];
const PHASE_DURATIONS = [4, 7, 8];
const PHASE_INSTRUCTIONS = [
  "Breathe in slowly through your nose",
  "Hold your breath gently",
  "Exhale completely through your mouth",
];

const BENEFITS = [
  "Reduces anxiety and stress quickly",
  "Helps fall asleep faster",
  "Manages food cravings",
  "Controls anger responses",
];

const STEPS = [
  "Place the tip of your tongue on the ridge behind your upper front teeth",
  "Exhale completely through your mouth making a whoosh sound",
  "Close your mouth and inhale through your nose for 4 counts",
  "Hold your breath for 7 counts",
  "Exhale completely through your mouth for 8 counts",
  "Repeat the cycle 3-4 times",
];

function Breathing478Screen({ navigation }: { navigation: any }) {
  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [count, setCount] = useState(PHASE_DURATIONS[0]);
  const [cycles, setCycles] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef(0);
  const countRef = useRef(PHASE_DURATIONS[0]);

  const animateCircle = (phase: string) => {
    if (phase === "Inhale") {
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 1.4, duration: 4000, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 4000, useNativeDriver: true }),
      ]).start();
    } else if (phase === "Hold") {
      Animated.timing(opacityAnim, { toValue: 0.85, duration: 300, useNativeDriver: true }).start();
    } else if (phase === "Exhale") {
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 1, duration: 8000, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0.6, duration: 8000, useNativeDriver: true }),
      ]).start();
    }
  };

  const startBreathing = () => {
    setIsRunning(true);
    phaseRef.current = 0;
    countRef.current = PHASE_DURATIONS[0];
    setPhaseIndex(0);
    setCount(PHASE_DURATIONS[0]);
    animateCircle(PHASES[0]);

    intervalRef.current = setInterval(() => {
      countRef.current -= 1;
      if (countRef.current <= 0) {
        const nextPhase = (phaseRef.current + 1) % PHASES.length;
        if (nextPhase === 0) setCycles(c => c + 1);
        phaseRef.current = nextPhase;
        countRef.current = PHASE_DURATIONS[nextPhase];
        setPhaseIndex(nextPhase);
        animateCircle(PHASES[nextPhase]);
      }
      setCount(countRef.current);
    }, 1000);
  };

  const stopBreathing = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 0.6, duration: 500, useNativeDriver: true }),
    ]).start();
    setPhaseIndex(0);
    setCount(PHASE_DURATIONS[0]);
  };

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const phaseColors = ["#4FC3F7", "#CE93D8", "#80CBC4"];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>4-7-8 Breathing</Text>
            <Text style={styles.headerSub}>Relaxation & sleep technique</Text>
          </View>
          <View style={styles.cycleBadge}>
            <Text style={styles.cycleText}>{cycles} cycles</Text>
          </View>
        </View>

        {/* Phase indicator bar */}
        <View style={styles.phaseBar}>
          {PHASES.map((p, i) => (
            <View key={i} style={styles.phaseBarItem}>
              <View style={[
                styles.phaseBarDot,
                { backgroundColor: phaseIndex === i ? phaseColors[i] : "rgba(255,255,255,0.3)" }
              ]} />
              <Text style={[styles.phaseBarLabel, phaseIndex === i && { color: "white", fontWeight: "700" }]}>
                {p} ({PHASE_DURATIONS[i]}s)
              </Text>
            </View>
          ))}
        </View>

        {/* Animated Circle */}
        <View style={styles.circleContainer}>
          <Animated.View style={[styles.circleGlow, {
            transform: [{ scale: scaleAnim }],
            opacity: opacityAnim,
          }]} />
          <Animated.View style={[styles.circleOuter, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.circleInner}>
              <Text style={[styles.phaseLabel, { color: phaseColors[phaseIndex] }]}>
                {PHASES[phaseIndex]}
              </Text>
              <Text style={styles.countText}>{count}</Text>
              <Text style={styles.secondsLabel}>seconds</Text>
            </View>
          </Animated.View>
        </View>

        {/* Instruction */}
        <View style={styles.instructionBox}>
          <Ionicons name="information-circle-outline" size={18} color="#C8EAE6" />
          <Text style={styles.instructionText}>{PHASE_INSTRUCTIONS[phaseIndex]}</Text>
        </View>

        {/* Play / Stop */}
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
              <View style={[styles.dot, { backgroundColor: phaseColors[0] }]} />
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

export default Breathing478Screen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#3D7A8A" },
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
  headerSub: { fontSize: 12, color: "#C8EAE6", marginTop: 2 },
  cycleBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  cycleText: { fontSize: 12, fontWeight: "700", color: "white" },

  phaseBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "rgba(0,0,0,0.15)",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  phaseBarItem: { alignItems: "center", gap: 4 },
  phaseBarDot: { width: 8, height: 8, borderRadius: 4 },
  phaseBarLabel: { fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: "500" },

  circleContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 240,
    marginBottom: 8,
  },
  circleGlow: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(79,195,247,0.2)",
  },
  circleOuter: {
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  circleInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  phaseLabel: { fontSize: 14, fontWeight: "700" },
  countText: { fontSize: 52, fontWeight: "800", color: "white", lineHeight: 58 },
  secondsLabel: { fontSize: 11, color: "rgba(255,255,255,0.7)" },

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
  instructionText: { fontSize: 13, color: "#E0F2F1", flex: 1 },

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
  controlBtnStop: { backgroundColor: "rgba(229,57,53,0.4)", borderColor: "rgba(229,57,53,0.6)" },
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
    backgroundColor: "#3D7A8A",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  stepNumText: { fontSize: 11, fontWeight: "800", color: "white" },
  stepText: { fontSize: 13, color: "#424242", flex: 1, lineHeight: 20 },
});