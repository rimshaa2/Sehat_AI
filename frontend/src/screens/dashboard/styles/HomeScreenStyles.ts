import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  greeting: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1C2A3A",
  },
  subGreeting: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  profileButton: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  // Search Bar
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
    marginTop: 24,
    paddingHorizontal: 16,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#1C2A3A",
  },
  filterButton: {
    width: 32,
    height: 32,
    backgroundColor: "#F0FDF9", // Light Teal
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  filterLine1: { width: 16, height: 2, backgroundColor: "#199A8E", marginBottom: 3 },
  filterLine2: { width: 10, height: 2, backgroundColor: "#199A8E", marginBottom: 3 },
  filterLine3: { width: 16, height: 2, backgroundColor: "#199A8E" },

  // Appointment Card
  appointmentCard: {
    marginHorizontal: 24,
    marginTop: 24,
    backgroundColor: "#199A8E", // The teal color from image
    borderRadius: 20,
    padding: 20,
  },
  doctorInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  doctorImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  doctorName: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  doctorSpeciality: {
    color: "#E5E7EB",
    fontSize: 12,
  },
  chatButton: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 12,
  },
  dateContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.1)",
    padding: 12,
    borderRadius: 12,
    justifyContent: "space-between",
  },
  dateItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    color: "#FFFFFF",
    fontSize: 12,
    marginLeft: 6,
    fontWeight: "500",
  },

  // Grid
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginHorizontal: 24,
    marginTop: 24,
  },
  gridItem: {
    width: (width - 48 - 16) / 2, // (ScreenWidth - padding - gap) / 2
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    minHeight: 140,
    justifyContent: "center",
  },
  gridIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  gridIcon: {
    width: 24,
    height: 24,
  },
  gridTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C2A3A",
    marginBottom: 4,
  },
  gridSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
  },

  // Promo Banner
  promoBanner: {
    marginHorizontal: 24,
    backgroundColor: "#4C6FFF", // Blue color
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    overflow: "hidden",
  },
  promoTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    lineHeight: 22,
  },
  promoLink: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  promoImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },

  // Bottom Nav
  bottomNav: {
    position: "absolute",
    bottom: 30,
    left: 24,
    right: 24,
    height: 60,
    backgroundColor: "#199A8E", // Teal color
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    // Shadow
    shadowColor: "#199A8E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
});

export default styles;