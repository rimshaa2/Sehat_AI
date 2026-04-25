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
  Linking,
} from "react-native";
import auth from "@react-native-firebase/auth";
import styles from "./styles/RegisterScreenStyles";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/types";
import { Keyboard } from "react-native";

// 🔴 REMOVED: Firestore imports
// 🟢 ADDED: Sync User API
import { syncUser } from "../../services/api";

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const getPasswordStrength = (value: string) => {
  if (!value) return { label: "Too weak", score: 0, color: "#D1D5DB" };

  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/[a-z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;

  if (score <= 2) return { label: "Weak", score, color: "#EF4444" };
  if (score <= 4) return { label: "Medium", score, color: "#F59E0B" };
  return { label: "Strong", score, color: "#10B981" };
};

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedPolicies, setAcceptedPolicies] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    policies: "",
  });

  const TERMS_URL = "https://sehat.ai/terms";
  const PRIVACY_URL = "https://sehat.ai/privacy";
  const passwordStrength = getPasswordStrength(password);

  const openPolicyLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert("Link unavailable", "Could not open this policy link.");
        return;
      }
      await Linking.openURL(url);
    } catch (error) {
      Alert.alert("Link unavailable", "Could not open this policy link.");
    }
  };

  const validateForm = () => {
    let valid = true;
    let newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      policies: "",
    };

    if (name.trim().length < 2) {
      newErrors.name = "Full Name is required";
      valid = false;
    }
    if (!email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!isValidEmail(email)) {
      newErrors.email = "Please enter a valid email address";
      valid = false;
    }
    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }
    if (!acceptedPolicies) {
      newErrors.policies = "You must accept Terms and Privacy Policy";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleRegister = async () => {
    Keyboard.dismiss();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // 1. Create Authentication User in Firebase
      const userCredential = await auth().createUserWithEmailAndPassword(
        email.trim(),
        password
      );

      const user = userCredential.user;

      // 2. Update Auth Profile IMMEDIATELY
      // We do this before syncing so the token contains the correct name
      await user.updateProfile({ displayName: name });

      // 3. Get Fresh Token (Force Refresh)
      // Passing 'true' forces a refresh, ensuring the new displayName is inside the token
      const idToken = await user.getIdToken(true);

      // 4. Sync to MySQL Backend
      console.log("Syncing new user to MySQL...");
      await syncUser(idToken);
      console.log("✅ User created in MySQL");

      Alert.alert("Success", "Account created successfully!");

      // Navigate to Home/App
      navigation.navigate("Home");

    } catch (error: any) {
      console.error("Registration Error:", error);
      
      let errorMessage = "Something went wrong";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "That email address is already in use!";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak!";
      } else if (error.message && error.message.includes("Network Error")) {
        errorMessage = "Account created, but could not connect to server. Please check internet.";
      } else {
        errorMessage = error.message;
      }
      
      Alert.alert("Registration Failed", errorMessage);
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
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => navigation?.goBack()}>
            <Image
              source={{
                uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/GKFzOSqxbW/7u0ffyps_expires_30_days.png",
              }}
              resizeMode={"stretch"}
              style={styles.iconSmall}
            />
          </TouchableOpacity>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.titleText}>Register</Text>
          <Text style={styles.subtitleText}>
            Please fill in the form to create an account
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            placeholder={"Enter your full name"}
            value={name}
            onChangeText={setName}
            style={[styles.input, errors.name ? styles.inputError : null]}
          />
          {errors.name ? (
            <Text style={styles.errorText}>{errors.name}</Text>
          ) : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder={"Enter your Email"}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={[styles.input, errors.email ? styles.inputError : null]}
          />
          {errors.email ? (
            <Text style={styles.errorText}>{errors.email}</Text>
          ) : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>
          <View
            style={[
              styles.passwordContainer,
              errors.password ? styles.inputError : null,
            ]}
          >
            <TextInput
              placeholder={"Enter your password"}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
              style={styles.passwordInput}
            />
            <TouchableOpacity
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              style={styles.eyeIcon}
            >
              <Image
                source={{
                  uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/GKFzOSqxbW/yiz58cxz_expires_30_days.png",
                }}
                resizeMode={"stretch"}
                style={styles.iconSmall}
              />
            </TouchableOpacity>
          </View>
          {errors.password ? (
            <Text style={styles.errorText}>{errors.password}</Text>
          ) : null}
          <View style={{ marginTop: 8 }}>
            <View
              style={{
                width: "100%",
                height: 6,
                borderRadius: 4,
                backgroundColor: "#E5E7EB",
                overflow: "hidden",
              }}
            >
              <View
                style={[
                  {
                    height: "100%",
                    borderRadius: 4,
                    width: `${Math.max(20, (passwordStrength.score / 5) * 100)}%`,
                    backgroundColor: passwordStrength.color,
                  },
                ]}
              />
            </View>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                marginTop: 6,
                color: passwordStrength.color,
              }}
            >
              Strength: {passwordStrength.label}
            </Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <View
            style={[
              styles.passwordContainer,
              errors.confirmPassword ? styles.inputError : null,
            ]}
          >
            <TextInput
              placeholder={"Confirm your password"}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!isPasswordVisible}
              style={styles.passwordInput}
            />
          </View>
          {errors.confirmPassword ? (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          ) : null}
        </View>

        <View style={styles.policyContainer}>
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => {
              setAcceptedPolicies((prev) => !prev);
              if (errors.policies) {
                setErrors((prev) => ({ ...prev, policies: "" }));
              }
            }}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.checkbox,
                acceptedPolicies ? styles.checkboxChecked : null,
              ]}
            >
              {acceptedPolicies ? <Text style={styles.checkboxTick}>✓</Text> : null}
            </View>
            <Text style={styles.policyText}>
              I agree to the{" "}
              <Text
                style={styles.policyLink}
                onPress={() => openPolicyLink(TERMS_URL)}
              >
                Terms of Service
              </Text>{" "}
              and{" "}
              <Text
                style={styles.policyLink}
                onPress={() => openPolicyLink(PRIVACY_URL)}
              >
                Privacy Policy
              </Text>
            </Text>
          </TouchableOpacity>
          {errors.policies ? (
            <Text style={styles.errorText}>{errors.policies}</Text>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={handleRegister}
          disabled={isLoading}
          style={[
            styles.button,
            { backgroundColor: isLoading ? "#A0A0A0" : "#199A8E" },
          ]}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Register</Text>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.linkText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
export default RegisterScreen;