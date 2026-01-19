import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 20,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C2A3A",
  },
  iconButton: {
    padding: 8,
  },

  // Doctor Profile Section
  profileContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginBottom: 24,
    alignItems: "center",
  },
  doctorImage: {
    width: 100,
    height: 100,
    borderRadius: 16,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C2A3A",
    marginBottom: 4,
  },
  specialty: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  ratingText: {
    color: "#199A8E",
    fontWeight: "bold",
    fontSize: 12,
    marginLeft: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  locationText: {
    color: "#6B7280",
    fontSize: 12,
    marginLeft: 4,
  },

  // About Section
  sectionContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C2A3A",
    marginBottom: 8,
  },
  aboutText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
  },
  readMore: {
    color: "#199A8E",
    fontWeight: "bold",
  },

  // Date Picker
  dateScroll: {
    paddingLeft: 24,
    marginBottom: 24,
  },
  dateCard: {
    width: 60,
    height: 70,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#FFFFFF",
  },
  dateCardActive: {
    backgroundColor: "#199A8E",
    borderColor: "#199A8E",
  },
  dayText: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  dateNumText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C2A3A",
  },
  textActive: {
    color: "#FFFFFF",
  },

  // Time Picker
  timeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 24,
    justifyContent: "space-between",
    marginBottom: 24, // Reduced margin to fit Reason Input below
  },
  timeSlot: {
    width: (width - 48 - 20) / 3,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    marginBottom: 12,
  },
  timeSlotActive: {
    backgroundColor: "#199A8E",
    borderColor: "#199A8E",
  },
  timeText: {
    fontSize: 14,
    color: "#1C2A3A",
  },

  // Reason Input (NEW)
  reasonContainer: {
    paddingHorizontal: 24,
    marginBottom: 100, // Extra space for footer
  },
  reasonLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C2A3A",
    marginBottom: 12,
  },
  reasonInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 16,
    fontSize: 14,
    color: "#1C2A3A",
    textAlignVertical: "top", // Ensures text starts at top for multiline
    minHeight: 100,
  },

  // Footer Actions
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    flexDirection: "row",
    alignItems: "center",
  },
  chatButton: {
    width: 50,
    height: 50,
    backgroundColor: "#E8F3F1",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  bookButton: {
    flex: 1,
    backgroundColor: "#199A8E",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  bookButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default styles;