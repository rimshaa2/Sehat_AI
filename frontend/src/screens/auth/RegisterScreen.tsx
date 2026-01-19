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
  StyleSheet,
} from "react-native";
import auth from "@react-native-firebase/auth";
import styles from "./styles/RegisterScreenStyles";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/types";
import firestore from "@react-native-firebase/firestore";
import { Keyboard } from "react-native";
import { serverTimestamp } from "@react-native-firebase/firestore";

// Simple regex for email validation
const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

type Props = NativeStackScreenProps<AuthStackParamList, "Register">;
const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validateForm = () => {
    let valid = true;
    let newErrors = { name: "", email: "", password: "", confirmPassword: "" };

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

    setErrors(newErrors);
    return valid;
  };

  const handleRegister = async () => {
    Keyboard.dismiss();
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // 2. Create Authentication User
      const userCredential = await auth().createUserWithEmailAndPassword(
        email.trim(),
        password
      );

      const user = userCredential.user;

      // 3. Save extra data to Firestore
      // We use .set() to create a document with the specific User ID (uid)
      await firestore().collection("users").doc(user.uid).set({
        fullName: name,
        email: email.trim(),
        createdAt: serverTimestamp(), // Consistent server time
        role: "user", 
        profileImage: null,
      });

      // 4. Update Auth Profile 
     await auth().currentUser?.updateProfile({ displayName: name });


      Alert.alert("Success", "Account created successfully!");

      // Navigate to Home/App
      navigation.navigate("Home");
    } catch (error: any) {
      let errorMessage = "Something went wrong";
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "That email address is already in use!";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak!";
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
