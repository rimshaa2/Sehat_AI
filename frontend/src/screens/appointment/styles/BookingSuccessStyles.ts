import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#66CDAA", // Main Teal Background
  },
  
  // The White Card Sheet
  contentSheet: {
    marginTop: height * 0.2, // Starts 20% down the screen
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60, // Space for the floating logo
  },

  // Floating Logo (Overlapping)
  logoContainer: {
    position: "absolute",
    top: -50, // Pulls it up above the white sheet
    alignSelf: "center",
    width: 100,
    height: 100,
    backgroundColor: "#FFFFFF",
    borderRadius: 30, // Squircle shape
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 4, // Optional: visual border to match design if needed
    borderColor: "#E0F2F1", 
  },
  logoIcon: {
    width: 50,
    height: 50,
  },

  // Texts
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1C2A3A",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 20,
    paddingHorizontal: 20,
  },

  // Doctor Info
  doctorContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  doctorImage: {
    width: 80,
    height: 80,
    borderRadius: 20,
    marginBottom: 12,
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
  },

  // Appointment Detail Row
  detailCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA", // Very light grey bg
    padding: 16,
    borderRadius: 16,
    width: "100%",
    marginBottom: 40,
  },
  iconBox: {
    width: 50,
    height: 50,
    backgroundColor: "#E8F3F1", // Light teal icon bg
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1C2A3A",
  },

  // Bottom Button
  homeButton: {
    backgroundColor: "#56C2B6",
    width: "100%",
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 20,
  },
  homeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default styles;