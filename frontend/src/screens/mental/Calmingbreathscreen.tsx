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

const PHASES = ["Inhale", "Exhale"];
const PHASE_DURATIONS = [5, 5];
const PHASE_INSTRUCTIONS = [
  "Breathe in slowly, filling your belly first then your chest",
  "Let go slowly, chest then belly deflates",
];

const BENEFITS = [
  "Easiest technique for beginners",
  "Activates the parasympathetic nervous system",
  "Lowers heart rate and blood pressure",
  "Can be done anywhere, anytime",
  "Excellent for daily stress management",
];

const TIPS = [
  { icon: "hand-left-outline" as const, title: "Belly Breathing", desc: "Place one hand on your chest and one on your belly. The belly hand should rise more than the chest hand." },
  { icon: "bed-outline" as const, title: "Best Position", desc: "Lie on your back with knees bent, or sit upright. Avoid slouching to allow full lung expansion." },
  { icon: "time-outline" as const, title: "Duration", desc: "Practice for 5-10 minutes daily. Even 2 minutes can significantly reduce stress in the moment." },
  { icon: "sunny-outline" as const, title: "Best Times", desc: "Morning to start the day calm, before meals, during stressful moments, or before sleep." },
];

function CalmingBreathScreen({ navigation }: { navigation: any }) {
  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [count, setCount] = useState(PHASE_DURATIONS[0]);
  const [cycles, setCycles] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef(0);
  const countRef = useRef(PHASE_DURATIONS[0]);

  const animateForPhase = (phase: string) => {
    if (phase === "Inhale") {
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 1.45, duration: 5000, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 1, duration: 5000, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, { toValue: 1, duration: 5000, useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 0, duration: 5000, useNativeDriver: true }),
      ]).start();
    }
  };

  const startBreathing = () => {
    setIsRunning(true);
    phaseRef.current = 0;
    countRef.current = PHASE_DURATIONS[0];
    setPhaseIndex(0);
    setCount(PHASE_DURATIONS[0]);
    animateForPhase(PHASES[0]);

    intervalRef.current = setInterval(() => {
      countRef.current -= 1;
      if (countRef.current <= 0) {
        const nextPhase = (phaseRef.current + 1) % PHASES.length;
        if (nextPhase === 0) setCycles(c => c + 1);
        phaseRef.current = nextPhase;
        countRef.current = PHASE_DURATIONS[nextPhase];
        setPhaseIndex(nextPhase);
        animateForPhase(PHASES[nextPhase]);
      }
      setCount(countRef.current);
    }, 1000);
  };

  const stopBreathing = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    Animated.parallel([
      Animated.timing(scaleAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.timing(waveAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
    setPhaseIndex(0);
    setCount(PHASE_DURATIONS[0]);
  };

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const bgColor = waveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.25)"],
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Calming Breath</Text>
            <Text style={styles.headerSub}>Diaphragmatic breathing • 5-5</Text>
          </View>
          <View style={styles.cycleBadge}>
            <Text style={styles.cycleText}>{cycles} cycles</Text>
          </View>
        </View>

        {/* Phase pills */}
        <View style={styles.phasePillRow}>
          {PHASES.map((p, i) => (
            <View key={i} style={[styles.phasePill, phaseIndex === i && styles.phasePillActive]}>
              <Text style={[styles.phasePillText, phaseIndex === i && styles.phasePillTextActive]}>
                {p} {PHASE_DURATIONS[i]}s
              </Text>
            </View>
          ))}
        </View>

        {/* Animated breathing circle */}
        <View style={styles.circleContainer}>
          {/* Outer ripple */}
          <Animated.View style={[styles.ripple, { transform: [{ scale: scaleAnim }], opacity: 0.2 }]} />
          <Animated.View style={[styles.ripple2, { transform: [{ scale: scaleAnim }], opacity: 0.12 }]} />

          {/* Main circle */}
          <Animated.View style={[styles.circleOuter, { transform: [{ scale: scaleAnim }], backgroundColor: bgColor }]}>
            <View style={styles.circleInner}>
              <Ionicons
                name={phaseIndex === 0 ? "arrow-up-outline" : "arrow-down-outline"}
                size={20}
                color={phaseIndex === 0 ? "#80DEEA" : "#FFCC80"}
              />
              <Text style={[styles.phaseLabel, { color: phaseIndex === 0 ? "#80DEEA" : "#FFCC80" }]}>
                {PHASES[phaseIndex]}
              </Text>
              <Text style={styles.countText}>{count}</Text>
            </View>
          </Animated.View>
        </View>

        {/* Belly vs Chest guide */}
        <View style={styles.breathGuide}>
          <View style={styles.breathGuideItem}>
            <Animated.View style={[styles.breathBar, {
              transform: [{ scaleY: phaseIndex === 0 ? scaleAnim : Animated.multiply(scaleAnim, new Animated.Value(0.7)) }]
            }]} />
            <Text style={styles.breathBarLabel}>Belly</Text>
          </View>
          <View style={styles.breathGuideItem}>
            <Animated.View style={[styles.breathBar, styles.breathBarChest, {
              transform: [{ scaleY: phaseIndex === 0 ? new Animated.Value(1.15) : new Animated.Value(1) }]
            }]} />
            <Text style={styles.breathBarLabel}>Chest</Text>
          </View>
        </View>

        {/* Instruction */}
        <View style={styles.instructionBox}>
          <Ionicons name="leaf-outline" size={18} color="#C8EAE6" />
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
              <View style={styles.dot} />
              <Text style={styles.benefitText}>{b}</Text>
            </View>
          ))}
        </View>

        {/* Tips */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tips for Best Results</Text>
          {TIPS.map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={styles.tipIcon}>
                <Ionicons name={tip.icon} size={18} color="#5BA89D" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDesc}>{tip.desc}</Text>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

export default CalmingBreathScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#5BA89D" },
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

  phasePillRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
    marginBottom: 16,
  },
  phasePill: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  phasePillActive: { backgroundColor: "rgba(255,255,255,0.35)" },
  phasePillText: { fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.7)" },
  phasePillTextActive: { color: "white" },

  circleContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 240,
    marginBottom: 12,
  },
  ripple: {
    position: "absolute",
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "white",
  },
  ripple2: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "white",
  },
  circleOuter: {
    width: 190,
    height: 190,
    borderRadius: 95,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  circleInner: {
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  phaseLabel: { fontSize: 14, fontWeight: "700" },
  countText: { fontSize: 52, fontWeight: "800", color: "white" },

  breathGuide: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 24,
    marginBottom: 16,
    paddingVertical: 8,
  },
  breathGuideItem: { alignItems: "center", gap: 6 },
  breathBar: {
    width: 24,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#80DEEA",
  },
  breathBarChest: { backgroundColor: "#FFCC80", height: 24 },
  breathBarLabel: { fontSize: 11, color: "rgba(255,255,255,0.8)", fontWeight: "600" },

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
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#5BA89D", marginRight: 10 },
  benefitText: { fontSize: 13, color: "#424242", flex: 1 },

  tipRow: { flexDirection: "row", gap: 12, marginBottom: 14 },
  tipIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#E0F4F2",
    alignItems: "center",
    justifyContent: "center",
  },
  tipTitle: { fontSize: 13, fontWeight: "700", color: "#212121", marginBottom: 2 },
  tipDesc: { fontSize: 12, color: "#757575", lineHeight: 18 },
});