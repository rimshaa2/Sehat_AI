import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingVertical: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  iconSmall: {
    width: 24,
    height: 24,
  },
  titleContainer: {
    alignSelf: "flex-start",
    marginBottom: 32,
    marginLeft: 16,
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
  inputContainer: {
    marginBottom: 16,
    marginHorizontal: 16,
  },
  label: {
    color: "#18181B",
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    color: "#18181B",
    fontSize: 14,
    backgroundColor: "#FFFFFF",
    borderColor: "#D2D6DB", // Updated to match Figma grey
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#D2D6DB",
    borderRadius: 12,
    borderWidth: 1,
    paddingRight: 12,
  },
  passwordInput: {
    color: "#18181B",
    fontSize: 14,
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 12,
  },
  eyeIcon: {
    borderRadius: 12,
    width: 24,
    height: 24,
  },
  forgotPasswordContainer: {
    marginBottom: 32,
    marginHorizontal: 16,
    alignItems: "flex-end",
  },
  forgotPasswordText: {
    color: "#3F3F46",
    fontSize: 14,
  },
  buttonContainer: {
    marginHorizontal: 16,
  },
  button: {
    alignItems: "center",
    backgroundColor: "#199A8E", // Primary Teal Color
    borderRadius: 12, // Adjusted radius to match modern feel
    paddingVertical: 14,
    marginBottom: 15,
    shadowColor: "#0000000D",
    shadowOpacity: 0.1,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  footerText: {
    color: "#3F3F46",
    fontSize: 14,
  },
  linkText: {
    color: "#199A8E",
    fontSize: 14,
    fontWeight: "bold",
  },
});

export default styles;