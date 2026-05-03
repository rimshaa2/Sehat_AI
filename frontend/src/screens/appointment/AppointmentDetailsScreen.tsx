// frontend/src/screens/appointment/AppointmentDetailsScreen.tsx
// CHANGES:
//   1. "Chat with Doctor" button navigates to LiveChatScreen (M13)
//   2. Cancel now navigates to Home with appointmentCancelled param
//      so the reminder card on HomeScreen disappears instantly

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
              // Navigate to Home with the cancelled ID so the reminder card
              // is removed instantly without waiting for a re-fetch
              navigation.navigate("Home", {
                appointmentCancelled: appointment.id,
              });
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
        <View style={[
          styles.statusContainer, 
          appointment.status === "cancelled" && { backgroundColor: "#FEE2E2" },
          appointment.status === "completed" && { backgroundColor: "#E8F5E9" }
        ]}>
          <Text style={[
            styles.statusText,
            appointment.status === "cancelled" && { color: "#EF4444" },
            appointment.status === "completed" && { color: "#2E7D32" }
          ]}>
            {appointment.status || "Upcoming"}
          </Text>
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
          <Text style={styles.value} numberOfLines={2}>{appointment.reason || "General Consultation"}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.label}>Total Cost</Text>
          <Text style={[styles.value, { color: "#199A8E" }]}>
            Rs. {appointment.totalAmount || appointment.amount || "0.00"}
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#199A8E" />
          ) : (
            <>
              {/* Chat with Doctor */}
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

              {/* Only show reschedule/cancel for active appointments */}
              {appointment.status === "scheduled" && (
                <>
                  <TouchableOpacity style={styles.rescheduleButton} onPress={handleReschedule}>
                    <Text style={styles.rescheduleText}>Reschedule Appointment</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.cancelButton} onPress={handleCancelAppointment}>
                    <Text style={styles.cancelText}>Cancel Appointment</Text>
                  </TouchableOpacity>
                </>
              )}
              
              {appointment.status === "cancelled" && (
                <View style={{ padding: 16, backgroundColor: "#F9FAFB", borderRadius: 12, alignItems: "center" }}>
                  <Text style={{ color: "#6B7280", fontStyle: "italic" }}>This appointment has been cancelled.</Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Inline styles for the Chat button ───────────────────────────────────────

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