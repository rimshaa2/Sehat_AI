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

const MOMENTS = [
  {
    quote: "You don't have to control your thoughts. You just have to stop letting them control you.",
    author: "Dan Millman",
  },
  {
    quote: "Almost everything will work again if you unplug it for a few minutes, including you.",
    author: "Anne Lamott",
  },
  {
    quote: "You are allowed to be both a masterpiece and a work in progress simultaneously.",
    author: "Sophia Bush",
  },
  {
    quote: "Breathe. Let go. And remind yourself that this very moment is the only one you know you have for sure.",
    author: "Oprah Winfrey",
  },
];

const PRACTICES = [
  {
    icon: "eye-outline" as const,
    title: "5-4-3-2-1 Grounding",
    desc: "Notice 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.",
    duration: "3 min",
    color: "#E8F5E9",
    iconColor: "#4CAF50",
  },
  {
    icon: "heart-outline" as const,
    title: "Gratitude Check",
    desc: "Think of 3 things you're genuinely grateful for right now, big or small.",
    duration: "2 min",
    color: "#FCE4EC",
    iconColor: "#E91E63",
  },
  {
    icon: "body-outline" as const,
    title: "Body Scan",
    desc: "Close your eyes and slowly scan from your toes to your head, releasing tension.",
    duration: "5 min",
    color: "#E3F2FD",
    iconColor: "#2196F3",
  },
  {
    icon: "walk-outline" as const,
    title: "Mindful Minute",
    desc: "Pause everything for 60 seconds. Just breathe and observe without judgment.",
    duration: "1 min",
    color: "#FFF8E1",
    iconColor: "#FF9800",
  },
];

function DailyMomentScreen({ navigation }: { navigation: any }) {
  const [savedQuote, setSavedQuote] = useState(false);
  const [completedPractices, setCompletedPractices] = useState<number[]>([]);
  const todayMoment = MOMENTS[new Date().getDay() % MOMENTS.length];

  const togglePractice = (i: number) => {
    setCompletedPractices(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Daily Mindful Moment</Text>
            <Text style={styles.headerSub}>Take care of yourself today</Text>
          </View>
        </View>

        {/* Date chip */}
        <View style={styles.dateChip}>
          <Ionicons name="calendar-outline" size={14} color="#C8EAE6" />
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </Text>
        </View>

        {/* Quote Card */}
        <View style={styles.quoteCard}>
          <View style={styles.quoteIconRow}>
            <Ionicons name="sparkles-outline" size={20} color="#AB47BC" />
            <Text style={styles.quoteCardLabel}>Today's Reflection</Text>
          </View>
          <Text style={styles.quoteText}>"{todayMoment.quote}"</Text>
          <Text style={styles.quoteAuthor}>— {todayMoment.author}</Text>
          <TouchableOpacity
            style={[styles.saveQuoteBtn, savedQuote && styles.saveQuoteBtnSaved]}
            onPress={() => setSavedQuote(!savedQuote)}
          >
            <Ionicons
              name={savedQuote ? "bookmark" : "bookmark-outline"}
              size={16}
              color={savedQuote ? "#AB47BC" : "#9E9E9E"}
            />
            <Text style={[styles.saveQuoteText, savedQuote && { color: "#AB47BC" }]}>
              {savedQuote ? "Saved" : "Save quote"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Today's Progress</Text>
          <View style={styles.progressBarBg}>
            <View style={[
              styles.progressBarFill,
              { width: `${(completedPractices.length / PRACTICES.length) * 100}%` }
            ]} />
          </View>
          <Text style={styles.progressLabel}>
            {completedPractices.length} of {PRACTICES.length} practices complete
          </Text>
        </View>

        {/* Mindful Practices */}
        <Text style={styles.sectionHeading}>Mindful Practices</Text>
        <View style={styles.practiceList}>
          {PRACTICES.map((p, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.practiceCard, completedPractices.includes(i) && styles.practiceCardDone]}
              onPress={() => togglePractice(i)}
              activeOpacity={0.85}
            >
              <View style={[styles.practiceIcon, { backgroundColor: p.color }]}>
                <Ionicons name={p.icon} size={22} color={p.iconColor} />
              </View>
              <View style={styles.practiceInfo}>
                <Text style={styles.practiceTitle}>{p.title}</Text>
                <Text style={styles.practiceDesc}>{p.desc}</Text>
                <View style={styles.practiceMeta}>
                  <Ionicons name="time-outline" size={12} color="#9E9E9E" />
                  <Text style={styles.practiceDuration}>{p.duration}</Text>
                </View>
              </View>
              <View style={[
                styles.checkCircle,
                completedPractices.includes(i) && styles.checkCircleDone
              ]}>
                {completedPractices.includes(i) && (
                  <Ionicons name="checkmark" size={14} color="white" />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Reminder nudge */}
        <View style={styles.nudgeCard}>
          <Ionicons name="bulb-outline" size={20} color="#FF9800" />
          <Text style={styles.nudgeText}>
            Even 1 mindful minute a day builds a calmer mind over time. You're doing great.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

export default DailyMomentScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#5BA89D" },
  scrollContent: { paddingBottom: 40 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "white" },
  headerSub: { fontSize: 12, color: "#C8EAE6", marginTop: 2 },

  dateChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  dateText: { fontSize: 13, color: "#C8EAE6", fontWeight: "500" },

  quoteCard: {
    backgroundColor: "white",
    marginHorizontal: 16,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
    elevation: 2,
  },
  quoteIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  quoteCardLabel: { fontSize: 13, fontWeight: "700", color: "#AB47BC" },
  quoteText: {
    fontSize: 15,
    color: "#212121",
    fontStyle: "italic",
    lineHeight: 24,
    marginBottom: 10,
  },
  quoteAuthor: { fontSize: 12, color: "#9E9E9E", fontWeight: "600", marginBottom: 14 },
  saveQuoteBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: "#F5F5F5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  saveQuoteBtnSaved: { backgroundColor: "#F3E5F5" },
  saveQuoteText: { fontSize: 12, fontWeight: "600", color: "#9E9E9E" },

  progressCard: {
    backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  progressTitle: { fontSize: 13, fontWeight: "700", color: "white", marginBottom: 10 },
  progressBarBg: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 4,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 8,
    backgroundColor: "white",
    borderRadius: 4,
  },
  progressLabel: { fontSize: 12, color: "#C8EAE6" },

  sectionHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  practiceList: { paddingHorizontal: 16, gap: 10 },
  practiceCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 18,
    padding: 14,
    gap: 12,
    elevation: 2,
  },
  practiceCardDone: { opacity: 0.75 },
  practiceIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  practiceInfo: { flex: 1 },
  practiceTitle: { fontSize: 14, fontWeight: "700", color: "#212121" },
  practiceDesc: { fontSize: 12, color: "#757575", marginTop: 3, lineHeight: 17 },
  practiceMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 6 },
  practiceDuration: { fontSize: 11, color: "#9E9E9E" },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: "#BDBDBD",
    alignItems: "center",
    justifyContent: "center",
  },
  checkCircleDone: { backgroundColor: "#5BA89D", borderColor: "#5BA89D" },

  nudgeCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    padding: 14,
  },
  nudgeText: { fontSize: 13, color: "white", flex: 1, lineHeight: 20 },
});