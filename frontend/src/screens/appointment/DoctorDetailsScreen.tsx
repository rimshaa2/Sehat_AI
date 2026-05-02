// frontend/src/screens/appointment/DoctorDetailsScreen.tsx
// ─── Doctor Information Screen — matches Mockup design ────────────────────────
// Layout:
//   1. Header (back, title, share/bookmark)
//   2. Hero card — doctor image, name, specialty, stats, schedule badge
//   3. Tab bar — Bio / Schedule
//   Bio tab: Biography, Work Location (static map), Rating + Reviews
//   Schedule tab: Date picker, Available slots, Reason input, Book button

import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  Linking,
} from "react-native";
import {
  ChevronLeft,
  Bookmark,
  Share2,
  MapPin,
  Star,
  Clock,
  MessageSquare,
  Calendar,
  ThumbsUp,
  ChevronRight,
} from "lucide-react-native";
import api from "../../services/api";

const { width } = Dimensions.get("window");

// ─── Colour tokens ────────────────────────────────────────────────────────────
const C = {
  primary:      "#199A8E",
  primaryLight: "#E6F7F6",
  primaryDark:  "#127A70",
  bg:           "#F5F7FA",
  white:        "#FFFFFF",
  dark:         "#0F172A",
  mid:          "#64748B",
  light:        "#94A3B8",
  border:       "#E2E8F0",
  star:         "#F59E0B",
  red:          "#EF4444",
};

// ─── Specialty-specific review banks ─────────────────────────────────────────
// Reviews are seeded from the doctor's specialty so each doctor gets
// contextually relevant feedback rather than generic text.
const REVIEW_BANK: Record<string, { text: string; name: string; color: string }[]> = {
  cardio: [
    { name: "Farrukh Ahmed",  color: "#EF4444", text: "My heart condition was handled with great care. The doctor explained every step of my ECG results clearly." },
    { name: "Sadia Malik",    color: "#F97316", text: "Finally found a cardiologist who actually listens. Blood pressure is now fully under control after 3 months." },
    { name: "Imran Qureshi",  color: "#8B5CF6", text: "Very thorough. Caught an arrhythmia my previous doctor missed. Highly recommend for cardiac issues." },
  ],
  derma: [
    { name: "Hina Baig",      color: "#EC4899", text: "My acne scars have improved so much after following the treatment plan. Very satisfied with the results." },
    { name: "Zara Khan",      color: "#6366F1", text: "Best dermatologist I have visited. Diagnosed my skin condition in the first session itself." },
    { name: "Ali Hassan",     color: "#14B8A6", text: "The prescribed cream worked wonders for my eczema. Consultation was quick and to the point." },
  ],
  ortho: [
    { name: "Tariq Hussain",  color: "#F59E0B", text: "Knee pain is completely gone after the physiotherapy plan the doctor recommended. Life changing!" },
    { name: "Nasreen Akhtar", color: "#10B981", text: "Very experienced with spine issues. My slipped disc was managed without surgery — very grateful." },
    { name: "Bilal Chaudhry", color: "#3B82F6", text: "Clear explanation of my fracture X-ray and a solid recovery plan. Healed faster than expected." },
  ],
  neuro: [
    { name: "Sara Ijaz",      color: "#8B5CF6", text: "My migraine frequency dropped significantly after the treatment plan. The doctor is very thorough." },
    { name: "Usman Raza",     color: "#EC4899", text: "Excellent at diagnosing nerve-related issues. Very patient and explains everything in simple terms." },
    { name: "Fatima Noor",    color: "#F59E0B", text: "Helped me manage my vertigo with a simple exercise plan. No medication needed — very holistic approach." },
  ],
  general: [
    { name: "Kamran Ali",     color: "#199A8E", text: "Very thorough check-up. The doctor noticed things other GPs had overlooked. Highly recommend." },
    { name: "Ayesha Siddiqui",color: "#F97316", text: "Always clear and honest about diagnosis. Never rushes through the appointment. Excellent bedside manner." },
    { name: "Hassan Mehmood", color: "#6366F1", text: "Best family doctor we have had. My children feel comfortable and the advice is always practical." },
  ],
};

const REVIEW_TIMES = ["Today", "Yesterday", "2 days ago", "1 week ago", "2 weeks ago"];

// Pick the right review set based on specialty keywords
const getReviewsForSpecialty = (specialty: string) => {
  const s = (specialty || "").toLowerCase();
  if (s.includes("cardio") || s.includes("heart"))              return REVIEW_BANK.cardio;
  if (s.includes("derm") || s.includes("skin") || s.includes("genetic")) return REVIEW_BANK.derma;
  if (s.includes("ortho") || s.includes("bone") || s.includes("spine")) return REVIEW_BANK.ortho;
  if (s.includes("neuro") || s.includes("brain") || s.includes("nerve")) return REVIEW_BANK.neuro;
  return REVIEW_BANK.general;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const generateDates = () => {
  const days  = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      day:      days[d.getDay()],
      date:     d.getDate(),
      fullDate: d.toISOString().split("T")[0],
    };
  });
};

const StarRow = ({ rating, size = 14 }: { rating: number; size?: number }) => {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <View style={{ flexDirection: "row", gap: 2 }}>
      {Array(full).fill(0).map((_, i) => (
        <Star key={`f${i}`} size={size} color={C.star} fill={C.star} />
      ))}
      {half && <Star size={size} color={C.star} fill="none" />}
      {Array(empty).fill(0).map((_, i) => (
        <Star key={`e${i}`} size={size} color={C.border} fill="none" />
      ))}
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function DoctorDetailsScreen({ navigation, route }: any) {
  const { doctor } = route.params || {};

  const dates = generateDates();
  const [activeTab,      setActiveTab]      = useState<"bio" | "schedule">("bio");
  const [selectedDate,   setSelectedDate]   = useState(dates[0].fullDate);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime,   setSelectedTime]   = useState<string | null>(null);
  const [loadingSlots,   setLoadingSlots]   = useState(false);
  const [reason,         setReason]         = useState("");
  const [bookmarked,     setBookmarked]     = useState(false);
  const [bioExpanded,    setBioExpanded]    = useState(false);

  // ── Fetch slots ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!doctor?.id || activeTab !== "schedule") return;
    const fetch = async () => {
      setLoadingSlots(true);
      setAvailableSlots([]);
      setSelectedTime(null);
      try {
        const res = await api.get(`/api/appointments/doctors/${doctor.id}/slots`, {
          params: { date: selectedDate },
        });
        if (res.data?.availableSlots) setAvailableSlots(res.data.availableSlots);
      } catch {}
      finally { setLoadingSlots(false); }
    };
    fetch();
  }, [selectedDate, doctor, activeTab]);

  // ── Book ────────────────────────────────────────────────────────────────────
  const handleBook = () => {
    if (!selectedTime) {
      Alert.alert("Select Time", "Please select a time slot to continue.");
      return;
    }
    if (!reason.trim()) {
      Alert.alert("Reason Required", "Please enter a brief reason for your visit.");
      return;
    }
    navigation.navigate("Payment", {
      doctor,
      date:   selectedDate,
      time:   selectedTime,
      reason,
      amount: doctor?.priceValue || 1500,
    });
  };

  // ── Doctor data with fallbacks ───────────────────────────────────────────────
  const name       = doctor?.name       || "Dr. Hamza Iqbal";
  const specialty  = doctor?.specialty  || "Dermato-Genetics";
  const rating     = doctor?.rating     || 4.5;
  const experience = doctor?.experience || "15 years";
  const patients   = doctor?.patients   || 1240;
  const price      = doctor?.priceValue || 1500;
  // Avatar: use initials derived from the doctor's name — no stock photos
  const nameInitials = (name || "D")
    .replace(/^Dr\.?\s*/i, "")
    .split(" ")
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() || "")
    .join("");

  // Deterministic colour per doctor based on name char codes
  const AVATAR_COLORS = ["#199A8E","#8B5CF6","#F59E0B","#EF4444","#3B82F6","#EC4899","#10B981","#F97316"];
  const avatarColor = AVATAR_COLORS[
    (name || "D").split("").reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0) % AVATAR_COLORS.length
  ];

  const bio        = doctor?.bio        ||
    "Dedicated healthcare professional committed to providing personalised and compassionate care. Passionate about advancing patient wellbeing through innovative and evidence-based medical practices. Specialist in hormone-related skin conditions, acne, hirsutism, and other skin disorders.";
  const location   = doctor?.location   || "Office #12, 2nd Floor, Al-Hameed Mall, G-11 Markaz, Islamabad Capital Territory, Pakistan";
  const schedule   = doctor?.schedule   || "Mon-Sat / 9:00AM – 1:00PM";
  const totalReviews = 72;

  // Google Maps static image (free, no key needed for basic embed)
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=Islamabad,Pakistan&zoom=15&size=600x200&maptype=roadmap&markers=color:red%7CIslamabad,Pakistan&key=AIzaSyD-placeholder`;
  // Fallback map image via OpenStreetMap tile
  const osmMapUrl = `https://static-maps.yandex.ru/1.x/?ll=73.0551,33.7294&spn=0.05,0.025&l=map&pt=73.0551,33.7294,pm2rdm&size=600,200`;

  return (
    <SafeAreaView style={s.container}>

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.headerBtn}>
          <ChevronLeft size={24} color={C.dark} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Doctor Information</Text>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.headerBtn}>
            <Share2 size={20} color={C.dark} />
          </TouchableOpacity>
          <TouchableOpacity style={s.headerBtn} onPress={() => setBookmarked(!bookmarked)}>
            <Bookmark size={20} color={bookmarked ? C.primary : C.dark} fill={bookmarked ? C.primary : "none"} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* ── Hero Card ── */}
        <View style={s.heroCard}>
          {/* Doctor avatar — initials, colour derived from name */}
          <View style={[s.heroAvatar, { backgroundColor: avatarColor }]}>
            <Text style={s.heroAvatarText}>{nameInitials}</Text>
          </View>

          {/* Name + specialty */}
          <Text style={s.heroName}>{name}</Text>
          <Text style={s.heroSpecialty}>{specialty}</Text>

          {/* Rating + patients pill row */}
          <View style={s.statsRow}>
            <View style={s.statPill}>
              <Star size={13} color={C.star} fill={C.star} />
              <Text style={s.statPillText}>{rating} Rating</Text>
            </View>
            <View style={s.statPill}>
              <ThumbsUp size={13} color={C.primary} />
              <Text style={s.statPillText}>{patients}+ Patients</Text>
            </View>
          </View>

          {/* Schedule info strip */}
          <View style={s.scheduleStrip}>
            <View style={s.scheduleItem}>
              <Clock size={13} color={C.primary} />
              <Text style={s.scheduleText}>{schedule}</Text>
            </View>
            <View style={s.scheduleDivider} />
            <View style={s.scheduleItem}>
              <MapPin size={13} color={C.primary} />
              <Text style={s.scheduleText}>Rs. {price.toLocaleString()}/visit</Text>
            </View>
          </View>
        </View>

        {/* ── Tab bar ── */}
        <View style={s.tabBar}>
          {(["bio", "schedule"] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[s.tabBtn, activeTab === tab && s.tabBtnActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[s.tabText, activeTab === tab && s.tabTextActive]}>
                {tab === "bio" ? "Bio" : "Schedule"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ════════════════════════════════════════════
            BIO TAB
        ════════════════════════════════════════════ */}
        {activeTab === "bio" && (
          <View style={s.section}>

            {/* Biography */}
            <Text style={s.sectionTitle}>Biography</Text>
            <Text style={s.bioText} numberOfLines={bioExpanded ? undefined : 4}>
              {bio}
            </Text>
            <TouchableOpacity onPress={() => setBioExpanded(!bioExpanded)}>
              <Text style={s.readMore}>
                {bioExpanded ? "Show less" : "Read more"}
              </Text>
            </TouchableOpacity>

            {/* Work Location */}
            <Text style={[s.sectionTitle, { marginTop: 24 }]}>Work Location</Text>
            <View style={s.locationCard}>
              <View style={s.locationTextRow}>
                <MapPin size={14} color={C.primary} />
                <Text style={s.locationAddr}>{location}</Text>
              </View>
              {/* Static map fallback image */}
              <TouchableOpacity
                onPress={() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(location)}`)}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: `https://staticmap.openstreetmap.de/staticmap.php?center=33.7066,73.0481&zoom=14&size=600x180&maptype=mapnik&markers=33.7066,73.0481,red-pushpin` }}
                  style={s.mapImage}
                  defaultSource={{ uri: "https://placehold.co/600x180/e2e8f0/94a3b8?text=Map+View" }}
                />
                <View style={s.mapOverlay}>
                  <View style={s.mapPin}>
                    <MapPin size={20} color={C.red} fill={C.red} />
                  </View>
                  <View style={s.mapOpenBtn}>
                    <Text style={s.mapOpenText}>Open in Maps</Text>
                    <ChevronRight size={12} color={C.primary} />
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {/* Rating & Reviews */}
            <View style={s.ratingHeader}>
              <Text style={s.sectionTitle}>Rating ({totalReviews})</Text>
              <View style={s.ratingBadge}>
                <Star size={14} color={C.star} fill={C.star} />
                <Text style={s.ratingBadgeText}>{rating}</Text>
              </View>
            </View>

            {/* Rating bar breakdown */}
            <View style={s.ratingBars}>
              {[
                { stars: 5, pct: 0.72 },
                { stars: 4, pct: 0.18 },
                { stars: 3, pct: 0.06 },
                { stars: 2, pct: 0.03 },
                { stars: 1, pct: 0.01 },
              ].map(({ stars, pct }) => (
                <View key={stars} style={s.ratingBarRow}>
                  <Text style={s.ratingBarLabel}>{stars}</Text>
                  <Star size={10} color={C.star} fill={C.star} />
                  <View style={s.ratingTrack}>
                    <View style={[s.ratingFill, { width: `${pct * 100}%` as any }]} />
                  </View>
                  <Text style={s.ratingBarPct}>{Math.round(pct * totalReviews)}</Text>
                </View>
              ))}
            </View>

            {/* Review cards */}
            {getReviewsForSpecialty(specialty).map((r, i) => (
              <View key={i} style={s.reviewCard}>
                <View style={s.reviewTop}>
                  {/* Reviewer initial avatar */}
                  <View style={[s.reviewAvatar, { backgroundColor: r.color }]}>
                    <Text style={s.reviewAvatarText}>
                      {r.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2)}
                    </Text>
                  </View>
                  <View style={s.reviewMeta}>
                    <Text style={s.reviewName}>{r.name}</Text>
                    <StarRow rating={4.5} size={13} />
                  </View>
                  <Text style={s.reviewTime}>{REVIEW_TIMES[i % REVIEW_TIMES.length]}</Text>
                </View>
                <Text style={s.reviewText}>{r.text}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ════════════════════════════════════════════
            SCHEDULE TAB
        ════════════════════════════════════════════ */}
        {activeTab === "schedule" && (
          <View style={s.section}>

            {/* Date picker */}
            <Text style={s.sectionTitle}>Select Date</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 10, paddingBottom: 4 }}
              style={{ marginBottom: 20 }}
            >
              {dates.map((item) => (
                <TouchableOpacity
                  key={item.fullDate}
                  style={[s.dateCard, selectedDate === item.fullDate && s.dateCardActive]}
                  onPress={() => setSelectedDate(item.fullDate)}
                >
                  <Text style={[s.dateDayText, selectedDate === item.fullDate && s.dateActiveText]}>
                    {item.day}
                  </Text>
                  <Text style={[s.dateNumText, selectedDate === item.fullDate && s.dateActiveText]}>
                    {item.date}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Time slots */}
            <Text style={s.sectionTitle}>Available Slots</Text>
            {loadingSlots ? (
              <ActivityIndicator size="small" color={C.primary} style={{ marginVertical: 20 }} />
            ) : (
              <View style={s.slotsGrid}>
                {availableSlots.length > 0 ? (
                  availableSlots.map((time) => (
                    <TouchableOpacity
                      key={time}
                      style={[s.slotBtn, selectedTime === time && s.slotBtnActive]}
                      onPress={() => setSelectedTime(time)}
                    >
                      <Clock size={12} color={selectedTime === time ? C.white : C.mid} />
                      <Text style={[s.slotText, selectedTime === time && s.slotTextActive]}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={s.noSlots}>No available slots for this date.</Text>
                )}
              </View>
            )}

            {/* Reason */}
            <Text style={[s.sectionTitle, { marginTop: 20 }]}>Reason for Visit</Text>
            <TextInput
              style={s.reasonInput}
              placeholder="e.g., Skin rash, acne consultation…"
              placeholderTextColor={C.light}
              multiline
              numberOfLines={4}
              value={reason}
              onChangeText={setReason}
              textAlignVertical="top"
            />
          </View>
        )}
      </ScrollView>

      {/* ── Footer ── */}
      <View style={s.footer}>
        <TouchableOpacity style={s.msgBtn}>
          <MessageSquare size={22} color={C.primary} />
        </TouchableOpacity>

        {activeTab === "bio" ? (
          <TouchableOpacity
            style={s.bookBtn}
            onPress={() => setActiveTab("schedule")}
          >
            <Calendar size={18} color={C.white} />
            <Text style={s.bookBtnText}>Book Appointment</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[s.bookBtn, (!selectedTime || loadingSlots) && { opacity: 0.55 }]}
            onPress={handleBook}
            disabled={!selectedTime || loadingSlots}
          >
            <Text style={s.bookBtnText}>Confirm Booking</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // Header
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  headerBtn: { padding: 8 },
  headerTitle: { fontSize: 17, fontWeight: "700", color: C.dark },
  headerRight: { flexDirection: "row", gap: 4 },

  // Hero Card
  heroCard: {
    backgroundColor: C.primaryLight,
    marginHorizontal: 16, marginTop: 16,
    borderRadius: 20, padding: 20,
    alignItems: "center",
  },
  heroAvatar: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 3, borderColor: C.white,
    marginBottom: 12,
    alignItems: "center", justifyContent: "center",
  },
  heroAvatarText: {
    fontSize: 32, fontWeight: "800", color: C.white,
  },
  heroName: { fontSize: 18, fontWeight: "800", color: C.dark, textAlign: "center" },
  heroSpecialty: { fontSize: 13, color: C.mid, marginTop: 4, marginBottom: 14, textAlign: "center" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statPill: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: C.white, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  statPillText: { fontSize: 12, fontWeight: "700", color: C.dark },
  scheduleStrip: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: C.white, borderRadius: 12, padding: 10,
    width: "100%", gap: 12,
  },
  scheduleItem: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  scheduleText: { fontSize: 11, color: C.dark, fontWeight: "600", flexShrink: 1 },
  scheduleDivider: { width: 1, height: 20, backgroundColor: C.border },

  // Tab bar
  tabBar: {
    flexDirection: "row", marginHorizontal: 16, marginTop: 16,
    backgroundColor: C.white, borderRadius: 14, padding: 4,
    borderWidth: 1, borderColor: C.border,
  },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  tabBtnActive: { backgroundColor: C.primary },
  tabText: { fontSize: 14, fontWeight: "600", color: C.mid },
  tabTextActive: { color: C.white },

  // Sections
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: C.dark, marginBottom: 10 },

  // Bio
  bioText: { fontSize: 14, color: C.mid, lineHeight: 22 },
  readMore: { fontSize: 13, color: C.primary, fontWeight: "700", marginTop: 6 },

  // Location
  locationCard: {
    backgroundColor: C.white, borderRadius: 16,
    borderWidth: 1, borderColor: C.border, overflow: "hidden",
  },
  locationTextRow: {
    flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 12,
  },
  locationAddr: { flex: 1, fontSize: 13, color: C.mid, lineHeight: 18 },
  mapImage: { width: "100%", height: 160, backgroundColor: C.border },
  mapOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "rgba(255,255,255,0.92)", paddingHorizontal: 14, paddingVertical: 8,
  },
  mapPin: { alignItems: "center" },
  mapOpenBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  mapOpenText: { fontSize: 12, color: C.primary, fontWeight: "700" },

  // Ratings
  ratingHeader: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    marginTop: 24, marginBottom: 10,
  },
  ratingBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "#FFF8E7", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  ratingBadgeText: { fontSize: 13, fontWeight: "800", color: C.star },
  ratingBars: { marginBottom: 16, gap: 5 },
  ratingBarRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  ratingBarLabel: { fontSize: 12, color: C.mid, width: 10, textAlign: "right" },
  ratingTrack: {
    flex: 1, height: 6, backgroundColor: C.border, borderRadius: 3, overflow: "hidden",
  },
  ratingFill: { height: 6, backgroundColor: C.star, borderRadius: 3 },
  ratingBarPct: { fontSize: 11, color: C.light, width: 22, textAlign: "right" },

  // Reviews
  reviewCard: {
    backgroundColor: C.white, borderRadius: 14, borderWidth: 1,
    borderColor: C.border, padding: 14, marginBottom: 10,
  },
  reviewTop: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  reviewAvatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
  },
  reviewAvatarText: { fontSize: 14, fontWeight: "800", color: C.white },
  reviewMeta: { flex: 1, gap: 3 },
  reviewName: { fontSize: 14, fontWeight: "700", color: C.dark },
  reviewTime: { fontSize: 11, color: C.light },
  reviewText: { fontSize: 13, color: C.mid, lineHeight: 19 },

  // Schedule tab — date picker
  dateCard: {
    width: 58, height: 68, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    alignItems: "center", justifyContent: "center",
    backgroundColor: C.white,
  },
  dateCardActive: { backgroundColor: C.primary, borderColor: C.primary },
  dateDayText: { fontSize: 12, fontWeight: "600", color: C.mid },
  dateNumText: { fontSize: 18, fontWeight: "800", color: C.dark, marginTop: 2 },
  dateActiveText: { color: C.white },

  // Slots
  slotsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 4 },
  slotBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 14, paddingVertical: 10,
    borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: C.white,
  },
  slotBtnActive: { backgroundColor: C.primary, borderColor: C.primary },
  slotText: { fontSize: 13, color: C.dark, fontWeight: "600" },
  slotTextActive: { color: C.white },
  noSlots: { fontSize: 13, color: C.red, fontStyle: "italic" },

  // Reason
  reasonInput: {
    backgroundColor: C.white, borderWidth: 1, borderColor: C.border,
    borderRadius: 14, padding: 14, fontSize: 14, color: C.dark,
    minHeight: 100, marginBottom: 20,
  },

  // Footer
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.border,
  },
  msgBtn: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: C.primaryLight, alignItems: "center", justifyContent: "center",
  },
  bookBtn: {
    flex: 1, height: 50, borderRadius: 25,
    backgroundColor: C.primary, flexDirection: "row",
    alignItems: "center", justifyContent: "center", gap: 8,
  },
  bookBtnText: { color: C.white, fontWeight: "700", fontSize: 15 },
});