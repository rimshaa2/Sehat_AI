import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { getAuth, sendPasswordResetEmail } from "@react-native-firebase/auth";

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert("Email required", "Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(getAuth(), email.trim());
      Alert.alert(
        "Reset email sent",
        "Check your inbox for password reset instructions.",
      );
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(
        "Reset failed",
        error?.message || "Could not send reset email. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF", padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "800", color: "#1C2A3A" }}>
        Forgot Password
      </Text>
      <Text style={{ marginTop: 8, color: "#6B7280" }}>
        Enter your account email to receive a reset link.
      </Text>

      <TextInput
        placeholder="Email address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={{
          marginTop: 20,
          borderWidth: 1,
          borderColor: "#E5E7EB",
          borderRadius: 12,
          paddingHorizontal: 12,
          paddingVertical: 12,
          color: "#111827",
        }}
      />

      <TouchableOpacity
        onPress={handleReset}
        disabled={loading}
        style={{
          marginTop: 16,
          backgroundColor: "#199A8E",
          borderRadius: 12,
          alignItems: "center",
          paddingVertical: 12,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={{ color: "#FFFFFF", fontWeight: "700" }}>Send Reset Link</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}
