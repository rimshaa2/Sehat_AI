import { StyleSheet, Dimensions } from "react-native";

const { height } = Dimensions.get("window");

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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C2A3A",
  },
  
  // Search & Filter Header
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
    marginBottom: 16,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1C2A3A",
  },
  filterBtnSquare: {
    width: 50,
    height: 50,
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  filterLine1: { width: 16, height: 2, backgroundColor: "#1C69FF", marginBottom: 3 },
  filterLine2: { width: 10, height: 2, backgroundColor: "#1C69FF", marginBottom: 3 },
  filterLine3: { width: 16, height: 2, backgroundColor: "#1C69FF" },

  // Horizontal Filters
  filtersScroll: {
    paddingHorizontal: 24,
    marginBottom: 24,
    maxHeight: 40,
  },
  filterPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 20, // Rounder pills
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  filterPillActive: {
    backgroundColor: "#199A8E", // Active Green Color
    borderColor: "#199A8E",
  },
  filterText: {
    fontSize: 12,
    color: "#6B7280",
    marginRight: 4,
    fontWeight: "500",
  },
  filterTextActive: {
    color: "#FFFFFF", // White text when active
  },

  // Doctor Card
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  card: {
    flexDirection: "row",
    marginBottom: 24,
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
  },
  doctorImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
    backgroundColor: "#F3F4F6",
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
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
  price: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1C2A3A",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
  },
  
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: '#1C2A3A',
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 16,
  },
  emptySubtitle: {
    color: '#6B7280',
    textAlign: 'center',
    fontSize: 14,
  },

  // --- MODAL STYLES ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    minHeight: height * 0.25,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1C2A3A",
    marginBottom: 16,
    textAlign: "center",
  },
  modalOption: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalOptionText: {
    fontSize: 16,
    color: "#374151",
    textAlign: "center",
  },
  modalOptionActive: {
    color: "#199A8E",
    fontWeight: "bold",
  },
});

export default styles;