import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const HELPLINES = [
  {
    name: "Umang Helpline",
    number: "0317-4288665",
    desc: "Mental health support for Pakistan",
    available: "Mon–Sat, 9AM–5PM",
    icon: "call-outline" as const,
    color: "#E53935",
  },
  {
    name: "Rozan Counseling",
    number: "051-2890505",
    desc: "Trauma & psychological support",
    available: "Mon–Fri, 9AM–5PM",
    icon: "heart-outline" as const,
    color: "#E91E63",
  },
  {
    name: "Edhi Foundation",
    number: "115",
    desc: "Emergency welfare & crisis support",
    available: "24/7",
    icon: "medkit-outline" as const,
    color: "#F44336",
  },
  {
    name: "Rescue Emergency",
    number: "1122",
    desc: "Emergency rescue services",
    available: "24/7",
    icon: "shield-outline" as const,
    color: "#FF5722",
  },
];

const SELF_HELP = [
  {
    icon: "leaf-outline" as const,
    title: "Breathe",
    desc: "Take 5 slow deep breaths. Inhale for 4 counts, exhale for 6.",
    color: "#E8F5E9",
    iconColor: "#4CAF50",
  },
  {
    icon: "people-outline" as const,
    title: "Reach Out",
    desc: "Text or call someone you trust — a friend, family member, or mentor.",
    color: "#E3F2FD",
    iconColor: "#2196F3",
  },
  {
    icon: "location-outline" as const,
    title: "Change Your Space",
    desc: "Move to a different room, go outside, or change your environment.",
    color: "#FFF3E0",
    iconColor: "#FF9800",
  },
  {
    icon: "water-outline" as const,
    title: "Ground Yourself",
    desc: "Hold something cold, name 5 things you can see, feel your feet on the floor.",
    color: "#F3E5F5",
    iconColor: "#9C27B0",
  },
];

const WARNINGS = [
  "Thoughts of harming yourself or others",
  "Feeling completely hopeless or trapped",
  "Giving away prized possessions",
  "Saying goodbye to people unexpectedly",
  "Sudden calmness after a period of depression",
];

function CrisisHelpScreen({ navigation }: { navigation: any }) {
  const [expandedWarnings, setExpandedWarnings] = useState(false);

  const callNumber = (number: string) => {
    Linking.openURL(`tel:${number}`);
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
            <Text style={styles.headerTitle}>Crisis Help</Text>
            <Text style={styles.headerSub}>You are not alone — help is here</Text>
          </View>
        </View>

        {/* You matter banner */}
        <View style={styles.matterBanner}>
          <Ionicons name="heart" size={22} color="#E53935" />
          <View style={{ flex: 1 }}>
            <Text style={styles.matterTitle}>You matter. Your life has value.</Text>
            <Text style={styles.matterSub}>
              Reaching out is a sign of strength, not weakness. Help is available right now.
            </Text>
          </View>
        </View>

        {/* Helplines */}
        <Text style={styles.sectionHeading}>Crisis Helplines</Text>
        <View style={styles.helplineList}>
          {HELPLINES.map((h, i) => (
            <View key={i} style={styles.helplineCard}>
              <View style={[styles.helplineIcon, { backgroundColor: h.color + "18" }]}>
                <Ionicons name={h.icon} size={22} color={h.color} />
              </View>
              <View style={styles.helplineInfo}>
                <Text style={styles.helplineName}>{h.name}</Text>
                <Text style={styles.helplineDesc}>{h.desc}</Text>
                <View style={styles.helplineAvail}>
                  <Ionicons name="time-outline" size={11} color="#9E9E9E" />
                  <Text style={styles.helplineAvailText}>{h.available}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.callBtn, { backgroundColor: h.color }]}
                onPress={() => callNumber(h.number)}
              >
                <Ionicons name="call" size={16} color="white" />
                <Text style={styles.callBtnText}>{h.number}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Immediate self-help */}
        <Text style={styles.sectionHeading}>Right Now, You Can</Text>
        <View style={styles.selfHelpList}>
          {SELF_HELP.map((s, i) => (
            <View key={i} style={styles.selfHelpCard}>
              <View style={[styles.selfHelpIcon, { backgroundColor: s.color }]}>
                <Ionicons name={s.icon} size={20} color={s.iconColor} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.selfHelpTitle}>{s.title}</Text>
                <Text style={styles.selfHelpDesc}>{s.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Warning signs */}
        <TouchableOpacity
          style={styles.warningsToggle}
          onPress={() => setExpandedWarnings(!expandedWarnings)}
          activeOpacity={0.85}
        >
          <View style={styles.warningsToggleLeft}>
            <Ionicons name="warning-outline" size={18} color="#FF9800" />
            <Text style={styles.warningsToggleText}>Warning Signs to Watch For</Text>
          </View>
          <Ionicons
            name={expandedWarnings ? "chevron-up" : "chevron-down"}
            size={18}
            color="#9E9E9E"
          />
        </TouchableOpacity>

        {expandedWarnings && (
          <View style={styles.warningsCard}>
            <Text style={styles.warningsIntro}>
              Seek help immediately if you or someone you know shows these signs:
            </Text>
            {WARNINGS.map((w, i) => (
              <View key={i} style={styles.warningRow}>
                <View style={styles.warningDot} />
                <Text style={styles.warningText}>{w}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Bottom reassurance */}
        <View style={styles.reassuranceCard}>
          <Text style={styles.reassuranceText}>
            💛 Whatever you're going through, this moment will pass. Please reach out — someone wants to help you.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

export default CrisisHelpScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#B71C1C" },
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
  headerSub: { fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 2 },

  matterBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
    elevation: 2,
  },
  matterTitle: { fontSize: 15, fontWeight: "800", color: "#B71C1C", marginBottom: 4 },
  matterSub: { fontSize: 13, color: "#424242", lineHeight: 19 },

  sectionHeading: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
    marginHorizontal: 16,
    marginBottom: 12,
  },

  helplineList: { paddingHorizontal: 16, gap: 10, marginBottom: 24 },
  helplineCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 18,
    padding: 14,
    gap: 12,
    elevation: 2,
  },
  helplineIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  helplineInfo: { flex: 1 },
  helplineName: { fontSize: 13, fontWeight: "700", color: "#212121" },
  helplineDesc: { fontSize: 11, color: "#757575", marginTop: 2 },
  helplineAvail: { flexDirection: "row", alignItems: "center", gap: 3, marginTop: 4 },
  helplineAvailText: { fontSize: 10, color: "#9E9E9E" },
  callBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
  },
  callBtnText: { fontSize: 11, fontWeight: "700", color: "white" },

  selfHelpList: { paddingHorizontal: 16, gap: 10, marginBottom: 20 },
  selfHelpCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 18,
    padding: 14,
    gap: 12,
    elevation: 2,
  },
  selfHelpIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  selfHelpTitle: { fontSize: 14, fontWeight: "700", color: "#212121", marginBottom: 3 },
  selfHelpDesc: { fontSize: 12, color: "#616161", lineHeight: 18 },

  warningsToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
  },
  warningsToggleLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  warningsToggleText: { fontSize: 14, fontWeight: "700", color: "white" },

  warningsCard: {
    backgroundColor: "white",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  warningsIntro: { fontSize: 13, color: "#424242", marginBottom: 12, lineHeight: 19 },
  warningRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10, gap: 10 },
  warningDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#E53935",
    marginTop: 5,
  },
  warningText: { fontSize: 13, color: "#424242", flex: 1, lineHeight: 19 },

  reassuranceCard: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    padding: 16,
  },
  reassuranceText: { fontSize: 14, color: "white", lineHeight: 22, textAlign: "center" },
});