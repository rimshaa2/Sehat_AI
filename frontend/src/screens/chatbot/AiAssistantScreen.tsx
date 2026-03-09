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
  Alert
} from "react-native";
import { 
  ChevronLeft, 
  Phone, 
  Video, 
  MoreHorizontal, 
  Mic,
  Plus,
  Send,
  Square,
  Volume2,
  Pause
} from "lucide-react-native";
import { Audio } from 'expo-av'; 
import { sendVoiceMessage, saveMedicalRecord, sendTextMessage, getUserProfile } from '../../services/api'; 
import { getAuth } from "@react-native-firebase/auth";
import styles from "./styles/AiAssistantStyles";

// Enable animations
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Initial Intro Conversation
const INTRO_MESSAGES = [
  { id: 1, text: "Hello! I am your AI Health Assistant.", isUrdu: false },
  { id: 2, text: "Please select your preferred language!", isUrdu: false },
  { id: 3, text: "اپنی پسند کی زبان منتخب کریں۔", isUrdu: true },
];

const WELCOME_MESSAGES_EN = [
  { id: 101, text: "Hello. 👋 I'm your health assistant. Ask me anything!", isUrdu: false },
  { id: 102, text: "What are you struggling with today?", isUrdu: false },
];

const WELCOME_MESSAGES_UR = [
  { id: 101, text: "السلام علیکم! میں آپ کی صحت کا معاون ہوں۔", isUrdu: true },
  { id: 102, text: "آپ کو آج کیا مسئلہ درپیش ہے؟", isUrdu: true },
];

export default ({ navigation }: any) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatState, setChatState] = useState<'intro' | 'language_selection' | 'active_chat'>('intro');
  const [inputText, setInputText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState('en-US'); // Default English
  
  // 🎙️ Voice State
  const [recording, setRecording] = useState<Audio.Recording | undefined>();
  const [voiceProcessing, setVoiceProcessing] = useState(false);

  // 🎵 Audio Playback State
  const [playingSound, setPlayingSound] = useState<Audio.Sound | null>(null);
  const [activeAudioUrl, setActiveAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
  // User State
  const [dbUserId, setDbUserId] = useState<number | null>(null);

  const currentUserProfile = {
    name: "User", // Will be stripped by backend for privacy
    age: 55,
    gender: "Male",
    conditions: "Hypertension",
    allergies: "None"
  };

  // 1. Initial Intro Sequence & Fetch Profile
  useEffect(() => {
    const fetchUserId = async () => {
      const auth = getAuth();
      if (auth.currentUser) {
        try {
          const profile = await getUserProfile(auth.currentUser.uid);
          if (profile && profile.id) {
            setDbUserId(profile.id);
          }
        } catch (e) {
          console.error("Failed to fetch user profile for AI:", e);
        }
      }
    };

    fetchUserId();

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
      setChatState('language_selection');
    };

    runIntro();
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (playingSound) {
        playingSound.unloadAsync();
      }
    };
  }, [playingSound]);

  // 2. Handle Language Selection
  const handleLanguageSelect = async (lang: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMessages([]); 
    setChatState('active_chat');
    
    // Set technical language code for API
    const langCode = lang === 'Urdu' ? 'ur-PK' : 'en-US';
    setSelectedLanguage(langCode);

    setIsTyping(true);
    await delay(800);

    const welcomePack = lang === 'Urdu' ? WELCOME_MESSAGES_UR : WELCOME_MESSAGES_EN;

    for (const msg of welcomePack) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
      setMessages((prev) => [...prev, msg]);
      await delay(1000);
    }
    setIsTyping(false);
  };

  // 3. Handle Text Sending
  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg = { id: Date.now(), text: inputText, isUser: true };
    setMessages((prev) => [...prev, userMsg]);
    
    // Save input to safely send before clearing state
    const textToSend = inputText;
    setInputText("");
    Keyboard.dismiss();

    setIsTyping(true);
    
    try {
      // Call the newly created text-only API
      const response = await sendTextMessage(textToSend, selectedLanguage, currentUserProfile);

      if (response.success) {
        setIsTyping(false);
        const botMsg = { 
          id: Date.now() + 1, 
          text: response.ai_text, 
          isUser: false,
          audioUrl: response.audio_url // Includes optional audio for playback
        };
        setMessages((prev) => [...prev, botMsg]);

        // Save to medical history
        if (dbUserId) {
          const recordData = {
              userId: dbUserId, 
              title: "Text Consultation",
              doctor_name: "Sehat AI Assistant",
              record_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
              record_type: "AI Consultation",
              details: `User: ${response.user_text}\nAI: ${response.ai_text}`,
              color_code: "#FEF9C3" // Yellow for notes
          };

          saveMedicalRecord(recordData)
              .then(() => console.log("Text Record Saved to History"))
              .catch(err => console.error("Save Error:", err));
        } else {
          console.warn("Skipping text save: dbUserId is null");
        }
      } else {
        throw new Error(response.error || "Unknown Error");
      }
    } catch (error) {
      console.error(error);
      setIsTyping(false);
      Alert.alert("Error", "Could not process text message.");
    }
  };

  // ---------------------------------------------------------
  // 🎙️ VOICE LOGIC START
  // ---------------------------------------------------------
  
  // A. Start Recording
  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(recording);
        // Haptic feedback or visual cue could go here
      } else {
        Alert.alert("Permission Required", "Please allow microphone access.");
      }
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  // B. Stop Recording & Send
  const stopRecording = async () => {
    if (!recording) return;

    setRecording(undefined);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI(); 
    
    if (!uri) return;

    setVoiceProcessing(true);
    
    try {
      // Call your API
      const response = await sendVoiceMessage(uri, selectedLanguage, currentUserProfile);

      if (response.success) {
        // 1. Show User Text (STT)
        const userMsg = { id: Date.now(), text: response.user_text, isUser: true };
        setMessages(prev => [...prev, userMsg]);

        setIsTyping(true);
        await delay(500); // Small natural delay

        // 2. Show AI Response (Text + Audio)
        setIsTyping(false);
        const botMsg = { 
          id: Date.now() + 1, 
          text: response.ai_text, 
          isUser: false,
          audioUrl: response.audio_url // Save audio URL for playback
        };
        setMessages(prev => [...prev, botMsg]);
        
        if (dbUserId) {
          const recordData = {
              userId: dbUserId, 
              title: "Voice Consultation",
              doctor_name: "Sehat AI Assistant",
              record_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
              record_type: "AI Consultation",
              details: `User: ${response.user_text}\nAI: ${response.ai_text}`,
              color_code: "#FEF9C3" // Yellow for notes
          };

          saveMedicalRecord(recordData)
              .then(() => console.log("Record Saved to History"))
              .catch(err => console.error("Save Error:", err));
        } else {
          console.warn("Skipping voice save: dbUserId is null");
        }

        // 3. Auto-play Response
        playSound(response.audio_url);
      }
    } catch (error) {
      console.error("FULL ERROR DETAILS:", error);
      Alert.alert("Error", "Could not process voice message.");
    } finally {
      setVoiceProcessing(false);
    }
  };

  // C. Play Audio
  const playSound = async (url: string) => {
    try {
      // 1. If tapping the same audio that is currently loaded
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

      // 2. If a different audio is playing, stop and unload it
      if (playingSound) {
        await playingSound.unloadAsync();
        setPlayingSound(null);
        setIsPlaying(false);
      }

      // 3. Load and play new audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            setIsPlaying(status.isPlaying);
            if (status.didJustFinish) {
              setIsPlaying(false);
              setActiveAudioUrl(null); // Reset when done
            }
          }
        }
      );
      
      setPlayingSound(sound);
      setActiveAudioUrl(url);
      setIsPlaying(true);

    } catch (error) {
      console.log("Audio Playback Error", error);
    }
  };

  // ---------------------------------------------------------
  // 🎙️ VOICE LOGIC END
  // ---------------------------------------------------------

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
              {voiceProcessing ? "Listening..." : isTyping ? "Typing..." : "@Official"}
            </Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity><Phone color="#1C2A3A" size={24} /></TouchableOpacity>
        </View>
      </View>

      {/* Main Chat Area */}
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
          {/* Large Central Bot Avatar */}
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

          {/* Dynamic Messages */}
          {messages.map((msg) => (
            <View 
              key={msg.id} 
              style={msg.isUser ? styles.userMessageWrapper : styles.messageWrapper}
            >
              <Text style={msg.isUser ? styles.userMessageText : [styles.messageText, msg.isUrdu && styles.urduText]}>
                {msg.text}
              </Text>
              
              {/* Play Audio Button for Bot Messages */}
              {!msg.isUser && msg.audioUrl && (
                <TouchableOpacity 
                  onPress={() => playSound(msg.audioUrl)} 
                  style={{ marginTop: 5, alignSelf: 'flex-start', padding: 4 }}
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

          {/* Typing/Listening Indicator */}
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

        {/* CONDITION 1: Show Language Buttons */}
        {chatState === 'language_selection' && (
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

        {/* CONDITION 2: Show Input Bar */}
        {chatState === 'active_chat' && (
          <View style={styles.inputContainer}>
            {/* 🔴 MODIFIED: MIC BUTTON LOGIC */}
            <TouchableOpacity 
              style={[
                styles.inputIcon, 
                recording && { backgroundColor: '#ffebee', borderRadius: 20 }
              ]}
              // Press and hold logic or Toggle logic
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
              placeholder={recording ? "Recording..." : "Type or speak..."}
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
              multiline
              editable={!recording} // Disable typing while recording
            />

            {inputText.length > 0 ? (
              <TouchableOpacity onPress={handleSend} style={styles.inputIcon}>
                <Send color="#199A8E" size={24} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.inputIcon}>
                <Plus color="#1C2A3A" size={24} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};