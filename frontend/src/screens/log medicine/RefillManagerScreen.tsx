// ─── src/screens/log medicine/RefillManagerScreen.tsx ───────────────────────

import React from "react";
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
import { ChevronLeft } from "lucide-react-native";

import { AuthStackParamList, Medicine } from "../../navigation/types";
import { Colors, getStockStatus, sharedStyles } from "../../constants/medicine";
import { PillIcon } from "./components/PillIcon";
import { useMedicines } from "../../context/MedicineContext";

type Props = NativeStackScreenProps<AuthStackParamList, "RefillManager">;
const { width: W } = Dimensions.get("window");

const RefillCard: React.FC<{ med: Medicine }> = ({ med }) => {
  const ss     = getStockStatus(med.stock)!;
  const barPct = Math.min(100, (med.stock / 30) * 100);
  return (
    <View style={styles.refillCard}>
      <View style={[styles.iconWrap, { backgroundColor: med.color + "18" }]}>
        <PillIcon color={med.color} size={27} />
      </View>
      <View style={styles.refillInfo}>
        <Text style={styles.refillName}>{med.name}</Text>
        <View style={styles.stockBar}>
          <View style={[styles.stockBarFill, { width: `${barPct}%` as any, backgroundColor: ss.color }]} />
        </View>
        <Text style={styles.refillSub}>{`${med.stock} ${med.unit} remaining`}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: ss.bg }]}>
        <Text style={[styles.statusBadgeText, { color: ss.color }]}>{ss.label}</Text>
      </View>
    </View>
  );
};

const OkCard: React.FC<{ med: Medicine }> = ({ med }) => (
  <View style={styles.okCard}>
    <View style={[styles.okIcon, { backgroundColor: med.color + "15" }]}>
      <PillIcon color={med.color} size={22} />
    </View>
    <Text style={styles.okName} numberOfLines={1}>{med.name}</Text>
    <Text style={styles.okStock}>{`${med.stock} left`}</Text>
  </View>
);

export default function RefillManagerScreen({ navigation }: Props): React.JSX.Element {
  const { medicines } = useMedicines();
  const low = medicines.filter(m => m.stock <= 7);
  const ok  = medicines.filter(m => m.stock > 7);

  return (
    <SafeAreaView style={sharedStyles.safeArea}>
      <View style={sharedStyles.screenHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={sharedStyles.backBtn}>
          <ChevronLeft color={Colors.navy} size={22} />
        </TouchableOpacity>
        <Text style={sharedStyles.headerTitle}>{"Refill Manager"}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>

        {medicines.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>{"💊"}</Text>
            <Text style={styles.emptyTitle}>{"No medicines added yet"}</Text>
            <Text style={styles.emptySub}>{"Add medicines from the dashboard first."}</Text>
          </View>
        )}

        {low.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>{`Needs Refill (${low.length})`}</Text>
            {low.map(med => <RefillCard key={med.id} med={med} />)}
          </>
        )}

        {low.length === 0 && medicines.length > 0 && (
          <View style={styles.allGoodBanner}>
            <Text style={{ fontSize: 22 }}>{"✅"}</Text>
            <Text style={styles.allGoodText}>{"All medicines are well stocked!"}</Text>
          </View>
        )}

        {ok.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: Colors.muted, marginTop: 18 }]}>
              {`Well Stocked (${ok.length})`}
            </Text>
            {ok.map(med => <OkCard key={med.id} med={med} />)}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body:         { paddingHorizontal: W * 0.055, paddingTop: 18, paddingBottom: 30 },
  sectionLabel: { fontSize: 13, fontWeight: "700", color: Colors.red, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 },

  refillCard:      { backgroundColor: Colors.card, borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: "row", alignItems: "center", gap: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  iconWrap:        { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  refillInfo:      { flex: 1 },
  refillName:      { fontWeight: "700", color: Colors.navy, fontSize: 15 },
  stockBar:        { backgroundColor: "#F0F2F5", borderRadius: 6, height: 6, overflow: "hidden", marginVertical: 6 },
  stockBarFill:    { height: "100%", borderRadius: 6 },
  refillSub:       { fontSize: 11, color: Colors.muted },
  statusBadge:     { borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  statusBadgeText: { fontSize: 11, fontWeight: "700" },

  okCard:  { backgroundColor: Colors.card, borderRadius: 14, padding: 12, marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 12, opacity: 0.75 },
  okIcon:  { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  okName:  { flex: 1, fontWeight: "600", color: Colors.slate },
  okStock: { fontSize: 12, color: Colors.tealDark, fontWeight: "700" },

  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyEmoji: { fontSize: 52, marginBottom: 14 },
  emptyTitle: { fontWeight: "800", fontSize: 16, color: Colors.navy, marginBottom: 4 },
  emptySub:   { fontSize: 13, color: Colors.muted },

  allGoodBanner: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: Colors.tealGhost, borderRadius: 14, padding: 14, marginBottom: 14 },
  allGoodText:   { fontSize: 14, fontWeight: "700", color: Colors.tealDark },
});