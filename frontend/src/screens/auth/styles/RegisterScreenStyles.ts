import { StyleSheet } from "react-native";
export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingVertical: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  iconSmall: {
    width: 24,
    height: 24,
  },
  titleSection: {
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  titleText: {
    color: "#18181B",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitleText: {
    color: "#3F3F46",
    fontSize: 14,
  },
  inputGroup: {
    marginBottom: 16,
    paddingHorizontal: 24,
  },
  label: {
    color: "#18181B",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    color: "#71717A",
    fontSize: 14,
    backgroundColor: "#FFFFFF",
    borderColor: "#D2D6DB",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  inputError: {
    borderColor: "#EF4444", // Red border on error
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#D2D6DB",
    borderRadius: 12,
    borderWidth: 1,
    paddingRight: 12,
  },
  passwordInput: {
    color: "#71717A",
    fontSize: 14,
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 12,
  },
  eyeIcon: {
    padding: 4,
  },
  strengthContainer: {
    marginTop: 8,
  },
  strengthTrack: {
    width: "100%",
    height: 6,
    borderRadius: 4,
    backgroundColor: "#E5E7EB",
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
    borderRadius: 4,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
  },
  errorText: {
    color: "#EF4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  policyContainer: {
    paddingHorizontal: 24,
    marginTop: 8,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#D2D6DB",
    borderRadius: 4,
    marginTop: 2,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    backgroundColor: "#199A8E",
    borderColor: "#199A8E",
  },
  checkboxTick: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  policyText: {
    flex: 1,
    color: "#3F3F46",
    fontSize: 13,
    lineHeight: 20,
  },
  policyLink: {
    color: "#199A8E",
    fontWeight: "600",
  },
  button: {
    marginHorizontal: 24,
    marginTop: 24,
    paddingVertical: 16,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  footerText: {
    color: "#71717A",
    fontSize: 14,
  },
  linkText: {
    color: "#199A8E", // Primary color
    fontSize: 14,
    fontWeight: "bold",
  },
});