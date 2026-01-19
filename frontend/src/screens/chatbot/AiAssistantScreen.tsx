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
} from "react-native";
import { 
  ChevronLeft, 
  Phone, 
  Video, 
  MoreHorizontal, 
  Mic,
  Plus,
  Send,
} from "lucide-react-native";
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

// Messages to show AFTER language selection
const WELCOME_MESSAGES_EN = [
  { id: 101, text: "Hello. 👋 I'm your health assistant. Ask me anything!", isUrdu: false },
  { id: 102, text: "What are you struggling with today?", isUrdu: false },
  { id: 103, text: "How may I help you?", isUrdu: false },
];

export default ({ navigation }: any) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chatState, setChatState] = useState<'intro' | 'language_selection' | 'active_chat'>('intro');
  const [inputText, setInputText] = useState("");
  
  const scrollViewRef = useRef<ScrollView>(null);

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  // 1. Initial Intro Sequence
  useEffect(() => {
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

  // 2. Handle Language Selection
  const handleLanguageSelect = async (lang: string) => {
    // Clear previous messages smoothly
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMessages([]); // Clear intro messages
    setChatState('active_chat'); // Switch mode

    // Start Chat Welcome Sequence
    setIsTyping(true);
    await delay(800);

    const welcomePack = lang === 'Urdu' ? [] : WELCOME_MESSAGES_EN; // Add Urdu logic later if needed

    for (const msg of welcomePack) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
      setMessages((prev) => [...prev, msg]);
      await delay(1000);
    }
    setIsTyping(false);
  };

  // 3. Handle Sending Messages (Dummy Response for now)
  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMsg = { id: Date.now(), text: inputText, isUser: true };
    
    // Add User Message
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    Keyboard.dismiss();

    // Simulate Bot Thinking
    setIsTyping(true);
    await delay(2000);

    // Dummy Bot Response
    const botMsg = { id: Date.now() + 1, text: "I understand. Can you tell me more about your symptoms?", isUser: false };
    
    setIsTyping(false);
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMessages((prev) => [...prev, botMsg]);
  };

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
            <Text style={styles.headerSubtitle}>@Official</Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity><Phone color="#1C2A3A" size={24} /></TouchableOpacity>
          <TouchableOpacity><Video color="#1C2A3A" size={24} /></TouchableOpacity>
          <TouchableOpacity><MoreHorizontal color="#1C2A3A" size={24} /></TouchableOpacity>
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
          {/* Large Central Bot Avatar (Always visible at top) */}
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
            </View>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <View style={styles.typingContainer}>
              <View style={[styles.dot, { backgroundColor: "#9CA3AF" }]} />
              <View style={[styles.dot, { backgroundColor: "#6B7280" }]} />
              <View style={[styles.dot, { backgroundColor: "#374151" }]} />
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

        {/* CONDITION 2: Show Input Bar (Only when chat is active) */}
        {chatState === 'active_chat' && (
          <View style={styles.inputContainer}>
            <TouchableOpacity style={styles.inputIcon}>
              <Mic color="#199A8E" size={24} />
            </TouchableOpacity>
            
            <TextInput 
              style={styles.inputField}
              placeholder="Send message..."
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
              multiline
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