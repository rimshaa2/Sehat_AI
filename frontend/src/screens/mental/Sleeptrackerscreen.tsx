import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SLEEP_HISTORY = [
  { day: "Mon", hours: 7.5, quality: 4, bedtime: "10:30 PM", wake: "6:00 AM" },
  { day: "Tue", hours: 5.0, quality: 2, bedtime: "1:00 AM",  wake: "6:00 AM" },
  { day: "Wed", hours: 8.0, quality: 5, bedtime: "10:00 PM", wake: "6:00 AM" },
  { day: "Thu", hours: 6.0, quality: 3, bedtime: "11:30 PM", wake: "5:30 AM" },
  { day: "Fri", hours: 9.0, quality: 5, bedtime: "9:30 PM",  wake: "6:30 AM" },
  { day: "Sat", hours: 6.5, quality: 3, bedtime: "12:00 AM", wake: "6:30 AM" },
  { day: "Sun", hours: 7.0, quality: 4, bedtime: "11:00 PM", wake: "6:00 AM" },
];

const QUALITY_OPTIONS = [
  { score: 1, label: "Terrible", emoji: "😴", color: "#EF5350" },
  { score: 2, label: "Poor",     emoji: "😪", color: "#FFA726" },
  { score: 3, label: "Fair",     emoji: "😶", color: "#FFEE58" },
  { score: 4, label: "Good",     emoji: "🙂", color: "#66BB6A" },
  { score: 5, label: "Great",    emoji: "😁", color: "#26C6DA" },
];

const BEDTIMES = ["9:00 PM", "10:00 PM", "10:30 PM", "11:00 PM", "11:30 PM", "12:00 AM", "1:00 AM"];
const WAKETIMES = ["5:00 AM", "5:30 AM", "6:00 AM", "6:30 AM", "7:00 AM", "7:30 AM", "8:00 AM"];

const SLEEP_TIPS = [
  { icon: "phone-portrait-outline" as const, tip: "Avoid screens 30 min before bed" },
  { icon: "thermometer-outline" as const,    tip: "Keep bedroom cool (65–68°F / 18–20°C)" },
  { icon: "cafe-outline" as const,           tip: "No caffeine after 2 PM" },
  { icon: "sunny-outline" as const,          tip: "Get sunlight within 30 min of waking" },
  { icon: "bed-outline" as const,            tip: "Keep a consistent sleep schedule" },
];

const qualityColor = (score: number) =>
  QUALITY_OPTIONS.find((q) => q.score === score)?.color ?? "#9E9E9E";

const MAX_HOURS = 9;

function SleepTrackerScreen({ navigation }: { navigation: any }) {
  const [activeTab, setActiveTab]         = useState<"log" | "history">("log");
  const [selectedQuality, setSelectedQuality] = useState<number | null>(null);
  const [selectedBedtime, setSelectedBedtime] = useState<string | null>(null);
  const [selectedWake, setSelectedWake]   = useState<string | null>(null);
  const [saved, setSaved]                 = useState(false);

  const avgHours = (
    SLEEP_HISTORY.reduce((a, b) => a + b.hours, 0) / SLEEP_HISTORY.length
  ).toFixed(1);

  const avgQuality = (
    SLEEP_HISTORY.reduce((a, b) => a + b.quality, 0) / SLEEP_HISTORY.length
  ).toFixed(1);

  const calcHours = () => {
    if (!selectedBedtime || !selectedWake) return null;
    const bedIdx  = BEDTIMES.indexOf(selectedBedtime);
    const wakeIdx = WAKETIMES.indexOf(selectedWake);
    const hours   = [7.5, 6.5, 6, 5.5, 5, 5, 4][bedIdx] + wakeIdx * 0.5;
    return Math.min(hours, 12).toFixed(1);
  };

  const handleSave = () => {
    if (!selectedQuality || !selectedBedtime || !selectedWake) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Sleep Tracker</Text>
          <Text style={styles.headerSub}>Rest is part of recovery</Text>
        </View>
        <Ionicons name="moon" size={24} color="rgba(255,255,255,0.5)" />
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {(["log", "history"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === "log" ? "Log Sleep" : "History"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {activeTab === "log" ? (
          <>
            {/* Sleep Quality */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>How did you sleep last night?</Text>
              <View style={styles.qualityRow}>
                {QUALITY_OPTIONS.map((q) => (
                  <TouchableOpacity
                    key={q.score}
                    style={[
                      styles.qualityBtn,
                      selectedQuality === q.score && {
                        borderColor: q.color, backgroundColor: q.color + "18", borderWidth: 2.5,
                      },
                    ]}
                    onPress={() => setSelectedQuality(q.score)}
                  >
                    <Text style={styles.qualityEmoji}>{q.emoji}</Text>
                    <Text style={[
                      styles.qualityLabel,
                      selectedQuality === q.score && { color: q.color, fontWeight: "700" },
                    ]}>
                      {q.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Bedtime */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>When did you go to bed?</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.timeRow}>
                  {BEDTIMES.map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.timeChip, selectedBedtime === t && styles.timeChipActive]}
                      onPress={() => setSelectedBedtime(t)}
                    >
                      <Text style={[styles.timeChipText, selectedBedtime === t && styles.timeChipTextActive]}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Wake Time */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>When did you wake up?</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.timeRow}>
                  {WAKETIMES.map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.timeChip, selectedWake === t && styles.timeChipActive]}
                      onPress={() => setSelectedWake(t)}
                    >
                      <Text style={[styles.timeChipText, selectedWake === t && styles.timeChipTextActive]}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Calculated Hours */}
            {selectedBedtime && selectedWake && (
              <View style={styles.hoursCard}>
                <Ionicons name="time-outline" size={22} color="#5BA89D" />
                <View>
                  <Text style={styles.hoursValue}>{calcHours()} hours</Text>
                  <Text style={styles.hoursLabel}>Estimated sleep duration</Text>
                </View>
                <View style={[
                  styles.hoursBadge,
                  { backgroundColor: Number(calcHours()) >= 7 ? "#E8F5E9" : "#FFF3E0" },
                ]}>
                  <Text style={{
                    fontSize: 11, fontWeight: "700",
                    color: Number(calcHours()) >= 7 ? "#4CAF50" : "#FF9800",
                  }}>
                    {Number(calcHours()) >= 7 ? "✓ Good" : "⚠ Low"}
                  </Text>
                </View>
              </View>
            )}

            {/* Save */}
            <TouchableOpacity
              style={[
                styles.saveBtn,
                saved && styles.saveBtnDone,
                (!selectedQuality || !selectedBedtime || !selectedWake) && styles.saveBtnDisabled,
              ]}
              onPress={handleSave}
            >
              <Ionicons name={saved ? "checkmark-circle" : "save-outline"} size={20} color="white" />
              <Text style={styles.saveBtnText}>{saved ? "Saved!" : "Save Sleep Log"}</Text>
            </TouchableOpacity>

            {/* Tips */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Sleep Hygiene Tips</Text>
              {SLEEP_TIPS.map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <View style={styles.tipIcon}>
                    <Ionicons name={tip.icon} size={16} color="#5BA89D" />
                  </View>
                  <Text style={styles.tipText}>{tip.tip}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Summary */}
            <View style={styles.card}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{avgHours}h</Text>
                  <Text style={styles.summaryLabel}>Avg Sleep</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{avgQuality}/5</Text>
                  <Text style={styles.summaryLabel}>Avg Quality</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>
                    {SLEEP_HISTORY.filter((d) => d.hours >= 7).length}
                  </Text>
                  <Text style={styles.summaryLabel}>Good Nights</Text>
                </View>
              </View>
            </View>

            {/* Bar Graph */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>This Week — Hours Slept</Text>
              <View style={styles.graph}>
                {SLEEP_HISTORY.map((d, i) => {
                  const barH = (d.hours / MAX_HOURS) * 120;
                  const color = d.hours >= 7 ? "#5BA89D" : d.hours >= 6 ? "#FFA726" : "#EF5350";
                  return (
                    <View key={i} style={styles.graphCol}>
                      <Text style={styles.graphHours}>{d.hours}h</Text>
                      <View style={styles.graphBarBg}>
                        <View style={[styles.graphBarFill, { height: barH, backgroundColor: color }]} />
                      </View>
                      <Text style={styles.graphDay}>{d.day}</Text>
                    </View>
                  );
                })}
              </View>
              {/* Recommended line label */}
              <View style={styles.recommendedLine}>
                <View style={styles.recommendedDash} />
                <Text style={styles.recommendedLabel}>Recommended: 7–9h</Text>
              </View>
            </View>

            {/* Log List */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Sleep Log</Text>
              {SLEEP_HISTORY.map((d, i) => (
                <View key={i} style={styles.logRow}>
                  <View style={[styles.logHourCircle, {
                    backgroundColor: d.hours >= 7 ? "#5BA89D" : d.hours >= 6 ? "#FFA726" : "#EF5350",
                  }]}>
                    <Text style={styles.logHourText}>{d.hours}h</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.logTopRow}>
                      <Text style={styles.logDay}>{d.day}</Text>
                      <Text style={styles.logTime}>{d.bedtime} → {d.wake}</Text>
                    </View>
                    <View style={styles.logQualityRow}>
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Ionicons
                          key={s}
                          name="star"
                          size={12}
                          color={s < d.quality ? qualityColor(d.quality) : "#EEEEEE"}
                        />
                      ))}
                      <Text style={[styles.logQualityLabel, { color: qualityColor(d.quality) }]}>
                        {QUALITY_OPTIONS.find((q) => q.score === d.quality)?.label}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

export default SleepTrackerScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#3D5A80" },
  scrollContent: { paddingBottom: 40 },

  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "white" },
  headerSub: { fontSize: 12, color: "#B8D4F0", marginTop: 2 },

  tabBar: {
    flexDirection: "row", marginHorizontal: 16, marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 14, padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center" },
  tabActive: { backgroundColor: "white" },
  tabText: { fontSize: 14, fontWeight: "600", color: "rgba(255,255,255,0.8)" },
  tabTextActive: { color: "#3D5A80" },

  card: {
    backgroundColor: "white", marginHorizontal: 16,
    borderRadius: 20, padding: 18, marginBottom: 14, elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#212121", marginBottom: 14 },

  qualityRow: { flexDirection: "row", justifyContent: "space-between" },
  qualityBtn: {
    alignItems: "center", padding: 8, borderRadius: 14,
    borderWidth: 2, borderColor: "transparent", width: "18%",
  },
  qualityEmoji: { fontSize: 26 },
  qualityLabel: { fontSize: 9, color: "#9E9E9E", marginTop: 4, textAlign: "center" },

  timeRow: { flexDirection: "row", gap: 8, paddingVertical: 4 },
  timeChip: {
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20,
    backgroundColor: "#F5F5F5", borderWidth: 1.5, borderColor: "transparent",
  },
  timeChipActive: { backgroundColor: "#E0F4F2", borderColor: "#5BA89D" },
  timeChipText: { fontSize: 13, color: "#757575", fontWeight: "500" },
  timeChipTextActive: { color: "#5BA89D", fontWeight: "700" },

  hoursCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "white", marginHorizontal: 16, borderRadius: 18,
    padding: 16, marginBottom: 14, elevation: 2,
  },
  hoursValue: { fontSize: 22, fontWeight: "800", color: "#212121" },
  hoursLabel: { fontSize: 12, color: "#9E9E9E" },
  hoursBadge: { marginLeft: "auto", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },

  saveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#3D5A80", marginHorizontal: 16, borderRadius: 16,
    padding: 16, gap: 8, marginBottom: 14,
  },
  saveBtnDone: { backgroundColor: "#4CAF50" },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontSize: 15, fontWeight: "700", color: "white" },

  tipRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  tipIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: "#E0F4F2", alignItems: "center", justifyContent: "center",
  },
  tipText: { fontSize: 13, color: "#424242", flex: 1 },

  summaryRow: { flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
  summaryItem: { alignItems: "center" },
  summaryValue: { fontSize: 26, fontWeight: "800", color: "#3D5A80" },
  summaryLabel: { fontSize: 12, color: "#9E9E9E", marginTop: 4 },
  summaryDivider: { width: 1, height: 40, backgroundColor: "#EEEEEE" },

  graph: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 },
  graphCol: { alignItems: "center", gap: 4, flex: 1 },
  graphHours: { fontSize: 9, color: "#9E9E9E", fontWeight: "600" },
  graphBarBg: {
    width: 24, height: 120, backgroundColor: "#F5F5F5",
    borderRadius: 12, justifyContent: "flex-end", overflow: "hidden",
  },
  graphBarFill: { width: "100%", borderRadius: 12 },
  graphDay: { fontSize: 10, color: "#9E9E9E", fontWeight: "600" },
  recommendedLine: { flexDirection: "row", alignItems: "center", gap: 8 },
  recommendedDash: { flex: 1, height: 1, backgroundColor: "#5BA89D", borderStyle: "dashed" },
  recommendedLabel: { fontSize: 10, color: "#5BA89D", fontWeight: "600" },

  logRow: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F5F5F5",
  },
  logHourCircle: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
  logHourText: { fontSize: 12, fontWeight: "800", color: "white" },
  logTopRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  logDay: { fontSize: 13, fontWeight: "700", color: "#212121" },
  logTime: { fontSize: 11, color: "#9E9E9E" },
  logQualityRow: { flexDirection: "row", alignItems: "center", gap: 3 },
  logQualityLabel: { fontSize: 11, fontWeight: "600", marginLeft: 4 },
});