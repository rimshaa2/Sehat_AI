import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
  LayoutAnimation,
  Platform,
  UIManager,
  TextInput,
  KeyboardAvoidingView,
  Keyboard,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import {
  ChevronLeft,
  Phone,
  
  Mic,
  Plus,
  Send,
  Square,
  Volume2,
  Pause,
} from "lucide-react-native";
import { Audio } from "expo-av";
import {
  sendVoiceMessage,
  saveMedicalRecord,
  sendTextMessage,
  getUserProfile,
} from "../../services/api";
import { getAuth } from "@react-native-firebase/auth";
import styles from "./styles/AiAssistantStyles";



if (
  Platform.OS === "android" &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Intro Messages ────────────────────────────────────────────────────────────
const INTRO_MESSAGES = [
  { id: 1, text: "Hello! I am your AI Health Assistant.", isUrdu: false },
  { id: 2, text: "Please select your preferred language!", isUrdu: false },
  { id: 3, text: "اپنی پسند کی زبان منتخب کریں۔", isUrdu: true },
];

const WELCOME_MESSAGES_EN = [
  { id: 101, text: "Hello 👋 I'm your personal health assistant!", isUrdu: false },
  { id: 102, text: "I have loaded your health profile. Ask me anything about your symptoms, medications, or health concerns.", isUrdu: false },
];

const WELCOME_MESSAGES_UR = [
  { id: 101, text: "السلام علیکم! میں آپ کی صحت کا ذاتی معاون ہوں۔", isUrdu: true },
  { id: 102, text: "میں نے آپ کا ہیلتھ پروفائل لوڈ کر لیا ہے۔ اپنی علامات یا صحت کے بارے میں کچھ بھی پوچھیں۔", isUrdu: true },
];

// ─── Types ──────────────────────────────────────────────────────────────────────
interface UserProfile {
  name: string;
  age: number | null;
  gender: string | null;
  conditions: string | null;
  allergies: string | null;
  bloodType: string | null;
}

interface Message {
  id: number;
  text: string;
  isUser?: boolean;
  isUrdu?: boolean;
  audioUrl?: string;
  isError?: boolean;
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default ({ navigation, route }: any) => {
  useEffect(() => {
    const prefillText = route?.params?.prefill;
    if (prefillText && typeof prefillText === "string") {
      setInputText(prefillText);
      setChatState("active_chat");
    }
  }, []);

  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatState, setChatState] = useState<"intro" | "language_selection" | "active_chat">("intro");
  const [inputText, setInputText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en-US");

  // Voice state
  const [recording, setRecording] = useState<Audio.Recording | undefined>();
  const [voiceProcessing, setVoiceProcessing] = useState(false);

  // Audio playback state
  const [playingSound, setPlayingSound] = useState<Audio.Sound | null>(null);
  const [activeAudioUrl, setActiveAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // User state
  const [dbUserId, setDbUserId] = useState<number | null>(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile>({
    name: "User",
    age: null,
    gender: null,
    conditions: null,
    allergies: null,
    bloodType: null,
  });

  const scrollViewRef = useRef<ScrollView>(null);
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // ─── 1. Fetch Real User Profile on Mount ─────────────────────────────────────
  useEffect(() => {
    const fetchUserProfile = async () => {
      const auth = getAuth();
      if (!auth.currentUser) return;

      try {
        const profile = await getUserProfile(auth.currentUser.uid);
        if (profile) {
          // Save DB id for medical records
          if (profile.id) setDbUserId(profile.id);

          // Build real profile for AI context
          setCurrentUserProfile({
            name: profile.fullName || "User",
            age: profile.age || null,
            gender: profile.gender || null,
            conditions: profile.medicalHistory || profile.conditions || null,
            allergies: profile.allergies || null,
            bloodType: profile.bloodType || null,
          });

          setProfileLoaded(true);
          console.log("✅ AI Profile loaded for:", profile.fullName);
        }
      } catch (e) {
        console.warn("⚠️ Could not load user profile for AI context:", e);
        setProfileLoaded(true); // Continue even if profile fails
      }
    };

    fetchUserProfile();
    runIntro();
  }, []);

  // ─── Cleanup audio on unmount ─────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (playingSound) playingSound.unloadAsync();
    };
  }, [playingSound]);

  // ─── 2. Intro Sequence ────────────────────────────────────────────────────────
  const runIntro = async () => {
    setIsTyping(true);
    await delay(1000);

    for (const msg of INTRO_MESSAGES) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setMessages((prev) => [...prev, msg]);
      scrollViewRef.current?.scrollToEnd({ animated: true });

      if (msg.id !== INTRO_MESSAGES.length) {
        setIsTyping(true);
        await delay(1200);
      }
    }
    setIsTyping(false);
    setChatState("language_selection");
  };

  // ─── 3. Language Selection ────────────────────────────────────────────────────
  const handleLanguageSelect = async (lang: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMessages([]);
    setChatState("active_chat");



    const langCode = lang === "Urdu" ? "ur-PK" : "en-US";
    setSelectedLanguage(langCode);

    setIsTyping(true);
    await delay(800);

    const welcomePack = lang === "Urdu" ? WELCOME_MESSAGES_UR : WELCOME_MESSAGES_EN;

    for (const msg of welcomePack) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
      setMessages((prev) => [...prev, msg]);
      await delay(1000);
    }

    // Show profile-aware greeting if profile is loaded
    if (profileLoaded && currentUserProfile.name !== "User") {
      await delay(500);
      const personalMsg: Message = {
        id: Date.now(),
        text: lang === "Urdu"
          ? `${currentUserProfile.name}، میں آپ کی صحت کی تاریخ سے واقف ہوں۔`
          : `I can see your profile, ${currentUserProfile.name}. I'll give you personalized advice based on your health history.`,
        isUrdu: lang === "Urdu",
      };
      setMessages((prev) => [...prev, personalMsg]);
    }

    setIsTyping(false);
  };

  // ─── Helper: Add error message to chat ───────────────────────────────────────
  const addErrorMessage = (text: string) => {
    const errMsg: Message = {
      id: Date.now(),
      text,
      isUser: false,
      isError: true,
    };
    setMessages((prev) => [...prev, errMsg]);
  };

  // ─── Helper: Save to medical history ─────────────────────────────────────────
  const saveToHistory = (userText: string, aiText: string, type: "Text" | "Voice") => {
    if (!dbUserId) return;
    const recordData = {
      userId: dbUserId,
      title: `${type} Consultation`,
      doctor_name: "Sehat AI Assistant",
      record_date: new Date().toISOString().split("T")[0],
      record_type: "AI Consultation",
      details: `User: ${userText}\nAI: ${aiText}`,
      color_code: "#FEF9C3",
    };
    saveMedicalRecord(recordData)
      .then(() => console.log(`✅ ${type} record saved`))
      .catch((err) => console.warn("Save record error:", err));
  };

  // ─── 4. Send Text Message ─────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    const userMsg: Message = { id: Date.now(), text: textToSend, isUser: true };
    setMessages((prev) => [...prev, userMsg]);


    setInputText("");
    Keyboard.dismiss();


    setIsTyping(true);

    try {


      const response = await sendTextMessage(textToSend, selectedLanguage, currentUserProfile);

      setIsTyping(false);

      if (response && response.success) {
        const botMsg: Message = {
          id: Date.now() + 1,
          text: response.ai_text,
          isUser: false,
          audioUrl: response.audio_url,
        };
        setMessages((prev) => [...prev, botMsg]);
        saveToHistory(textToSend, response.ai_text, "Text");
      } else {
        addErrorMessage("I couldn't process that. Please try again.");
      }
    } catch (error: any) {
      setIsTyping(false);
      console.error("Text send error:", error);

      if (error?.message?.includes("Network")) {
        addErrorMessage("⚠️ Cannot reach AI service. Make sure the Python server is running on port 5001.");
      } else {
        addErrorMessage("Something went wrong. Please try again.");
      }
    }
  };

  // ─── 5. Voice Recording ───────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status !== "granted") {
        Alert.alert("Permission Required", "Please allow microphone access in your phone settings.");
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      console.error("Failed to start recording:", err);
      Alert.alert("Error", "Could not start recording. Please try again.");
    }
  };



  const stopRecording = async () => {
    if (!recording) return;

    setRecording(undefined);



    

    setVoiceProcessing(true);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) throw new Error("No audio URI");

      const response = await sendVoiceMessage(uri, selectedLanguage, currentUserProfile);

      if (response && response.success) {
        // Show what the user said
        const userMsg: Message = {
          id: Date.now(),
          text: `🎙️ "${response.user_text}"`,
          isUser: true,
        };
        setMessages((prev) => [...prev, userMsg]);

        setIsTyping(true);
        await delay(500);
        setIsTyping(false);

        // Show AI response
        const botMsg: Message = {
          id: Date.now() + 1,
          text: response.ai_text,
          isUser: false,
          audioUrl: response.audio_url,
        };
        setMessages((prev) => [...prev, botMsg]);
        saveToHistory(response.user_text, response.ai_text, "Voice");

        // Auto-play the response audio
        if (response.audio_url) playSound(response.audio_url);
      } else {
        addErrorMessage("I couldn't understand the audio. Please try speaking again.");
      }
    } catch (error: any) {
      console.error("Voice error:", error);
      if (error?.message?.includes("Network")) {
        addErrorMessage("⚠️ Cannot reach AI service. Make sure Python server is running.");
      } else {
        addErrorMessage("Could not process voice. Please try again.");
      }
    } finally {
      setVoiceProcessing(false);
    }
  };

  // ─── 6. Audio Playback ────────────────────────────────────────────────────────
  const playSound = async (url: string) => {
    try {

    
      if (activeAudioUrl === url && playingSound) {
        if (isPlaying) {
          await playingSound.pauseAsync();
          setIsPlaying(false);
        } else {
          await playingSound.playAsync();
          setIsPlaying(true);
        }
        return;
      }



      if (playingSound) {
        await playingSound.unloadAsync();
        setPlayingSound(null);
        setIsPlaying(false);
      }



      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish) {
              setIsPlaying(false);
              setActiveAudioUrl(null);
            }
          }
        }
      );

      setPlayingSound(sound);
      setActiveAudioUrl(url);
      setIsPlaying(true);


    } catch (error) {
      console.warn("Audio playback error:", error);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  const handleCallSupport = async () => {
    const url = "tel:1166";
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert("Unavailable", "Calling is not supported on this device.");
        return;
      }
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert("Unavailable", "Could not open phone dialer.");
    }
  };

  const handleQuickPrompt = () => {
    setInputText((prev) =>
      prev || "I have fever, sore throat, and fatigue for 2 days. What should I do?",
    );
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#66CDAA" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft color="#1C2A3A" size={28} />
          </TouchableOpacity>
          <View style={styles.headerAvatarContainer}>
            <View style={styles.headerAvatar}>
              <Image
                source={{ uri: "https://cdn-icons-png.flaticon.com/512/4712/4712035.png" }}
                style={{ width: 40, height: 40 }}
              />
            </View>
            <View style={styles.onlineBadge} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>AI Health Assistant</Text>
            <Text style={styles.headerSubtitle}>
              {voiceProcessing
                ? "🎙️ Processing..."
                : isTyping
                ? "Typing..."
                : profileLoaded && currentUserProfile.name !== "User"
                ? `Hi, ${currentUserProfile.name}`
                : "Online 24/7"}
            </Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={handleCallSupport}>
            <Phone color="#1C2A3A" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatContainer}
          contentContainerStyle={styles.contentContainerStyle}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {/* Bot Avatar */}
          <View style={styles.largeBotContainer}>
            <View style={styles.largeBotCircle}>
              <View style={styles.innerBotCircle}>
                <Image
                  source={{ uri: "https://cdn-icons-png.flaticon.com/512/4712/4712109.png" }}
                  style={styles.botImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>

          {/* Messages */}
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={msg.isUser ? styles.userMessageWrapper : styles.messageWrapper}
            >
              <Text
                style={[
                  msg.isUser ? styles.userMessageText : styles.messageText,
                  msg.isUrdu && styles.urduText,
                  msg.isError && { color: "#EF4444", fontStyle: "italic" },
                ]}
              >
                {msg.text}
              </Text>

              {/* Audio play button for bot messages */}
              {!msg.isUser && msg.audioUrl && (
                <TouchableOpacity
                  onPress={() => playSound(msg.audioUrl!)}
                  style={{ marginTop: 5, alignSelf: "flex-start", padding: 4 }}
                >
                  {activeAudioUrl === msg.audioUrl && isPlaying ? (
                    <Pause size={18} color="#199A8E" />
                  ) : (
                    <Volume2 size={18} color="#199A8E" />
                  )}
                </TouchableOpacity>
              )}
            </View>
          ))}

          {/* Typing / Processing indicator */}
          {(isTyping || voiceProcessing) && (
            <View style={styles.typingContainer}>
              {voiceProcessing ? (
                <ActivityIndicator size="small" color="#199A8E" />
              ) : (
                <>
                  <View style={[styles.dot, { backgroundColor: "#9CA3AF" }]} />
                  <View style={[styles.dot, { backgroundColor: "#6B7280" }]} />
                  <View style={[styles.dot, { backgroundColor: "#374151" }]} />
                </>
              )}
            </View>
          )}
        </ScrollView>

        {/* Language Selection Buttons */}
        {chatState === "language_selection" && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.languageButton}
              onPress={() => handleLanguageSelect("English")}
            >
              <Text style={styles.languageButtonText}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.languageButton}
              onPress={() => handleLanguageSelect("Urdu")}
            >
              <Text style={styles.languageButtonText}>اردو</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Input Bar */}
        {chatState === "active_chat" && (
          <View style={styles.inputContainer}>


            <TouchableOpacity
              style={[
                styles.inputIcon,
                recording && { backgroundColor: "#ffebee", borderRadius: 20 },
              ]}


              onPress={recording ? stopRecording : startRecording}
            >
              {recording ? (
                <Square color="#EF4444" size={24} fill="#EF4444" />
              ) : (
                <Mic color="#199A8E" size={24} />
              )}
            </TouchableOpacity>

            <TextInput
              style={styles.inputField}
              placeholder={recording ? "🔴 Recording... tap square to stop" : "Type or speak..."}
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
              multiline
              editable={!recording && !voiceProcessing}
              onSubmitEditing={handleSend}
            />

            {inputText.length > 0 ? (
              <TouchableOpacity onPress={handleSend} style={styles.inputIcon}>
                <Send color="#199A8E" size={24} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.inputIcon} onPress={handleQuickPrompt}>
                <Plus color="#1C2A3A" size={24} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
