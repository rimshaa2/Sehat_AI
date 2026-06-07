// frontend/src/screens/appointment/AppointmentDetailsScreen.tsx
import React, { useState, useEffect } from "react";
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
import { ChevronLeft, MoreVertical, MessageCircle, Clock, AlertTriangle } from "lucide-react-native";
import { cancelAppointment, getUserProfile } from "../../services/api";
import auth from "@react-native-firebase/auth";
import styles from "./styles/AppointmentDetailStyles";

export default ({ navigation, route }: any) => {
  const { appointment } = route.params || {};
  const [loading, setLoading]   = useState(false);
  const [userRole, setUserRole] = useState<"patient" | "doctor" | "admin" | null>(null);

  // ── Detect logged-in user's role ─────────────────────────────────────────
  useEffect(() => {
    const fetchRole = async () => {
      try {
        const currentUser = auth().currentUser;
        if (!currentUser) return;
        const profile = await getUserProfile(currentUser.uid);
        setUserRole(profile?.role || "patient");
      } catch {
        setUserRole("patient");
      }
    };
    fetchRole();
  }, []);

  // ── Helper: check if patient is allowed to cancel ────────────────────────
  // Rules:
  //   1. Cannot cancel on the day of the appointment
  //   2. Cannot cancel less than 24 hours before the appointment
  const getPatientCancelStatus = (): { allowed: boolean; reason?: string } => {
    if (!appointment?.date) return { allowed: true };

    // Normalise appointment date to "YYYY-MM-DD"
    const apptDateStr =
      typeof appointment.date === "string" && appointment.date.includes("-")
        ? appointment.date.substring(0, 10)           // already YYYY-MM-DD
        : new Date(appointment.date).toISOString().split("T")[0];

    const todayStr = new Date().toLocaleDateString("en-CA"); // "YYYY-MM-DD" in local time

    // Rule 1: same calendar day
    if (apptDateStr === todayStr) {
      return {
        allowed: false,
        reason: "You cannot cancel an appointment on the day it is scheduled. Please contact the clinic directly.",
      };
    }

    // Rule 2: less than 24 hours before appointment start
    if (appointment.cancellationDeadline) {
      const deadline = new Date(appointment.cancellationDeadline);
      if (new Date() > deadline) {
        return {
          allowed: false,
          reason: "The cancellation window has passed. Appointments must be cancelled at least 24 hours in advance.",
        };
      }
    } else {
      // Fallback: calculate manually from date + time if no deadline field
      try {
        const [timePart, meridiem] = (appointment.time || "09:00 AM").split(" ");
        let [h, m] = timePart.split(":").map(Number);
        if (meridiem === "PM" && h !== 12) h += 12;
        if (meridiem === "AM" && h === 12) h = 0;
        const apptStart = new Date(`${apptDateStr}T${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:00`);
        const deadline  = new Date(apptStart.getTime() - 24 * 60 * 60 * 1000);
        if (new Date() > deadline) {
          return {
            allowed: false,
            reason: "The cancellation window has passed. Appointments must be cancelled at least 24 hours in advance.",
          };
        }
      } catch {
        // If parsing fails, let backend enforce the rule
      }
    }

    return { allowed: true };
  };

  // ── Cancel handler ────────────────────────────────────────────────────────
  const handleCancelAppointment = () => {
    // For patients, check window before even showing the confirm dialog
    if (userRole === "patient") {
      const { allowed, reason } = getPatientCancelStatus();
      if (!allowed) {
        Alert.alert("Cannot Cancel", reason, [{ text: "OK" }]);
        return;
      }
    }

    const message =
      userRole === "doctor"
        ? "Are you sure you want to cancel this appointment? The patient will be notified."
        : "Are you sure you want to cancel this appointment? This action cannot be undone.";

    Alert.alert("Cancel Appointment", message, [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: async () => {
          setLoading(true);
          try {
            await cancelAppointment(appointment.id);

            if (userRole === "doctor") {
              // Doctor goes back to their appointments list
              Alert.alert("Cancelled", "Appointment has been cancelled and the patient has been notified.", [
                { text: "OK", onPress: () => navigation.goBack() },
              ]);
            } else {
              navigation.navigate("Home", { appointmentCancelled: appointment.id });
            }
          } catch (error: any) {
            // Show the backend error message (e.g. window passed)
            const msg =
              error?.response?.data?.error ||
              error?.message ||
              "Could not cancel appointment. Please try again.";
            Alert.alert("Cannot Cancel", msg);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleReschedule = () => {
    navigation.navigate("RescheduleAppointment", { appointment });
  };

  const handleOpenChat = () => {
    navigation.navigate("LiveChat", {
      appointmentId:  appointment.id,
      doctorName:     appointment.doctorName || "Doctor",
      doctorSpecialty: appointment.doctorSpecialty || "Specialist",
      doctorImage:    appointment.doctorImage,
    });
  };

  if (!appointment) return null;

  const isScheduled    = appointment.status === "scheduled";
  const isChatAvailable = isScheduled || appointment.status === "confirmed";
  const isPatient      = userRole === "patient";
  const isDoctor       = userRole === "doctor";

  // Show cancellation warning to patient if window is closing
  const cancelStatus = isPatient ? getPatientCancelStatus() : { allowed: true };

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
          appointment.status === "completed"  && { backgroundColor: "#E8F5E9" },
        ]}>
          <Text style={[
            styles.statusText,
            appointment.status === "cancelled" && { color: "#EF4444" },
            appointment.status === "completed"  && { color: "#2E7D32" },
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

        {/* Patient: show cancellation warning if window is closing */}
        {isScheduled && isPatient && !cancelStatus.allowed && (
          <View style={{
            flexDirection: "row", alignItems: "flex-start", gap: 10,
            backgroundColor: "#FEF3C7", borderRadius: 12, padding: 14,
            marginTop: 12, borderWidth: 1, borderColor: "#FDE68A",
          }}>
            <AlertTriangle size={16} color="#92400E" style={{ marginTop: 1 }} />
            <Text style={{ fontSize: 13, color: "#92400E", flex: 1, lineHeight: 20 }}>
              {cancelStatus.reason}
            </Text>
          </View>
        )}

        {/* Cancellation deadline info for patient */}
        {isScheduled && isPatient && cancelStatus.allowed && appointment.cancellationDeadline && (
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 8,
            backgroundColor: "#F0FDF9", borderRadius: 12, padding: 12,
            marginTop: 12, borderWidth: 1, borderColor: "#D1FAE5",
          }}>
            <Clock size={14} color="#199A8E" />
            <Text style={{ fontSize: 12, color: "#065F46", flex: 1 }}>
              Cancel by{" "}
              <Text style={{ fontWeight: "700" }}>
                {new Date(appointment.cancellationDeadline).toLocaleString("en-PK", {
                  timeZone: "Asia/Karachi",
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </Text>{" "}
              to avoid the no-cancellation window.
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#199A8E" />
          ) : (
            <>
              {/* Chat — patient only */}
              {isChatAvailable && isPatient && (
                <TouchableOpacity style={chatButtonStyle} onPress={handleOpenChat} activeOpacity={0.85}>
                  <MessageCircle size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={chatButtonTextStyle}>Chat with Doctor</Text>
                </TouchableOpacity>
              )}

              {/* Patient: reschedule + cancel (only if window open) */}
              {isScheduled && isPatient && (
                <>
                  <TouchableOpacity style={styles.rescheduleButton} onPress={handleReschedule}>
                    <Text style={styles.rescheduleText}>Reschedule Appointment</Text>
                  </TouchableOpacity>

                  {/* Always show cancel button — if window closed, tapping shows the error */}
                  <TouchableOpacity
                    style={[
                      styles.cancelButton,
                      !cancelStatus.allowed && { opacity: 0.45 },
                    ]}
                    onPress={handleCancelAppointment}
                  >
                    <Text style={styles.cancelText}>Cancel Appointment</Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Doctor: only cancel button */}
              {isScheduled && isDoctor && (
                <TouchableOpacity
                  style={[styles.cancelButton, { backgroundColor: "#FEE2E2" }]}
                  onPress={handleCancelAppointment}
                >
                  <Text style={[styles.cancelText, { color: "#DC2626" }]}>
                    Cancel This Appointment
                  </Text>
                </TouchableOpacity>
              )}

              {appointment.status === "cancelled" && (
                <View style={{ padding: 16, backgroundColor: "#F9FAFB", borderRadius: 12, alignItems: "center" }}>
                  <Text style={{ color: "#6B7280", fontStyle: "italic" }}>
                    This appointment has been cancelled.
                  </Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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