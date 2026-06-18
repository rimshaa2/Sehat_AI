import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
} from "react-native";
import { Calendar, Clock } from "lucide-react-native";

export default ({ navigation, route }: any) => {
  const { doctor, date, time, paymentMethod, pendingReview } = route.params || {};

  // Bank transfer appointments need admin review before being confirmed
  const isPendingReview = paymentMethod === "bank" && pendingReview === true;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={isPendingReview ? "#D97706" : "#199A8E"} />

      <View style={[
        styles.topBanner,
        isPendingReview ? styles.topBannerPending : styles.topBannerConfirmed,
      ]} />

      <View style={styles.contentSheet}>

        {/* Icon Badge */}
        <View style={[
          styles.iconBadge,
          isPendingReview ? styles.iconBadgePending : styles.iconBadgeConfirmed,
        ]}>
          {isPendingReview
            ? <Clock size={36} color="#D97706" />
            : <Image
                source={{ uri: "https://cdn-icons-png.flaticon.com/512/3004/3004458.png" }}
                style={styles.logoIcon}
                resizeMode="contain"
              />
          }
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {isPendingReview
            ? "Payment Under Review"
            : "Appointment Confirmed!"
          }
        </Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          {isPendingReview
            ? "Your payment screenshot has been submitted. An admin will review it and confirm your appointment within 1–2 hours. You will be notified once approved."
            : "Your appointment has been successfully booked. A confirmation has been sent to your email."
          }
        </Text>

        {/* Pending Review Banner */}
        {isPendingReview && (
          <View style={styles.pendingBanner}>
            <Clock size={16} color="#92400E" style={{ marginRight: 8 }} />
            <Text style={styles.pendingBannerText}>
              Status: Awaiting payment confirmation
            </Text>
          </View>
        )}

        {/* Doctor Info */}
        <View style={styles.doctorContainer}>
          <Image
            source={{ uri: doctor?.image || "https://via.placeholder.com/150" }}
            style={styles.doctorImage}
          />
          <Text style={styles.doctorName}>{doctor?.name || "Doctor"}</Text>
          <Text style={styles.specialty}>{doctor?.specialty || "Specialist"}</Text>
        </View>

        {/* Appointment Details */}
        <View style={styles.detailCard}>
          <View style={[
            styles.detailIconBox,
            isPendingReview ? styles.detailIconBoxPending : styles.detailIconBoxConfirmed,
          ]}>
            <Calendar size={22} color={isPendingReview ? "#D97706" : "#199A8E"} />
          </View>
          <View>
            <Text style={styles.detailLabel}>Appointment</Text>
            <Text style={styles.detailValue}>{date} | {time}</Text>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={[
            styles.homeButton,
            isPendingReview ? styles.homeButtonPending : styles.homeButtonConfirmed,
          ]}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: "Home" }] })}
        >
          <Text style={styles.homeButtonText}>
            {isPendingReview ? "OK, got it" : "Back to Home"}
          </Text>
        </TouchableOpacity>

        {isPendingReview && (
          <TouchableOpacity
            style={styles.viewAppointmentsLink}
            onPress={() => navigation.reset({ index: 0, routes: [{ name: "Appointments" }] })}
          >
            <Text style={styles.viewAppointmentsText}>View My Appointments</Text>
          </TouchableOpacity>
        )}

      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container:              { flex: 1, backgroundColor: "#F8FAFC", alignItems: "center", justifyContent: "center" },
  topBanner:              { position: "absolute", top: 0, left: 0, right: 0, height: 180, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  topBannerConfirmed:     { backgroundColor: "#199A8E" },
  topBannerPending:       { backgroundColor: "#D97706" },
  contentSheet:           { backgroundColor: "white", borderRadius: 28, marginHorizontal: 20, padding: 28, alignItems: "center", elevation: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 20, width: "90%" },
  iconBadge:              { width: 80, height: 80, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 20, marginTop: -16 },
  iconBadgeConfirmed:     { backgroundColor: "#E6FFFA" },
  iconBadgePending:       { backgroundColor: "#FEF3C7" },
  logoIcon:               { width: 48, height: 48 },
  title:                  { fontSize: 20, fontWeight: "800", color: "#1C2A3A", textAlign: "center", marginBottom: 10 },
  subtitle:               { fontSize: 13, color: "#6B7280", textAlign: "center", lineHeight: 20, marginBottom: 16 },
  pendingBanner:          { flexDirection: "row", alignItems: "center", backgroundColor: "#FEF3C7", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16, borderWidth: 1, borderColor: "#FDE68A" },
  pendingBannerText:      { fontSize: 12, fontWeight: "700", color: "#92400E" },
  doctorContainer:        { alignItems: "center", marginBottom: 16 },
  doctorImage:            { width: 64, height: 64, borderRadius: 20, marginBottom: 8 },
  doctorName:             { fontSize: 15, fontWeight: "700", color: "#1C2A3A" },
  specialty:              { fontSize: 12, color: "#6B7280", marginTop: 2 },
  detailCard:             { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#F8FAFC", borderRadius: 14, padding: 14, width: "100%", marginBottom: 20, borderWidth: 1, borderColor: "#F3F4F6" },
  detailIconBox:          { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  detailIconBoxConfirmed: { backgroundColor: "#E6FFFA" },
  detailIconBoxPending:   { backgroundColor: "#FEF3C7" },
  detailLabel:            { fontSize: 11, color: "#9CA3AF" },
  detailValue:            { fontSize: 14, fontWeight: "700", color: "#1C2A3A", marginTop: 2 },
  homeButton:             { borderRadius: 16, paddingVertical: 14, paddingHorizontal: 32, width: "100%", alignItems: "center", marginBottom: 12 },
  homeButtonConfirmed:    { backgroundColor: "#199A8E" },
  homeButtonPending:      { backgroundColor: "#D97706" },
  homeButtonText:         { color: "white", fontWeight: "800", fontSize: 15 },
  viewAppointmentsLink:   { paddingVertical: 8 },
  viewAppointmentsText:   { color: "#199A8E", fontWeight: "600", fontSize: 13 },
});