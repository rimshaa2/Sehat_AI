import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Share,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const CATEGORIES = [
  { label: "All",          icon: "apps-outline" as const },
  { label: "Self-Worth",   icon: "heart-outline" as const },
  { label: "Anxiety",      icon: "leaf-outline" as const },
  { label: "Confidence",   icon: "star-outline" as const },
  { label: "Healing",      icon: "bandage-outline" as const },
  { label: "Gratitude",    icon: "sunny-outline" as const },
];

const AFFIRMATIONS = [
  { text: "I am worthy of love and belonging exactly as I am.",             category: "Self-Worth",  color: "#E8F5E9", accent: "#4CAF50" },
  { text: "I release what I cannot control and find peace in the present.", category: "Anxiety",     color: "#E3F2FD", accent: "#5C6BC0" },
  { text: "I trust myself to handle whatever comes my way.",                category: "Confidence",  color: "#FFF8E1", accent: "#FF9800" },
  { text: "My body and mind are healing more every single day.",            category: "Healing",     color: "#FCE4EC", accent: "#E91E63" },
  { text: "I am grateful for the small joys that fill my everyday life.",   category: "Gratitude",   color: "#F3E5F5", accent: "#9C27B0" },
  { text: "I am enough — I have always been enough.",                       category: "Self-Worth",  color: "#E8F5E9", accent: "#4CAF50" },
  { text: "This anxious feeling is temporary. I breathe through it.",       category: "Anxiety",     color: "#E3F2FD", accent: "#5C6BC0" },
  { text: "I show up for myself every day, even imperfectly.",              category: "Confidence",  color: "#FFF8E1", accent: "#FF9800" },
  { text: "I deserve compassion — especially from myself.",                 category: "Healing",     color: "#FCE4EC", accent: "#E91E63" },
  { text: "I notice beauty and goodness even in ordinary moments.",         category: "Gratitude",   color: "#F3E5F5", accent: "#9C27B0" },
  { text: "I am not my thoughts. I am the awareness behind them.",          category: "Anxiety",     color: "#E3F2FD", accent: "#5C6BC0" },
  { text: "Every day I grow stronger, wiser, and more resilient.",          category: "Healing",     color: "#FCE4EC", accent: "#E91E63" },
  { text: "My voice matters. My presence makes a difference.",              category: "Confidence",  color: "#FFF8E1", accent: "#FF9800" },
  { text: "I choose to see the good in myself and others.",                 category: "Gratitude",   color: "#F3E5F5", accent: "#9C27B0" },
  { text: "I am deeply loved and I radiate that love outward.",             category: "Self-Worth",  color: "#E8F5E9", accent: "#4CAF50" },
];

const TODAY_INDEX = new Date().getDay() % AFFIRMATIONS.length;

function AffirmationsScreen({ navigation }: { navigation: any }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [favorites, setFavorites]           = useState<number[]>([]);
  const [activeTab, setActiveTab]           = useState<"daily" | "all" | "favorites">("daily");

  const filtered =
    activeCategory === "All"
      ? AFFIRMATIONS
      : AFFIRMATIONS.filter((a) => a.category === activeCategory);

  const favoriteList = AFFIRMATIONS.filter((_, i) => favorites.includes(i));

  const toggleFav = (i: number) =>
    setFavorites((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);

  const shareAffirmation = async (text: string) => {
    await Share.share({ message: `"${text}" — Sehat AI Mental Health` });
  };

  const today = AFFIRMATIONS[TODAY_INDEX];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Affirmations</Text>
          <Text style={styles.headerSub}>Kind words for your inner self</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {(["daily", "all", "favorites"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === "daily" ? "Today" : tab === "all" ? "All" : `❤️ ${favorites.length}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {activeTab === "daily" && (
          <>
            {/* Today's affirmation — big hero card */}
            <View style={[styles.heroCard, { backgroundColor: today.accent }]}>
              <Text style={styles.heroLabel}>✨ Today's Affirmation</Text>
              <Text style={styles.heroText}>"{today.text}"</Text>
              <Text style={styles.heroCategory}>{today.category}</Text>
              <View style={styles.heroActions}>
                <TouchableOpacity style={styles.heroBtn} onPress={() => toggleFav(TODAY_INDEX)}>
                  <Ionicons
                    name={favorites.includes(TODAY_INDEX) ? "heart" : "heart-outline"}
                    size={20} color="white"
                  />
                  <Text style={styles.heroBtnText}>
                    {favorites.includes(TODAY_INDEX) ? "Saved" : "Save"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.heroBtn} onPress={() => shareAffirmation(today.text)}>
                  <Ionicons name="share-outline" size={20} color="white" />
                  <Text style={styles.heroBtnText}>Share</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* How to use affirmations */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>How to Use Affirmations</Text>
              {[
                { icon: "sunny-outline" as const,   text: "Say it aloud in the morning, looking in the mirror" },
                { icon: "repeat-outline" as const,   text: "Repeat 3–5 times slowly, feel each word" },
                { icon: "pencil-outline" as const,   text: "Write it in your journal to reinforce it" },
                { icon: "notifications-outline" as const, text: "Set a reminder to revisit it during the day" },
              ].map((tip, i) => (
                <View key={i} style={styles.tipRow}>
                  <View style={styles.tipIcon}>
                    <Ionicons name={tip.icon} size={16} color="#7E57C2" />
                  </View>
                  <Text style={styles.tipText}>{tip.text}</Text>
                </View>
              ))}
            </View>

            {/* Quick picks */}
            <Text style={styles.sectionHeading}>More for Today</Text>
            {AFFIRMATIONS.slice(0, 4).map((a, i) => (
              <AffirmCard
                key={i} index={i} affirmation={a}
                isFav={favorites.includes(i)}
                onFav={() => toggleFav(i)}
                onShare={() => shareAffirmation(a.text)}
              />
            ))}
          </>
        )}

        {activeTab === "all" && (
          <>
            {/* Category filter */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.label}
                  style={[styles.catChip, activeCategory === cat.label && styles.catChipActive]}
                  onPress={() => setActiveCategory(cat.label)}
                >
                  <Ionicons
                    name={cat.icon} size={14}
                    color={activeCategory === cat.label ? "white" : "rgba(255,255,255,0.8)"}
                  />
                  <Text style={[styles.catText, activeCategory === cat.label && { color: "white", fontWeight: "700" }]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {filtered.map((a, i) => {
              const globalIdx = AFFIRMATIONS.indexOf(a);
              return (
                <AffirmCard
                  key={i} index={globalIdx} affirmation={a}
                  isFav={favorites.includes(globalIdx)}
                  onFav={() => toggleFav(globalIdx)}
                  onShare={() => shareAffirmation(a.text)}
                />
              );
            })}
          </>
        )}

        {activeTab === "favorites" && (
          favoriteList.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>💛</Text>
              <Text style={styles.emptyTitle}>No favorites yet</Text>
              <Text style={styles.emptyDesc}>
                Tap the heart on any affirmation to save it here.
              </Text>
            </View>
          ) : (
            favoriteList.map((a, i) => {
              const globalIdx = AFFIRMATIONS.indexOf(a);
              return (
                <AffirmCard
                  key={i} index={globalIdx} affirmation={a}
                  isFav={true}
                  onFav={() => toggleFav(globalIdx)}
                  onShare={() => shareAffirmation(a.text)}
                />
              );
            })
          )
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Reusable Affirmation Card ────────────────────────────────────────────────
function AffirmCard({
  affirmation, isFav, onFav, onShare,
}: {
  index: number;
  affirmation: { text: string; category: string; color: string; accent: string };
  isFav: boolean;
  onFav: () => void;
  onShare: () => void;
}) {
  return (
    <View style={[styles.affirmCard, { backgroundColor: affirmation.color }]}>
      <View style={[styles.affirmAccent, { backgroundColor: affirmation.accent }]} />
      <View style={styles.affirmContent}>
        <Text style={styles.affirmText}>"{affirmation.text}"</Text>
        <View style={[styles.affirmCatBadge, { backgroundColor: affirmation.accent + "22" }]}>
          <Text style={[styles.affirmCatText, { color: affirmation.accent }]}>
            {affirmation.category}
          </Text>
        </View>
        <View style={styles.affirmActions}>
          <TouchableOpacity style={styles.affirmActionBtn} onPress={onFav}>
            <Ionicons name={isFav ? "heart" : "heart-outline"} size={18} color={isFav ? "#E91E63" : "#9E9E9E"} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.affirmActionBtn} onPress={onShare}>
            <Ionicons name="share-outline" size={18} color="#9E9E9E" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default AffirmationsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#7E57C2" },
  scrollContent: { paddingBottom: 40 },

  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "white" },
  headerSub: { fontSize: 12, color: "#D1C4E9", marginTop: 2 },

  tabBar: {
    flexDirection: "row", marginHorizontal: 16, marginBottom: 16,
    backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 14, padding: 4,
  },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center" },
  tabActive: { backgroundColor: "white" },
  tabText: { fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.8)" },
  tabTextActive: { color: "#7E57C2" },

  heroCard: {
    marginHorizontal: 16, borderRadius: 24, padding: 24,
    marginBottom: 16, elevation: 4,
  },
  heroLabel: { fontSize: 12, fontWeight: "700", color: "rgba(255,255,255,0.8)", marginBottom: 14 },
  heroText: { fontSize: 20, fontWeight: "800", color: "white", lineHeight: 30, marginBottom: 12 },
  heroCategory: { fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 20 },
  heroActions: { flexDirection: "row", gap: 12 },
  heroBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 18,
    paddingVertical: 10, borderRadius: 20,
  },
  heroBtnText: { fontSize: 13, fontWeight: "700", color: "white" },

  card: {
    backgroundColor: "white", marginHorizontal: 16,
    borderRadius: 20, padding: 18, marginBottom: 14, elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#212121", marginBottom: 14 },
  tipRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  tipIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: "#EDE7F6", alignItems: "center", justifyContent: "center",
  },
  tipText: { fontSize: 13, color: "#424242", flex: 1 },

  sectionHeading: {
    fontSize: 15, fontWeight: "700", color: "white",
    marginHorizontal: 16, marginBottom: 12,
  },

  catScroll: { paddingLeft: 16, marginBottom: 14 },
  catChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)", marginRight: 8,
  },
  catChipActive: { backgroundColor: "rgba(255,255,255,0.35)" },
  catText: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.85)" },

  affirmCard: {
    flexDirection: "row", marginHorizontal: 16, borderRadius: 18,
    marginBottom: 12, overflow: "hidden", elevation: 2,
  },
  affirmAccent: { width: 5 },
  affirmContent: { flex: 1, padding: 16 },
  affirmText: { fontSize: 14, color: "#212121", lineHeight: 22, fontStyle: "italic", marginBottom: 10 },
  affirmCatBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, marginBottom: 10 },
  affirmCatText: { fontSize: 11, fontWeight: "700" },
  affirmActions: { flexDirection: "row", gap: 16 },
  affirmActionBtn: { padding: 4 },

  emptyState: { alignItems: "center", paddingTop: 60, paddingHorizontal: 40 },
  emptyEmoji: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: "white", marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: "rgba(255,255,255,0.7)", textAlign: "center", lineHeight: 21 },
});