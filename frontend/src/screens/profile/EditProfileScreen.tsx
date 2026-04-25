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
  ScrollView,
} from "react-native";
import { ChevronLeft, User, Mail, Phone } from "lucide-react-native";
import { getAuth } from "@react-native-firebase/auth";
import { updateUserProfile } from "../../services/api";
import styles from "./styles/EditProfileStyles";

export default ({ navigation, route }: any) => {
  const { userData } = route.params || {};

  const [fullName, setFullName] = useState(userData?.fullName || "");
  const [phone, setPhone] = useState(userData?.phoneNumber || "");
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
      const user = auth.currentUser;

      if (user) {
        // Save to Railway backend
        await updateUserProfile(user.uid, {
          fullName: fullName.trim(),
          phoneNumber: phone.trim(),
        });

        Alert.alert("Success", "Profile updated successfully!", [
          { text: "OK", onPress: () => navigation.goBack() },
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

        <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
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
                placeholderTextColor="#9CA3AF"
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
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, isLoading && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};