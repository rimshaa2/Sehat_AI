import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const MOODS = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😌", label: "Calm" },
  { emoji: "😐", label: "Okay" },
  { emoji: "😔", label: "Sad" },
  { emoji: "😰", label: "Anxious" },
];

const RECENT_ENTRIES = [
  { date: "Oct 8", emoji: "😊", preview: "Had a wonderful day with family..." },
  { date: "Oct 7", emoji: "😌", preview: "Meditation helped me feel centered..." },
  { date: "Oct 6", emoji: "😐", preview: "Regular day, nothing special..." },
];

function JournalScreen({ navigation }: { navigation: any }) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [journalText, setJournalText] = useState("");

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Mood Journal</Text>
          <Text style={styles.headerSub}>Track your emotions</Text>
        </View>
        <View style={styles.saveButton}>
          <Ionicons name="bookmark-outline" size={18} color="white" />
          <Text style={styles.saveText}>Save</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.dateText}>Today, {today}</Text>
          <Text style={styles.questionText}>How are you feeling?</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodScroll}>
            {MOODS.map((m, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.moodItem, selectedMood === i && styles.moodItemSelected]}
                onPress={() => setSelectedMood(i)}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={[styles.moodLabel, selectedMood === i && { color: "#5BA89D" }]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TextInput
            style={styles.journalInput}
            multiline
            placeholder="Write about your day, your thoughts, or what you're grateful for..."
            placeholderTextColor="#BDBDBD"
            value={journalText}
            onChangeText={setJournalText}
            textAlignVertical="top"
          />

          <TouchableOpacity style={styles.saveEntryButton}>
            <Text style={styles.saveEntryText}>Save Entry</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.recentTitle}>Recent Entries</Text>
          {RECENT_ENTRIES.map((entry, i) => (
            <View key={i} style={styles.entryCard}>
              <Text style={styles.entryEmoji}>{entry.emoji}</Text>
              <View style={styles.entryInfo}>
                <Text style={styles.entryDate}>{entry.date}</Text>
                <Text style={styles.entryPreview}>{entry.preview}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#BDBDBD" />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default JournalScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#5BA89D" },
  scrollContent: { paddingBottom: 32 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "white" },
  headerSub: { fontSize: 13, color: "#C8EAE6", marginTop: 2 },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  saveText: { fontSize: 13, fontWeight: "600", color: "white" },
  card: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 18,
    elevation: 3,
  },
  dateText: { fontSize: 15, fontWeight: "700", color: "#212121", marginBottom: 4 },
  questionText: { fontSize: 13, color: "#757575", marginBottom: 14 },
  moodScroll: { marginBottom: 16 },
  moodItem: { alignItems: "center", marginRight: 16, padding: 8, borderRadius: 12 },
  moodItemSelected: { backgroundColor: "#E0F4F2" },
  moodEmoji: { fontSize: 28 },
  moodLabel: { fontSize: 11, color: "#9E9E9E", marginTop: 4, fontWeight: "500" },
  journalInput: {
    backgroundColor: "#F9F9F9",
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: "#212121",
    minHeight: 120,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    marginBottom: 14,
  },
  saveEntryButton: {
    backgroundColor: "#5BA89D",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  saveEntryText: { fontSize: 15, fontWeight: "700", color: "white" },
  recentTitle: { fontSize: 15, fontWeight: "700", color: "#212121", marginBottom: 12 },
  entryCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  entryEmoji: { fontSize: 24, marginRight: 12 },
  entryInfo: { flex: 1 },
  entryDate: { fontSize: 12, fontWeight: "600", color: "#5BA89D", marginBottom: 2 },
  entryPreview: { fontSize: 13, color: "#757575" },
});