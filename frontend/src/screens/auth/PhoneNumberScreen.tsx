import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  StyleSheet, // Added StyleSheet
} from "react-native";
import CountryPicker, {
  Country,
  CountryCode,
} from "react-native-country-picker-modal";
import auth from "@react-native-firebase/auth";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { AuthStackParamList } from "../../navigation/types";

// If you have global styles, import them. 
// For this fix, I will define the critical styles locally to ensure it works.
import styles from "./styles/PhoneNumberStyles"; 

type Props = NativeStackScreenProps<AuthStackParamList, "PhoneNumber">;

const PhoneNumberScreen: React.FC<Props> = ({ navigation }) => {
  const [countryCode, setCountryCode] = useState<CountryCode>("US");
  const [callingCode, setCallingCode] = useState<string>("1");
  const [phone, setPhone] = useState("");
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSelect = (selectedCountry: Country) => {
    setCountryCode(selectedCountry.cca2);
    if (selectedCountry.callingCode && selectedCountry.callingCode.length > 0) {
      setCallingCode(selectedCountry.callingCode[0]);
    }
    // Flag updates automatically based on countryCode prop
    setShowCountryPicker(false);
  };

  const sendOtp = async () => {
    if (!phone) {
      Alert.alert("Error", "Please enter a phone number");
      return;
    }

    setLoading(true);

    try {
      const fullPhoneNumber = `+${callingCode}${phone}`;
      const confirmation = await auth().signInWithPhoneNumber(fullPhoneNumber);
      setLoading(false);
      navigation.navigate("Otp", { confirmation });
    } catch (err: any) {
      setLoading(false);
      console.log("Error sending OTP:", err);
      if (err.code === 'auth/invalid-phone-number') {
        Alert.alert('Error', 'The phone number is invalid.');
      } else if (err.code === 'auth/quota-exceeded') {
        Alert.alert('Error', 'SMS quota exceeded. Try again later.');
      } else {
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scroll}>
        <View style={styles.titleWrapper}>
          <Text style={styles.title}>Register</Text>
          <Text style={styles.subtitle}>
            Please enter your phone number to continue
          </Text>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Phone Number</Text>

          <View style={styles.phoneInputContainer}>
            {/* Country Picker Section */}
            <View style={styles.countryPickerWrapper}>
              <CountryPicker
                withFilter
                withFlag
                withCallingCode={false} // We display calling code manually next to it
                withEmoji
                countryCode={countryCode}
                onSelect={onSelect}
                visible={showCountryPicker}
                onClose={() => setShowCountryPicker(false)}
                containerButtonStyle={styles.pickerButton} // Fixes alignment
                theme={{
                  onBackgroundTextColor: 'black',
                  fontSize: 24, // Ensures flag is large enough
                }}
              />
              <Text style={styles.countryCodeText}>{countryCode}</Text>
            </View>

            {/* Vertical Divider */}
            <View style={styles.divider} />

            {/* Calling Code */}
            <Text style={styles.callingCodeText}>+{callingCode}</Text>

            {/* Phone Input */}
            <TextInput
              placeholder="812-3123-3123"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              style={styles.phoneInputText} // Applied specific font size here
              placeholderTextColor="#A1A8B0"
            />
          </View>
        </View>

        <TouchableOpacity
          disabled={loading}
          style={[
            styles.continueBtn,
            { backgroundColor: phone.length > 0 ? "#199A8E" : "#F3F4F6" },
          ]}
          onPress={sendOtp}
        >
          {loading ? (
             <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text
              style={[
                styles.continueText,
                { color: phone.length > 0 ? "#FFFFFF" : "#D4D4D8" },
              ]}
            >
              Continue
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PhoneNumberScreen;
