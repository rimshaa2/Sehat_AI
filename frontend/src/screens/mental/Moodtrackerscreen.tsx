import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createWellnessEntry, getWellnessEntries } from "../../services/api";

const { width } = Dimensions.get("window");
const GRAPH_WIDTH = width - 64;

// ─── Mock history data (replace with AsyncStorage/backend) ───────────────────
const DEFAULT_MOOD_HISTORY = [
  { day: "Mon", score: 4, emoji: "😊", note: "Had a great morning walk" },
  { day: "Tue", score: 2, emoji: "😔", note: "Felt overwhelmed at work" },
  { day: "Wed", score: 3, emoji: "😐", note: "Average day, nothing special" },
  { day: "Thu", score: 5, emoji: "🤩", note: "Got great news from family" },
  { day: "Fri", score: 3, emoji: "😐", note: "Tired but okay" },
  { day: "Sat", score: 4, emoji: "😊", note: "Spent time with friends" },
  { day: "Sun", score: 2, emoji: "😰", note: "Anxious about the week ahead" },
];

const MOODS = [
  { score: 1, emoji: "😢", label: "Very Low",  color: "#EF5350" },
  { score: 2, emoji: "😔", label: "Low",        color: "#FFA726" },
  { score: 3, emoji: "😐", label: "Neutral",    color: "#FFEE58" },
  { score: 4, emoji: "😊", label: "Good",       color: "#66BB6A" },
  { score: 5, emoji: "🤩", label: "Excellent",  color: "#26C6DA" },
];

const TRIGGERS = [
  "Work", "Family", "Sleep", "Exercise", "Food",
  "Social", "Weather", "Health", "Finance", "Relationship",
];

const GRAPH_MAX = 5;

function MoodTrackerScreen({ navigation }: { navigation: any }) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<"log" | "history">("log");
  const [moodHistory, setMoodHistory] = useState(DEFAULT_MOOD_HISTORY);

  useEffect(() => {
    const load = async () => {
      try {
        const entries = await getWellnessEntries("mood", 100);
        if (!Array.isArray(entries)) return;
        const mapped = entries
          .map((entry: any) => ({
            day: new Date(entry.createdAt).toLocaleDateString("en-US", { weekday: "short" }),
            score: Number(entry.payload?.score || 3),
            emoji: entry.payload?.emoji || "😐",
            note: entry.payload?.note || "",
          }))
          .slice(0, 7);
        if (mapped.length > 0) setMoodHistory(mapped);
      } catch (error) {
        console.warn("Mood history load failed:", error);
      }
    };
    load();
  }, []);

  const avgMood = (
    moodHistory.length
      ? moodHistory.reduce((a, b) => a + b.score, 0) / moodHistory.length
      : 0
  ).toFixed(1);

  const toggleTrigger = (t: string) =>
    setSelectedTriggers((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );

  const handleSave = async () => {
    if (selectedMood === null) return;
    const selected = MOODS.find((m) => m.score === selectedMood);
    const payload = {
      score: selectedMood,
      emoji: selected?.emoji || "😐",
      triggers: selectedTriggers,
      note: note || "",
    };
    try {
      await createWellnessEntry("mood", payload);
      setMoodHistory((prev) => [
        {
          day: new Date().toLocaleDateString("en-US", { weekday: "short" }),
          score: payload.score,
          emoji: payload.emoji,
          note: payload.note || "No note",
        },
        ...prev,
      ].slice(0, 7));
    } catch (error) {
      console.warn("Mood save failed:", error);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const moodColor = (score: number) =>
    MOODS.find((m) => m.score === score)?.color ?? "#9E9E9E";

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Mood Tracker</Text>
          <Text style={styles.headerSub}>Track how you feel every day</Text>
        </View>
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
              {tab === "log" ? "Log Today" : "History"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {activeTab === "log" ? (
          <>
            {/* Mood Selector */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>How are you feeling right now?</Text>
              <View style={styles.moodRow}>
                {MOODS.map((m) => (
                  <TouchableOpacity
                    key={m.score}
                    style={[
                      styles.moodBtn,
                      selectedMood === m.score && { borderColor: m.color, borderWidth: 2.5, backgroundColor: m.color + "18" },
                    ]}
                    onPress={() => setSelectedMood(m.score)}
                  >
                    <Text style={styles.moodEmoji}>{m.emoji}</Text>
                    <Text style={[styles.moodLabel, selectedMood === m.score && { color: m.color, fontWeight: "700" }]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Triggers */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>What's influencing your mood?</Text>
              <View style={styles.triggerGrid}>
                {TRIGGERS.map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[
                      styles.triggerChip,
                      selectedTriggers.includes(t) && styles.triggerChipActive,
                    ]}
                    onPress={() => toggleTrigger(t)}
                  >
                    <Text style={[
                      styles.triggerText,
                      selectedTriggers.includes(t) && styles.triggerTextActive,
                    ]}>
                      {t}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Note */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Add a note (optional)</Text>
              <View style={styles.noteInput}>
                <Text style={styles.notePlaceholder}>
                  {note || "What happened today? How did it make you feel?"}
                </Text>
              </View>
              <View style={styles.quickNotes}>
                {["Felt productive", "Slept well", "Anxious thoughts", "Grateful today"].map((q) => (
                  <TouchableOpacity key={q} style={styles.quickNote} onPress={() => setNote(q)}>
                    <Text style={styles.quickNoteText}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveBtn, saved && styles.saveBtnDone, !selectedMood && styles.saveBtnDisabled]}
              onPress={handleSave}
            >
              <Ionicons name={saved ? "checkmark-circle" : "save-outline"} size={20} color="white" />
              <Text style={styles.saveBtnText}>{saved ? "Saved!" : "Save Today's Mood"}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Weekly Summary */}
            <View style={styles.card}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{avgMood}</Text>
                  <Text style={styles.summaryLabel}>Avg Mood</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>
                    {moodHistory.filter((d) => d.score >= 4).length}
                  </Text>
                  <Text style={styles.summaryLabel}>Good Days</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>
                    {moodHistory.filter((d) => d.score <= 2).length}
                  </Text>
                  <Text style={styles.summaryLabel}>Low Days</Text>
                </View>
              </View>
            </View>

            {/* Bar Graph */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>This Week</Text>
              <View style={styles.graph}>
                {moodHistory.map((d, i) => {
                  const barH = (d.score / GRAPH_MAX) * 120;
                  return (
                    <View key={i} style={styles.graphCol}>
                      <Text style={styles.graphEmoji}>{d.emoji}</Text>
                      <View style={styles.graphBarBg}>
                        <View
                          style={[
                            styles.graphBarFill,
                            { height: barH, backgroundColor: moodColor(d.score) },
                          ]}
                        />
                      </View>
                      <Text style={styles.graphDay}>{d.day}</Text>
                    </View>
                  );
                })}
              </View>

              {/* Legend */}
              <View style={styles.legend}>
                {MOODS.map((m) => (
                  <View key={m.score} style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: m.color }]} />
                    <Text style={styles.legendText}>{m.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Daily Log List */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Daily Log</Text>
              {moodHistory.map((d, i) => (
                <View key={i} style={styles.logRow}>
                  <View style={[styles.logScoreDot, { backgroundColor: moodColor(d.score) }]}>
                    <Text style={styles.logScoreText}>{d.score}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.logTopRow}>
                      <Text style={styles.logDay}>{d.day}</Text>
                      <Text style={styles.logEmoji}>{d.emoji}</Text>
                      <Text style={[styles.logMoodLabel, { color: moodColor(d.score) }]}>
                        {MOODS.find((m) => m.score === d.score)?.label}
                      </Text>
                    </View>
                    <Text style={styles.logNote}>{d.note}</Text>
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

export default MoodTrackerScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#5BA89D" },
  scrollContent: { paddingBottom: 40 },

  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "white" },
  headerSub: { fontSize: 12, color: "#C8EAE6", marginTop: 2 },

  tabBar: {
    flexDirection: "row", marginHorizontal: 16, marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 14, padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center" },
  tabActive: { backgroundColor: "white" },
  tabText: { fontSize: 14, fontWeight: "600", color: "rgba(255,255,255,0.8)" },
  tabTextActive: { color: "#5BA89D" },

  card: {
    backgroundColor: "white", marginHorizontal: 16,
    borderRadius: 20, padding: 18, marginBottom: 14, elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#212121", marginBottom: 14 },

  moodRow: { flexDirection: "row", justifyContent: "space-between" },
  moodBtn: {
    alignItems: "center", padding: 8, borderRadius: 14,
    borderWidth: 2, borderColor: "transparent", width: "18%",
  },
  moodEmoji: { fontSize: 26 },
  moodLabel: { fontSize: 9, color: "#9E9E9E", marginTop: 4, fontWeight: "500", textAlign: "center" },

  triggerGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  triggerChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: "#F5F5F5", borderWidth: 1.5, borderColor: "transparent",
  },
  triggerChipActive: { backgroundColor: "#E0F4F2", borderColor: "#5BA89D" },
  triggerText: { fontSize: 12, color: "#757575", fontWeight: "500" },
  triggerTextActive: { color: "#5BA89D", fontWeight: "700" },

  noteInput: {
    backgroundColor: "#F9F9F9", borderRadius: 12, padding: 14,
    minHeight: 80, marginBottom: 12, borderWidth: 1, borderColor: "#EEEEEE",
  },
  notePlaceholder: { fontSize: 13, color: "#BDBDBD" },
  quickNotes: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  quickNote: {
    backgroundColor: "#F0F0F0", paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: 20,
  },
  quickNoteText: { fontSize: 12, color: "#616161" },

  saveBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#5BA89D", marginHorizontal: 16, borderRadius: 16,
    padding: 16, gap: 8, marginBottom: 14,
  },
  saveBtnDone: { backgroundColor: "#4CAF50" },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { fontSize: 15, fontWeight: "700", color: "white" },

  summaryRow: { flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
  summaryItem: { alignItems: "center" },
  summaryValue: { fontSize: 28, fontWeight: "800", color: "#5BA89D" },
  summaryLabel: { fontSize: 12, color: "#9E9E9E", marginTop: 4 },
  summaryDivider: { width: 1, height: 40, backgroundColor: "#EEEEEE" },

  graph: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 },
  graphCol: { alignItems: "center", gap: 4, flex: 1 },
  graphEmoji: { fontSize: 14 },
  graphBarBg: {
    width: 24, height: 120, backgroundColor: "#F5F5F5",
    borderRadius: 12, justifyContent: "flex-end", overflow: "hidden",
  },
  graphBarFill: { width: "100%", borderRadius: 12 },
  graphDay: { fontSize: 10, color: "#9E9E9E", fontWeight: "600" },

  legend: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: "#757575" },

  logRow: {
    flexDirection: "row", alignItems: "flex-start", gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F5F5F5",
  },
  logScoreDot: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: "center", justifyContent: "center",
  },
  logScoreText: { fontSize: 13, fontWeight: "800", color: "white" },
  logTopRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  logDay: { fontSize: 13, fontWeight: "700", color: "#212121" },
  logEmoji: { fontSize: 14 },
  logMoodLabel: { fontSize: 11, fontWeight: "600" },
  logNote: { fontSize: 12, color: "#757575" },
});