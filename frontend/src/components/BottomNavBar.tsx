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

const isRouteActive = (routeName: string, current: string) => {
  if (routeName === current) return true;
  // Treat nested stack screens as "Appointments"
  if (
    routeName === "Appointments" &&
    [
      "BookAppointment",
      "DoctorList",
      "DoctorDetails",
      "Payment",
      "BookingSuccess",
      "AppointmentDetails",
      "RescheduleAppointment",
    ].includes(current)
  ) {
    return true;
  }
  return false;
};

export default function BottomNavBar({ navigation }: Props) {
  const route = useRoute<any>();
  const current = route?.name || "";

  const iconColor = (name: string) =>
    isRouteActive(name, current) ? "#1C2A3A" : "#FFFFFF";

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity onPress={() => navigation.navigate("Home")}>
        <Home color={iconColor("Home")} size={24} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Appointments")}>
        <CalendarDays color={iconColor("Appointments")} size={24} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
        <UserIcon color={iconColor("Profile")} size={24} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
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
});

