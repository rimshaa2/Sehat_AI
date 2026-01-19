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

  // Info Section
  infoContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  currentSlotText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#199A8E", // Teal
  },

  // Section Headers
  sectionContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C2A3A",
  },

  // Date Picker
  dateScroll: {
    paddingLeft: 24,
    marginBottom: 10,
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
    marginBottom: 40,
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

  // Footer
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  confirmButton: {
    backgroundColor: "#199A8E",
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default styles;