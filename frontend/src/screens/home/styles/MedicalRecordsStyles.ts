import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#66CDAA", // Main Teal Background for upper part
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginLeft: 16,
  },
  backButton: {
    padding: 4,
  },

  // Summary Cards (Total Records, Last Updated)
  summaryContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    justifyContent: "space-between",
    marginBottom: 30,
  },
  summaryCard: {
    width: (width - 48 - 16) / 2, // Half width minus padding
    backgroundColor: "rgba(255, 255, 255, 0.2)", // Semi-transparent white
    borderRadius: 16,
    padding: 16,
    height: 100,
    justifyContent: "center",
  },
  summaryLabel: {
    color: "#E0F2F1",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  summaryValue: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  summarySubValue: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },

  // Main Content Sheet (White part)
  contentSheet: {
    flex: 1,
    backgroundColor: "#F9FAFB", // Light grey background for list
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 24,
    paddingHorizontal: 24,
  },

  // Filter Tabs (All, Lab Reports, etc.)
  filtersScroll: {
    flexGrow: 0, // Don't expand to fill height
    marginBottom: 20,
  },
  filterPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F3F4F6", // Inactive grey
    marginRight: 12,
  },
  filterPillActive: {
    backgroundColor: "#199A8E", // Active Teal
  },
  filterText: {
    color: "#6B7280",
    fontWeight: "500",
    fontSize: 14,
  },
  filterTextActive: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },

  // Record List Items
  listContent: {
    paddingBottom: 100, // Space for footer button
  },
  recordCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  recordInfo: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 12,
    color: "#9CA3AF",
    marginRight: 12,
  },
  tagContainer: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "500",
  },
  downloadIcon: {
    padding: 8,
  },

  // Footer Buttons (Floating + and Back)
  footerContainer: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
    alignItems: "center",
  },
  addButton: {
    position: "absolute",
    bottom: 80, // Above the back button
    right: 0,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#199A8E",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#199A8E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  backHomeButton: {
    backgroundColor: "#66CDAA",
    width: "100%",
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: "center",
  },
  backHomeText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default styles;