import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import {
  Home,
  User as UserIcon,
  CalendarDays,
  Settings,
} from "lucide-react-native";

type Props = {
  navigation: any;
};

const APPOINTMENT_SCREENS = [
  "Appointments",
  "BookAppointment",
  "DoctorList",
  "DoctorDetails",
  "Payment",
  "PaymentMethod",
  "BookingSuccess",
  "AppointmentDetails",
  "RescheduleAppointment",
];

export default function BottomNavBar({ navigation }: Props) {
  // In a flat Stack navigator, useRoute() correctly gives the current screen
  const route = useRoute<any>();
  const current = route?.name || "";

  const isActive = (tabName: string) => {
    if (tabName === "Appointments") {
      return APPOINTMENT_SCREENS.includes(current);
    }
    return current === tabName;
  };

  const iconColor = (tabName: string) =>
    isActive(tabName) ? "#1C2A3A" : "#FFFFFF";

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={styles.navItem}
        activeOpacity={0.7}
        onPress={() => {
          if (current !== "Home") navigation.navigate("Home");
        }}
      >
        <Home color={iconColor("Home")} size={24} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        activeOpacity={0.7}
        onPress={() => {
          if (current !== "Appointments") navigation.navigate("Appointments");
        }}
      >
        <CalendarDays color={iconColor("Appointments")} size={24} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        activeOpacity={0.7}
        onPress={() => {
          if (current !== "Profile") navigation.navigate("Profile");
        }}
      >
        <UserIcon color={iconColor("Profile")} size={24} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.navItem}
        activeOpacity={0.7}
        onPress={() => {
          if (current !== "Settings") navigation.navigate("Settings");
        }}
      >
        <Settings color={iconColor("Settings")} size={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: "absolute",
    bottom: 30,
    left: 24,
    right: 24,
    height: 60,
    backgroundColor: "#199A8E",
    borderRadius: 30,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    shadowColor: "#199A8E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  navItem: {
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});