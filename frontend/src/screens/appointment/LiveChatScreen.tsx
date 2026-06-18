// frontend/src/screens/appointment/LiveChatScreen.tsx
// ─── Mockup M13: Live Chat Consultation with Doctor ───────────────────────────
// Real-time doctor–patient chat powered by Socket.io.
// Supports text messages AND file/image attachments via Firebase Storage.
//
// REQUIRES (install if not already):
//   npx expo install expo-image-picker expo-document-picker
//
// Receives route params: { appointmentId, doctorName, doctorSpecialty, doctorImage }

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Image,
  Alert,
  Modal,
  Linking,
} from "react-native";
import {
  ChevronLeft,
  Send,
  Wifi,
  WifiOff,
  Clock,
  CheckCheck,
  Paperclip,
  Image as ImageIcon,
  FileText,
  X,
  Download,
  File,
} from "lucide-react-native";
import { getAuth } from "@react-native-firebase/auth";
import { io, Socket } from "socket.io-client";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { getUserProfile } from "../../services/api";

// ─── Firebase Storage (react-native-firebase) ────────────────────────────────
// @react-native-firebase/storage must be installed:
//   npx expo install @react-native-firebase/storage
import storage from "@react-native-firebase/storage";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string;
  appointmentId: string;
  senderId: number;
  senderRole: "patient" | "doctor";
  senderName: string;
  message: string;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  attachmentType?: string | null;
  attachmentSize?: number | null;
  isRead: boolean;
  createdAt: string;
}

interface PendingAttachment {
  uri: string;
  name: string;
  type: string;
  size?: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRIMARY       = "#199A8E";
const PRIMARY_LIGHT = "#E6F7F6";
const SENT_BG       = "#199A8E";
const RECV_BG       = "#FFFFFF";
const PAGE_BG       = "#F0F4F8";
const TEXT_DARK     = "#0F172A";
const TEXT_MID      = "#64748B";
const TEXT_LIGHT    = "#94A3B8";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatTime = (iso: string): string => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDateLabel = (iso: string): string => {
  const d         = new Date(iso);
  const today     = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString())     return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
};

const formatBytes = (bytes?: number | null): string => {
  if (!bytes) return "";
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isImage = (type?: string | null) =>
  !!type && type.startsWith("image/");

// ─── DateSeparator ───────────────────────────────────────────────────────────

const DateSeparator = ({ label }: { label: string }) => (
  <View style={styles.dateSeparator}>
    <View style={styles.dateLine} />
    <Text style={styles.dateLabel}>{label}</Text>
    <View style={styles.dateLine} />
  </View>
);

// ─── AttachmentPreview (inside bubble) ───────────────────────────────────────

const AttachmentPreview = ({
  url,
  name,
  type,
  size,
  isOwn,
}: {
  url: string;
  name: string;
  type?: string | null;
  size?: number | null;
  isOwn: boolean;
}) => {
  const handleOpen = () => {
    Linking.openURL(url).catch(() =>
      Alert.alert("Error", "Could not open the file.")
    );
  };

  if (isImage(type)) {
    return (
      <TouchableOpacity onPress={handleOpen} activeOpacity={0.85}>
        <Image
          source={{ uri: url }}
          style={styles.attachmentImage}
          resizeMode="cover"
        />
        <Text style={[styles.attachmentImageCaption, isOwn && { color: "rgba(255,255,255,0.75)" }]}>
          Tap to open
        </Text>
      </TouchableOpacity>
    );
  }

  // Non-image file (PDF, DOCX, etc.)
  return (
    <TouchableOpacity
      style={[styles.fileCard, isOwn && styles.fileCardOwn]}
      onPress={handleOpen}
      activeOpacity={0.8}
    >
      <View style={[styles.fileIcon, isOwn && styles.fileIconOwn]}>
        <FileText size={20} color={isOwn ? PRIMARY : "#FFFFFF"} />
      </View>
      <View style={styles.fileInfo}>
        <Text
          style={[styles.fileName, isOwn && styles.fileNameOwn]}
          numberOfLines={2}
        >
          {name}
        </Text>
        {!!size && (
          <Text style={[styles.fileSize, isOwn && styles.fileSizeOwn]}>
            {formatBytes(size)}
          </Text>
        )}
      </View>
      <Download size={16} color={isOwn ? "rgba(255,255,255,0.7)" : TEXT_MID} />
    </TouchableOpacity>
  );
};

// ─── MessageBubble ───────────────────────────────────────────────────────────

const MessageBubble = ({
  msg,
  isOwn,
}: {
  msg: ChatMessage;
  isOwn: boolean;
}) => {
  const hasAttachment = !!msg.attachmentUrl;
  const hasText       = !!msg.message;

  return (
    <View style={[styles.bubbleRow, isOwn ? styles.bubbleRowOwn : styles.bubbleRowOther]}>
      {!isOwn && (
        <View style={styles.avatarSmall}>
          <Text style={styles.avatarSmallText}>
            {msg.senderName.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      <View style={styles.bubbleColumn}>
        {!isOwn && (
          <Text style={styles.bubbleSenderName}>{msg.senderName}</Text>
        )}

        <View style={[styles.bubble, isOwn ? styles.bubbleSent : styles.bubbleReceived]}>
          {hasAttachment && (
            <AttachmentPreview
              url={msg.attachmentUrl!}
              name={msg.attachmentName || "Attachment"}
              type={msg.attachmentType}
              size={msg.attachmentSize}
              isOwn={isOwn}
            />
          )}
          {hasText && (
            <Text style={[styles.bubbleText, isOwn && styles.bubbleTextOwn, hasAttachment && styles.bubbleTextAfterAttachment]}>
              {msg.message}
            </Text>
          )}
        </View>

        <View style={[styles.metaRow, isOwn && styles.metaRowOwn]}>
          <Clock size={10} color={TEXT_LIGHT} />
          <Text style={styles.metaTime}>{formatTime(msg.createdAt)}</Text>
          {isOwn && (
            <CheckCheck
              size={12}
              color={msg.isRead ? PRIMARY : TEXT_LIGHT}
              style={styles.readIcon}
            />
          )}
        </View>
      </View>
    </View>
  );
};

// ─── PendingAttachmentBar ─────────────────────────────────────────────────────
// Shows the selected file above the input bar before sending

const PendingAttachmentBar = ({
  attachment,
  onRemove,
}: {
  attachment: PendingAttachment;
  onRemove: () => void;
}) => (
  <View style={styles.pendingBar}>
    <View style={styles.pendingIcon}>
      {isImage(attachment.type) ? (
        <Image source={{ uri: attachment.uri }} style={styles.pendingThumb} />
      ) : (
        <File size={20} color={PRIMARY} />
      )}
    </View>
    <View style={styles.pendingInfo}>
      <Text style={styles.pendingName} numberOfLines={1}>
        {attachment.name}
      </Text>
      {!!attachment.size && (
        <Text style={styles.pendingSize}>{formatBytes(attachment.size)}</Text>
      )}
    </View>
    <TouchableOpacity onPress={onRemove} style={styles.pendingRemove}>
      <X size={16} color={TEXT_MID} />
    </TouchableOpacity>
  </View>
);

// ─── AttachmentPickerModal ────────────────────────────────────────────────────

const AttachmentPickerModal = ({
  visible,
  onClose,
  onPickImage,
  onPickDocument,
}: {
  visible: boolean;
  onClose: () => void;
  onPickImage: () => void;
  onPickDocument: () => void;
}) => (
  <Modal
    visible={visible}
    transparent
    animationType="slide"
    onRequestClose={onClose}
  >
    <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose}>
      <View style={styles.modalSheet}>
        <View style={styles.modalHandle} />
        <Text style={styles.modalTitle}>Send Attachment</Text>

        <TouchableOpacity
          style={styles.modalOption}
          onPress={() => { onPickImage(); onClose(); }}
        >
          <View style={[styles.modalOptionIcon, { backgroundColor: "#EFF6FF" }]}>
            <ImageIcon size={22} color="#3B82F6" />
          </View>
          <View>
            <Text style={styles.modalOptionLabel}>Photo or Image</Text>
            <Text style={styles.modalOptionSub}>From camera or gallery</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.modalOption}
          onPress={() => { onPickDocument(); onClose(); }}
        >
          <View style={[styles.modalOptionIcon, { backgroundColor: "#FFF7ED" }]}>
            <FileText size={22} color="#F97316" />
          </View>
          <View>
            <Text style={styles.modalOptionLabel}>Document or Report</Text>
            <Text style={styles.modalOptionSub}>PDF, DOCX, XLSX and more</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.modalCancel} onPress={onClose}>
          <Text style={styles.modalCancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  </Modal>
);

// ─── Main Screen ─────────────────────────────────────────────────────────────

const LiveChatScreen = ({ navigation, route }: any) => {
  const { appointmentId, doctorName, doctorSpecialty, doctorImage } =
    route.params || {};

  // ── State ──────────────────────────────────────────────────────────────────
  const [messages,          setMessages]          = useState<ChatMessage[]>([]);
  const [inputText,         setInputText]         = useState("");
  const [loading,           setLoading]           = useState(true);
  const [connected,         setConnected]         = useState(false);
  const [typingName,        setTypingName]        = useState<string | null>(null);
  const [myProfile,         setMyProfile]         = useState<{ id: number; fullName: string; role: string } | null>(null);
  const [pendingAttachment, setPendingAttachment] = useState<PendingAttachment | null>(null);
  const [uploading,         setUploading]         = useState(false);
  const [uploadProgress,    setUploadProgress]    = useState(0);
  const [pickerVisible,     setPickerVisible]     = useState(false);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const socketRef      = useRef<Socket | null>(null);
  const flatListRef    = useRef<FlatList<any>>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef    = useRef(false);

  const backendUrl = (
    process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000"
  ).replace("/api", "");

  // ── Init: load profile + connect socket ───────────────────────────────────
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const auth        = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) {
          Alert.alert("Error", "You must be logged in to chat.");
          navigation.goBack();
          return;
        }

        const profile = await getUserProfile(currentUser.uid);
        if (!mounted) return;
        setMyProfile({ id: profile.id, fullName: profile.fullName, role: profile.role });

        const socket = io(backendUrl, {
          transports: ["websocket"],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1500,
        });
        socketRef.current = socket;

        socket.on("connect", () => {
          if (!mounted) return;
          setConnected(true);
          socket.emit("JOIN_CHAT_ROOM", {
            appointmentId,
            userId: profile.id,
            role:   profile.role,
            name:   profile.fullName,
          });
        });

        socket.on("disconnect",    () => { if (mounted) setConnected(false); });
        socket.on("connect_error", () => { if (mounted) setConnected(false); });

        socket.on("CHAT_HISTORY", ({ messages: history }) => {
          if (!mounted) return;
          setMessages(history || []);
          setLoading(false);
          scrollToBottom(true);
        });

        socket.on("NEW_MESSAGE", (msg: ChatMessage) => {
          if (!mounted) return;
          setMessages((prev) => {
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          scrollToBottom(false);
        });

        socket.on("TYPING_INDICATOR",      ({ senderName }) => { if (mounted) setTypingName(senderName); });
        socket.on("STOP_TYPING_INDICATOR", ()               => { if (mounted) setTypingName(null); });
        socket.on("USER_LEFT",             ()               => { if (mounted) setTypingName(null); });
        socket.on("CHAT_ERROR",            ({ error })      => Alert.alert("Chat Error", error));
      } catch (err) {
        console.error("Chat init error:", err);
        if (mounted) setLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
      if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
      if (socketRef.current) {
        socketRef.current.emit("LEAVE_CHAT_ROOM", { appointmentId });
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [appointmentId]);

  const scrollToBottom = (immediate: boolean) =>
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: !immediate }), immediate ? 0 : 100);

  // ── Typing ─────────────────────────────────────────────────────────────────
  const handleTextChange = useCallback((text: string) => {
    setInputText(text);
    if (!socketRef.current || !myProfile) return;
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socketRef.current.emit("TYPING", { appointmentId, senderName: myProfile.fullName });
    }
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socketRef.current?.emit("STOP_TYPING", { appointmentId });
    }, 1500);
  }, [appointmentId, myProfile]);

  // ── Upload file to Firebase Storage ───────────────────────────────────────
  const uploadToFirebase = async (attachment: PendingAttachment): Promise<string> => {
    const filename  = `chat/${appointmentId}/${Date.now()}_${attachment.name}`;
    const reference = storage().ref(filename);
    const task      = reference.putFile(attachment.uri);

    return new Promise((resolve, reject) => {
      task.on(
        "state_changed",
        (snapshot) => {
          const progress = snapshot.bytesTransferred / snapshot.totalBytes;
          setUploadProgress(Math.round(progress * 100));
        },
        (error) => reject(error),
        async () => {
          const url = await reference.getDownloadURL();
          resolve(url);
        }
      );
    });
  };

  // ── Send (text + optional attachment) ─────────────────────────────────────
  const handleSend = useCallback(async () => {
    const trimmed = inputText.trim();
    if (!trimmed && !pendingAttachment) return;
    if (!socketRef.current || !myProfile) return;

    // Stop typing indicator
    if (isTypingRef.current) {
      isTypingRef.current = false;
      socketRef.current.emit("STOP_TYPING", { appointmentId });
    }
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);

    let attachmentUrl:  string | null = null;
    let attachmentName: string | null = null;
    let attachmentType: string | null = null;
    let attachmentSize: number | null = null;

    // Upload if there's an attachment
    if (pendingAttachment) {
      setUploading(true);
      setUploadProgress(0);
      try {
        attachmentUrl  = await uploadToFirebase(pendingAttachment);
        attachmentName = pendingAttachment.name;
        attachmentType = pendingAttachment.type;
        attachmentSize = pendingAttachment.size ?? null;
      } catch (err) {
        console.error("Upload failed:", err);
        Alert.alert("Upload Failed", "Could not upload the file. Please try again.");
        setUploading(false);
        return;
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    }

    socketRef.current.emit("SEND_MESSAGE", {
      appointmentId,
      senderId:      myProfile.id,
      senderRole:    myProfile.role,
      senderName:    myProfile.fullName,
      message:       trimmed,
      attachmentUrl,
      attachmentName,
      attachmentType,
      attachmentSize,
    });

    setInputText("");
    setPendingAttachment(null);
  }, [inputText, pendingAttachment, appointmentId, myProfile]);

  // ── Image picker ───────────────────────────────────────────────────────────
  const handlePickImage = useCallback(async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission Required", "Please allow access to your photo library.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality:    0.85,
      allowsMultipleSelection: false,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      const name  = asset.fileName || `image_${Date.now()}.jpg`;
      setPendingAttachment({
        uri:  asset.uri,
        name,
        type: asset.mimeType || "image/jpeg",
        size: asset.fileSize,
      });
    }
  }, []);

  // ── Document picker ────────────────────────────────────────────────────────
  const handlePickDocument = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "image/*",
        "text/plain",
      ],
      copyToCacheDirectory: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      setPendingAttachment({
        uri:  asset.uri,
        name: asset.name,
        type: asset.mimeType || "application/octet-stream",
        size: asset.size,
      });
    }
  }, []);

  // ── Build render list with date separators ────────────────────────────────
  type ListItem =
    | { type: "separator"; id: string; label: string }
    | { type: "message";   id: string; data: ChatMessage };

  const listItems: ListItem[] = [];
  let lastLabel = "";
  messages.forEach((msg) => {
    const label = formatDateLabel(msg.createdAt);
    if (label !== lastLabel) {
      lastLabel = label;
      listItems.push({ type: "separator", id: `sep_${msg.id}`, label });
    }
    listItems.push({ type: "message", id: msg.id, data: msg });
  });

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === "separator") return <DateSeparator label={item.label} />;
    const isOwn = item.data.senderId === myProfile?.id;
    return <MessageBubble msg={item.data} isOwn={isOwn} />;
  };

  const canSend = (inputText.trim().length > 0 || !!pendingAttachment) && connected && !uploading;
  const doctorInitial = (doctorName || "D").replace("Dr. ", "").charAt(0).toUpperCase();

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container}>

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft color={TEXT_DARK} size={24} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          {doctorImage ? (
            <Image source={{ uri: doctorImage }} style={styles.headerAvatar} />
          ) : (
            <View style={styles.headerAvatarPlaceholder}>
              <Text style={styles.headerAvatarText}>{doctorInitial}</Text>
            </View>
          )}
          <View style={styles.headerTextBlock}>
            <Text style={styles.headerName} numberOfLines={1}>{doctorName || "Doctor"}</Text>
            <Text style={styles.headerSpecialty} numberOfLines={1}>{doctorSpecialty || "Specialist"}</Text>
          </View>
        </View>

        <View style={styles.connBadge}>
          {connected
            ? <Wifi    size={16} color={PRIMARY}   />
            : <WifiOff size={16} color="#EF4444" />}
        </View>
      </View>

      {/* ── Offline banner ── */}
      {!connected && !loading && (
        <View style={styles.offlineBanner}>
          <WifiOff size={14} color="#FFF" />
          <Text style={styles.offlineText}>Reconnecting…</Text>
        </View>
      )}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={PRIMARY} />
            <Text style={styles.loadingText}>Loading conversation…</Text>
          </View>
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={listItems}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
              onContentSizeChange={() => scrollToBottom(true)}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <View style={styles.emptyIcon}>
                    <Text style={styles.emptyIconText}>💬</Text>
                  </View>
                  <Text style={styles.emptyTitle}>Start the conversation</Text>
                  <Text style={styles.emptySubtitle}>
                    Send a message or share a report with {doctorName || "your doctor"}.
                  </Text>
                </View>
              }
              ListFooterComponent={
                typingName ? (
                  <View style={styles.typingRow}>
                    <View style={styles.typingBubble}>
                      <Text style={styles.typingText}>{typingName} is typing</Text>
                      <View style={styles.typingDots}>
                        <View style={[styles.dot, styles.dot1]} />
                        <View style={[styles.dot, styles.dot2]} />
                        <View style={[styles.dot, styles.dot3]} />
                      </View>
                    </View>
                  </View>
                ) : null
              }
            />

            {/* ── Upload progress bar ── */}
            {uploading && (
              <View style={styles.uploadBar}>
                <View style={styles.uploadBarInner}>
                  <ActivityIndicator size="small" color={PRIMARY} />
                  <Text style={styles.uploadText}>
                    Uploading… {uploadProgress}%
                  </Text>
                </View>
                <View style={styles.uploadTrack}>
                  <View style={[styles.uploadFill, { width: `${uploadProgress}%` as any }]} />
                </View>
              </View>
            )}

            {/* ── Pending attachment preview ── */}
            {pendingAttachment && !uploading && (
              <PendingAttachmentBar
                attachment={pendingAttachment}
                onRemove={() => setPendingAttachment(null)}
              />
            )}

            {/* ── Input bar ── */}
            <View style={styles.inputBar}>
              <TouchableOpacity
                style={styles.attachBtn}
                onPress={() => setPickerVisible(true)}
                disabled={uploading}
              >
                <Paperclip size={20} color={uploading ? TEXT_LIGHT : TEXT_MID} />
              </TouchableOpacity>

              <TextInput
                style={styles.input}
                placeholder={pendingAttachment ? "Add a caption…" : "Type a message…"}
                placeholderTextColor={TEXT_LIGHT}
                value={inputText}
                onChangeText={handleTextChange}
                multiline
                maxLength={1000}
                returnKeyType="default"
                editable={!uploading}
              />

              <TouchableOpacity
                onPress={handleSend}
                style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
                disabled={!canSend}
                activeOpacity={0.8}
              >
                <Send size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </KeyboardAvoidingView>

      {/* ── Attachment picker modal ── */}
      <AttachmentPickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onPickImage={handlePickImage}
        onPickDocument={handlePickDocument}
      />
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: PAGE_BG },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  backBtn: { padding: 6, marginRight: 4 },
  headerCenter: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  headerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 2, borderColor: PRIMARY_LIGHT,
  },
  headerAvatarPlaceholder: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: PRIMARY, alignItems: "center", justifyContent: "center",
  },
  headerAvatarText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  headerTextBlock: { flex: 1 },
  headerName: { fontSize: 15, fontWeight: "700", color: TEXT_DARK },
  headerSpecialty: { fontSize: 12, color: TEXT_MID, marginTop: 1 },
  connBadge: { padding: 8 },

  // Offline
  offlineBanner: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 6, backgroundColor: "#EF4444", paddingVertical: 6,
  },
  offlineText: { color: "#FFF", fontSize: 12, fontWeight: "600" },

  // List
  listContent: { padding: 16, paddingBottom: 8 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  loadingText: { color: TEXT_MID, fontSize: 14 },

  // Empty
  emptyContainer: { alignItems: "center", paddingTop: 80, paddingHorizontal: 32 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: PRIMARY_LIGHT, alignItems: "center", justifyContent: "center", marginBottom: 16,
  },
  emptyIconText: { fontSize: 32 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: TEXT_DARK, marginBottom: 8, textAlign: "center" },
  emptySubtitle: { fontSize: 14, color: TEXT_MID, textAlign: "center", lineHeight: 20 },

  // Date separator
  dateSeparator: { flexDirection: "row", alignItems: "center", marginVertical: 16, gap: 8 },
  dateLine: { flex: 1, height: 1, backgroundColor: "#E2E8F0" },
  dateLabel: { fontSize: 12, fontWeight: "600", color: TEXT_LIGHT, paddingHorizontal: 4 },

  // Bubbles
  bubbleRow: { flexDirection: "row", marginBottom: 12, alignItems: "flex-end", gap: 8 },
  bubbleRowOwn: { justifyContent: "flex-end" },
  bubbleRowOther: { justifyContent: "flex-start" },
  avatarSmall: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: "#CBD5E1", alignItems: "center", justifyContent: "center", marginBottom: 18,
  },
  avatarSmallText: { fontSize: 13, fontWeight: "700", color: "#FFF" },
  bubbleColumn: { maxWidth: "75%" },
  bubbleSenderName: { fontSize: 11, fontWeight: "600", color: PRIMARY, marginBottom: 4, marginLeft: 4 },
  bubble: {
    borderRadius: 18, paddingHorizontal: 12, paddingVertical: 10,
    elevation: 1, shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3,
    overflow: "hidden",
  },
  bubbleSent: { backgroundColor: SENT_BG, borderBottomRightRadius: 4 },
  bubbleReceived: {
    backgroundColor: RECV_BG, borderBottomLeftRadius: 4,
    borderWidth: 1, borderColor: "#E2E8F0",
  },
  bubbleText: { fontSize: 15, color: TEXT_DARK, lineHeight: 21 },
  bubbleTextOwn: { color: "#FFFFFF" },
  bubbleTextAfterAttachment: { marginTop: 6 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 3, marginLeft: 4 },
  metaRowOwn: { justifyContent: "flex-end", marginRight: 4, marginLeft: 0 },
  metaTime: { fontSize: 10, color: TEXT_LIGHT },
  readIcon: { marginLeft: 2 },

  // Attachment inside bubble
  attachmentImage: {
    width: 220, height: 160, borderRadius: 10, marginBottom: 2,
  },
  attachmentImageCaption: {
    fontSize: 10, color: TEXT_MID, textAlign: "center", marginBottom: 4,
  },
  fileCard: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: PRIMARY_LIGHT, borderRadius: 10,
    padding: 10, marginBottom: 2,
  },
  fileCardOwn: { backgroundColor: "rgba(255,255,255,0.2)" },
  fileIcon: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: PRIMARY, alignItems: "center", justifyContent: "center",
  },
  fileIconOwn: { backgroundColor: "rgba(255,255,255,0.9)" },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 13, fontWeight: "600", color: TEXT_DARK },
  fileNameOwn: { color: "#FFFFFF" },
  fileSize: { fontSize: 11, color: TEXT_MID, marginTop: 2 },
  fileSizeOwn: { color: "rgba(255,255,255,0.7)" },

  // Typing indicator
  typingRow: { flexDirection: "row", marginBottom: 12, paddingLeft: 38 },
  typingBubble: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: RECV_BG, borderRadius: 18, borderBottomLeftRadius: 4,
    paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: "#E2E8F0",
  },
  typingText: { fontSize: 12, color: TEXT_MID, fontStyle: "italic" },
  typingDots: { flexDirection: "row", gap: 3, alignItems: "center" },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: TEXT_MID, opacity: 0.4 },
  dot1: { opacity: 0.9 },
  dot2: { opacity: 0.6 },
  dot3: { opacity: 0.3 },

  // Upload progress
  uploadBar: {
    backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: "#E2E8F0",
  },
  uploadBarInner: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  uploadText: { fontSize: 13, color: TEXT_MID, fontWeight: "600" },
  uploadTrack: { height: 4, backgroundColor: "#E2E8F0", borderRadius: 2, overflow: "hidden" },
  uploadFill: { height: 4, backgroundColor: PRIMARY, borderRadius: 2 },

  // Pending attachment bar
  pendingBar: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: "#E2E8F0",
  },
  pendingIcon: {
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: PRIMARY_LIGHT, alignItems: "center", justifyContent: "center",
    overflow: "hidden",
  },
  pendingThumb: { width: 42, height: 42 },
  pendingInfo: { flex: 1 },
  pendingName: { fontSize: 13, fontWeight: "600", color: TEXT_DARK },
  pendingSize: { fontSize: 11, color: TEXT_MID, marginTop: 2 },
  pendingRemove: { padding: 6 },

  // Input bar
  inputBar: {
    flexDirection: "row", alignItems: "flex-end",
    padding: 10, backgroundColor: "#FFFFFF",
    borderTopWidth: 1, borderTopColor: "#E2E8F0", gap: 8,
  },
  attachBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center",
  },
  input: {
    flex: 1, minHeight: 44, maxHeight: 120,
    backgroundColor: "#F8FAFC", borderRadius: 22,
    borderWidth: 1, borderColor: "#E2E8F0",
    paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 15, color: TEXT_DARK, lineHeight: 20,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: PRIMARY, alignItems: "center", justifyContent: "center",
    elevation: 2, shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,
  },
  sendBtnDisabled: { backgroundColor: "#CBD5E1", elevation: 0, shadowOpacity: 0 },

  // Picker modal
  modalBackdrop: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#FFFFFF", borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, paddingBottom: 36,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: "#E2E8F0", alignSelf: "center", marginBottom: 20,
  },
  modalTitle: { fontSize: 17, fontWeight: "700", color: TEXT_DARK, marginBottom: 20 },
  modalOption: {
    flexDirection: "row", alignItems: "center", gap: 14,
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9",
  },
  modalOptionIcon: {
    width: 46, height: 46, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
  },
  modalOptionLabel: { fontSize: 15, fontWeight: "600", color: TEXT_DARK },
  modalOptionSub: { fontSize: 12, color: TEXT_MID, marginTop: 2 },
  modalCancel: {
    marginTop: 16, paddingVertical: 14,
    alignItems: "center", backgroundColor: "#F8FAFC", borderRadius: 14,
  },
  modalCancelText: { fontSize: 15, fontWeight: "700", color: "#EF4444" },
});

export default LiveChatScreen;