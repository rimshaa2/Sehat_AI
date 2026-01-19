import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { getAuth, updateProfile } from "@react-native-firebase/auth";
import { getFirestore, doc, updateDoc } from "@react-native-firebase/firestore";
import styles from "./styles/EditProfileStyles";

export default ({ navigation, route }: any) => {
  // Get existing data passed from ProfileScreen
  const { userData } = route.params || {};

  const [fullName, setFullName] = useState(userData?.fullName || "");
  const [phone, setPhone] = useState(userData?.phone || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    Keyboard.dismiss();
    
    if (fullName.trim().length < 2) {
      Alert.alert("Error", "Name must be at least 2 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const auth = getAuth();
      const db = getFirestore();
      const user = auth.currentUser;

      if (user) {
        // 1. Update Firebase Auth Profile (DisplayName)
        await updateProfile(user, {
          displayName: fullName,
        });

        // 2. Update Firestore User Document
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
          fullName: fullName,
          phone: phone,
        });

        Alert.alert("Success", "Profile updated successfully!", [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error("Update Error:", error);
      Alert.alert("Error", "Could not update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft color="#1C2A3A" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Name Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your name"
            />
          </View>

          {/* Email Field (Read Only) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={userData?.email}
              editable={false} 
            />
          </View>

          {/* Phone Field */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Save Changes</Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};