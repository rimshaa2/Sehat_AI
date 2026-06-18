// frontend/src/screens/home/HealthArticlesScreen.tsx
// ─── Health Articles Screen ────────────────────────────────────────────────────
// Rich article browser matching Mockup design:
//   • Search bar
//   • Category filter chips
//   • Trending articles horizontal scroll (image cards)
//   • Related / all articles vertical list
// All articles link to real, verified health sources (WHO, CDC, NHS, Mayo Clinic)

import React, { useState, useMemo } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  TextInput,
  Image,
  Linking,
  Alert,
  StatusBar,
  StyleSheet,
} from "react-native";
import { ChevronLeft, Search, Bookmark, Clock, ExternalLink, TrendingUp } from "lucide-react-native";

// ─── Colour tokens (match Sehat AI design system) ────────────────────────────
const C = {
  primary:      "#199A8E",
  primaryLight: "#E6F7F6",
  bg:           "#F5F7FA",
  white:        "#FFFFFF",
  dark:         "#0F172A",
  mid:          "#64748B",
  light:        "#94A3B8",
  border:       "#E2E8F0",
  card:         "#FFFFFF",
};

// ─── Category definitions ─────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "all",           label: "All",           color: C.primary },
  { id: "mental_health", label: "Mental Health",  color: "#8B5CF6" },
  { id: "diet",          label: "Diet & Nutrition",color: "#F59E0B" },
  { id: "fitness",       label: "Fitness",         color: "#EF4444" },
  { id: "heart",         label: "Heart Health",    color: "#EC4899" },
  { id: "diabetes",      label: "Diabetes",        color: "#06B6D4" },
  { id: "womens",        label: "Women's Health",  color: "#10B981" },
  { id: "sleep",         label: "Sleep",           color: "#6366F1" },
];

// ─── Article data ─────────────────────────────────────────────────────────────
// Images: Unsplash free-to-use images relevant to each topic
interface Article {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  categoryColor: string;
  source: string;
  date: string;
  readTime: string;
  image: string;
  url: string;
  isNew?: boolean;
  isTrending?: boolean;
}

const ARTICLES: Article[] = [
  // ── Trending ──────────────────────────────────────────────────────────────
  {
    id: "t1",
    title: "Everything You Need to Know About Seasonal Flu & Prevention",
    category: "all",
    categoryLabel: "Health News",
    categoryColor: "#10B981",
    source: "WHO",
    date: "Apr 27, 2025",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&q=80",
    url: "https://www.who.int/news-room/fact-sheets/detail/influenza-(seasonal)",
    isNew: true,
    isTrending: true,
  },
  {
    id: "t2",
    title: "How Stress Affects Your Physical Health — What Science Says",
    category: "mental_health",
    categoryLabel: "Mental Health",
    categoryColor: "#8B5CF6",
    source: "Mayo Clinic",
    date: "Jan 10, 2025",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=600&q=80",
    url: "https://www.mayoclinic.org/healthy-lifestyle/stress-management/in-depth/stress-symptoms/art-20050987",
    isTrending: true,
  },
  {
    id: "t3",
    title: "Mediterranean Diet: A Complete Beginner's Guide for Heart Health",
    category: "diet",
    categoryLabel: "Diet & Nutrition",
    categoryColor: "#F59E0B",
    source: "Harvard Health",
    date: "Mar 5, 2025",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
    url: "https://www.health.harvard.edu/blog/a-practical-guide-to-the-mediterranean-diet-2019032116194",
    isTrending: true,
  },
  {
    id: "t4",
    title: "30-Minute Home Workouts That Actually Work, Backed by Research",
    category: "fitness",
    categoryLabel: "Fitness",
    categoryColor: "#EF4444",
    source: "NHS",
    date: "Feb 18, 2025",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80",
    url: "https://www.nhs.uk/live-well/exercise/exercise-guidelines/physical-activity-guidelines-for-adults-aged-19-to-64/",
    isTrending: true,
  },
  // ── Related / All ─────────────────────────────────────────────────────────
  {
    id: "r1",
    title: "The 25 Healthiest Fruits You Can Eat, According to a Nutritionist",
    category: "diet",
    categoryLabel: "Diet & Nutrition",
    categoryColor: "#F59E0B",
    source: "CDC",
    date: "Jun 10, 2024",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1490474418585-ba9bad8fd0ea?w=300&q=80",
    url: "https://www.cdc.gov/nutrition/features/fruits-and-vegetables.html",
  },
  {
    id: "r2",
    title: "Traditional Herbal Medicine — What Actually Works for Common Ailments",
    category: "all",
    categoryLabel: "Health",
    categoryColor: "#10B981",
    source: "WHO",
    date: "Jun 9, 2024",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=300&q=80",
    url: "https://www.who.int/health-topics/traditional-complementary-and-integrative-medicine",
  },
  {
    id: "r3",
    title: "Understanding Hypertension: Causes, Symptoms, and How to Manage It",
    category: "heart",
    categoryLabel: "Heart Health",
    categoryColor: "#EC4899",
    source: "WHO",
    date: "May 17, 2025",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=300&q=80",
    url: "https://www.who.int/news-room/fact-sheets/detail/hypertension",
  },
  {
    id: "r4",
    title: "Type 2 Diabetes: Prevention, Symptoms, and Lifestyle Changes",
    category: "diabetes",
    categoryLabel: "Diabetes",
    categoryColor: "#06B6D4",
    source: "CDC",
    date: "Apr 3, 2025",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1631815588090-d4bfec5b1ccb?w=300&q=80",
    url: "https://www.cdc.gov/diabetes/prevention/index.html",
  },
  {
    id: "r5",
    title: "How Much Sleep Do You Really Need? Science-Backed Answer",
    category: "sleep",
    categoryLabel: "Sleep",
    categoryColor: "#6366F1",
    source: "NHS",
    date: "Mar 22, 2025",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=300&q=80",
    url: "https://www.nhs.uk/live-well/sleep-and-tiredness/how-much-sleep-do-i-need/",
  },
  {
    id: "r6",
    title: "Women's Heart Health: Why Symptoms Differ and What to Watch For",
    category: "womens",
    categoryLabel: "Women's Health",
    categoryColor: "#10B981",
    source: "Mayo Clinic",
    date: "Feb 14, 2025",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=300&q=80",
    url: "https://www.mayoclinic.org/diseases-conditions/heart-disease/in-depth/heart-disease/art-20049534",
  },
  {
    id: "r7",
    title: "Anxiety vs. Stress: How to Tell the Difference and Cope Effectively",
    category: "mental_health",
    categoryLabel: "Mental Health",
    categoryColor: "#8B5CF6",
    source: "WHO",
    date: "Jan 30, 2025",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1493836512294-502baa1986e2?w=300&q=80",
    url: "https://www.who.int/news-room/questions-and-answers/item/stress",
  },
  {
    id: "r8",
    title: "Strength Training After 40: Benefits, Tips, and Where to Start",
    category: "fitness",
    categoryLabel: "Fitness",
    categoryColor: "#EF4444",
    source: "NHS",
    date: "Jan 8, 2025",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=300&q=80",
    url: "https://www.nhs.uk/live-well/exercise/strength-and-flexibility-exercises/",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const openUrl = async (url: string) => {
  try {
    const ok = await Linking.canOpenURL(url);
    if (!ok) { Alert.alert("Unavailable", "Could not open this article."); return; }
    await Linking.openURL(url);
  } catch {
    Alert.alert("Unavailable", "Could not open this article.");
  }
};

// ─── Trending Card ────────────────────────────────────────────────────────────
const TrendingCard = ({ item }: { item: Article }) => (
  <TouchableOpacity
    style={styles.trendingCard}
    onPress={() => openUrl(item.url)}
    activeOpacity={0.88}
  >
    <Image source={{ uri: item.image }} style={styles.trendingImage} />
    <View style={styles.trendingOverlay} />

    {/* Badge */}
    <View style={[styles.categoryBadge, { backgroundColor: item.categoryColor }]}>
      {item.isNew && <Text style={styles.newDot}>●</Text>}
      <Text style={styles.categoryBadgeText}>{item.categoryLabel}</Text>
    </View>

    {/* Bottom text */}
    <View style={styles.trendingBottom}>
      <Text style={styles.trendingTitle} numberOfLines={2}>{item.title}</Text>
      <View style={styles.trendingMeta}>
        <Text style={styles.trendingMetaText}>{item.date}</Text>
        <View style={styles.dot} />
        <Clock size={11} color="rgba(255,255,255,0.75)" />
        <Text style={styles.trendingMetaText}>{item.readTime}</Text>
      </View>
    </View>
  </TouchableOpacity>
);

// ─── Related Article Row ──────────────────────────────────────────────────────
const ArticleRow = ({ item }: { item: Article }) => (
  <TouchableOpacity
    style={styles.articleRow}
    onPress={() => openUrl(item.url)}
    activeOpacity={0.85}
  >
    <Image source={{ uri: item.image }} style={styles.articleRowImage} />
    <View style={styles.articleRowBody}>
      <View style={[styles.articleRowBadge, { backgroundColor: item.categoryColor + "22" }]}>
        <Text style={[styles.articleRowBadgeText, { color: item.categoryColor }]}>
          {item.categoryLabel}
        </Text>
      </View>
      <Text style={styles.articleRowTitle} numberOfLines={2}>{item.title}</Text>
      <View style={styles.articleRowMeta}>
        <Text style={styles.articleRowSource}>{item.source}</Text>
        <View style={styles.dot} />
        <Clock size={11} color={C.light} />
        <Text style={styles.articleRowMetaText}>{item.readTime}</Text>
      </View>
    </View>
    <TouchableOpacity style={styles.bookmarkBtn}>
      <Bookmark size={16} color={C.light} />
    </TouchableOpacity>
  </TouchableOpacity>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function HealthArticlesScreen({ navigation }: any) {
  const [query,       setQuery]       = useState("");
  const [activeCategory, setCategory] = useState("all");

  const trending = ARTICLES.filter((a) => a.isTrending);

  const related = useMemo(() => {
    return ARTICLES.filter((a) => {
      const matchCat = activeCategory === "all" || a.category === activeCategory;
      const matchQ   = query.length === 0 ||
        a.title.toLowerCase().includes(query.toLowerCase()) ||
        a.categoryLabel.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchQ;
    });
  }, [activeCategory, query]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={C.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Articles</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Search ── */}
        <View style={styles.searchBar}>
          <Search size={16} color={C.light} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search articles, news…"
            placeholderTextColor={C.light}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
        </View>

        {/* ── Popular / Category chips ── */}
        <Text style={styles.sectionTitle}>Popular Articles</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.chip,
                  active
                    ? { backgroundColor: cat.color }
                    : { backgroundColor: cat.color + "18", borderColor: cat.color + "44", borderWidth: 1 },
                ]}
                onPress={() => setCategory(cat.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, { color: active ? "#FFF" : cat.color }]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ── Trending Articles ── */}
        {query.length === 0 && (
          <>
            <View style={styles.sectionRow}>
              <View style={styles.sectionTitleRow}>
                <TrendingUp size={16} color={C.primary} />
                <Text style={styles.sectionTitle}>Trending Articles</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.trendingRow}
              decelerationRate="fast"
              snapToInterval={260}
            >
              {trending.map((item) => (
                <TrendingCard key={item.id} item={item} />
              ))}
            </ScrollView>
          </>
        )}

        {/* ── Related / All Articles ── */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>
            {query.length > 0 ? `Results for "${query}"` : "Related Articles"}
          </Text>
          {query.length === 0 && (
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          )}
        </View>

        {related.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No articles found.</Text>
            <Text style={styles.emptySubText}>Try a different keyword or category.</Text>
          </View>
        ) : (
          related.map((item) => <ArticleRow key={item.id} item={item} />)
        )}

        {/* ── Source credits ── */}
        <View style={styles.sourceCredit}>
          <ExternalLink size={12} color={C.light} />
          <Text style={styles.sourceCreditText}>
            Articles sourced from WHO, CDC, NHS & Mayo Clinic
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700", color: C.dark },

  scroll: { paddingBottom: 40 },

  // Search
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.white,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  searchInput: { flex: 1, fontSize: 14, color: C.dark, padding: 0 },

  // Section titles
  sectionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 22,
    marginBottom: 12,
  },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: C.dark,
    paddingHorizontal: 16,
    marginTop: 22,
    marginBottom: 12,
  },
  seeAll: { fontSize: 13, fontWeight: "600", color: C.primary },

  // Category chips
  chipsRow: { paddingHorizontal: 16, gap: 8, paddingBottom: 4 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipText: { fontSize: 13, fontWeight: "600" },

  // Trending cards
  trendingRow: { paddingHorizontal: 16, gap: 12 },
  trendingCard: {
    width: 248,
    height: 200,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#1C2A3A",
  },
  trendingImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  trendingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10,20,35,0.48)",
  },
  categoryBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  newDot: { fontSize: 8, color: "#FFF" },
  categoryBadgeText: { fontSize: 11, fontWeight: "700", color: "#FFF" },
  trendingBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
  },
  trendingTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
    lineHeight: 20,
    marginBottom: 8,
  },
  trendingMeta: { flexDirection: "row", alignItems: "center", gap: 5 },
  trendingMetaText: { fontSize: 11, color: "rgba(255,255,255,0.75)" },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: C.light,
  },

  // Article rows
  articleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: C.white,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: C.border,
    gap: 12,
  },
  articleRowImage: {
    width: 76,
    height: 76,
    borderRadius: 12,
    backgroundColor: C.border,
  },
  articleRowBody: { flex: 1, gap: 5 },
  articleRowBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  articleRowBadgeText: { fontSize: 10, fontWeight: "700" },
  articleRowTitle: { fontSize: 13, fontWeight: "700", color: C.dark, lineHeight: 18 },
  articleRowMeta: { flexDirection: "row", alignItems: "center", gap: 5 },
  articleRowSource: { fontSize: 11, color: C.light, fontWeight: "600" },
  articleRowMetaText: { fontSize: 11, color: C.light },
  bookmarkBtn: { padding: 4, marginTop: 2 },

  // Empty
  emptyState: { alignItems: "center", paddingTop: 40, paddingBottom: 20 },
  emptyText: { fontSize: 16, fontWeight: "700", color: C.mid },
  emptySubText: { fontSize: 13, color: C.light, marginTop: 6 },

  // Credits
  sourceCredit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sourceCreditText: { fontSize: 11, color: C.light },
});