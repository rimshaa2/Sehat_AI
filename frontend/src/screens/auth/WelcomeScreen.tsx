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
import firestore from "@react-native-firebase/firestore";

import styles from "./styles/WelcomeScreenStyle";
import { IMAGES } from "../../constants/Images";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { AuthStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<AuthStackParamList, "Welcome">;

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  // 1. Configure Google Sign-In (Run once on mount)
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: "839845740526-efh4bq1oaunaboe80q6mk01av3oq5rs2.apps.googleusercontent.com", 
    });
  }, []);

  const onGoogleButtonPress = async () => {
    setLoading(true);
    try {
      // 1. Check if device supports Google Play
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // 2. Get the user's ID token
      const signInResult = await GoogleSignin.signIn();
      
      // FIX: Access token directly from 'data' property
      // The library guarantees 'data' exists on success in v13+
      const idToken = signInResult.data?.idToken;

      if (!idToken) {
        throw new Error('No ID token found');
      }

      // 3. Create a Google credential with the token
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // 4. Sign-in the user with the credential
      const userCredential = await auth().signInWithCredential(googleCredential);
      const user = userCredential.user;

      // 5. SAVE TO FIRESTORE
      const userDocRef = firestore().collection("users").doc(user.uid);
      const userDoc = await userDocRef.get();

      if (!userDoc.exists) {
        await userDocRef.set({
          fullName: user.displayName || "Google User",
          email: user.email,
          profileImage: user.photoURL,
          createdAt: firestore.FieldValue.serverTimestamp(),
          role: "user",
          phone: user.phoneNumber || "",
        });
      }

      // 6. Navigate to Home
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });

    } catch (error: any) {
      if (error.code === 'SIGN_IN_CANCELLED') {
        console.log("User cancelled login");
      } else {
        console.error(error);
        Alert.alert("Google Sign-In Error", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll}>
        {/* Background Header */}
        <ImageBackground
          source={IMAGES.WELCOME_BG}
          resizeMode="stretch"
          imageStyle={styles.headerImage}
          style={styles.headerWrapper}
        >
          <View style={styles.statusBarRow}>
            {/* You can remove this row if using SafeAreaView correctly on styles */}
          </View>
        </ImageBackground>

        {/* Title */}
        <View style={styles.titleWrapper}>
          <Text style={styles.appTitle}>Sehat AI</Text>
          <Text style={styles.subtitle}>
            Begin your journey to better health!
          </Text>
        </View>

        {/* Buttons */}
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

        {/* Terms */}
        <View style={styles.termsWrapper}>
          <Text style={styles.termsText}>
            By signing up or logging in, I accept the app’s {"\n"}Terms of
            Service and Privacy Policy
          </Text>
        </View>

        {/* Bottom bar */}
        <View style={styles.bottomBarWrapper}>
          <View style={styles.bottomBar} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default WelcomeScreen;