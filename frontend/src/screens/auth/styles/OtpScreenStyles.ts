import { StyleSheet } from "react-native";
import colors from "../../../config/colors";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  wrapper: {
    width: "100%",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: colors.black,
  },

  subtitle: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 28,
    width: "90%",
  },

  otpInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    fontSize: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    textAlign: "center",
    letterSpacing: 4,
    marginBottom: 24,
  },

  verifyBtn: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },

  verifyText: {
    fontSize: 16,
    fontWeight: "bold",
  },

  resendText: {
    color: "#2563EB",
    fontSize: 14,
    textAlign: "center",
    marginTop: 10,
  },
});
