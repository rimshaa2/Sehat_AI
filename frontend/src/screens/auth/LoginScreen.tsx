import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  ScrollView,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "@react-native-firebase/auth";
import styles from "./styles/LoginScreenStyles";
import { syncUser } from "../../services/api";

export default ({ navigation }: any) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const auth = getAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Modular Firebase Login (Existing)
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );

      // ---------------------------------------------------------
      // 🟡 NEW: Sync with MySQL Backend
      // ---------------------------------------------------------
      console.log("Firebase Auth Success. Now syncing to MySQL...");

      // A. Get the security token from Firebase
      const idToken = await userCredential.user.getIdToken();

      // B. Send token to your Node.js backend
      // This ensures the user exists in your 'Users' table in MySQL
      const dbResponse = await syncUser(idToken);

      console.log("✅ MySQL Sync Success:", dbResponse);
      // ---------------------------------------------------------

      // 2. Navigate to Home on success
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    } catch (error: any) {
      console.error("Login Error:", error);

      let msg = "Login failed. Please try again.";

      // Firebase Errors
      if (error.code === "auth/invalid-email")
        msg = "That email address is invalid.";
      if (error.code === "auth/user-not-found")
        msg = "No user found with this email.";
      if (error.code === "auth/wrong-password") msg = "Incorrect password.";
      if (error.code === "auth/invalid-credential")
        msg = "Invalid credentials.";

      // 🟡 Axios/Network Errors (If backend is down)
      if (error.message && error.message.includes("Network Error")) {
        msg =
          "Cannot connect to Sehat AI Server. Please check your internet or try again later.";
      }

      Alert.alert("Login Failed", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header / Back Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            {/* Using your arrow icon */}
            <Image
              source={{
                uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/GKFzOSqxbW/7u0ffyps_expires_30_days.png",
              }}
              resizeMode={"stretch"}
              style={styles.iconSmall}
            />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleText}>Welcome Back</Text>
          <Text style={styles.subtitleText}>
            Please enter your details to login
          </Text>
        </View>

        {/* Email Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
              style={styles.passwordInput}
            />
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <Image
                source={{
                  uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/GKFzOSqxbW/yiz58cxz_expires_30_days.png",
                }}
                resizeMode={"stretch"}
                style={styles.eyeIcon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Forgot Password */}
        <View style={styles.forgotPasswordContainer}>
          <TouchableOpacity
            onPress={() =>
              Alert.alert("Reset Password", "This feature is coming soon!")
            }
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Log In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Register Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("PhoneNumber")}>
            <Text style={styles.linkText}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
