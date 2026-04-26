// ─── src/screens/log medicine/MedicineDashboardScreen.tsx ───────────────────

import React, { useCallback } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { Plus } from "lucide-react-native";
import Svg, { Circle } from "react-native-svg";

import { AuthStackParamList, Medicine } from "../../navigation/types";
import {
  Colors, DAYS_SHORT, getTodayIndex,
  getStockStatus, sharedStyles,
} from "../../constants/medicine";
import { PillIcon } from "./components/PillIcon";
import { useMedicines } from "../../context/MedicineContext";

type Props = NativeStackScreenProps<AuthStackParamList, "MedicineDashboard">;

const TODAY        = getTodayIndex();
const { width: W } = Dimensions.get("window");
const RING_R       = 23;
const RING_CIRC    = 2 * Math.PI * RING_R;

// ── Progress ring ─────────────────────────────────────────────────────────────
const ProgressRing: React.FC<{ pct: number }> = ({ pct }) => (
  <Svg width={58} height={58} viewBox="0 0 58 58">
    <Circle cx={29} cy={29} r={RING_R} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={5} />
    <Circle
      cx={29} cy={29} r={RING_R} fill="none" stroke="#fff" strokeWidth={5}
      strokeDasharray={`${RING_CIRC}`}
      strokeDashoffset={`${RING_CIRC * (1 - pct / 100)}`}
      strokeLinecap="round" rotation="-90" origin="29,29"
    />
  </Svg>
);

// ── Medicine card ─────────────────────────────────────────────────────────────
interface MedCardProps {
  med: Medicine;
  onPress: () => void;
  onTake: () => void;
}

const MedCard: React.FC<MedCardProps> = ({ med, onPress, onTake }) => {
  const isTaken = med.taken[TODAY];
  const ss      = getStockStatus(med.stock);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.medCard, isTaken && { borderColor: Colors.teal + "55" }]}
    >
      <View style={[styles.medIconWrap, { backgroundColor: med.color + "1A" }]}>
        <PillIcon color={med.color} size={28} />
      </View>

      <View style={styles.medInfo}>
        <View style={styles.medNameRow}>
          <Text style={styles.medName} numberOfLines={1}>{med.name}</Text>
          {ss && (
            <View style={[styles.badge, { backgroundColor: ss.bg }]}>
              <Text style={[styles.badgeText, { color: ss.color }]}>{ss.label}</Text>
            </View>
          )}
        </View>
        <Text style={styles.medSub}>{`${med.dose} ${med.unit} · ${med.freq}`}</Text>
        <View style={styles.timesRow}>
          {med.times.map((t, i) => (
            <View key={i} style={styles.timeChip}>
              <Text style={styles.timeChipText}>{t}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.takeCol}>
        <View style={[styles.checkCircle, isTaken && styles.checkDone]}>
          {isTaken && <Text style={styles.checkMark}>{"✓"}</Text>}
        </View>
        {!isTaken && (
          <TouchableOpacity
            onPress={onTake}
            style={styles.takeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.takeBtnText}>{"Take"}</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

// ── Screen ────────────────────────────────────────────────────────────────────
export default function MedicineDashboardScreen({ navigation }: Props): React.JSX.Element {
  const { medicines, markTaken, refetch, loading } = useMedicines();

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const takenToday = medicines.filter(m => m.taken[TODAY]).length;
  const pct        = medicines.length ? Math.round((takenToday / medicines.length) * 100) : 0;
  const lowStock   = medicines.filter(m => m.stock <= 7);

  return (
    <SafeAreaView style={sharedStyles.safeArea}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerCircle1} />
        <View style={styles.headerCircle2} />

        <View style={styles.headerTop}>
          <View>
            <Text style={styles.eyebrow}>{"Today's Overview"}</Text>
            <Text style={styles.heroTitle}>{"Medicine Tracker"}</Text>
          </View>
          <View style={styles.datePill}>
            <Text style={styles.datePillText}>
              {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </Text>
          </View>
        </View>

        <View style={styles.progressCard}>
          <View style={{ width: 58, height: 58 }}>
            <ProgressRing pct={pct} />
            <View style={styles.ringLabel}>
              <Text style={styles.ringLabelText}>{`${pct}%`}</Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.progressMain}>{`${takenToday} of ${medicines.length} taken`}</Text>
            <Text style={styles.progressSub}>
              {pct === 100 ? "🎉 All done for today!" : `${medicines.length - takenToday} remaining`}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Day strip ── */}
      <View style={styles.dayStrip}>
        {DAYS_SHORT.map((d, i) => {
          const isToday  = i === TODAY;
          const isPast   = i < TODAY;
          const allTaken = medicines.length > 0 && medicines.every(m => m.taken[i]);
          return (
            <View key={i} style={styles.dayCol}>
              <Text style={[styles.dayLabel, isToday && { color: Colors.teal, fontWeight: "700" }]}>
                {d}
              </Text>
              <View style={[
                styles.dayDot,
                isToday && styles.dayDotToday,
                isPast && allTaken && styles.dayDotDone,
              ]}>
                {(isToday || (isPast && allTaken)) && (
                  <Text style={{ color: isToday ? "#fff" : Colors.teal, fontSize: 11 }}>{"✓"}</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* ── Body ── */}
      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {loading && medicines.length === 0 ? (
          <View style={{ paddingVertical: 30, alignItems: "center" }}>
            <Text style={{ color: "#fff", fontWeight: "700" }}>Loading medicines...</Text>
          </View>
        ) : null}

        {/* Low stock alert */}
        {lowStock.length > 0 && (
          <TouchableOpacity
            style={styles.alertBanner}
            onPress={() => navigation.navigate("RefillManager")}
            activeOpacity={0.85}
          >
            <Text style={{ fontSize: 18 }}>{"⚠️"}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.alertTitle}>{"Refill needed"}</Text>
              <Text style={styles.alertSub}>
                {`${lowStock.map(m => m.name).join(", ")} ${lowStock.length === 1 ? "is" : "are"} running low`}
              </Text>
            </View>
            <Text style={styles.alertLink}>{"View →"}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.sectionRow}>
          <Text style={styles.sectionTitle}>{"My Medications"}</Text>
          <Text style={styles.sectionCount}>{`${medicines.length} active`}</Text>
        </View>

        {/* Empty state */}
        {medicines.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>{"💊"}</Text>
            <Text style={styles.emptyTitle}>{"No medicines yet"}</Text>
            <Text style={styles.emptySub}>{"Tap + to log your first medicine"}</Text>
            <TouchableOpacity
              style={styles.emptyCta}
              onPress={() => navigation.navigate("AddMedicine", {})}
              activeOpacity={0.85}
            >
              <Text style={styles.emptyCtaText}>{"Add Medicine"}</Text>
            </TouchableOpacity>
          </View>
        )}

        {medicines.map(med => (
          <MedCard
            key={med.id}
            med={med}
            onPress={() => navigation.navigate("MedicineDetail", { medicineId: med.id })}
            onTake={() => markTaken(med.id)}
          />
        ))}
      </ScrollView>

      {/* ── FAB ── */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate("AddMedicine", {})}
        activeOpacity={0.85}
      >
        <Plus color="#fff" size={24} />
      </TouchableOpacity>

    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  header:        { backgroundColor: Colors.teal, paddingHorizontal: W * 0.055, paddingTop: 20, paddingBottom: 28, overflow: "hidden" },
  headerCircle1: { position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: 70, backgroundColor: "rgba(255,255,255,0.09)" },
  headerCircle2: { position: "absolute", bottom: -40, left: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(255,255,255,0.06)" },
  headerTop:     { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  eyebrow:       { color: "rgba(255,255,255,0.72)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 },
  heroTitle:     { color: "#fff", fontSize: W > 380 ? 22 : 19, fontWeight: "800", fontFamily: "Georgia", marginTop: 3 },
  datePill:      { backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 },
  datePillText:  { color: "#fff", fontSize: 12, fontWeight: "700" },
  progressCard:  { backgroundColor: "rgba(255,255,255,0.18)", borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", gap: 16 },
  ringLabel:     { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  ringLabelText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  progressMain:  { color: "#fff", fontWeight: "800", fontSize: W > 380 ? 17 : 15 },
  progressSub:   { color: "rgba(255,255,255,0.72)", fontSize: 12, marginTop: 3 },

  dayStrip: { backgroundColor: Colors.card, paddingHorizontal: W * 0.055, paddingVertical: 12, flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: Colors.border },
  dayCol:   { alignItems: "center", gap: 5 },
  dayLabel: { fontSize: 10, color: Colors.muted, fontWeight: "500" },
  dayDot:   { width: 30, height: 30, borderRadius: 15, backgroundColor: "#F0F2F5", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "transparent" },
  dayDotToday: { backgroundColor: Colors.teal, borderColor: Colors.teal },
  dayDotDone:  { backgroundColor: Colors.tealGhost, borderColor: Colors.tealMid },

  body:         { paddingHorizontal: W * 0.055, paddingTop: 16, paddingBottom: 100 },
  sectionRow:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontWeight: "700", fontSize: 15, color: Colors.navy },
  sectionCount: { fontSize: 12, color: Colors.muted },

  alertBanner: { backgroundColor: Colors.orangeLight, borderRadius: 13, padding: 12, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14, borderWidth: 1, borderColor: Colors.orange + "30" },
  alertTitle:  { fontWeight: "700", fontSize: 13, color: Colors.orange },
  alertSub:    { fontSize: 12, color: Colors.slate },
  alertLink:   { fontSize: 12, color: Colors.orange, fontWeight: "700" },

  emptyState: { alignItems: "center", paddingVertical: 50 },
  emptyEmoji: { fontSize: 50, marginBottom: 12 },
  emptyTitle: { fontWeight: "700", color: Colors.navy, fontSize: 15, marginBottom: 4 },
  emptySub:   { fontSize: 13, color: Colors.muted },
  emptyCta:   { marginTop: 14, backgroundColor: Colors.teal, borderRadius: 22, paddingHorizontal: 20, paddingVertical: 10 },
  emptyCtaText:{ color: "#fff", fontWeight: "700", fontSize: 13 },

  medCard:     { backgroundColor: Colors.card, borderRadius: 16, padding: 14, marginBottom: 11, flexDirection: "row", alignItems: "center", gap: 14, borderWidth: 1.5, borderColor: Colors.border, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  medIconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  medInfo:     { flex: 1, minWidth: 0 },
  medNameRow:  { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  medName:     { fontWeight: "700", fontSize: 15, color: Colors.navy, flexShrink: 1 },
  medSub:      { fontSize: 12, color: Colors.muted, marginTop: 2 },
  timesRow:    { flexDirection: "row", gap: 5, marginTop: 5, flexWrap: "wrap" },
  timeChip:    { backgroundColor: Colors.tealGhost, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 2 },
  timeChipText:{ fontSize: 10, color: Colors.tealDark, fontWeight: "600" },
  badge:       { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText:   { fontSize: 10, fontWeight: "700" },

  takeCol:    { alignItems: "center", gap: 6 },
  checkCircle:{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#EEF0F3", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#DDE" },
  checkDone:  { backgroundColor: Colors.teal, borderColor: Colors.tealDark },
  checkMark:  { color: "#fff", fontSize: 14, fontWeight: "700" },
  takeBtn:    { backgroundColor: Colors.teal, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  takeBtnText:{ color: "#fff", fontSize: 10, fontWeight: "700" },

  fab: { position: "absolute", bottom: 28, right: W * 0.055, width: 54, height: 54, borderRadius: 27, backgroundColor: Colors.teal, alignItems: "center", justifyContent: "center", shadowColor: Colors.teal, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
});