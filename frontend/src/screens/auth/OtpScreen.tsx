import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator
} from "react-native";
import styles from "./styles/OtpScreenStyles";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/types";

// 1. Import Native Auth (only for types if needed, logic is handled via the route param)
import auth from "@react-native-firebase/auth";

type Props = NativeStackScreenProps<AuthStackParamList, "Otp">;

const OtpScreen: React.FC<Props> = ({ navigation, route }) => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  
  // 2. Destructure the confirmation object passed from PhoneNumberScreen
  const { confirmation } = route.params;

  // Optional: Handle auto-verification (Android often verifies SMS automatically)
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(user => {
        if (user) {
            // If the OS auto-verified the code, user is already logged in
            // navigation.replace("Home"); 
            console.log("Auto-verified!");
        }
    });
    return subscriber; // unsubscribe on unmount
  }, []);

  const confirmOtp = async () => {
    if (otp.length !== 6) return;

    setLoading(true);
    try {
      // 3. Use the native confirm method
      // This automatically signs the user in if successful
      await confirmation.confirm(otp);
      
      setLoading(false);
      
      navigation.replace("Register");

    } catch (err: any) {
      setLoading(false);
      console.log("Error verifying OTP:", err);
      
      if (err.code === 'auth/invalid-verification-code') {
         Alert.alert('Error', 'Invalid code. Please check your SMS.');
      } else {
         Alert.alert('Error', 'Verification failed.');
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