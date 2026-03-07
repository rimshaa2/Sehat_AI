import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// GAD-7 — Generalized Anxiety Disorder 7-item scale (clinically validated)
const QUESTIONS = [
  "Feeling nervous, anxious, or on edge",
  "Not being able to stop or control worrying",
  "Worrying too much about different things",
  "Trouble relaxing",
  "Being so restless that it's hard to sit still",
  "Becoming easily annoyed or irritable",
  "Feeling afraid, as if something awful might happen",
];

const OPTIONS = [
  { label: "Not at all",        score: 0 },
  { label: "Several days",      score: 1 },
  { label: "More than half",    score: 2 },
  { label: "Nearly every day",  score: 3 },
];

const getResult = (total: number) => {
  if (total <= 4)  return { level: "Minimal",  color: "#4CAF50", bg: "#E8F5E9", icon: "😊", desc: "Your anxiety levels appear minimal. Keep practicing self-care and the healthy habits you've built.", advice: ["Maintain your current healthy routines", "Practice daily mindfulness or breathing", "Stay connected with people you care about"] };
  if (total <= 9)  return { level: "Mild",     color: "#FF9800", bg: "#FFF3E0", icon: "😐", desc: "You're experiencing mild anxiety. This is very common and manageable with the right tools.", advice: ["Try the breathing exercises in this app", "Journaling can help process your thoughts", "Regular exercise significantly reduces anxiety", "Consider talking to a trusted friend"] };
  if (total <= 14) return { level: "Moderate", color: "#FF5722", bg: "#FBE9E7", icon: "😔", desc: "Your score suggests moderate anxiety. It's worth taking this seriously and seeking support.", advice: ["Speak with a mental health counselor", "Consider therapy — CBT is very effective for anxiety", "Reduce caffeine and screen time before bed", "Use the Talk to Expert feature in this app"] };
  return           { level: "Severe",   color: "#E53935", bg: "#FFEBEE", icon: "😰", desc: "Your score indicates severe anxiety. Please reach out for professional support — you deserve help.", advice: ["Contact a mental health professional soon", "Reach out to someone you trust today", "Use our Crisis Help resources if needed", "Remember: severe anxiety is treatable"] };
};

function AnxietyQuizScreen({ navigation }: { navigation: any }) {
  const [answers, setAnswers]     = useState<(number | null)[]>(Array(7).fill(null));
  const [currentQ, setCurrentQ]  = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [started, setStarted]    = useState(false);

  const total = answers.reduce<number>((acc, a) => acc + (a ?? 0), 0);
  const result = getResult(total);
  const answered = answers.filter((a) => a !== null).length;
  const progress = answered / QUESTIONS.length;

  const selectAnswer = (score: number) => {
    const updated = [...answers];
    updated[currentQ] = score;
    setAnswers(updated);
    if (currentQ < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQ(currentQ + 1), 300);
    }
  };

  const handleSubmit = () => {
    if (answers.every((a) => a !== null)) setShowResult(true);
  };

  const handleRetake = () => {
    setAnswers(Array(7).fill(null));
    setCurrentQ(0);
    setShowResult(false);
    setStarted(false);
  };

  if (!started) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Anxiety Assessment</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.introCard}>
            <Text style={styles.introIcon}>🧠</Text>
            <Text style={styles.introTitle}>GAD-7 Anxiety Scale</Text>
            <Text style={styles.introDesc}>
              This is the clinically validated Generalized Anxiety Disorder 7-item questionnaire
              used by mental health professionals worldwide.
            </Text>
            <View style={styles.introMeta}>
              {[
                { icon: "time-outline" as const,     label: "~2 minutes" },
                { icon: "shield-outline" as const,   label: "Private & confidential" },
                { icon: "medical-outline" as const,  label: "Clinically validated" },
              ].map((m, i) => (
                <View key={i} style={styles.introMetaItem}>
                  <Ionicons name={m.icon} size={16} color="#7E57C2" />
                  <Text style={styles.introMetaText}>{m.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.disclaimerCard}>
            <Ionicons name="information-circle-outline" size={18} color="#FF9800" />
            <Text style={styles.disclaimerText}>
              This quiz is for informational purposes only and does not replace professional
              medical advice, diagnosis, or treatment.
            </Text>
          </View>

          <TouchableOpacity style={styles.startBtn} onPress={() => setStarted(true)}>
            <Text style={styles.startBtnText}>Begin Assessment</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (showResult) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Results</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Score Card */}
          <View style={[styles.resultCard, { backgroundColor: result.bg }]}>
            <Text style={styles.resultEmoji}>{result.icon}</Text>
            <Text style={[styles.resultLevel, { color: result.color }]}>{result.level} Anxiety</Text>
            <View style={styles.resultScoreRow}>
              <Text style={[styles.resultScore, { color: result.color }]}>{total}</Text>
              <Text style={styles.resultScoreMax}>/21</Text>
            </View>
            <Text style={styles.resultDesc}>{result.desc}</Text>
          </View>

          {/* Score breakdown */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Score Breakdown</Text>
            {QUESTIONS.map((q, i) => (
              <View key={i} style={styles.breakdownRow}>
                <Text style={styles.breakdownQ} numberOfLines={2}>{q}</Text>
                <View style={[styles.breakdownScore, { backgroundColor: result.color + "22" }]}>
                  <Text style={[styles.breakdownScoreText, { color: result.color }]}>
                    {answers[i]}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Range guide */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Score Ranges</Text>
            {[
              { range: "0–4",   level: "Minimal",  color: "#4CAF50" },
              { range: "5–9",   level: "Mild",     color: "#FF9800" },
              { range: "10–14", level: "Moderate", color: "#FF5722" },
              { range: "15–21", level: "Severe",   color: "#E53935" },
            ].map((r, i) => (
              <View key={i} style={styles.rangeRow}>
                <View style={[styles.rangeDot, { backgroundColor: r.color }]} />
                <Text style={styles.rangeText}>{r.range} — {r.level}</Text>
                {total >= parseInt(r.range) && total <= parseInt(r.range.split("–")[1]) && (
                  <View style={[styles.youBadge, { backgroundColor: r.color }]}>
                    <Text style={styles.youBadgeText}>You</Text>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* Recommendations */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>What We Recommend</Text>
            {result.advice.map((a, i) => (
              <View key={i} style={styles.adviceRow}>
                <View style={[styles.adviceDot, { backgroundColor: result.color }]} />
                <Text style={styles.adviceText}>{a}</Text>
              </View>
            ))}
          </View>

          {/* Action buttons */}
          <TouchableOpacity
            style={styles.talkBtn}
            onPress={() => navigation.navigate("Talk")}
          >
            <Ionicons name="chatbubble-outline" size={20} color="white" />
            <Text style={styles.talkBtnText}>Talk to an Expert</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.retakeBtn} onPress={handleRetake}>
            <Text style={styles.retakeBtnText}>Retake Assessment</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Quiz in progress
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { if (currentQ > 0) setCurrentQ(currentQ - 1); else setStarted(false); }} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Question {currentQ + 1} of {QUESTIONS.length}</Text>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
      <Text style={styles.progressLabel}>{answered} of {QUESTIONS.length} answered</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Prompt */}
        <View style={styles.card}>
          <Text style={styles.promptLabel}>Over the last 2 weeks, how often have you been bothered by:</Text>
          <Text style={styles.promptQ}>"{QUESTIONS[currentQ]}"</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsCol}>
          {OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.score}
              style={[
                styles.optionBtn,
                answers[currentQ] === opt.score && styles.optionBtnActive,
              ]}
              onPress={() => selectAnswer(opt.score)}
            >
              <View style={[
                styles.optionCircle,
                answers[currentQ] === opt.score && styles.optionCircleActive,
              ]}>
                {answers[currentQ] === opt.score && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
              <Text style={[
                styles.optionText,
                answers[currentQ] === opt.score && styles.optionTextActive,
              ]}>
                {opt.label}
              </Text>
              <Text style={styles.optionScore}>{opt.score}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Navigation */}
        <View style={styles.navRow}>
          {currentQ > 0 && (
            <TouchableOpacity style={styles.navBtn} onPress={() => setCurrentQ(currentQ - 1)}>
              <Ionicons name="chevron-back" size={18} color="#7E57C2" />
              <Text style={styles.navBtnText}>Previous</Text>
            </TouchableOpacity>
          )}
          <View style={{ flex: 1 }} />
          {currentQ < QUESTIONS.length - 1 ? (
            <TouchableOpacity
              style={[styles.navBtn, styles.navBtnPrimary, !answers[currentQ] && { opacity: 0.5 }]}
              onPress={() => answers[currentQ] !== null && setCurrentQ(currentQ + 1)}
            >
              <Text style={[styles.navBtnText, { color: "white" }]}>Next</Text>
              <Ionicons name="chevron-forward" size={18} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.navBtn, styles.navBtnPrimary, !answers.every((a) => a !== null) && { opacity: 0.5 }]}
              onPress={handleSubmit}
            >
              <Text style={[styles.navBtnText, { color: "white" }]}>See Results</Text>
              <Ionicons name="checkmark-circle-outline" size={18} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default AnxietyQuizScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#7E57C2" },
  scrollContent: { paddingBottom: 40, paddingTop: 8 },

  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "white" },

  progressBg: {
    height: 6, backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 16, borderRadius: 3, overflow: "hidden", marginBottom: 6,
  },
  progressFill: { height: 6, backgroundColor: "white", borderRadius: 3 },
  progressLabel: { fontSize: 11, color: "rgba(255,255,255,0.7)", marginHorizontal: 16, marginBottom: 14 },

  card: {
    backgroundColor: "white", marginHorizontal: 16,
    borderRadius: 20, padding: 18, marginBottom: 14, elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#212121", marginBottom: 14 },

  introCard: {
    backgroundColor: "white", marginHorizontal: 16, borderRadius: 24,
    padding: 24, marginBottom: 14, alignItems: "center", elevation: 3,
  },
  introIcon: { fontSize: 52, marginBottom: 14 },
  introTitle: { fontSize: 20, fontWeight: "800", color: "#212121", marginBottom: 10, textAlign: "center" },
  introDesc: { fontSize: 14, color: "#616161", textAlign: "center", lineHeight: 22, marginBottom: 20 },
  introMeta: { gap: 10, width: "100%" },
  introMetaItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  introMetaText: { fontSize: 13, color: "#424242" },

  disclaimerCard: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: "rgba(255,255,255,0.15)", marginHorizontal: 16,
    borderRadius: 14, padding: 14, marginBottom: 16,
  },
  disclaimerText: { fontSize: 12, color: "rgba(255,255,255,0.9)", flex: 1, lineHeight: 18 },

  startBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "white", marginHorizontal: 16, borderRadius: 16,
    padding: 16, gap: 8,
  },
  startBtnText: { fontSize: 16, fontWeight: "800", color: "#7E57C2" },

  promptLabel: { fontSize: 13, color: "#9E9E9E", marginBottom: 12 },
  promptQ: { fontSize: 18, fontWeight: "700", color: "#212121", lineHeight: 26 },

  optionsCol: { paddingHorizontal: 16, gap: 10 },
  optionBtn: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: "white", borderRadius: 16, padding: 16,
    borderWidth: 2, borderColor: "transparent", elevation: 1,
  },
  optionBtnActive: { borderColor: "#7E57C2", backgroundColor: "#EDE7F6" },
  optionCircle: {
    width: 26, height: 26, borderRadius: 13,
    borderWidth: 2, borderColor: "#BDBDBD",
    alignItems: "center", justifyContent: "center",
  },
  optionCircleActive: { backgroundColor: "#7E57C2", borderColor: "#7E57C2" },
  optionText: { flex: 1, fontSize: 14, color: "#424242", fontWeight: "500" },
  optionTextActive: { color: "#7E57C2", fontWeight: "700" },
  optionScore: { fontSize: 12, color: "#BDBDBD", fontWeight: "600" },

  navRow: {
    flexDirection: "row", alignItems: "center",
    marginHorizontal: 16, marginTop: 20,
  },
  navBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  navBtnPrimary: { backgroundColor: "#5E35B1" },
  navBtnText: { fontSize: 14, fontWeight: "700", color: "white" },

  resultCard: {
    marginHorizontal: 16, borderRadius: 24, padding: 24,
    marginBottom: 14, alignItems: "center", elevation: 2,
  },
  resultEmoji: { fontSize: 52, marginBottom: 10 },
  resultLevel: { fontSize: 22, fontWeight: "800", marginBottom: 8 },
  resultScoreRow: { flexDirection: "row", alignItems: "baseline", marginBottom: 14 },
  resultScore: { fontSize: 52, fontWeight: "800" },
  resultScoreMax: { fontSize: 22, color: "#9E9E9E", marginLeft: 2 },
  resultDesc: { fontSize: 14, color: "#424242", textAlign: "center", lineHeight: 22 },

  breakdownRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F5F5F5", gap: 12,
  },
  breakdownQ: { fontSize: 13, color: "#424242", flex: 1 },
  breakdownScore: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  breakdownScoreText: { fontSize: 13, fontWeight: "800" },

  rangeRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  rangeDot: { width: 10, height: 10, borderRadius: 5 },
  rangeText: { fontSize: 13, color: "#424242", flex: 1 },
  youBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  youBadgeText: { fontSize: 10, fontWeight: "800", color: "white" },

  adviceRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  adviceDot: { width: 7, height: 7, borderRadius: 4, marginTop: 5 },
  adviceText: { fontSize: 13, color: "#424242", flex: 1, lineHeight: 20 },

  talkBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#7E57C2", marginHorizontal: 16, borderRadius: 16,
    padding: 16, gap: 8, marginBottom: 10,
  },
  talkBtnText: { fontSize: 15, fontWeight: "700", color: "white" },
  retakeBtn: {
    alignItems: "center", marginHorizontal: 16, padding: 14,
    backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 16,
  },
  retakeBtnText: { fontSize: 14, fontWeight: "600", color: "white" },
});