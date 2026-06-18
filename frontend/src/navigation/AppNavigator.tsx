// frontend/src/navigation/AppNavigator.tsx
// CHANGE: Imported LiveChatScreen and added <Stack.Screen name="LiveChat" />

import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AuthStackParamList } from "./types";

// ── Auth ──────────────────────────────────────────────────────────────────────
import WelcomeScreen from "../screens/auth/WelcomeScreen";
import PhoneNumberScreen from "../screens/auth/PhoneNumberScreen";
import OtpScreen from "../screens/auth/OtpScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";

// ── Dashboard ─────────────────────────────────────────────────────────────────
import HomeScreen from "../screens/dashboard/HomeScreen";
import AppointmentsScreen from "../screens/appointment/AppointmentsScreen";

// ── Mental Health — Hub & Utility ─────────────────────────────────────────────
import MentalHealthScreen from "../screens/mental/MentalHealthScreen";
import DailyMomentScreen from "../screens/mental/DailyMomentScreen";
import CrisisHelpScreen from "../screens/mental/CrisisHelpScreen";

// ── Mental Health — Breathing ─────────────────────────────────────────────────
import BreathingScreen from "../screens/mental/BreathingScreen";
import Breathing478Screen from "../screens/mental/Breathing478screen";
import BoxBreathingScreen from "../screens/mental/Boxbreathingscreen";
import CalmingBreathScreen from "../screens/mental/Calmingbreathscreen";

// ── Mental Health — Core Tools ────────────────────────────────────────────────
import MeditationScreen from "../screens/mental/MeditationScreen";
import JournalScreen from "../screens/mental/Journalscreen";
import TalkScreen from "../screens/mental/TalkScreen";

// ── Mental Health — Track & Assess ───────────────────────────────────────────
import MoodTrackerScreen from "../screens/mental/Moodtrackerscreen";
import SleepTrackerScreen from "../screens/mental/Sleeptrackerscreen";
import AnxietyQuizScreen from "../screens/mental/Anxietyquizscreen";
import AffirmationsScreen from "../screens/mental/Affirmationsscreen";

// ── Appointments ──────────────────────────────────────────────────────────────
import BookAppointmentScreen from "../screens/appointment/BookAppointmentScreen";
import DoctorListScreen from "../screens/appointment/DoctorListScreen";
import DoctorDetailsScreen from "../screens/appointment/DoctorDetailsScreen";
import PaymentScreen from "../screens/appointment/PaymentScreen";
import PaymentMethodScreen from "../screens/appointment/PaymentMethodScreen";
import BookingSuccessScreen from "../screens/appointment/BookingSuccessScreen";
import AppointmentDetailsScreen from "../screens/appointment/AppointmentDetailsScreen";
import RescheduleAppointmentScreen from "../screens/appointment/RescheduleAppointmentScreen";
// ← NEW
import LiveChatScreen from "../screens/appointment/LiveChatScreen";

// ── Profile ───────────────────────────────────────────────────────────────────
import ProfileScreen from "../screens/profile/ProfileScreen";
import EditProfileScreen from "../screens/profile/EditProfileScreen";

// ── Medicine Tracker ──────────────────────────────────────────────────────────
import MedicineDashboardScreen from "../screens/log medicine/Medicinedashboardscreen";
import AddMedicineScreen from "../screens/log medicine/Addmedicinescreen";
import MedicineDetailScreen from "../screens/log medicine/MedicineDetailScreen";
import RefillManagerScreen from "../screens/log medicine/RefillManagerScreen";

// ── Other ─────────────────────────────────────────────────────────────────────
import AiAssistantScreen from "../screens/chatbot/AiAssistantScreen";
import MedicalRecordsScreen from "../screens/home/MedicalRecordsScreen";
import MedicalRecordDetailScreen from "../screens/home/MedicalRecordsDetailScreen";
import AddMedicalRecordScreen from "../screens/home/AddMedicalRecordScreen";
import HealthArticlesScreen from "../screens/home/HealthArticlesScreen";
import EmergencyScreen from "../screens/emergency/EmergencyScreen";
import SettingsScreen from "../screens/settings/SettingsScreen";
import CommunityScreen from "../screens/community/CommunityScreen";
import NotificationsScreen from "../screens/notifications/NotificationsScreen";

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>

        {/* ── Auth ── */}
        <Stack.Screen name="Welcome"        component={WelcomeScreen} />
        <Stack.Screen name="PhoneNumber"    component={PhoneNumberScreen} />
        <Stack.Screen name="Otp"            component={OtpScreen} />
        <Stack.Screen name="Register"       component={RegisterScreen} />
        <Stack.Screen name="Login"          component={LoginScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

        {/* ── Dashboard ── */}
        <Stack.Screen name="Home"           component={HomeScreen} />
        <Stack.Screen name="Appointments"   component={AppointmentsScreen} />
        <Stack.Screen name="Settings"       component={SettingsScreen} />

        {/* ── Mental Health — Hub ── */}
        <Stack.Screen name="MentalHealth"   component={MentalHealthScreen} />
        <Stack.Screen name="DailyMoment"    component={DailyMomentScreen} />
        <Stack.Screen name="CrisisHelp"     component={CrisisHelpScreen} />

        {/* ── Mental Health — Breathing ── */}
        <Stack.Screen name="Breathing"      component={BreathingScreen} />
        <Stack.Screen name="Breathing478"   component={Breathing478Screen} />
        <Stack.Screen name="BoxBreathing"   component={BoxBreathingScreen} />
        <Stack.Screen name="CalmingBreath"  component={CalmingBreathScreen} />

        {/* ── Mental Health — Core Tools ── */}
        <Stack.Screen name="Meditation"     component={MeditationScreen} />
        <Stack.Screen name="Journal"        component={JournalScreen} />
        <Stack.Screen name="Talk"           component={TalkScreen} />

        {/* ── Mental Health — Track & Assess ── */}
        <Stack.Screen name="MoodTracker"    component={MoodTrackerScreen} />
        <Stack.Screen name="SleepTracker"   component={SleepTrackerScreen} />
        <Stack.Screen name="AnxietyQuiz"    component={AnxietyQuizScreen} />
        <Stack.Screen name="Affirmations"   component={AffirmationsScreen} />

        {/* ── Appointments ── */}
        <Stack.Screen name="BookAppointment"       component={BookAppointmentScreen} />
        <Stack.Screen name="DoctorList"            component={DoctorListScreen} />
        <Stack.Screen name="DoctorDetails"         component={DoctorDetailsScreen} />
        <Stack.Screen name="Payment"               component={PaymentScreen} />
        <Stack.Screen name="PaymentMethod"         component={PaymentMethodScreen} />
        <Stack.Screen name="BookingSuccess"        component={BookingSuccessScreen} />
        <Stack.Screen name="AppointmentDetails"    component={AppointmentDetailsScreen} />
        <Stack.Screen name="RescheduleAppointment" component={RescheduleAppointmentScreen} />
        {/* ← NEW */}
        <Stack.Screen name="LiveChat"              component={LiveChatScreen} />

        {/* ── Profile ── */}
        <Stack.Screen name="Profile"     component={ProfileScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />

        {/* ── Medicine Tracker ── */}
        <Stack.Screen name="MedicineDashboard" component={MedicineDashboardScreen} />
        <Stack.Screen name="AddMedicine"       component={AddMedicineScreen} />
        <Stack.Screen name="MedicineDetail"    component={MedicineDetailScreen} />
        <Stack.Screen name="RefillManager"     component={RefillManagerScreen} />

        {/* ── Other ── */}
        <Stack.Screen name="AiAssistant"        component={AiAssistantScreen} />
        <Stack.Screen name="MedicalRecords"     component={MedicalRecordsScreen} />
        <Stack.Screen name="MedicalRecordDetail" component={MedicalRecordDetailScreen} />
        <Stack.Screen name="AddMedicalRecord"   component={AddMedicalRecordScreen} />
        <Stack.Screen name="HealthArticles"     component={HealthArticlesScreen} />
        <Stack.Screen name="Community"          component={CommunityScreen} />
        <Stack.Screen name="Emergency"          component={EmergencyScreen} />
        <Stack.Screen name="Notifications"      component={NotificationsScreen} />

      </Stack.Navigator>
  );
};

export default AppNavigator;