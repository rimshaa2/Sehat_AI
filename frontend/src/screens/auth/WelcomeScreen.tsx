import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";


import styles from "./styles/WelcomeScreenStyle";
import { IMAGES } from "../../constants/Images";
import { syncUser } from "../../services/api"; // 🟢 ADDED: API Service

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Welcome">;

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  const withTimeout = async <T,>(promise: Promise<T>, ms = 20000): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out. Please try again.")), ms),
      ),
    ]);
  };

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: "839845740526-efh4bq1oaunaboe80q6mk01av3oq5rs2.apps.googleusercontent.com", 
    });
  }, []);

  const onGoogleButtonPress = async () => {
    setLoading(true);
    try {
      // 1. Google Sign-In (Get Google Token)
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const signInResult = await GoogleSignin.signIn();
      const googleIdToken = signInResult.data?.idToken;

      if (!googleIdToken) throw new Error('No ID token found');

      // 2. Firebase Sign-In (Exchange Google Token for Firebase User)
      const googleCredential = auth.GoogleAuthProvider.credential(googleIdToken);
      const userCredential = await withTimeout(
        auth().signInWithCredential(googleCredential),
      );
      
      // 3. 🟢 SYNC WITH MYSQL BACKEND
      console.log("✅ Google Auth Success. Syncing with MySQL...");
      
      // We need the FIREBASE token (not the Google one) to send to your backend
      const firebaseToken = await withTimeout(userCredential.user.getIdToken());
      
      const dbResponse = await withTimeout(syncUser(firebaseToken));
      console.log("✅ Backend Sync Complete:", dbResponse);

      // 4. Navigate to Home
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });

    } catch (error: any) {
      if (error.code === 'SIGN_IN_CANCELLED') {
        console.log("User cancelled login");
      } else {
        console.error("Google Sign In Error:", error);
        
        // Handle Network Errors gracefully
        if (error.message && error.message.includes("Network Error")) {
           Alert.alert("Connection Failed", "Could not reach the server. Please check your internet.");
        } else if (error.message && error.message.includes("timed out")) {
           Alert.alert("Login Timeout", "Google login took too long. Please retry.");
        } else if (
          error.message &&
          error.message.includes("EXPO_PUBLIC_API_URL")
        ) {
          Alert.alert("Backend URL Missing", error.message);
        } else {
           Alert.alert("Error", error.message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll}>
        <ImageBackground
          source={IMAGES.WELCOME_BG}
          resizeMode="stretch"
          imageStyle={styles.headerImage}
          style={styles.headerWrapper}
        >
          <View style={styles.statusBarRow} />
        </ImageBackground>

        <View style={styles.titleWrapper}>
          <Text style={styles.appTitle}>Sehat AI</Text>
          <Text style={styles.subtitle}>
            Begin your journey to better health!
          </Text>
        </View>

        <View style={styles.buttonWrapper}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate("PhoneNumber")}
          >
            <Text style={styles.primaryButtonText}>
              Continue With Phone Number
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.googleButton} 
            onPress={onGoogleButtonPress}
            disabled={loading}
          >
            {loading ? (
               <ActivityIndicator size="small" color="#000" />
            ) : (
               <>
                <Image source={IMAGES.GOOGLE_ICON} style={styles.socialIcon} />
                <Text style={styles.googleText}>Sign in with Google</Text>
               </>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.appleButton}>
            <Image source={IMAGES.APPLE_ICON} style={styles.socialIcon} />
            <Text style={styles.appleText}>Sign in with Apple</Text>
          </TouchableOpacity>

          <Text
            style={styles.loginText}
            onPress={() => navigation.navigate("Login")}
          >
            Already have an account? Sign In
          </Text>
        </View>

        <View style={styles.termsWrapper}>
          <Text style={styles.termsText}>
            By signing up or logging in, I accept the app’s {"\n"}Terms of
            Service and Privacy Policy
          </Text>
        </View>

        <View style={styles.bottomBarWrapper}>
          <View style={styles.bottomBar} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WelcomeScreen;