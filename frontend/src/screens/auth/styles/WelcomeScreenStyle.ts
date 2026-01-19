import { StyleSheet } from "react-native";
import colors from "../../../config/colors";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },

  scroll: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 24,
    paddingBottom: 8,
  },

  headerWrapper: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },

  headerImage: {
    borderRadius: 24,
  },

  statusBarRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 273,
  },

  timeText: {
    color: colors.darkBlue,
    fontSize: 15,
  },

  statusIcons: {
    width: 66,
    height: 11,
  },

  titleWrapper: {
    alignSelf: "flex-start",
    marginBottom: 46,
    marginLeft: 16,
  },

  appTitle: {
    color: colors.black,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },

  subtitle: {
    color: colors.gray,
    fontSize: 14,
  },

  buttonWrapper: {
    alignItems: "center",
    marginBottom: 64,
    marginHorizontal: 16,
    
  },

  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 16,
    elevation: 2,
    minWidth: 280
  },

  primaryButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "bold",
  },

  googleButton: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 12,
    marginBottom: 16,
    elevation: 2,
    minWidth: 280
  },

  appleButton: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    marginBottom: 16,
    elevation: 2,
    minWidth: 280
  },

  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 12,
    borderRadius: 8,
  },

  googleText: {
    color: colors.googleBlue,
    fontSize: 14,
    fontWeight: "bold",
  },

  appleText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "bold",
  },

  loginText: {
    color: colors.gray,
    fontSize: 14,
  },

  termsWrapper: {
    alignItems: "center",
    marginBottom: 27,
  },

  termsText: {
    color: colors.gray,
    fontSize: 12,
    textAlign: "center",
    width: 254,
  },

  bottomBarWrapper: {
    alignItems: "center",
  },

  bottomBar: {
    width: 134,
    height: 5,
    backgroundColor: colors.darkBlue,
    borderRadius: 100,
  },
});
