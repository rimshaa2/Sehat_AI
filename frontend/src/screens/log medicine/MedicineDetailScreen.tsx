// ─── src/screens/log medicine/MedicineDetailScreen.tsx ──────────────────────

import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ChevronLeft, Bell, Pencil, Trash2 } from "lucide-react-native";

import { AuthStackParamList } from "../../navigation/types";
import {
  Colors, DAYS_SHORT, getTodayIndex,
  getAdherencePct, getStockStatus, sharedStyles,
} from "../../constants/medicine";
import { PillIcon } from "./components/PillIcon";
import { useMedicines } from "../../context/MedicineContext";

type Props = NativeStackScreenProps<AuthStackParamList, "MedicineDetail">;

const TODAY        = getTodayIndex();
const { width: W } = Dimensions.get("window");

export default function MedicineDetailScreen({ navigation, route }: Props): React.JSX.Element {
  const { medicineId } = route.params;
  const { medicines, toggleDay, deleteMedicine } = useMedicines();

  const med = medicines.find(m => m.id.toString() === medicineId.toString());

  if (!med) {
    return (
      <SafeAreaView style={sharedStyles.safeArea}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: Colors.muted, fontSize: 15 }}>{"Medicine not found."}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const adh        = getAdherencePct(med);
  const takenCount = med.taken.filter(Boolean).length;
  const daysLeft   = Math.max(0, med.durationDays - takenCount);
  const coursePct  = Math.min(100, Math.round((takenCount / med.durationDays) * 100));
  const ss         = getStockStatus(med.stock);

  const handleDelete = (): void => {
    Alert.alert(
      "Delete Medicine",
      `Remove ${med.name} from your tracker?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => {
          deleteMedicine(med.id);
          navigation.goBack();
        }},
      ]
    );
  };

  return (
    <SafeAreaView style={sharedStyles.safeArea}>

      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: med.color }]}>
        <View style={styles.heroCircle} />
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={Colors.navy} size={22} />
        </TouchableOpacity>

        <View style={styles.heroBody}>
          <View style={styles.heroIconWrap}>
            <PillIcon color="#fff" size={38} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroName} numberOfLines={1}>{med.name}</Text>
            <Text style={styles.heroSub}>{`${med.dose} ${med.unit} · ${med.freq}`}</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          {[
            { v: `${adh}%`,      l: "Adherence" },
            { v: `${med.stock}`, l: "Stock left" },
            { v: `${daysLeft}d`, l: "Remaining"  },
          ].map(s => (
            <View key={s.l} style={styles.statBox}>
              <Text style={styles.statValue}>{s.v}</Text>
              <Text style={styles.statLabel}>{s.l}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        {/* Weekly heatmap */}
        <View style={sharedStyles.sectionCard}>
          <Text style={sharedStyles.sectionCardTitle}>{"This Week"}</Text>
          <View style={styles.heatmapRow}>
            {DAYS_SHORT.map((d, i) => (
              <View key={i} style={styles.heatmapCol}>
                <Text style={[styles.heatmapDay, i === TODAY && { color: med.color, fontWeight: "700" }]}>{d}</Text>
                <TouchableOpacity
                  onPress={() => toggleDay(med.id, i)}
                  style={[
                    styles.heatmapCell,
                    med.taken[i] && { backgroundColor: med.color },
                    i === TODAY  && { borderColor: med.color, borderWidth: 2 },
                  ]}
                >
                  {med.taken[i] && <Text style={{ color: "#fff", fontSize: 13 }}>{"✓"}</Text>}
                </TouchableOpacity>
              </View>
            ))}
          </View>
          <View style={styles.adhBar}>
            <View style={[styles.adhBarFill, { width: `${adh}%` as any, backgroundColor: med.color }]} />
          </View>
          <Text style={styles.adhLabel}>{`${adh}% adherence this week`}</Text>
        </View>

        {/* Reminders */}
        <View style={sharedStyles.sectionCard}>
          <Text style={sharedStyles.sectionCardTitle}>{"Reminders"}</Text>
          {med.times.map((t, i) => (
            <View key={i} style={[styles.reminderRow, i < med.times.length - 1 && styles.reminderBorder]}>
              <View style={styles.reminderIcon}>
                <Bell color={Colors.teal} size={17} />
              </View>
              <Text style={styles.reminderTime}>{t}</Text>
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeText}>{"Active"}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Course progress */}
        <View style={sharedStyles.sectionCard}>
          <Text style={sharedStyles.sectionCardTitle}>{"Course Progress"}</Text>
          <View style={styles.courseRow}>
            <Text style={styles.courseSub}>{`${takenCount} of ${med.durationDays} days`}</Text>
            <Text style={[styles.coursePct, { color: med.color }]}>{`${coursePct}%`}</Text>
          </View>
          <View style={styles.courseBar}>
            <View style={[styles.courseBarFill, { width: `${coursePct}%` as any, backgroundColor: med.color }]} />
          </View>
          <Text style={styles.courseDaysLeft}>{`${daysLeft} days remaining in this course`}</Text>
        </View>

        {/* Stock warning */}
        {ss && (
          <View style={[styles.stockAlert, { backgroundColor: ss.bg, borderColor: ss.color + "40" }]}>
            <Text style={{ fontSize: 20 }}>{ss.label === "Critical" ? "⚠️" : "📦"}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.stockAlertTitle, { color: ss.color }]}>
                {ss.label === "Critical" ? "Very low stock!" : "Running low"}
              </Text>
              <Text style={styles.stockAlertSub}>{`Only ${med.stock} ${med.unit} remaining.`}</Text>
            </View>
          </View>
        )}

        {/* Notes */}
        {!!med.note && (
          <View style={sharedStyles.sectionCard}>
            <Text style={sharedStyles.sectionCardTitle}>{"Notes"}</Text>
            <Text style={styles.noteText}>{med.note}</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.editBtn}
            onPress={() => navigation.navigate("AddMedicine", { editMed: med })}>
            <Pencil color={Colors.teal} size={17} />
            <Text style={styles.editBtnText}>{"Edit"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
            <Trash2 color={Colors.red} size={17} />
            <Text style={styles.deleteBtnText}>{"Delete"}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero:        { paddingHorizontal: W * 0.055, paddingTop: 20, paddingBottom: 28, overflow: "hidden" },
  heroCircle:  { position: "absolute", top: -40, right: -30, width: 130, height: 130, borderRadius: 65, backgroundColor: "rgba(255,255,255,0.1)" },
  backBtn:     { backgroundColor: "rgba(255,255,255,0.25)", borderRadius: 10, width: 35, height: 35, alignItems: "center", justifyContent: "center", marginBottom: 14 },
  heroBody:    { flexDirection: "row", alignItems: "center", gap: 16 },
  heroIconWrap:{ width: 64, height: 64, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" },
  heroName:    { color: "#fff", fontSize: W > 380 ? 22 : 19, fontWeight: "800", fontFamily: "Georgia" },
  heroSub:     { color: "rgba(255,255,255,0.78)", fontSize: 13, marginTop: 4 },
  statsRow:    { flexDirection: "row", gap: 8, marginTop: 18 },
  statBox:     { flex: 1, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 12, paddingVertical: 10, alignItems: "center" },
  statValue:   { color: "#fff", fontWeight: "800", fontSize: W > 380 ? 18 : 15 },
  statLabel:   { color: "rgba(255,255,255,0.68)", fontSize: 10, marginTop: 2 },

  body: { paddingHorizontal: W * 0.055, paddingTop: 18, paddingBottom: 30 },

  heatmapRow:  { flexDirection: "row", justifyContent: "space-between" },
  heatmapCol:  { alignItems: "center", gap: 5 },
  heatmapDay:  { fontSize: 10, color: Colors.muted },
  heatmapCell: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#F0F2F5", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "transparent" },
  adhBar:      { backgroundColor: Colors.bg, borderRadius: 8, height: 6, overflow: "hidden", marginTop: 12 },
  adhBarFill:  { height: "100%", borderRadius: 8 },
  adhLabel:    { fontSize: 11, color: Colors.muted, textAlign: "right", marginTop: 5 },

  reminderRow:    { flexDirection: "row", alignItems: "center", gap: 13, paddingVertical: 10 },
  reminderBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  reminderIcon:   { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.tealGhost, alignItems: "center", justifyContent: "center" },
  reminderTime:   { flex: 1, fontWeight: "700", fontSize: 15, color: Colors.navy },
  activeBadge:    { backgroundColor: Colors.tealGhost, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 3 },
  activeBadgeText:{ fontSize: 11, color: Colors.tealDark, fontWeight: "700" },

  courseRow:     { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  courseSub:     { fontSize: 13, color: Colors.muted },
  coursePct:     { fontSize: 13, fontWeight: "700" },
  courseBar:     { backgroundColor: Colors.bg, borderRadius: 8, height: 10, overflow: "hidden" },
  courseBarFill: { height: "100%", borderRadius: 8 },
  courseDaysLeft:{ fontSize: 11, color: Colors.muted, marginTop: 7 },

  stockAlert:      { borderRadius: 14, padding: 14, marginBottom: 14, flexDirection: "row", gap: 12, alignItems: "center", borderWidth: 1 },
  stockAlertTitle: { fontWeight: "700", fontSize: 13 },
  stockAlertSub:   { fontSize: 12, color: Colors.slate },

  noteText:  { fontSize: 13, color: Colors.slate, lineHeight: 22 },
  actionRow: { flexDirection: "row", gap: 12, marginTop: 4 },
  editBtn:   { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 13, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.teal, backgroundColor: Colors.card },
  editBtnText:  { color: Colors.teal, fontWeight: "700", fontSize: 14 },
  deleteBtn:    { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 13, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.red, backgroundColor: Colors.redLight },
  deleteBtnText:{ color: Colors.red, fontWeight: "700", fontSize: 14 },
});