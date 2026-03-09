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

const TECHNIQUES = [
  {
    label: "4-7-8 Breathing",
    screen: "Breathing478",
    desc: "Best for sleep & anxiety",
    color: "#3D7A8A",
    icon: "moon-outline" as const,
  },
  {
    label: "Box Breathing",
    screen: "BoxBreathing",
    desc: "Focus & stress control",
    color: "#4A6FA5",
    icon: "grid-outline" as const,
  },
  {
    label: "Calming Breath",
    screen: "CalmingBreath",
    desc: "Beginner friendly, 5-5",
    color: "#5BA89D",
    icon: "leaf-outline" as const,
  },
];

const BENEFITS = [
  "Reduces stress and anxiety",
  "Improves focus and concentration",
  "Promotes better sleep",
];

const PHASES = ["Inhale", "Hold", "Exhale", "Hold"];
const PHASE_DURATIONS = [4, 7, 8, 4];

function BreathingScreen({ navigation }: { navigation: any }) {
  const [isRunning, setIsRunning] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [count, setCount] = useState(PHASE_DURATIONS[0]);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseRef = useRef(0);
  const countRef = useRef(PHASE_DURATIONS[0]);

  const animateCircle = (phase: string) => {
    if (phase === "Inhale") {
      Animated.timing(scaleAnim, { toValue: 1.35, duration: 4000, useNativeDriver: true }).start();
    } else if (phase === "Exhale") {
      Animated.timing(scaleAnim, { toValue: 1, duration: 8000, useNativeDriver: true }).start();
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
        phaseRef.current = (phaseRef.current + 1) % PHASES.length;
        countRef.current = PHASE_DURATIONS[phaseRef.current];
        setPhaseIndex(phaseRef.current);
        animateCircle(PHASES[phaseRef.current]);
      }
      setCount(countRef.current);
    }, 1000);
  };

  const stopBreathing = () => {
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    Animated.timing(scaleAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    setPhaseIndex(0);
    setCount(PHASE_DURATIONS[0]);
  };

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Breathing Exercise</Text>
            <Text style={styles.headerSub}>Find your calm</Text>
          </View>
        </View>

        {/* Quick demo circle */}
        <View style={styles.circleContainer}>
          <Animated.View style={[styles.circleOuter, { transform: [{ scale: scaleAnim }] }]}>
            <View style={styles.circleInner}>
              <Text style={styles.phaseText}>{PHASES[phaseIndex]}</Text>
              <Text style={styles.countText}>{count}</Text>
            </View>
          </Animated.View>
        </View>

        <View style={styles.playRow}>
          <TouchableOpacity style={styles.playButton} onPress={isRunning ? stopBreathing : startBreathing}>
            <Ionicons name={isRunning ? "stop" : "play"} size={26} color="white" />
          </TouchableOpacity>
          <Text style={styles.playHint}>{isRunning ? "Tap to stop" : "Quick preview"}</Text>
        </View>

        {/* Technique Cards */}
        <Text style={styles.sectionLabel}>Choose a technique</Text>
        <View style={styles.techniqueList}>
          {TECHNIQUES.map((t, i) => (
            <TouchableOpacity
              key={i}
              style={styles.techniqueCard}
              onPress={() => navigation.navigate(t.screen)}
              activeOpacity={0.85}
            >
              <View style={[styles.techniqueIconWrap, { backgroundColor: t.color }]}>
                <Ionicons name={t.icon} size={22} color="white" />
              </View>
              <View style={styles.techniqueInfo}>
                <Text style={styles.techniqueTitle}>{t.label}</Text>
                <Text style={styles.techniqueDesc}>{t.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#BDBDBD" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Benefits */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Benefits</Text>
          {BENEFITS.map((b, i) => (
            <View key={i} style={styles.benefitRow}>
              <View style={styles.dot} />
              <Text style={styles.benefitText}>{b}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default BreathingScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#5BA89D" },
  scrollContent: { paddingBottom: 32 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 10,
    gap: 12,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "white" },
  headerSub: { fontSize: 13, color: "#C8EAE6", marginTop: 2 },
  circleContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 24,
    height: 200,
  },
  circleOuter: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  circleInner: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  phaseText: { fontSize: 16, fontWeight: "600", color: "white" },
  countText: { fontSize: 40, fontWeight: "800", color: "white" },
  playRow: { alignItems: "center", marginBottom: 28, gap: 8 },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  playHint: { fontSize: 12, color: "rgba(255,255,255,0.7)" },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "white",
    marginLeft: 16,
    marginBottom: 12,
  },
  techniqueList: { paddingHorizontal: 16, gap: 10, marginBottom: 20 },
  techniqueCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 18,
    padding: 14,
    gap: 14,
    elevation: 2,
  },
  techniqueIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  techniqueInfo: { flex: 1 },
  techniqueTitle: { fontSize: 14, fontWeight: "700", color: "#212121" },
  techniqueDesc: { fontSize: 12, color: "#9E9E9E", marginTop: 2 },
  benefitsCard: { backgroundColor: "white", marginHorizontal: 16, borderRadius: 20, padding: 18 },
  benefitsTitle: { fontSize: 15, fontWeight: "700", color: "#212121", marginBottom: 12 },
  benefitRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#5BA89D", marginRight: 10 },
  benefitText: { fontSize: 13, color: "#424242" },
});