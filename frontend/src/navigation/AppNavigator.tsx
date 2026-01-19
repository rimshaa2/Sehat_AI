import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "../screens/auth/WelcomeScreen";
import { AuthStackParamList } from "./types";
import PhoneNumberScreen from "../screens/auth/PhoneNumberScreen";
import OtpScreen from "../screens/auth/OtpScreen";
import RegisterScreen from "../screens/auth/RegisterScreen"
import HomeScreen from "../screens/dashboard/HomeScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import BookAppointmentScreen from "../screens/appointment/BookAppointmentScreen";
import DoctorListScreen from "../screens/appointment/DoctorListScreen";
import DoctorDetailsScreen from "../screens/appointment/DoctorDetailsScreen";
import PaymentScreen from "../screens/appointment/PaymentScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";
import BookingSuccessScreen from "../screens/appointment/BookingSuccessScreen";
import AiAssistantScreen from "../screens/chatbot/AiAssistantScreen";
import AppointmentDetailsScreen from "../screens/appointment/AppointmentDetailsScreen";
import RescheduleAppointmentScreen from "../screens/appointment/RescheduleAppointmentScreen";
import MedicalRecordsScreen from "../screens/home/MedicalRecordsScreen";

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="PhoneNumber" component={PhoneNumberScreen} />
        <Stack.Screen name="Otp" component={OtpScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="BookAppointment" component={BookAppointmentScreen} />
        <Stack.Screen name="DoctorList" component={DoctorListScreen} />
        <Stack.Screen name="DoctorDetails" component={DoctorDetailsScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="BookingSuccess" component={BookingSuccessScreen} />
        <Stack.Screen name="AiAssistant" component={AiAssistantScreen} />
        <Stack.Screen name="AppointmentDetails" component={AppointmentDetailsScreen} />
        <Stack.Screen name="RescheduleAppointment" component={RescheduleAppointmentScreen} />
        <Stack.Screen name="MedicalRecords" component={MedicalRecordsScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
