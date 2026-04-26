import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import styles from "./styles/OtpScreenStyles";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/types";
import auth from "@react-native-firebase/auth";

// 🟢 1. IMPORT YOUR API SERVICE
import { syncUser } from "../../services/api";

type Props = NativeStackScreenProps<AuthStackParamList, "Otp">;

const OtpScreen: React.FC<Props> = ({ navigation, route }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const { confirmation } = route.params;

  // Handle Android Auto-Verification
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(async (user) => {
      if (user) {
        // If Android verifies SMS automatically, we must still sync!
        console.log("🤖 Auto-verified by Android!");
        try {
          // Passing 'true' forces a refresh and suppresses the warning
          const idToken = await user.getIdToken(true);
          await syncUser(idToken);
          navigation.replace("Home");
        } catch (e) {
          console.error("Auto-verify sync failed", e);
        }
      }
    });
    return subscriber;
  }, []);

  const confirmOtp = async () => {
    if (otp.length !== 6) return;

    setLoading(true);
    try {
      // 2. Confirm OTP with Firebase
      const userCredential = await confirmation.confirm(otp);

      if (!userCredential) {
        Alert.alert("Error", "Verification failed. Please try again.");
        setLoading(false);
        return;
      }

      const user = userCredential.user;

      if (user) {
        console.log("✅ Phone Verified. Syncing to MySQL...");

        // 3. Get Token & Sync
        const idToken = await user.getIdToken();
        const dbUser = await syncUser(idToken);

        console.log("✅ MySQL Sync Complete:", dbUser);

        setLoading(false);

        // 4. Navigate to Home
        // We go to Home because the user is now logged in.
        // If you need to collect Name/Email, create a separate "CompleteProfile" screen.
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      }
    } catch (err: any) {
      setLoading(false);
      console.log("Error verifying OTP:", err);

      if (err.code === "auth/invalid-verification-code") {
        Alert.alert("Error", "Invalid code. Please check your SMS.");
      } else if (err.code === "auth/session-expired") {
        Alert.alert("Error", "Code expired. Please request a new one.");
      } else if (err.message && err.message.includes("Network Error")) {
        Alert.alert("Error", "Network Error. Cannot connect to server.");
      } else if (err.response && err.response.data && err.response.data.error) {
        Alert.alert(
          "Error",
          `${err.response.data.error}\nDetails: ${err.response.data.details || "None"}`
        );
      } else {
        const errorMsg = err.message || "Verification failed. Please try again.";
        Alert.alert("Error", errorMsg);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.wrapper}>
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>
          A verification code has been sent to your phone number.
        </Text>

        <TextInput
          style={styles.otpInput}
          placeholder="Enter 6-digit code"
          keyboardType="number-pad"
          maxLength={6}
          value={otp}
          onChangeText={setOtp}
        />

        <TouchableOpacity
          style={[
            styles.verifyBtn,
            { backgroundColor: otp.length === 6 ? "#199A8E" : "#E5E7EB" },
          ]}
          onPress={confirmOtp}
          disabled={otp.length !== 6 || loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text
              style={[
                styles.verifyText,
                { color: otp.length === 6 ? "#FFFFFF" : "#9CA3AF" },
              ]}
            >
              Verify OTP
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.resendText}>Edit Phone Number</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default OtpScreen;
