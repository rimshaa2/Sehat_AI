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
  content: {
    paddingHorizontal: 24,
  },
  
  // Status Badge
  statusContainer: {
    alignSelf: "center",
    backgroundColor: "#E0F2F1", // Light Green
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  statusText: {
    color: "#10B981", // Green Text
    fontWeight: "bold",
    fontSize: 14,
    textTransform: "uppercase",
  },

  // Doctor Card
  doctorCard: {
    flexDirection: "row",
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    marginBottom: 24,
    alignItems: "center",
  },
  doctorImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    marginRight: 16,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C2A3A",
    marginBottom: 4,
  },
  specialty: {
    fontSize: 12,
    color: "#6B7280",
  },

  // Details Section
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C2A3A",
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#6B7280",
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1C2A3A",
    maxWidth: "60%",
    textAlign: "right",
  },

  // Action Buttons
  actionsContainer: {
    marginTop: 24,
  },
  rescheduleButton: {
    backgroundColor: "#199A8E",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  rescheduleText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#FEE2E2", // Light Red
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelText: {
    color: "#EF4444", // Red Text
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default styles;