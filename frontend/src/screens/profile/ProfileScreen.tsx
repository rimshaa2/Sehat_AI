import React, { useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, ScrollView,
  ActivityIndicator, SafeAreaView, StyleSheet,
  Dimensions, Alert,
} from "react-native";
import {
  ChevronLeft, Edit2, Calendar, FileText, Pill,
  User, Bell, Globe, ChevronRight, Heart, Droplets,
  Weight, Ruler, AlertTriangle, Phone, Activity,
  Shield, Moon, Brain, LogOut,
} from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getAuth, signOut } from "@react-native-firebase/auth";
import { getUserProfile } from "../../services/api";
import BottomNavBar from "../../components/BottomNavBar";

const { width } = Dimensions.get("window");

// ─── helpers ─────────────────────────────────────────────────────────────────
function bmi(weight?: number | null, height?: number | null): string {
  if (!weight || !height || height === 0) return "—";
  const h = height / 100;
  return (weight / (h * h)).toFixed(1);
}

function bmiLabel(bmiVal: string): { label: string; color: string } {
  const v = parseFloat(bmiVal);
  if (isNaN(v)) return { label: "", color: "#9CA3AF" };
  if (v < 18.5) return { label: "Underweight", color: "#F59E0B" };
  if (v < 25)   return { label: "Normal",      color: "#10B981" };
  if (v < 30)   return { label: "Overweight",  color: "#F97316" };
  return            { label: "Obese",          color: "#EF4444" };
}

function age(dateOfBirth?: string | null): string {
  if (!dateOfBirth) return "—";
  const d = new Date(dateOfBirth);
  const diff = Date.now() - d.getTime();
  return String(Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000)));
}

function initials(name?: string): string {
  if (!name) return "?";
  return name.split(" ").map(p => p[0]).join("").toUpperCase().slice(0, 2);
}

// ─── sub-components ───────────────────────────────────────────────────────────
function InfoChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={[styles.chip, { borderColor: color + "30", backgroundColor: color + "12" }]}>
      <Text style={[styles.chipLabel, { color }]}>{label}</Text>
      <Text style={[styles.chipValue, { color }]}>{value}</Text>
    </View>
  );
}

function MenuItem({ icon, title, subtitle, color = "#E0E7FF", onPress }: any) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.85}>
      <View style={[styles.menuIconBox, { backgroundColor: color }]}>{icon}</View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        {subtitle ? <Text style={styles.menuSubtitle}>{subtitle}</Text> : null}
      </View>
      <ChevronRight size={18} color="#D1D5DB" />
    </TouchableOpacity>
  );
}

// ─── main screen ──────────────────────────────────────────────────────────────
export default function ProfileScreen({ navigation }: any) {
  const [user, setUser]       = useState<any>(null);
  const [stats, setStats]     = useState({ appointments: 0, records: 0, medicines: 0, wellness: 0 });
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setLoading(true);
        try {
          const auth  = getAuth();
          const fbUser = auth.currentUser;
          if (!fbUser) return;

          const profile = await getUserProfile(fbUser.uid);
          setUser(profile);

          // Load real stats from timeline
          try {
            const timeline = await fetchMedicalTimeline(profile.id);
            const items: any[] = timeline?.items ?? [];
            setStats({
              appointments: items.filter((i: any) => i.source === "appointment").length,
              records:      items.filter((i: any) => i.source === "record").length,
              medicines:    items.filter((i: any) => i.source === "medicine").length,
              wellness:     items.filter((i: any) => i.source === "wellness").length,
            });
          } catch (_) {}
        } catch (err) {
          console.error("Profile fetch error:", err);
        } finally {
          setLoading(false);
        }
      })();
    }, [])
  );

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out", style: "destructive",
        onPress: async () => {
          await signOut(getAuth());
          navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#199A8E" />
      </View>
    );
  }

  const bmiVal   = bmi(user?.weight, user?.height);
  const bmiInfo  = bmiLabel(bmiVal);
  const userAge  = age(user?.dateOfBirth);
  const profileComplete = [user?.age || user?.dateOfBirth, user?.weight, user?.height, user?.bloodType, user?.gender].filter(Boolean).length;
  const completePct = Math.round((profileComplete / 5) * 100);

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <SafeAreaView style={styles.header}>
          <View style={styles.headerNav}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
              <ChevronLeft color="#FFF" size={26} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Profile</Text>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate("EditProfile", { userData: user })}
            >
              <Edit2 size={16} color="#FFF" />
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {/* Avatar + name */}
          <View style={styles.avatarRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials(user?.fullName)}</Text>
            </View>
            <View style={styles.avatarInfo}>
              <Text style={styles.avatarName}>{user?.fullName || "—"}</Text>
              <Text style={styles.avatarEmail}>{user?.email}</Text>
              {user?.phoneNumber ? (
                <Text style={styles.avatarPhone}>{user.phoneNumber}</Text>
              ) : null}
            </View>
          </View>

          {/* Profile completeness bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${completePct}%` as any }]} />
          </View>
          <Text style={styles.progressLabel}>
            {completePct < 100
              ? `Health profile ${completePct}% complete — tap Edit to fill in`
              : "✓ Health profile complete"}
          </Text>
        </SafeAreaView>

        {/* ── Activity stats ───────────────────────────────────────────────── */}
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Health Activity</Text>
          <View style={styles.statsGrid}>
            {[
              { icon: <Calendar size={20} color="#2563EB" />, bg: "#DBEAFE", n: stats.appointments, label: "Appointments" },
              { icon: <FileText size={20} color="#7C3AED" />, bg: "#EDE9FE", n: stats.records,      label: "AI Records"    },
              { icon: <Pill     size={20} color="#D97706" />, bg: "#FEF3C7", n: stats.medicines,    label: "Medicines"     },
              { icon: <Brain    size={20} color="#DB2777" />, bg: "#FCE7F3", n: stats.wellness,     label: "Wellness Logs" },
            ].map(s => (
              <TouchableOpacity
                key={s.label}
                style={styles.statBox}
                onPress={() => navigation.navigate("MedicalRecords")}
              >
                <View style={[styles.statIcon, { backgroundColor: s.bg }]}>{s.icon}</View>
                <Text style={styles.statNum}>{s.n}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Health vitals ────────────────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Activity size={18} color="#199A8E" />
            <Text style={styles.sectionTitle}>Health Vitals</Text>
          </View>
          <View style={styles.chipsRow}>
            <InfoChip label="Age"    value={userAge !== "—" ? `${userAge} yrs` : "—"} color="#2563EB" />
            <InfoChip label="Gender" value={user?.gender || "—"}                       color="#DB2777" />
            <InfoChip label="Blood"  value={user?.bloodType || "—"}                    color="#EF4444" />
          </View>
          <View style={[styles.chipsRow, { marginTop: 10 }]}>
            <InfoChip label="Weight" value={user?.weight ? `${user.weight} kg` : "—"} color="#D97706" />
            <InfoChip label="Height" value={user?.height ? `${user.height} cm` : "—"} color="#059669" />
            <InfoChip
              label="BMI"
              value={bmiVal !== "—" ? `${bmiVal} ${bmiInfo.label}` : "—"}
              color={bmiInfo.color}
            />
          </View>
        </View>

        {/* ── Medical info ─────────────────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Shield size={18} color="#199A8E" />
            <Text style={styles.sectionTitle}>Medical Information</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: "#FEE2E2" }]}>
              <AlertTriangle size={16} color="#EF4444" />
            </View>
            <View style={styles.infoBody}>
              <Text style={styles.infoLabel}>Allergies</Text>
              <Text style={styles.infoValue}>{user?.allergies || "None recorded"}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: "#DBEAFE" }]}>
              <FileText size={16} color="#2563EB" />
            </View>
            <View style={styles.infoBody}>
              <Text style={styles.infoLabel}>Medical History</Text>
              <Text style={styles.infoValue}>{user?.medicalHistory || "None recorded"}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={[styles.infoIcon, { backgroundColor: "#D1FAE5" }]}>
              <Phone size={16} color="#059669" />
            </View>
            <View style={styles.infoBody}>
              <Text style={styles.infoLabel}>Emergency Contact</Text>
              <Text style={styles.infoValue}>{user?.emergencyContact || "Not set"}</Text>
            </View>
          </View>
        </View>

        {/* ── Quick navigation ─────────────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Heart size={18} color="#199A8E" />
            <Text style={styles.sectionTitle}>Quick Access</Text>
          </View>
          <MenuItem icon={<Calendar size={18} color="#2563EB" />} title="My Appointments"    subtitle={`${stats.appointments} total`}       color="#DBEAFE" onPress={() => navigation.navigate("Appointments")} />
          <MenuItem icon={<FileText size={18} color="#7C3AED" />} title="Medical Records"    subtitle="View full history"                    color="#EDE9FE" onPress={() => navigation.navigate("MedicalRecords")} />
          <MenuItem icon={<Pill     size={18} color="#D97706" />} title="Medicine Tracker"   subtitle={`${stats.medicines} active`}          color="#FEF3C7" onPress={() => navigation.navigate("MedicineTracker")} />
          <MenuItem icon={<Brain    size={18} color="#DB2777" />} title="Mental Wellness"    subtitle={`${stats.wellness} sessions logged`}  color="#FCE7F3" onPress={() => navigation.navigate("MentalHealth")} />
        </View>

        {/* ── Settings ─────────────────────────────────────────────────────── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Globe size={18} color="#199A8E" />
            <Text style={styles.sectionTitle}>Settings</Text>
          </View>
          <MenuItem icon={<User  size={18} color="#3B82F6" />} title="Personal Information" subtitle="Edit name, phone, health data"  color="#EFF6FF" onPress={() => navigation.navigate("EditProfile", { userData: user })} />
          <MenuItem icon={<Bell  size={18} color="#8B5CF6" />} title="Notifications"        subtitle={user?.notificationsEnabled ? "On" : "Off"}  color="#F5F3FF" />
          <MenuItem icon={<Globe size={18} color="#10B981" />} title="Language"             subtitle={user?.preferredLanguage === "ur" ? "اردو" : user?.preferredLanguage === "pa" ? "ਪੰਜਾਬੀ" : "English"} color="#ECFDF5" />
        </View>

        {/* ── Sign Out ─────────────────────────────────────────────────────── */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <LogOut size={18} color="#EF4444" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.memberSince}>
          Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-PK", { year: "numeric", month: "long" }) : "—"}
        </Text>
      </ScrollView>

      <BottomNavBar navigation={navigation} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F3F4F6" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { paddingBottom: 110 },

  // Header
  header: { backgroundColor: "#199A8E", paddingHorizontal: 20, paddingBottom: 28 },
  headerNav: { flexDirection: "row", alignItems: "center", paddingTop: 12, marginBottom: 24 },
  headerTitle: { flex: 1, color: "#FFF", fontSize: 18, fontWeight: "700", marginLeft: 8 },
  iconBtn: { padding: 4 },
  editBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "rgba(255,255,255,0.22)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  editBtnText: { color: "#FFF", fontWeight: "700", fontSize: 13 },

  // Avatar
  avatarRow: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  avatarCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "rgba(255,255,255,0.5)", marginRight: 16 },
  avatarText: { fontSize: 26, fontWeight: "800", color: "#FFF" },
  avatarInfo: { flex: 1 },
  avatarName: { color: "#FFF", fontSize: 20, fontWeight: "800", marginBottom: 4 },
  avatarEmail: { color: "rgba(255,255,255,0.85)", fontSize: 12, marginBottom: 2 },
  avatarPhone: { color: "rgba(255,255,255,0.75)", fontSize: 12 },

  // Progress bar
  progressBar: { height: 6, backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 3, marginBottom: 6, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#FFF", borderRadius: 3 },
  progressLabel: { color: "rgba(255,255,255,0.8)", fontSize: 11 },

  // Cards
  statsCard: { backgroundColor: "#FFF", marginHorizontal: 16, marginTop: 16, borderRadius: 20, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  card: { backgroundColor: "#FFF", marginHorizontal: 16, marginTop: 14, borderRadius: 20, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1F2937" },

  // Stats grid
  statsGrid: { flexDirection: "row", justifyContent: "space-between" },
  statBox: { flex: 1, alignItems: "center" },
  statIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  statNum: { fontSize: 22, fontWeight: "800", color: "#1F2937", marginBottom: 2 },
  statLabel: { fontSize: 10, color: "#6B7280", textAlign: "center" },

  // Health chips
  chipsRow: { flexDirection: "row", gap: 8 },
  chip: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 10, alignItems: "center" },
  chipLabel: { fontSize: 9, fontWeight: "700", marginBottom: 4, textTransform: "uppercase" },
  chipValue: { fontSize: 13, fontWeight: "800" },

  // Info rows
  infoRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 14 },
  infoIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center", marginRight: 12 },
  infoBody: { flex: 1 },
  infoLabel: { fontSize: 11, fontWeight: "700", color: "#9CA3AF", marginBottom: 3, textTransform: "uppercase" },
  infoValue: { fontSize: 14, color: "#1F2937" },

  // Menu items
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  menuIconBox: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center", marginRight: 14 },
  menuContent: { flex: 1 },
  menuTitle: { fontSize: 14, fontWeight: "600", color: "#1F2937" },
  menuSubtitle: { fontSize: 12, color: "#9CA3AF", marginTop: 1 },

  // Sign out
  signOutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 16, marginTop: 16, paddingVertical: 16, backgroundColor: "#FFF", borderRadius: 16, borderWidth: 1.5, borderColor: "#FEE2E2" },
  signOutText: { color: "#EF4444", fontWeight: "700", fontSize: 15 },
  memberSince: { textAlign: "center", color: "#9CA3AF", fontSize: 12, marginTop: 14 },
});
async function fetchMedicalTimeline(id: any): Promise<{ items: any[] }> {
  // Mock implementation: replace with actual API call
  return { items: [] };
}

