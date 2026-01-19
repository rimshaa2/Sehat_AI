import { StyleSheet, Dimensions, Platform } from "react-native";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  
  // Header (Same as before)
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: "#66CDAA",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 12,
  },
  headerAvatarContainer: {
    position: "relative",
    marginRight: 12,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0F2F1",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#10B981",
    borderWidth: 1.5,
    borderColor: "#66CDAA",
  },
  headerInfo: {
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C2A3A",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#374151",
  },
  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },

  // Content Container
  chatContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  contentContainerStyle: {
    paddingBottom: 100, // Space for input bar
  },
  
  // Large Bot Avatar
  largeBotContainer: {
    alignItems: "center",
    marginVertical: 30,
  },
  largeBotCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#66CDAA",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "rgba(255,255,255,0.5)",
    shadowColor: "#66CDAA",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  innerBotCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#4DB6AC",
    justifyContent: "center",
    alignItems: "center",
  },
  botImage: {
    width: 80,
    height: 80,
  },

  // Messages
  messageWrapper: {
    alignSelf: "flex-start",
    backgroundColor: "#E0E7FF",
    padding: 16,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    marginBottom: 12,
    maxWidth: "85%",
  },
  messageText: {
    fontSize: 16,
    color: "#1F2937",
    lineHeight: 22,
  },
  urduText: {
    fontSize: 18,
    textAlign: "right",
  },
  
  // User Message (Right Side)
  userMessageWrapper: {
    alignSelf: "flex-end",
    backgroundColor: "#66CDAA", // Teal for user
    padding: 16,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    marginBottom: 12,
    maxWidth: "85%",
  },
  userMessageText: {
    fontSize: 16,
    color: "#FFFFFF",
    lineHeight: 22,
  },

  // Typing Dots
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E0E7FF",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    alignSelf: "flex-start",
    width: 60,
    justifyContent: "space-between",
    marginBottom: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#6B7280",
    opacity: 0.6,
  },

  // Footer / Language Selection
  footer: {
    backgroundColor: "#66CDAA",
    paddingVertical: 24,
    paddingHorizontal: 40,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 180,
  },
  languageButton: {
    backgroundColor: "#FFFFFF",
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  languageButtonText: {
    fontSize: 16,
    color: "#199A8E",
    fontWeight: "500",
  },

  // Input Bar (New)
  inputContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 30, // Fully rounded
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
    color: "#1C2A3A",
    maxHeight: 100,
    paddingVertical: 8,
    marginLeft: 8,
  },
  inputIcon: {
    padding: 8,
  },
});

export default styles;