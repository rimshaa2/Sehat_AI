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

const SESSION_TYPES = [
  { label: "Chat", icon: "chatbubble-outline" as const },
  { label: "Voice", icon: "call-outline" as const },
  { label: "Video", icon: "videocam-outline" as const },
];

const EXPERTS = [
  {
    name: "Dr. Sarah Ahmed",
    title: "Clinical Psychologist",
    rating: 4.9,
    sessions: 250,
    languages: ["English", "Urdu"],
    availability: "Today, 3:00 PM",
    online: true,
    initials: "SA",
    color: "#4CAF50",
  },
  {
    name: "Dr. Ali Hassan",
    title: "Mental Health Counselor",
    rating: 4.8,
    sessions: 180,
    languages: ["English", "Urdu", "Punjabi"],
    availability: "Tomorrow, 10:00 AM",
    online: true,
    initials: "AH",
    color: "#26C6DA",
  },
  {
    name: "Dr. Zara Khan",
    title: "Stress Management Expert",
    rating: 4.9,
    sessions: 320,
    languages: ["English", "Urdu"],
    availability: "Today, 5:00 PM",
    online: false,
    initials: "ZK",
    color: "#AB47BC",
  },
];

function TalkScreen({ navigation }: { navigation: any }) {
  const [activeSession, setActiveSession] = useState(0);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Talk to Expert</Text>
          <Text style={styles.headerSub}>Professional mental health support</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.cardSectionLabel}>Choose session type</Text>
          <View style={styles.sessionTypeRow}>
            {SESSION_TYPES.map((type, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.sessionTypeBtn, activeSession === i && styles.sessionTypeBtnActive]}
                onPress={() => setActiveSession(i)}
              >
                <Ionicons name={type.icon} size={22} color={activeSession === i ? "white" : "#757575"} />
                <Text style={[styles.sessionTypeText, activeSession === i && { color: "white" }]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.expertsHeading}>Available Experts</Text>

        {EXPERTS.map((expert, i) => (
          <View key={i} style={styles.expertCard}>
            <View style={styles.expertTopRow}>
              <View style={[styles.avatar, { backgroundColor: expert.color }]}>
                <Text style={styles.avatarText}>{expert.initials}</Text>
                {expert.online && <View style={styles.onlineDot} />}
              </View>
              <View style={styles.expertInfo}>
                <Text style={styles.expertName}>{expert.name}</Text>
                <Text style={styles.expertTitle}>{expert.title}</Text>
                <View style={styles.ratingRow}>
                  <Ionicons name="star" size={13} color="#FF9800" />
                  <Text style={styles.ratingText}>{expert.rating}</Text>
                  <Text style={styles.sessionsText}>{expert.sessions} sessions</Text>
                </View>
              </View>
            </View>

            <Text style={styles.langLabel}>Languages</Text>
            <View style={styles.langRow}>
              {expert.languages.map((lang, j) => (
                <View key={j} style={styles.langChip}>
                  <Text style={styles.langText}>{lang}</Text>
                </View>
              ))}
            </View>

            <View style={styles.availRow}>
              <View style={styles.availInfo}>
                <Ionicons name="calendar-outline" size={14} color="#757575" />
                <Text style={styles.availText}>{expert.availability}</Text>
              </View>
              <TouchableOpacity style={styles.bookButton}>
                <Text style={styles.bookText}>Book Session</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

export default TalkScreen;

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
  card: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 18,
    elevation: 3,
  },
  cardSectionLabel: { fontSize: 13, fontWeight: "600", color: "#757575", marginBottom: 12 },
  sessionTypeRow: { flexDirection: "row", gap: 10 },
  sessionTypeBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: "#F5F5F5",
    gap: 4,
  },
  sessionTypeBtnActive: { backgroundColor: "#5BA89D" },
  sessionTypeText: { fontSize: 12, fontWeight: "600", color: "#757575" },
  expertsHeading: { fontSize: 16, fontWeight: "700", color: "white", marginHorizontal: 16, marginBottom: 12 },
  expertCard: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 20,
    padding: 16,
    elevation: 3,
  },
  expertTopRow: { flexDirection: "row", marginBottom: 12 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { fontSize: 18, fontWeight: "800", color: "white" },
  onlineDot: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "white",
  },
  expertInfo: { flex: 1, justifyContent: "center" },
  expertName: { fontSize: 15, fontWeight: "700", color: "#212121" },
  expertTitle: { fontSize: 12, color: "#757575", marginTop: 2 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 4 },
  ratingText: { fontSize: 13, fontWeight: "600", color: "#212121" },
  sessionsText: { fontSize: 12, color: "#9E9E9E" },
  langLabel: { fontSize: 12, fontWeight: "600", color: "#9E9E9E", marginBottom: 6 },
  langRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  langChip: { backgroundColor: "#E0F4F2", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  langText: { fontSize: 12, fontWeight: "600", color: "#5BA89D" },
  availRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F5F5F5",
    paddingTop: 12,
  },
  availInfo: { flexDirection: "row", alignItems: "center", gap: 6 },
  availText: { fontSize: 13, color: "#757575" },
  bookButton: { backgroundColor: "#5BA89D", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  bookText: { fontSize: 13, fontWeight: "700", color: "white" },
});