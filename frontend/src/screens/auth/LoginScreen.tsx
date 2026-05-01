import React, { useEffect, useState } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "@react-native-firebase/auth";
import styles from "./styles/LoginScreenStyles";
import { syncUser, recordLoginAttempt } from "../../services/api";

export default ({ navigation }: any) => {
  const MAX_FAILED_ATTEMPTS = 5;
  const LOCKOUT_MINUTES = 10;
  const LOCKOUT_KEY = "auth_lockout_until";
  const FAILED_ATTEMPTS_KEY = "auth_failed_attempts";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [remainingLockoutSeconds, setRemainingLockoutSeconds] = useState(0);

  const auth = getAuth();

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    const hydrateLockout = async () => {
      const lockoutUntil = await AsyncStorage.getItem(LOCKOUT_KEY);
      if (!lockoutUntil) return;
      const remaining = Math.max(
        0,
        Math.floor((Number(lockoutUntil) - Date.now()) / 1000),
      );
      setRemainingLockoutSeconds(remaining);
    };

    hydrateLockout();
    interval = setInterval(() => {
      setRemainingLockoutSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = async () => {
    const lockoutUntil = await AsyncStorage.getItem(LOCKOUT_KEY);
    if (lockoutUntil && Number(lockoutUntil) > Date.now()) {
      const remaining = Math.ceil((Number(lockoutUntil) - Date.now()) / 1000);
      setRemainingLockoutSeconds(remaining);
      Alert.alert(
        "Account temporarily locked",
        `Too many failed attempts. Try again in ${Math.ceil(remaining / 60)} minute(s).`,
      );
      return;
    }

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
      await recordLoginAttempt(email.trim(), true);

      console.log("✅ MySQL Sync Success:", dbResponse);
      await AsyncStorage.multiRemove([FAILED_ATTEMPTS_KEY, LOCKOUT_KEY]);
      setRemainingLockoutSeconds(0);
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

      try {
        await recordLoginAttempt(email.trim(), false);
      } catch (attemptError: any) {
        if (attemptError?.response?.status === 423) {
          msg = "Too many failed attempts. Account is locked for 10 minutes.";
        }
      }

      const nextFailedAttempts =
        Number(await AsyncStorage.getItem(FAILED_ATTEMPTS_KEY) || 0) + 1;
      await AsyncStorage.setItem(
        FAILED_ATTEMPTS_KEY,
        String(nextFailedAttempts),
      );
      if (nextFailedAttempts >= MAX_FAILED_ATTEMPTS) {
        const lockoutUntilTs = Date.now() + LOCKOUT_MINUTES * 60 * 1000;
        await AsyncStorage.setItem(LOCKOUT_KEY, String(lockoutUntilTs));
        await AsyncStorage.setItem(FAILED_ATTEMPTS_KEY, "0");
        setRemainingLockoutSeconds(LOCKOUT_MINUTES * 60);
        msg = `Too many failed attempts. Account is locked for ${LOCKOUT_MINUTES} minutes.`;
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
          <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={isLoading || remainingLockoutSeconds > 0}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Log In</Text>
            )}
          </TouchableOpacity>
          {remainingLockoutSeconds > 0 ? (
            <Text style={styles.lockoutText}>
              Login locked for {Math.ceil(remainingLockoutSeconds / 60)} minute(s).
            </Text>
          ) : null}
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