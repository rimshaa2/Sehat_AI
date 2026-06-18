// ─── src/screens/log medicine/AddMedicineScreen.tsx ─────────────────────────

import React, { useCallback, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ChevronLeft, Bell, X } from "lucide-react-native";

import { Medicine, AuthStackParamList } from "../../navigation/types";
import {
  Colors, PILL_COLORS, UNITS, FREQ_OPTIONS,
  TIME_SLOTS, sharedStyles,
} from "../../constants/medicine";
import { PillIcon } from "./components/PillIcon";
import { useMedicines } from "../../context/MedicineContext";

type Props = NativeStackScreenProps<AuthStackParamList, "AddMedicine">;

const STEP_LABELS  = ["Details", "Schedule", "Review"] as const;
const { width: W } = Dimensions.get("window");

// ── Field wrapper ─────────────────────────────────────────────────────────────
const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <View style={styles.field}>
    <Text style={sharedStyles.fieldLabel}>{label}</Text>
    {children}
  </View>
);

// ── Focus-aware input ─────────────────────────────────────────────────────────
const FocusInput: React.FC<React.ComponentProps<typeof TextInput>> = (props) => {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      {...props}
      style={[sharedStyles.input, focused && sharedStyles.inputFocused, props.style]}
      onFocus={e => { setFocused(true); props.onFocus?.(e); }}
      onBlur={e  => { setFocused(false); props.onBlur?.(e); }}
      placeholderTextColor={Colors.muted}
    />
  );
};

// ── Screen ────────────────────────────────────────────────────────────────────
export default function AddMedicineScreen({ navigation, route }: Props): React.JSX.Element {
  const { editMed } = route.params ?? {};
  const { addMedicine, updateMedicine, refetch } = useMedicines();
  const isEdit = !!editMed;

  const [step,     setStep]     = useState<1 | 2 | 3>(1);
  const [color,    setColor]    = useState(editMed?.color            ?? Colors.teal);
  const [name,     setName]     = useState(editMed?.name             ?? "");
  const [dose,     setDose]     = useState(editMed?.dose             ?? "");
  const [unit,     setUnit]     = useState(editMed?.unit             ?? "mg");
  const [freq,     setFreq]     = useState(editMed?.freq             ?? FREQ_OPTIONS[0].label);
  const [stock,    setStock]    = useState(editMed?.stock?.toString()         ?? "30");
  const [duration, setDuration] = useState(editMed?.durationDays?.toString() ?? "30");
  const [times,    setTimes]    = useState<string[]>(editMed?.times  ?? ["8:00 AM"]);
  const [note,     setNote]     = useState(editMed?.note             ?? "");

  const freqObj    = FREQ_OPTIONS.find(f => f.label === freq) ?? FREQ_OPTIONS[0];
  const step1Valid = name.trim().length > 0 && dose.trim().length > 0;

  const addTime    = (): void => {
    if (times.length < Math.min(freqObj.maxTimes, 4)) setTimes(p => [...p, "8:00 AM"]);
  };
  const removeTime = (i: number): void => setTimes(p => p.filter((_, idx) => idx !== i));
  const updateTime = (i: number, v: string): void => setTimes(p => p.map((t, idx) => idx === i ? v : t));

  const handleSave = async (): Promise<void> => {
    const payload: Omit<Medicine, "id" | "taken" | "notifIds"> = {
      name, dose, unit, freq, color, note,
      stock:        parseInt(stock,    10) || 30,
      durationDays: parseInt(duration, 10) || 30,
      times,
    };
    if (isEdit && editMed) await updateMedicine({ ...editMed, ...payload });
    else await addMedicine(payload);
    await refetch().catch(() => {});
    navigation.goBack();
  };

  const handleContinue = (): void => {
    if (step === 1 && step1Valid) setStep(2);
    else if (step === 2) setStep(3);
    else if (step === 3) handleSave();
  };

  return (
    <SafeAreaView style={sharedStyles.safeArea}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>

        {/* Header */}
        <View style={sharedStyles.screenHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={sharedStyles.backBtn}>
            <ChevronLeft color={Colors.navy} size={22} />
          </TouchableOpacity>
          <Text style={sharedStyles.headerTitle}>{isEdit ? "Edit Medicine" : "Log Medicine"}</Text>
          <View style={{ flex: 1 }} />
          <View style={styles.stepRow}>
            {[1, 2, 3].map(s => (
              <View key={s} style={[styles.stepDot, s <= step && styles.stepDotActive, s === step && styles.stepDotCurrent]} />
            ))}
          </View>
        </View>

        <Text style={styles.stepLabel}>{`Step ${step} of 3 — ${STEP_LABELS[step - 1]}`}</Text>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* ── Step 1: Details ── */}
          {step === 1 && (
            <>
              <Text style={styles.stepIntro}>{"Enter the basic information about your medicine."}</Text>

              <Field label="Pill Colour">
                <View style={styles.colorRow}>
                  {PILL_COLORS.map(c => (
                    <TouchableOpacity key={c} onPress={() => setColor(c)}
                      style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotSelected]} />
                  ))}
                </View>
              </Field>

              <Field label="Medicine Name *">
                <FocusInput value={name} onChangeText={setName} placeholder="e.g. Oxycodone" autoCapitalize="words" />
              </Field>

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Field label="Dose *">
                    <FocusInput value={dose} onChangeText={setDose} placeholder="e.g. 5" keyboardType="numeric" />
                  </Field>
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <Field label="Unit">
                    <View style={styles.chipRow}>
                      {UNITS.map(u => (
                        <TouchableOpacity key={u} onPress={() => setUnit(u)}
                          style={[styles.chip, unit === u && styles.chipActive]}>
                          <Text style={[styles.chipText, unit === u && styles.chipTextActive]}>{u}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </Field>
                </View>
              </View>

              <Field label="Frequency">
                <View style={styles.chipRow}>
                  {FREQ_OPTIONS.map(f => (
                    <TouchableOpacity key={f.label}
                      onPress={() => { setFreq(f.label); if (times.length > f.maxTimes) setTimes(p => p.slice(0, f.maxTimes)); }}
                      style={[styles.chip, freq === f.label && styles.chipActive]}>
                      <Text style={[styles.chipText, freq === f.label && styles.chipTextActive]}>{f.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Field>

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Field label="Stock left">
                    <FocusInput value={stock} onChangeText={setStock} placeholder="30" keyboardType="numeric" />
                  </Field>
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <Field label="Duration (days)">
                    <FocusInput value={duration} onChangeText={setDuration} placeholder="30" keyboardType="numeric" />
                  </Field>
                </View>
              </View>
            </>
          )}

          {/* ── Step 2: Schedule ── */}
          {step === 2 && (
            <>
              <Text style={styles.stepIntro}>
                {"Set reminder times for "}
                <Text style={{ fontWeight: "700", color: Colors.navy }}>{name}</Text>
                {"."}
              </Text>

              <Field label="Reminder Times">
                {times.map((t, i) => (
                  <View key={i} style={styles.timeRow}>
                    <View style={styles.timeInputWrap}>
                      <Bell color={Colors.teal} size={17} />
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.timeSlotScroll}>
                        {TIME_SLOTS.map(ts => (
                          <TouchableOpacity key={ts} onPress={() => updateTime(i, ts)}
                            style={[styles.timeSlotChip, t === ts && styles.timeSlotChipActive]}>
                            <Text style={[styles.timeSlotText, t === ts && styles.timeSlotTextActive]}>{ts}</Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                    {times.length > 1 && (
                      <TouchableOpacity onPress={() => removeTime(i)} style={styles.removeBtn}>
                        <X color={Colors.red} size={14} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}
                {times.length < Math.min(freqObj.maxTimes, 4) && (
                  <TouchableOpacity onPress={addTime} style={styles.addTimeBtn}>
                    <Text style={styles.addTimeBtnText}>{"+ Add another time"}</Text>
                  </TouchableOpacity>
                )}
              </Field>

              <Field label="Notes (optional)">
                <FocusInput value={note} onChangeText={setNote}
                  placeholder="e.g. Take with food, avoid sunlight…"
                  multiline numberOfLines={3}
                  style={{ minHeight: 80, textAlignVertical: "top" }} />
              </Field>

              <View style={[styles.previewCard, { backgroundColor: color + "12", borderColor: color + "30" }]}>
                <View style={[styles.previewIcon, { backgroundColor: color + "25" }]}>
                  <PillIcon color={color} size={28} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.previewName}>{name}</Text>
                  <Text style={styles.previewSub}>{`${dose} ${unit} · ${freq}`}</Text>
                  <View style={styles.timesRow}>
                    {times.map((t, i) => (
                      <View key={i} style={styles.timeChip}>
                        <Text style={styles.timeChipText}>{t}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </>
          )}

          {/* ── Step 3: Review ── */}
          {step === 3 && (
            <>
              <Text style={styles.stepIntro}>{"Review everything before saving."}</Text>

              <View style={[styles.reviewHero, { backgroundColor: color + "18", borderColor: color + "30" }]}>
                <View style={[styles.reviewHeroIcon, { backgroundColor: color + "28" }]}>
                  <PillIcon color={color} size={38} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.reviewHeroName}>{name}</Text>
                  <Text style={styles.reviewHeroSub}>{`${dose} ${unit} · ${freq}`}</Text>
                  <Text style={[styles.reviewHeroBadge, { color }]}>
                    {`${duration} day course · ${stock} units`}
                  </Text>
                </View>
              </View>

              {[
                { label: "Reminder times", value: times.join("  ·  ") },
                { label: "Stock count",    value: `${stock} ${unit}` },
                { label: "Duration",       value: `${duration} days` },
                { label: "Notes",          value: note || "—" },
              ].map(row => (
                <View key={row.label} style={styles.reviewRow}>
                  <Text style={styles.reviewRowLabel}>{row.label}</Text>
                  <Text style={styles.reviewRowValue}>{row.value}</Text>
                </View>
              ))}
            </>
          )}
        </ScrollView>

        {/* Bottom bar */}
        <View style={sharedStyles.bottomBar}>
          {step > 1 && (
            <TouchableOpacity onPress={() => setStep(s => (s - 1) as 1 | 2 | 3)} style={sharedStyles.outlineBtn}>
              <Text style={sharedStyles.outlineBtnText}>{"Back"}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handleContinue}
            disabled={step === 1 && !step1Valid}
            style={[sharedStyles.primaryBtn, step === 1 && !step1Valid && styles.btnDisabled]}
          >
            <Text style={sharedStyles.primaryBtnText}>
              {step < 3 ? "Continue →" : (isEdit ? "Save Changes ✓" : "Save Medicine ✓")}
            </Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  stepLabel:   { fontSize: 12, color: Colors.muted, paddingHorizontal: W * 0.055, paddingTop: 8, paddingBottom: 4 },
  body:        { paddingHorizontal: W * 0.055, paddingTop: 14, paddingBottom: 30 },
  stepIntro:   { fontSize: 13, color: Colors.slate, lineHeight: 20, marginBottom: 20 },
  row:         { flexDirection: "row" },
  field:       { marginBottom: 18 },

  stepRow:         { flexDirection: "row", gap: 5 },
  stepDot:         { height: 6, width: 8, borderRadius: 3, backgroundColor: Colors.border },
  stepDotActive:   { backgroundColor: Colors.teal + "88" },
  stepDotCurrent:  { width: 22, backgroundColor: Colors.teal },

  colorRow:         { flexDirection: "row", gap: 10 },
  colorDot:         { width: 32, height: 32, borderRadius: 16, borderWidth: 3, borderColor: "transparent" },
  colorDotSelected: { borderColor: Colors.navy, transform: [{ scale: 1.15 }] },

  chipRow:       { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip:          { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.card },
  chipActive:    { borderColor: Colors.teal, backgroundColor: Colors.tealGhost },
  chipText:      { fontSize: 12, color: Colors.slate },
  chipTextActive:{ color: Colors.tealDark, fontWeight: "700" },

  timeRow:       { flexDirection: "row", gap: 10, alignItems: "center", marginBottom: 10 },
  timeInputWrap: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: Colors.card, borderRadius: 13, paddingHorizontal: 14, paddingVertical: 2, borderWidth: 1.5, borderColor: Colors.border },
  timeSlotScroll:     { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  timeSlotChip:       { paddingVertical: 7, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.card, marginRight: 8 },
  timeSlotChipActive: { borderColor: Colors.teal, backgroundColor: Colors.tealGhost },
  timeSlotText:       { fontSize: 12, color: Colors.slate },
  timeSlotTextActive: { color: Colors.tealDark, fontWeight: "700" },
  removeBtn:     { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.redLight, alignItems: "center", justifyContent: "center" },
  addTimeBtn:    { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: Colors.tealGhost, borderRadius: 13, paddingVertical: 10, borderWidth: 1.5, borderStyle: "dashed", borderColor: Colors.tealMid, marginTop: 4 },
  addTimeBtnText:{ color: Colors.tealDark, fontWeight: "700", fontSize: 13 },

  previewCard:  { borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 14, marginTop: 6, borderWidth: 1.5 },
  previewIcon:  { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  previewName:  { fontWeight: "800", color: Colors.navy, fontSize: 15 },
  previewSub:   { fontSize: 12, color: Colors.muted, marginTop: 2 },
  timesRow:     { flexDirection: "row", gap: 5, flexWrap: "wrap", marginTop: 4 },
  timeChip:     { backgroundColor: Colors.tealGhost, borderRadius: 20, paddingHorizontal: 9, paddingVertical: 2 },
  timeChipText: { fontSize: 10, color: Colors.tealDark, fontWeight: "600" },

  reviewHero:      { borderRadius: 20, padding: 20, flexDirection: "row", gap: 16, alignItems: "center", marginBottom: 14, borderWidth: 1.5 },
  reviewHeroIcon:  { width: 64, height: 64, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  reviewHeroName:  { fontSize: W > 380 ? 20 : 17, fontWeight: "800", color: Colors.navy, fontFamily: "Georgia" },
  reviewHeroSub:   { fontSize: 13, color: Colors.slate, marginTop: 3 },
  reviewHeroBadge: { fontSize: 12, fontWeight: "700", marginTop: 3 },
  reviewRow:       { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  reviewRowLabel:  { fontSize: 13, color: Colors.muted, fontWeight: "600" },
  reviewRowValue:  { fontSize: 13, color: Colors.navy, fontWeight: "700", maxWidth: "55%", textAlign: "right" },
  btnDisabled:     { backgroundColor: Colors.border },
});