import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Modal,
  FlatList,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createWellnessEntry, getWellnessEntries } from "../../services/api";

// ─── Data ─────────────────────────────────────────────────────────────────────

const DEFAULT_SLEEP_HISTORY = [
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

const SLEEP_TIPS = [
  { icon: "phone-portrait-outline" as const, tip: "Avoid screens 30 min before bed" },
  { icon: "thermometer-outline" as const,    tip: "Keep bedroom cool (65–68°F / 18–20°C)" },
  { icon: "cafe-outline" as const,           tip: "No caffeine after 2 PM" },
  { icon: "sunny-outline" as const,          tip: "Get sunlight within 30 min of waking" },
  { icon: "bed-outline" as const,            tip: "Keep a consistent sleep schedule" },
];

const MAX_HOURS = 9;

// ─── Full time list (every 15 min, 24h) ──────────────────────────────────────
const buildTimeList = () => {
  const times: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 15, 30, 45]) {
      const hour12 = h % 12 === 0 ? 12 : h % 12;
      const ampm   = h < 12 ? "AM" : "PM";
      const min    = m.toString().padStart(2, "0");
      times.push(`${hour12}:${min} ${ampm}`);
    }
  }
  return times;
};
const ALL_TIMES = buildTimeList();

// ─── Helpers ──────────────────────────────────────────────────────────────────

const qualityColor = (score: number) =>
  QUALITY_OPTIONS.find((q) => q.score === score)?.color ?? "#9E9E9E";

const toMinutes = (t: string): number => {
  const [time, ampm] = t.split(" ");
  const [hStr, mStr] = time.split(":");
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h * 60 + m;
};

const calcHoursFromTimes = (bed: string, wake: string): number => {
  let diff = toMinutes(wake) - toMinutes(bed);
  if (diff <= 0) diff += 24 * 60;
  return Math.round((diff / 60) * 10) / 10;
};

// ─── Time Picker Modal ────────────────────────────────────────────────────────

interface TimePickerModalProps {
  visible: boolean;
  title: string;
  selected: string | null;
  onSelect: (t: string) => void;
  onClose: () => void;
}

const TimePickerModal = ({ visible, title, selected, onSelect, onClose }: TimePickerModalProps) => {
  const initialIndex = selected ? Math.max(0, ALL_TIMES.indexOf(selected)) : 0;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={mp.backdrop} activeOpacity={1} onPress={onClose}>
        <View style={mp.sheet}>
          <View style={mp.handle} />
          <Text style={mp.title}>{title}</Text>
          <FlatList
            data={ALL_TIMES}
            keyExtractor={(item) => item}
            initialScrollIndex={initialIndex}
            getItemLayout={(_, index) => ({ length: 52, offset: 52 * index, index })}
            showsVerticalScrollIndicator={false}
            style={mp.list}
            renderItem={({ item }) => {
              const isSelected = item === selected;
              return (
                <TouchableOpacity
                  style={[mp.row, isSelected && mp.rowActive]}
                  onPress={() => { onSelect(item); onClose(); }}
                >
                  <Text style={[mp.rowText, isSelected && mp.rowTextActive]}>{item}</Text>
                  {isSelected && <Ionicons name="checkmark-circle" size={20} color="#5BA89D" />}
                </TouchableOpacity>
              );
            }}
          />
          <TouchableOpacity style={mp.cancelBtn} onPress={onClose}>
            <Text style={mp.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const mp = StyleSheet.create({
  backdrop:    { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet:       { backgroundColor: "white", borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 12, paddingBottom: 32, maxHeight: "70%" },
  handle:      { width: 40, height: 4, borderRadius: 2, backgroundColor: "#E0E0E0", alignSelf: "center", marginBottom: 16 },
  title:       { fontSize: 16, fontWeight: "800", color: "#212121", textAlign: "center", marginBottom: 8, paddingHorizontal: 20 },
  list:        { flexGrow: 0, height: 312 },
  row:         { height: 52, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: "#F5F5F5" },
  rowActive:   { backgroundColor: "#E0F4F2" },
  rowText:     { fontSize: 16, color: "#424242", fontWeight: "500" },
  rowTextActive:{ color: "#5BA89D", fontWeight: "800" },
  cancelBtn:   { marginTop: 12, marginHorizontal: 20, backgroundColor: "#F5F5F5", borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  cancelText:  { fontSize: 15, fontWeight: "700", color: "#EF5350" },
});

// ─── Time Selector Button ─────────────────────────────────────────────────────

const TimeSelectorBtn = ({ label, value, icon, onPress }: {
  label: string; value: string | null;
  icon: "moon-outline" | "sunny-outline"; onPress: () => void;
}) => (
  <TouchableOpacity style={ts.btn} onPress={onPress} activeOpacity={0.8}>
    <View style={ts.iconWrap}>
      <Ionicons name={icon} size={18} color="#5BA89D" />
    </View>
    <View style={ts.textWrap}>
      <Text style={ts.label}>{label}</Text>
      <Text style={value ? ts.value : ts.placeholder}>{value ?? "Tap to set"}</Text>
    </View>
    <Ionicons name="chevron-down" size={18} color="#9E9E9E" />
  </TouchableOpacity>
);

const ts = StyleSheet.create({
  btn:         { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#F8FAFA", borderRadius: 14, padding: 14, borderWidth: 1.5, borderColor: "#E0F4F2", marginBottom: 10 },
  iconWrap:    { width: 36, height: 36, borderRadius: 10, backgroundColor: "#E0F4F2", alignItems: "center", justifyContent: "center" },
  textWrap:    { flex: 1 },
  label:       { fontSize: 11, color: "#9E9E9E", fontWeight: "600", marginBottom: 2 },
  value:       { fontSize: 17, fontWeight: "800", color: "#212121" },
  placeholder: { fontSize: 14, color: "#BDBDBD", fontStyle: "italic" },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

function SleepTrackerScreen({ navigation }: { navigation: any }) {
  const [activeTab,       setActiveTab]       = useState<"log" | "history">("log");
  const [selectedQuality, setSelectedQuality] = useState<number | null>(null);
  const [selectedBedtime, setSelectedBedtime] = useState<string | null>(null);
  const [selectedWake,    setSelectedWake]    = useState<string | null>(null);
  const [saving,          setSaving]          = useState(false);
  const [sleepHistory,    setSleepHistory]    = useState(DEFAULT_SLEEP_HISTORY);
  const [bedPickerOpen,   setBedPickerOpen]   = useState(false);
  const [wakePickerOpen,  setWakePickerOpen]  = useState(false);

  // Track whether we already loaded from backend so we don't overwrite user entries
  const loadedFromBackend = useRef(false);

  // Load history once on mount — only replace defaults, never replace user-added entries
  useEffect(() => {
    if (loadedFromBackend.current) return;
    const loadHistory = async () => {
      try {
        const entries = await getWellnessEntries("sleep", 50);
        if (!Array.isArray(entries) || entries.length === 0) return;
        const mapped = entries
          .map((entry: any) => entry.payload)
          .filter((p: any) => p?.day && p?.hours && p?.quality)
          .slice(0, 7);
        if (mapped.length > 0) {
          loadedFromBackend.current = true;
          setSleepHistory(mapped);
        }
      } catch {
        // Keep defaults — no crash
      }
    };
    loadHistory();
  }, []); // Empty deps — runs ONCE only, never overwrites state again

  const computedHours =
    selectedBedtime && selectedWake
      ? calcHoursFromTimes(selectedBedtime, selectedWake)
      : null;

  const avgHours = sleepHistory.length
    ? (sleepHistory.reduce((a, b) => a + b.hours, 0) / sleepHistory.length).toFixed(1)
    : "0";

  const avgQuality = sleepHistory.length
    ? (sleepHistory.reduce((a, b) => a + b.quality, 0) / sleepHistory.length).toFixed(1)
    : "0";

  const handleSave = async () => {
    if (!selectedQuality || !selectedBedtime || !selectedWake || computedHours === null) {
      Alert.alert("Incomplete", "Please select quality, bedtime and wake time before saving.");
      return;
    }

    const newEntry = {
      day:     new Date().toLocaleDateString("en-US", { weekday: "short" }),
      hours:   computedHours,
      quality: selectedQuality,
      bedtime: selectedBedtime,
      wake:    selectedWake,
    };

    // ── Step 1: Update local state FIRST — this always works ──────────────────
    setSleepHistory((prev) => {
      const updated = [...prev, newEntry];
      return updated.slice(-7); // keep last 7
    });

    // ── Step 2: Reset form fields ─────────────────────────────────────────────
    setSelectedQuality(null);
    setSelectedBedtime(null);
    setSelectedWake(null);

    // ── Step 3: Switch to History tab so user sees the new entry ──────────────
    setActiveTab("history");

    // ── Step 4: Try saving to backend in background (non-blocking) ────────────
    setSaving(true);
    try {
      await createWellnessEntry("sleep", newEntry);
    } catch (err: any) {
      // Don't crash — entry is already in local state
      console.warn("Backend save failed (entry saved locally):", err?.message);
    } finally {
      setSaving(false);
    }
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
              {tab === "log" ? "Log Sleep" : `History (${sleepHistory.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ══════════ LOG TAB ══════════ */}
        {activeTab === "log" && (
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
                    <Text style={[styles.qualityLabel, selectedQuality === q.score && { color: q.color, fontWeight: "700" }]}>
                      {q.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Time pickers */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>When did you sleep?</Text>
              <TimeSelectorBtn label="BEDTIME"       value={selectedBedtime} icon="moon-outline"  onPress={() => setBedPickerOpen(true)} />
              <TimeSelectorBtn label="WAKE UP TIME"  value={selectedWake}    icon="sunny-outline" onPress={() => setWakePickerOpen(true)} />
            </View>

            {/* Computed hours */}
            {computedHours !== null && (
              <View style={styles.hoursCard}>
                <Ionicons name="time-outline" size={22} color="#5BA89D" />
                <View>
                  <Text style={styles.hoursValue}>{computedHours} hours</Text>
                  <Text style={styles.hoursLabel}>Estimated sleep duration</Text>
                </View>
                <View style={[styles.hoursBadge, { backgroundColor: computedHours >= 7 ? "#E8F5E9" : "#FFF3E0" }]}>
                  <Text style={{ fontSize: 11, fontWeight: "700", color: computedHours >= 7 ? "#4CAF50" : "#FF9800" }}>
                    {computedHours >= 7 ? "✓ Good" : "⚠ Low"}
                  </Text>
                </View>
              </View>
            )}

            {/* Save button */}
            <TouchableOpacity
              style={[
                styles.saveBtn,
                saving && styles.saveBtnSaving,
                (!selectedQuality || !selectedBedtime || !selectedWake) && styles.saveBtnDisabled,
              ]}
              onPress={handleSave}
              disabled={saving || !selectedQuality || !selectedBedtime || !selectedWake}
            >
              <Ionicons name={saving ? "hourglass-outline" : "save-outline"} size={20} color="white" />
              <Text style={styles.saveBtnText}>{saving ? "Saving…" : "Save Sleep Log"}</Text>
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
        )}

        {/* ══════════ HISTORY TAB ══════════ */}
        {activeTab === "history" && (
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
                  <Text style={styles.summaryValue}>{sleepHistory.filter((d) => d.hours >= 7).length}</Text>
                  <Text style={styles.summaryLabel}>Good Nights</Text>
                </View>
              </View>
            </View>

            {/* Bar Graph */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Recent — Hours Slept</Text>
              <View style={styles.graph}>
                {sleepHistory.map((d, i) => {
                  const barH  = (d.hours / MAX_HOURS) * 120;
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
              <View style={styles.recommendedLine}>
                <View style={styles.recommendedDash} />
                <Text style={styles.recommendedLabel}>Recommended: 7–9h</Text>
              </View>
            </View>

            {/* Log List */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Sleep Log</Text>
              {[...sleepHistory].reverse().map((d, i) => (
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
                        <Ionicons key={s} name="star" size={12} color={s < d.quality ? qualityColor(d.quality) : "#EEEEEE"} />
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

      {/* Modals */}
      <TimePickerModal visible={bedPickerOpen}  title="Select Bedtime"      selected={selectedBedtime} onSelect={setSelectedBedtime} onClose={() => setBedPickerOpen(false)} />
      <TimePickerModal visible={wakePickerOpen} title="Select Wake Up Time" selected={selectedWake}    onSelect={setSelectedWake}    onClose={() => setWakePickerOpen(false)} />
    </SafeAreaView>
  );
}

export default SleepTrackerScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: "#3D5A80" },
  scrollContent:   { paddingBottom: 40 },
  header:          { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, gap: 12 },
  backBtn:         { padding: 4 },
  headerTitle:     { fontSize: 20, fontWeight: "800", color: "white" },
  headerSub:       { fontSize: 12, color: "#B8D4F0", marginTop: 2 },
  tabBar:          { flexDirection: "row", marginHorizontal: 16, marginBottom: 16, backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 14, padding: 4 },
  tab:             { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center" },
  tabActive:       { backgroundColor: "white" },
  tabText:         { fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.8)" },
  tabTextActive:   { color: "#3D5A80" },
  card:            { backgroundColor: "white", marginHorizontal: 16, borderRadius: 20, padding: 18, marginBottom: 14, elevation: 2 },
  cardTitle:       { fontSize: 15, fontWeight: "700", color: "#212121", marginBottom: 14 },
  qualityRow:      { flexDirection: "row", justifyContent: "space-between" },
  qualityBtn:      { alignItems: "center", padding: 8, borderRadius: 14, borderWidth: 2, borderColor: "transparent", width: "18%" },
  qualityEmoji:    { fontSize: 26 },
  qualityLabel:    { fontSize: 9, color: "#9E9E9E", marginTop: 4, textAlign: "center" },
  hoursCard:       { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: "white", marginHorizontal: 16, borderRadius: 18, padding: 16, marginBottom: 14, elevation: 2 },
  hoursValue:      { fontSize: 22, fontWeight: "800", color: "#212121" },
  hoursLabel:      { fontSize: 12, color: "#9E9E9E" },
  hoursBadge:      { marginLeft: "auto", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  saveBtn:         { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#3D5A80", marginHorizontal: 16, borderRadius: 16, padding: 16, gap: 8, marginBottom: 14 },
  saveBtnSaving:   { backgroundColor: "#5BA89D" },
  saveBtnDisabled: { opacity: 0.45 },
  saveBtnText:     { fontSize: 15, fontWeight: "700", color: "white" },
  tipRow:          { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  tipIcon:         { width: 34, height: 34, borderRadius: 10, backgroundColor: "#E0F4F2", alignItems: "center", justifyContent: "center" },
  tipText:         { fontSize: 13, color: "#424242", flex: 1 },
  summaryRow:      { flexDirection: "row", justifyContent: "space-around", alignItems: "center" },
  summaryItem:     { alignItems: "center" },
  summaryValue:    { fontSize: 26, fontWeight: "800", color: "#3D5A80" },
  summaryLabel:    { fontSize: 12, color: "#9E9E9E", marginTop: 4 },
  summaryDivider:  { width: 1, height: 40, backgroundColor: "#EEEEEE" },
  graph:           { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 },
  graphCol:        { alignItems: "center", gap: 4, flex: 1 },
  graphHours:      { fontSize: 9, color: "#9E9E9E", fontWeight: "600" },
  graphBarBg:      { width: 24, height: 120, backgroundColor: "#F5F5F5", borderRadius: 12, justifyContent: "flex-end", overflow: "hidden" },
  graphBarFill:    { width: "100%", borderRadius: 12 },
  graphDay:        { fontSize: 10, color: "#9E9E9E", fontWeight: "600" },
  recommendedLine: { flexDirection: "row", alignItems: "center", gap: 8 },
  recommendedDash: { flex: 1, height: 1, backgroundColor: "#5BA89D" },
  recommendedLabel:{ fontSize: 10, color: "#5BA89D", fontWeight: "600" },
  logRow:          { flexDirection: "row", alignItems: "flex-start", gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F5F5F5" },
  logHourCircle:   { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  logHourText:     { fontSize: 12, fontWeight: "800", color: "white" },
  logTopRow:       { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  logDay:          { fontSize: 13, fontWeight: "700", color: "#212121" },
  logTime:         { fontSize: 11, color: "#9E9E9E" },
  logQualityRow:   { flexDirection: "row", alignItems: "center", gap: 3 },
  logQualityLabel: { fontSize: 11, fontWeight: "600", marginLeft: 4 },
});