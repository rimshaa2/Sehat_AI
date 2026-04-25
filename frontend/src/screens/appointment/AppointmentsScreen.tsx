import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getAuth } from "@react-native-firebase/auth";
import { CalendarDays, ChevronRight } from "lucide-react-native";
import { getMyAppointments, getUserProfile } from "../../services/api";
import BottomNavBar from "../../components/BottomNavBar";

export default function AppointmentsScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);

  useFocusEffect(
    () => {
      let active = true;
      const run = async () => {
        setLoading(true);
        try {
          const auth = getAuth();
          if (!auth.currentUser) return;
          const profile = await getUserProfile(auth.currentUser.uid);
          const list = await getMyAppointments(profile.id, "patient");
          if (!active) return;
          setAppointments(Array.isArray(list) ? list : []);
        } catch (e) {
          if (!active) return;
          setAppointments([]);
        } finally {
          if (active) setLoading(false);
        }
      };
      run();
      return () => {
        active = false;
      };
    },
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 }}>
        <Text style={{ fontSize: 20, fontWeight: "800", color: "#1C2A3A" }}>
          Appointments
        </Text>
        <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>
          Your upcoming and past consultations
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#199A8E" />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {appointments.length === 0 ? (
            <View
              style={{
                backgroundColor: "#F3F4F6",
                borderRadius: 16,
                padding: 16,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#111827" }}>
                No appointments found
              </Text>
              <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 6 }}>
                Book a doctor to see your schedule here.
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("BookAppointment")}
                style={{
                  marginTop: 12,
                  backgroundColor: "#199A8E",
                  borderRadius: 12,
                  paddingVertical: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>
                  Book Appointment
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            appointments.map((apt) => (
              <TouchableOpacity
                key={apt.id}
                onPress={() =>
                  navigation.navigate("AppointmentDetails", { appointment: apt })
                }
                style={{
                  backgroundColor: "#FFFFFF",
                  borderRadius: 16,
                  padding: 14,
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  marginBottom: 10,
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      backgroundColor: "#E6FFFA",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CalendarDays size={20} color="#199A8E" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: "800", color: "#111827" }}>
                      {apt?.doctor?.user?.fullName || "Doctor"}
                    </Text>
                    <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                      {apt.appointmentDate} • {apt.timeSlot}
                    </Text>
                  </View>
                  <ChevronRight size={18} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}

      <BottomNavBar navigation={navigation} />
    </SafeAreaView>
  );
}

