// frontend/src/screens/appointment/AppointmentDetailsScreen.tsx
// CHANGE: Added "Chat with Doctor" button that navigates to LiveChatScreen.
// Only shown when appointment status is "scheduled" or "confirmed".

import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { ChevronLeft, MoreVertical, MessageCircle } from "lucide-react-native";
import { cancelAppointment } from "../../services/api";
import styles from "./styles/AppointmentDetailStyles";

export default ({ navigation, route }: any) => {
  const { appointment } = route.params || {};
  const [loading, setLoading] = useState(false);

  // ── Cancel ──────────────────────────────────────────────────────────────────
  const handleCancelAppointment = () => {
    Alert.alert(
      "Cancel Appointment",
      "Are you sure you want to cancel this appointment? This action cannot be undone.",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await cancelAppointment(appointment.id);
              Alert.alert("Cancelled", "Appointment has been cancelled successfully.");
              navigation.goBack();
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "Could not cancel appointment.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // ── Reschedule ───────────────────────────────────────────────────────────────
  const handleReschedule = () => {
    navigation.navigate("RescheduleAppointment", { appointment });
  };

  // ── Open Live Chat (Mockup M13) ──────────────────────────────────────────────
  const handleOpenChat = () => {
    navigation.navigate("LiveChat", {
      appointmentId: appointment.id,
      doctorName: appointment.doctorName || "Doctor",
      doctorSpecialty: appointment.doctorSpecialty || "Specialist",
      doctorImage: appointment.doctorImage,
    });
  };

  if (!appointment) return null;

  // Chat is only available for active appointments
  const isChatAvailable =
    appointment.status === "scheduled" || appointment.status === "confirmed";

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ChevronLeft color="#1C2A3A" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appointment Details</Text>
        <TouchableOpacity style={styles.iconButton}>
          <MoreVertical color="#1C2A3A" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Status Badge */}
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{appointment.status || "Upcoming"}</Text>
        </View>

        {/* Doctor Info */}
        <View style={styles.doctorCard}>
          <Image
            source={{ uri: appointment.doctorImage || "https://via.placeholder.com/150" }}
            style={styles.doctorImage}
          />
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{appointment.doctorName}</Text>
            <Text style={styles.specialty}>{appointment.doctorSpecialty}</Text>
          </View>
        </View>

        {/* Details */}
        <Text style={styles.sectionTitle}>Visit Information</Text>

        <View style={styles.detailRow}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{appointment.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Time</Text>
          <Text style={styles.value}>{appointment.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Reason</Text>
          <Text style={styles.value} numberOfLines={2}>{appointment.reason}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Total Cost</Text>
          <Text style={[styles.value, { color: "#199A8E" }]}>
            Rs. {appointment.totalAmount}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#199A8E" />
          ) : (
            <>
              {/* ── Chat with Doctor — NEW ── */}
              {isChatAvailable && (
                <TouchableOpacity
                  style={chatButtonStyle}
                  onPress={handleOpenChat}
                  activeOpacity={0.85}
                >
                  <MessageCircle size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={chatButtonTextStyle}>Chat with Doctor</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.rescheduleButton} onPress={handleReschedule}>
                <Text style={styles.rescheduleText}>Reschedule Appointment</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelAppointment}>
                <Text style={styles.cancelText}>Cancel Appointment</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Inline styles for the new Chat button ────────────────────────────────────
// (Uses the same primary green as the rest of the app; kept inline so we don't
//  need to touch the shared AppointmentDetailStyles.ts file.)

const chatButtonStyle = {
  flexDirection: "row" as const,
  alignItems: "center" as const,
  justifyContent: "center" as const,
  backgroundColor: "#199A8E",
  borderRadius: 12,
  paddingVertical: 14,
  marginBottom: 12,
  elevation: 2,
  shadowColor: "#199A8E",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.25,
  shadowRadius: 6,
};

const chatButtonTextStyle = {
  color: "#FFFFFF",
  fontSize: 15,
  fontWeight: "700" as const,
};