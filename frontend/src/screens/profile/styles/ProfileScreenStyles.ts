import { StyleSheet, Dimensions, Platform } from "react-native";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  // ── Root ──
  container: {
    flex: 1,
    backgroundColor: "#F1F5F9",
  },

  // ── Gradient Header ──
  headerBg: {
    backgroundColor: "#199A8E",
    paddingTop: Platform.OS === "ios" ? 56 : 44,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF",
  },
  headerRightPlaceholder: {
    width: 38,
  },

  // ── Profile Card ──
  profileCardWrapper: {
    marginTop: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  profileCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    paddingTop: 28,
    paddingBottom: 22,
    paddingHorizontal: 20,
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 6,
  },
  avatarRing: {
    width: 84,
    height: 84,
    borderRadius: 28,
    borderWidth: 3,
    borderColor: "#199A8E",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  avatarInner: {
    width: 72,
    height: 72,
    borderRadius: 23,
    backgroundColor: "#E6F7F5",
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: 21,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: 0.2,
  },
  userEmail: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 4,
  },
  userPhone: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 2,
  },
  roleBadge: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: "#E6F7F5",
  },
  roleText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#199A8E",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  memberSince: {
    fontSize: 11,
    color: "#CBD5E1",
    marginTop: 10,
  },
  editBtn: {
    position: "absolute",
    top: 18,
    right: 18,
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Stats Strip ──
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: "#FFF",
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 6,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statDivider: {
    width: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 4,
  },
  statIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
    marginTop: 2,
  },

  // ── Section Titles ──
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
    marginLeft: 20,
    marginBottom: 10,
    marginTop: 4,
  },

  // ── Quick Actions ──
  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  quickBtn: {
    width: (width - 48) / 2,
    backgroundColor: "#FFF",
    borderRadius: 18,
    padding: 14,
    margin: 4,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  quickIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  quickTextWrap: {
    flex: 1,
  },
  quickBtnTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
  },
  quickBtnSub: {
    fontSize: 10,
    color: "#94A3B8",
    marginTop: 2,
  },

  // ── Menu Card ──
  menuSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  menuCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginLeft: 60,
  },
  menuIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },
  menuSubtitle: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 1,
  },

  // ── Sign Out ──
  signOutSection: {
    paddingHorizontal: 16,
    marginBottom: 36,
  },
  signOutButton: {
    backgroundColor: "#FFF",
    borderRadius: 18,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#FCA5A5",
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
  signOutText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#EF4444",
    marginLeft: 10,
  },

  // ── Scroll ──
  scrollContent: {
    paddingBottom: 30,
  },
});

export default styles;