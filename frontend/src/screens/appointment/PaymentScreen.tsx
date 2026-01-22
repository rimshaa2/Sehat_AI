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
import { ChevronLeft, Star, MapPin, Calendar, PenTool } from "lucide-react-native";
import { getAuth } from "@react-native-firebase/auth";

// 🟢 IMPORT API SERVICES
import api, { getUserProfile } from "../../services/api"; 
import styles from "./styles/PaymentScreenStyles";

export default ({ navigation, route = { params: {} } }: any) => {
  // 1. Get Data from Previous Screen
  const { doctor, date, time, reason } = route.params || {};

  const [isLoading, setIsLoading] = useState(false);

  // Payment Calculations
  // In a real app, 'consultationFee' should come from doctor.priceValue
  const consultationFee = doctor?.priceValue || 2500;
  const adminFee = 100; // Small platform fee
  const total = consultationFee + adminFee;

  const handleConfirmBooking = async () => {
    setIsLoading(true);

    try {
      const auth = getAuth();
      const currentUser = auth.currentUser;

      if (!currentUser) {
        Alert.alert("Error", "You must be logged in to book.");
        return;
      }

      // A. Get the MySQL User ID (We only have Firebase UID right now)
      // We need the integer ID (e.g. 1, 2) to link the Foreign Key in MySQL
      const userProfile = await getUserProfile(currentUser.uid);
      
      if (!userProfile || !userProfile.id) {
        throw new Error("Could not find user profile in database.");
      }

      // B. Prepare Payload for Backend
      const payload = {
        patientId: userProfile.id, // The MySQL ID we just found
        doctorId: doctor.id,       // The Doctor's MySQL ID
        appointmentDate: date,                // "2026-01-21"
        timeSlot: time,                // "09:00:00"
        reason: reason,
        amount: total
      };

      console.log("🚀 Booking Payload:", payload);

      // C. Call the Backend
      // POST /api/appointments/book
      const response = await api.post('/api/appointments/book', payload);

      if (response.data.success) {
        // D. Success! Navigate to Success Screen
        navigation.replace("BookingSuccess", {
          doctor: doctor,
          date: date,
          time: time,
        });
      }

    } catch (error: any) {
      console.error("Booking Error:", error);
      const msg = error.response?.data?.error || "Something went wrong. Please try again.";
      Alert.alert("Booking Failed", msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color="#1C2A3A" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Doctor Card */}
        <View style={styles.doctorCard}>
          <Image 
            source={{ uri: doctor?.image || 'https://via.placeholder.com/150' }} 
            style={styles.doctorImage} 
          />
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{doctor?.name || "Doctor Name"}</Text>
            <Text style={styles.specialty}>{doctor?.specialty || "Specialist"}</Text>
            
            <View style={styles.ratingContainer}>
              <Star size={12} color="#199A8E" fill="#199A8E" />
              <Text style={styles.ratingText}>{doctor?.rating || 4.5}</Text>
            </View>
            <View style={styles.locationRow}>
              <MapPin size={12} color="#6B7280" />
              <Text style={styles.locationText}>800m away</Text>
            </View>
          </View>
        </View>

        {/* Date Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Date</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.changeLink}>Change</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.iconCircle}>
            <Calendar size={20} color="#199A8E" />
          </View>
          <Text style={styles.infoText}>
            {date} | {time}
          </Text>
        </View>

        {/* Reason Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Reason</Text>
        </View>
        <View style={styles.infoRow}>
          <View style={styles.iconCircle}>
            <PenTool size={20} color="#199A8E" />
          </View>
          <Text style={styles.infoText} numberOfLines={2}>
            {reason || "General Consultation"}
          </Text>
        </View>

        <View style={styles.divider} />

        {/* Payment Detail */}
        <Text style={[styles.sectionTitle, { marginBottom: 16 }]}>Payment Detail</Text>
        
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Consultation</Text>
          <Text style={styles.paymentValue}>Rs. {consultationFee}</Text>
        </View>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Admin Fee</Text>
          <Text style={styles.paymentValue}>Rs. {adminFee}</Text>
        </View>
        <View style={styles.paymentRow}>
          <Text style={styles.paymentLabel}>Total</Text>
          <Text style={[styles.paymentValue, { color: '#199A8E', fontWeight: 'bold' }]}>Rs. {total}</Text>
        </View>
        
        <View style={styles.divider} />

        {/* Payment Method (Visual Only) */}
        <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>Payment Method</Text>
        <View style={styles.methodCard}>
          <Text style={styles.visaText}>Cash on Visit</Text>
          <TouchableOpacity>
            <Text style={styles.changeLink}>Change</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerTotalLabel}>Total</Text>
          <Text style={styles.footerTotalPrice}>Rs. {total}</Text>
        </View>
        <TouchableOpacity 
          style={styles.confirmButton} 
          onPress={handleConfirmBooking}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Booking</Text>
          )}
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};