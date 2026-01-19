import { StyleSheet, Dimensions } from "react-native";

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
  backButton: {
    padding: 4,
  },

  // Scroll Content
  content: {
    paddingHorizontal: 24,
    paddingBottom: 120, // Space for footer
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
    width: 80,
    height: 80,
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
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF9",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 4,
  },
  ratingText: {
    color: "#199A8E",
    fontWeight: "bold",
    fontSize: 12,
    marginLeft: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  locationText: {
    color: "#6B7280",
    fontSize: 12,
    marginLeft: 4,
  },

  // Section Headers (Date, Reason, etc.)
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C2A3A",
  },
  changeLink: {
    fontSize: 12,
    color: "#9CA3AF",
  },

  // Info Row (Date/Reason content)
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F0FDF9", // Light teal
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
    flex: 1,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 16,
  },

  // Payment Details
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  paymentValue: {
    fontSize: 14,
    color: "#374151",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    paddingTop: 12,
    // borderTopWidth: 1,
    // borderTopColor: "#F3F4F6",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C2A3A",
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#199A8E",
  },

  // Payment Method Card
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
  },
  visaText: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1A1A80", // Visa Blue-ish
    fontStyle: "italic",
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footerTotalLabel: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  footerTotalPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1C2A3A",
  },
  confirmButton: {
    backgroundColor: "#56C2B6", // Slightly lighter teal from design
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default styles;