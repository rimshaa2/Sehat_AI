import React, { useState, useEffect, useRef } from "react";
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
import { Audio } from "expo-av";

type AudioType = "nature" | "guided" | "ambient";

interface Session {
  title: string;
  duration: number;
  level: string;
  bgColor: string;
  iconColor: string;
  description: string;
  audio: Record<AudioType, string>;
}

const SESSIONS: Session[] = [
  {
    title: "Morning Mindfulness",
    duration: 600,
    level: "Beginner",
    bgColor: "#E8F5E9",
    iconColor: "#4CAF50",
    description: "Start your day with calm awareness",
    audio: {
      nature:  "https://cdn.pixabay.com/audio/2022/05/27/audio_1808fbf07a.mp3",  // birds & stream
      guided:  "https://cdn.pixabay.com/audio/2024/02/28/audio_93bd6a8ada.mp3",  // soft wind chimes
      ambient: "https://cdn.pixabay.com/audio/2022/10/30/audio_946c18a120.mp3",  // morning ambient
    },
  },
  {
    title: "Stress Relief",
    duration: 900,
    level: "Intermediate",
    bgColor: "#E8F5E9",
    iconColor: "#4CAF50",
    description: "Release tension and find stillness",
    audio: {
      nature:  "https://cdn.pixabay.com/audio/2022/10/27/audio_aecc9b96ee.mp3",  // rain on leaves
      guided:  "https://cdn.pixabay.com/audio/2023/03/18/audio_2db4e08498.mp3",  // calm piano
      ambient: "https://cdn.pixabay.com/audio/2022/08/04/audio_2dde668d05.mp3",  // deep relaxation
    },
  },
  {
    title: "Deep Relaxation",
    duration: 1200,
    level: "Advanced",
    bgColor: "#EDE7F6",
    iconColor: "#AB47BC",
    description: "Sink into profound restfulness",
    audio: {
      nature:  "https://cdn.pixabay.com/audio/2022/12/23/audio_1e79b1a6e6.mp3",  // ocean waves
      guided:  "https://cdn.pixabay.com/audio/2023/02/28/audio_d1718ab825.mp3",  // tibetan bowls
      ambient: "https://cdn.pixabay.com/audio/2022/11/22/audio_febc508520.mp3",  // deep space ambient
    },
  },
  {
    title: "Sleep Preparation",
    duration: 720,
    level: "Beginner",
    bgColor: "#E3F2FD",
    iconColor: "#5C6BC0",
    description: "Ease your mind into restful sleep",
    audio: {
      nature:  "https://cdn.pixabay.com/audio/2022/06/07/audio_b8946fb476.mp3",  // night crickets
      guided:  "https://cdn.pixabay.com/audio/2024/01/10/audio_8ea31b86e8.mp3",  // sleep music
      ambient: "https://cdn.pixabay.com/audio/2022/12/13/audio_a85c2b24e6.mp3",  // theta waves
    },
  },
  {
    title: "Focus & Clarity",
    duration: 480,
    level: "Intermediate",
    bgColor: "#E0F7FA",
    iconColor: "#00ACC1",
    description: "Sharpen your mind and attention",
    audio: {
      nature:  "https://cdn.pixabay.com/audio/2022/08/23/audio_d16737e948.mp3",  // light forest
      guided:  "https://cdn.pixabay.com/audio/2023/05/15/audio_5a1d3c5e65.mp3",  // focus tones
      ambient: "https://cdn.pixabay.com/audio/2022/09/02/audio_54e8508716.mp3",  // alpha waves
    },
  },
  {
    title: "Body Scan",
    duration: 1080,
    level: "Advanced",
    bgColor: "#EDE7F6",
    iconColor: "#AB47BC",
    description: "Travel through your body with awareness",
    audio: {
      nature:  "https://cdn.pixabay.com/audio/2022/10/16/audio_aef89b0ac4.mp3",  // flowing river
      guided:  "https://cdn.pixabay.com/audio/2023/01/25/audio_8a1b0b8e2d.mp3",  // healing bowls
      ambient: "https://cdn.pixabay.com/audio/2022/11/01/audio_4cbf6d44e1.mp3",  // deep ambient
    },
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatTime = (s: number) =>
  `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

const FILTERS = ["All", "Beginner", "Intermediate", "Advanced"];

const AUDIO_LABELS: Record<AudioType, string> = {
  nature:  "🌿 Nature",
  guided:  "🎙️ Guided",
  ambient: "🎵 Ambient",
};

const AUDIO_DESCRIPTIONS: Record<AudioType, string> = {
  nature:  "Birds, rain, ocean & forest sounds",
  guided:  "Chimes, bowls & soothing tones",
  ambient: "Deep waves, space & theta frequencies",
};


function MeditationScreen({ navigation }: { navigation: any }) {
  const [activeFilter, setActiveFilter]       = useState("All");
  const [audioType, setAudioType]             = useState<AudioType>("nature");
  const [playingIndex, setPlayingIndex]       = useState<number | null>(null);
  const [elapsed, setElapsed]                 = useState(0);
  const [loading, setLoading]                 = useState(false);
  const [loadingIndex, setLoadingIndex]       = useState<number | null>(null);

  const soundRef    = useRef<Audio.Sound | null>(null);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const filtered =
    activeFilter === "All"
      ? SESSIONS
      : SESSIONS.filter((s) => s.level === activeFilter);

  useEffect(() => {
    Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    return () => { stopAll(); };
  }, []);

  useEffect(() => {
    if (playingIndex === null) return;
    const total = SESSIONS[playingIndex].duration;
    Animated.timing(progressAnim, {
      toValue: elapsed / total,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [elapsed]);

  const stopAll = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (_) {}
      soundRef.current = null;
    }
    setPlayingIndex(null);
    setElapsed(0);
    progressAnim.setValue(0);
  };

  const playSession = async (index: number) => {
    if (playingIndex === index) { await stopAll(); return; }
    await stopAll();

    setLoading(true);
    setLoadingIndex(index);

    try {
      const url = SESSIONS[index].audio[audioType];
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true, isLooping: true, volume: 1.0 }
      );
      soundRef.current = sound;
      setPlayingIndex(index);
      setElapsed(0);
      progressAnim.setValue(0);

      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev + 1 >= SESSIONS[index].duration) {
            stopAll();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (e) {
      console.warn("Audio load error:", e);
    } finally {
      setLoading(false);
      setLoadingIndex(null);
    }
  };

  const switchType = async (type: AudioType) => {
    const prev = playingIndex;
    await stopAll();
    setAudioType(type);
    if (prev !== null) setTimeout(() => playSession(prev), 150);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { stopAll(); navigation.goBack(); }} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="white" />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Meditation</Text>
            <Text style={styles.headerSub}>Guided sessions for peace</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Daily Streak</Text>
            <Text style={styles.statValue}>7 days 🔥</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Time</Text>
            <Text style={styles.statValue}>2h 45m</Text>
          </View>
        </View>

        {/* Sound Type Selector */}
        <View style={styles.soundCard}>
          <Text style={styles.soundCardTitle}>Choose Sound Type</Text>
          {(["nature", "guided", "ambient"] as AudioType[]).map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.soundRow, audioType === type && styles.soundRowActive]}
              onPress={() => switchType(type)}
              activeOpacity={0.85}
            >
              <View style={[styles.soundIconWrap, audioType === type && styles.soundIconWrapActive]}>
                <Text style={styles.soundEmoji}>
                  {type === "nature" ? "🌿" : type === "guided" ? "🎙️" : "🎵"}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.soundRowLabel, audioType === type && { color: "#5BA89D" }]}>
                  {AUDIO_LABELS[type]}
                </Text>
                <Text style={styles.soundRowDesc}>{AUDIO_DESCRIPTIONS[type]}</Text>
              </View>
              {audioType === type && (
                <Ionicons name="checkmark-circle" size={20} color="#5BA89D" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Now Playing */}
        {playingIndex !== null && (
          <View style={styles.nowPlayingCard}>
            <View style={styles.nowPlayingTop}>
              <View style={styles.liveDot} />
              <Text style={styles.nowPlayingName} numberOfLines={1}>
                {SESSIONS[playingIndex].title}
              </Text>
              <Text style={styles.nowPlayingType}>{AUDIO_LABELS[audioType]}</Text>
            </View>

            {/* Big progress bar */}
            <View style={styles.bigProgressBg}>
              <Animated.View
                style={[
                  styles.bigProgressFill,
                  {
                    width: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0%", "100%"],
                    }),
                  },
                ]}
              />
            </View>

            <View style={styles.timerRow}>
              <Text style={styles.timerElapsed}>{formatTime(elapsed)}</Text>
              <Text style={styles.timerCenter}>
                {Math.round((elapsed / SESSIONS[playingIndex].duration) * 100)}% complete
              </Text>
              <Text style={styles.timerTotal}>
                {formatTime(SESSIONS[playingIndex].duration)}
              </Text>
            </View>
          </View>
        )}

        {/* Level Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sessions */}
        <View style={styles.sessionList}>
          {filtered.map((session, i) => {
            const gi = SESSIONS.indexOf(session);
            const isPlaying = playingIndex === gi;
            const isLoading = loadingIndex === gi;

            return (
              <View
                key={i}
                style={[
                  styles.sessionCard,
                  { backgroundColor: session.bgColor },
                  isPlaying && { borderColor: session.iconColor, borderWidth: 2 },
                ]}
              >
                <View style={[styles.sessionIconWrap, { backgroundColor: session.iconColor + "22" }]}>
                  <Ionicons name="headset-outline" size={22} color={session.iconColor} />
                </View>

                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionTitle}>{session.title}</Text>
                  <Text style={styles.sessionDesc}>{session.description}</Text>
                  <View style={styles.sessionMeta}>
                    <Ionicons name="time-outline" size={12} color="#9E9E9E" />
                    <Text style={styles.sessionDuration}>{formatTime(session.duration)}</Text>
                    <View style={[styles.levelBadge, { backgroundColor: session.iconColor + "22" }]}>
                      <Text style={[styles.levelText, { color: session.iconColor }]}>
                        {session.level}
                      </Text>
                    </View>
                  </View>

                  {/* Inline progress bar */}
                  {isPlaying && (
                    <View style={styles.inlineProgressBg}>
                      <Animated.View
                        style={[
                          styles.inlineProgressFill,
                          { backgroundColor: session.iconColor },
                          {
                            width: progressAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ["0%", "100%"],
                            }),
                          },
                        ]}
                      />
                    </View>
                  )}
                </View>

                {/* Play Button */}
                <TouchableOpacity
                  style={[
                    styles.playBtn,
                    { backgroundColor: isPlaying ? session.iconColor : session.iconColor + "22" },
                  ]}
                  onPress={() => playSession(gi)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Ionicons name="hourglass-outline" size={18} color={session.iconColor} />
                  ) : (
                    <Ionicons
                      name={isPlaying ? "pause" : "play"}
                      size={18}
                      color={isPlaying ? "white" : session.iconColor}
                    />
                  )}
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {/* Quick Session */}
        <TouchableOpacity style={styles.quickBtn} onPress={() => playSession(0)}>
          <Ionicons name="play-circle-outline" size={20} color="white" />
          <Text style={styles.quickBtnText}>Quick 5-Minute Session</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

export default MeditationScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#5BA89D" },
  scrollContent: { paddingBottom: 40 },

  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "white" },
  headerSub: { fontSize: 13, color: "#C8EAE6", marginTop: 2 },

  statsRow: {
    flexDirection: "row", backgroundColor: "rgba(255,255,255,0.2)",
    marginHorizontal: 16, borderRadius: 16, padding: 16,
    marginBottom: 14, alignItems: "center",
  },
  statItem: { flex: 1, alignItems: "center" },
  statLabel: { fontSize: 12, color: "#E0F2F1", marginBottom: 4 },
  statValue: { fontSize: 18, fontWeight: "700", color: "white" },
  statDivider: { width: 1, height: 36, backgroundColor: "rgba(255,255,255,0.3)" },

  soundCard: {
    backgroundColor: "white", marginHorizontal: 16,
    borderRadius: 20, padding: 16, marginBottom: 14, elevation: 2,
  },
  soundCardTitle: { fontSize: 13, fontWeight: "700", color: "#9E9E9E", marginBottom: 12 },
  soundRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 10, paddingHorizontal: 10, borderRadius: 14,
    marginBottom: 6, borderWidth: 1.5, borderColor: "transparent",
    backgroundColor: "#F9F9F9",
  },
  soundRowActive: { borderColor: "#5BA89D", backgroundColor: "#E0F4F2" },
  soundIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: "#F0F0F0", alignItems: "center", justifyContent: "center",
  },
  soundIconWrapActive: { backgroundColor: "#C8EAE6" },
  soundEmoji: { fontSize: 20 },
  soundRowLabel: { fontSize: 14, fontWeight: "700", color: "#212121" },
  soundRowDesc: { fontSize: 11, color: "#9E9E9E", marginTop: 2 },

  nowPlayingCard: {
    backgroundColor: "white", marginHorizontal: 16,
    borderRadius: 20, padding: 16, marginBottom: 14, elevation: 3,
  },
  nowPlayingTop: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#4CAF50" },
  nowPlayingName: { fontSize: 13, fontWeight: "700", color: "#212121", flex: 1 },
  nowPlayingType: { fontSize: 11, color: "#9E9E9E" },
  bigProgressBg: {
    height: 10, backgroundColor: "#EEEEEE",
    borderRadius: 5, overflow: "hidden", marginBottom: 8,
  },
  bigProgressFill: { height: 10, backgroundColor: "#5BA89D", borderRadius: 5 },
  timerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  timerElapsed: { fontSize: 13, fontWeight: "700", color: "#5BA89D" },
  timerCenter: { fontSize: 11, color: "#9E9E9E" },
  timerTotal: { fontSize: 13, color: "#9E9E9E" },

  filterScroll: { paddingLeft: 16, marginBottom: 14 },
  filterChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)", marginRight: 10,
  },
  filterChipActive: { backgroundColor: "white" },
  filterText: { fontSize: 13, fontWeight: "600", color: "rgba(255,255,255,0.85)" },
  filterTextActive: { color: "#5BA89D" },

  sessionList: { paddingHorizontal: 16, gap: 10 },
  sessionCard: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 16, padding: 14, marginBottom: 4,
    borderWidth: 2, borderColor: "transparent",
  },
  sessionIconWrap: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: "center", justifyContent: "center", marginRight: 12,
  },
  sessionInfo: { flex: 1 },
  sessionTitle: { fontSize: 14, fontWeight: "700", color: "#212121" },
  sessionDesc: { fontSize: 11, color: "#757575", marginTop: 2 },
  sessionMeta: { flexDirection: "row", alignItems: "center", marginTop: 6, gap: 4 },
  sessionDuration: { fontSize: 12, color: "#9E9E9E" },
  levelBadge: { marginLeft: 6, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  levelText: { fontSize: 10, fontWeight: "700" },
  inlineProgressBg: {
    height: 4, backgroundColor: "rgba(0,0,0,0.08)",
    borderRadius: 2, marginTop: 8, overflow: "hidden",
  },
  inlineProgressFill: { height: 4, borderRadius: 2 },
  playBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
  },

  quickBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.2)", marginHorizontal: 16,
    marginTop: 20, borderRadius: 16, padding: 16, gap: 8,
  },
  quickBtnText: { fontSize: 15, fontWeight: "700", color: "white" },
});