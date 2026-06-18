// ─── src/constants/medicine.ts ───────────────────────────────────────────────

import { StyleSheet } from "react-native";
import { Medicine } from "../navigation/types";

// ── Design tokens ─────────────────────────────────────────────────────────────
export const Colors = {
  teal:        "#00C9A7",
  tealDark:    "#00A88C",
  tealDeep:    "#007A6B",
  tealGhost:   "#E8FAF7",
  tealMid:     "#B2EDE5",
  bg:          "#F4F7F9",
  card:        "#FFFFFF",
  navy:        "#1C2A3A",
  slate:       "#4A5568",
  muted:       "#94A3B8",
  border:      "#EDF2F7",
  red:         "#FF6B6B",
  redLight:    "#FFF0F0",
  orange:      "#FF9F43",
  orangeLight: "#FFF6EE",
  blue:        "#4A90E2",
  purple:      "#9B59B6",
  green:       "#27AE60",
  pink:        "#E91E8C",
};

export const PILL_COLORS: string[] = [
  Colors.teal, Colors.blue, Colors.orange,
  Colors.red, Colors.purple, Colors.green, Colors.pink,
];

export const UNITS: string[] = [
  "mg", "ml", "tablet(s)", "capsule(s)", "drops",
];

export interface FreqOption {
  label: string;
  maxTimes: number;
}

export const FREQ_OPTIONS: FreqOption[] = [
  { label: "Once daily",  maxTimes: 1 },
  { label: "Twice daily", maxTimes: 2 },
  { label: "3× daily",    maxTimes: 3 },
  { label: "Weekly",      maxTimes: 1 },
  { label: "As needed",   maxTimes: 1 },
];

export const TIME_SLOTS: string[] = [
  "6:00 AM","7:00 AM","8:00 AM","9:00 AM","10:00 AM","11:00 AM",
  "12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM",
  "6:00 PM","7:00 PM","8:00 PM","9:00 PM","10:00 PM","11:00 PM",
];

export const DAYS_SHORT: string[] = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

export const getTodayIndex = (): number => {
  const d = new Date().getDay();
  return d === 0 ? 6 : d - 1;
};

// ── Domain helpers ────────────────────────────────────────────────────────────
export const getAdherencePct = (med: Medicine): number =>
  Math.round((med.taken.filter(Boolean).length / med.taken.length) * 100);

export interface StockStatus {
  label: "Critical" | "Low";
  bg: string;
  color: string;
}

export const getStockStatus = (stock: number): StockStatus | null => {
  if (stock <= 3) return { label: "Critical", bg: Colors.redLight,    color: Colors.red    };
  if (stock <= 7) return { label: "Low",      bg: Colors.orangeLight, color: Colors.orange };
  return null;
};

// ── Shared styles ─────────────────────────────────────────────────────────────
export const sharedStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  screenHeader: {
    backgroundColor: Colors.card,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.navy,
    fontFamily: "Georgia",
  },
  backBtn: {
    padding: 6,
    borderRadius: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.muted,
    marginBottom: 7,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.navy,
  },
  inputFocused: {
    borderColor: Colors.teal,
  },
  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionCardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.navy,
    marginBottom: 12,
  },
  bottomBar: {
    backgroundColor: Colors.card,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    flexDirection: "row",
    gap: 10,
  },
  primaryBtn: {
    flex: 2,
    backgroundColor: Colors.teal,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  outlineBtn: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.teal,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.card,
  },
  outlineBtnText: {
    color: Colors.teal,
    fontWeight: "700",
    fontSize: 15,
  },
});