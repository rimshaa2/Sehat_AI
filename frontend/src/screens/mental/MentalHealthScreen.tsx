import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const MOODS = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "😔", label: "Sad" },
  { emoji: "😰", label: "Anxious" },
];

function MentalHealthScreen({ navigation }: { navigation: any }) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mental Health</Text>
          <Text style={styles.subtitle}>Take care of your mind</Text>
        </View>

        {/* Mood Check */}
        <View style={styles.moodCard}>
          <Text style={styles.sectionTitle}>How are you feeling today?</Text>
          <View style={styles.moodRow}>
            {MOODS.map((mood, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.moodButton, selectedMood === index && styles.moodButtonSelected]}
                onPress={() => setSelectedMood(index)}
              >
                <Text style={styles.emoji}>{mood.emoji}</Text>
                <Text style={styles.moodLabel}>{mood.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Daily Moment */}
        <TouchableOpacity style={styles.dailyCard} onPress={() => navigation.navigate("DailyMoment")} activeOpacity={0.85}>
          <MaterialCommunityIcons name="brain" size={24} color="#7E57C2" />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={styles.cardTitle}>Today's Mindful Moment</Text>
            <Text style={styles.cardSubtitle}>Taking care of yourself is productive.</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9E9E9E" />
        </TouchableOpacity>

        {/* Core Tools Grid */}
        <Text style={styles.gridHeading}>Core Tools</Text>
        <View style={styles.grid}>
          {[
            { label: "Breathing",  screen: "Breathing",  icon: "leaf-outline",        color: "#4CAF50", bg: "#E8F5E9" },
            { label: "Meditation", screen: "Meditation",  icon: "heart-outline",       color: "#AB47BC", bg: "#F3E5F5" },
            { label: "Journal",    screen: "Journal",     icon: "book-outline",        color: "#FF9800", bg: "#FFF3E0" },
            { label: "Talk",       screen: "Talk",        icon: "chatbubble-outline",  color: "#26C6DA", bg: "#E0F7FA" },
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.gridItem, { backgroundColor: item.bg }]}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.85}
            >
              <View style={[styles.gridIconWrap, { backgroundColor: item.color + "22" }]}>
                <Ionicons name={item.icon as any} size={26} color={item.color} />
              </View>
              <Text style={styles.gridText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Track & Assess */}
        <Text style={styles.gridHeading}>Track & Assess</Text>
        <View style={styles.wideGrid}>
          {[
            { label: "Mood Tracker",  screen: "MoodTracker",  icon: "happy-outline",      color: "#4CAF50", bg: "#E8F5E9", desc: "Log & graph your daily mood" },
            { label: "Sleep Tracker", screen: "SleepTracker", icon: "moon-outline",       color: "#3D5A80", bg: "#E3F2FD", desc: "Track bedtime & sleep quality" },
            { label: "Anxiety Quiz",  screen: "AnxietyQuiz",  icon: "clipboard-outline",  color: "#7E57C2", bg: "#EDE7F6", desc: "Clinically validated GAD-7 test" },
            { label: "Affirmations",  screen: "Affirmations", icon: "sunny-outline",      color: "#E91E63", bg: "#FCE4EC", desc: "Daily positive self-talk" },
          ].map((item, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.wideItem, { backgroundColor: item.bg }]}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.85}
            >
              <View style={[styles.wideIconWrap, { backgroundColor: item.color + "22" }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.wideItemTitle}>{item.label}</Text>
                <Text style={styles.wideItemDesc}>{item.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#BDBDBD" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Crisis Help */}
        <TouchableOpacity style={styles.crisisLink} onPress={() => navigation.navigate("CrisisHelp")} activeOpacity={0.7}>
          <Ionicons name="call-outline" size={16} color="#E53935" />
          <Text style={styles.crisisText}>Need immediate help? 24/7 Crisis Helpline</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

export default MentalHealthScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#5BA89D" },
  scrollContent: { paddingBottom: 32 },
  header: { padding: 20 },
  backButton: { width: 36, height: 36, justifyContent: "center" },
  headerTitle: { fontSize: 28, fontWeight: "800", color: "#FFFFFF", marginTop: 10 },
  subtitle: { fontSize: 14, color: "#C8EAE6", marginTop: 4, fontWeight: "500" },
  moodCard: { backgroundColor: "#FFFFFF", margin: 16, padding: 16, borderRadius: 20, elevation: 2 },
  sectionTitle: { fontWeight: "700", fontSize: 15, color: "#212121", marginBottom: 14 },
  moodRow: { flexDirection: "row", justifyContent: "space-between" },
  moodButton: {
    alignItems: "center", backgroundColor: "#F5F5F5", padding: 10,
    borderRadius: 14, width: "22%", borderWidth: 2, borderColor: "transparent",
  },
  moodButtonSelected: { backgroundColor: "#C8EAE6", borderColor: "#5BA89D" },
  emoji: { fontSize: 26 },
  moodLabel: { fontSize: 10, fontWeight: "600", color: "#424242", marginTop: 4 },
  dailyCard: {
    flexDirection: "row", backgroundColor: "#EDE7F6",
    margin: 16, padding: 16, borderRadius: 20, alignItems: "center", elevation: 2,
  },
  cardTitle: { fontWeight: "700", fontSize: 14, color: "#212121" },
  cardSubtitle: { fontSize: 12, color: "#616161", marginTop: 2 },
  gridHeading: { fontSize: 17, fontWeight: "700", color: "#FFFFFF", marginHorizontal: 16, marginBottom: 12 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", paddingHorizontal: 16, marginBottom: 20 },
  gridItem: { width: "48%", padding: 18, borderRadius: 20, marginBottom: 14, alignItems: "center", elevation: 2 },
  gridIconWrap: { width: 52, height: 52, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  gridText: { fontSize: 14, fontWeight: "700", color: "#212121" },
  wideGrid: { paddingHorizontal: 16, gap: 10, marginBottom: 20 },
  wideItem: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, borderRadius: 18, elevation: 2 },
  wideIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  wideItemTitle: { fontSize: 14, fontWeight: "700", color: "#212121" },
  wideItemDesc: { fontSize: 11, color: "#757575", marginTop: 2 },
  crisisLink: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    marginHorizontal: 16, marginTop: 6, paddingVertical: 10, gap: 6,
  },
  crisisText: { fontSize: 13, color: "#E53935", fontWeight: "600", textDecorationLine: "underline" },
});