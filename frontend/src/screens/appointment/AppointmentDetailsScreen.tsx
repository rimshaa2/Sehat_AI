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
import { ChevronLeft, MoreVertical } from "lucide-react-native";
import { getFirestore, doc, deleteDoc, updateDoc } from "@react-native-firebase/firestore";
import styles from "./styles/AppointmentDetailStyles";

export default ({ navigation, route }: any) => {
  // Get the appointment object passed from Home
  const { appointment } = route.params || {};
  const [loading, setLoading] = useState(false);

  const db = getFirestore();

  // --- DELETE (Cancel) Operation ---
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
              await deleteDoc(doc(db, "appointments", appointment.id));
              Alert.alert("Cancelled", "Appointment has been cancelled successfully.");
              navigation.goBack(); // Go back to Home to refresh
            } catch (error) {
              console.error(error);
              Alert.alert("Error", "Could not cancel appointment.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // --- UPDATE (Reschedule) Operation ---
  const handleReschedule = () => {
    // Navigate to the Reschedule Screen and pass the current appointment data
    navigation.navigate("RescheduleAppointment", { appointment: appointment });
  };

  if (!appointment) return null;

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
            source={{ uri: appointment.doctorImage || 'https://via.placeholder.com/150' }} 
            style={styles.doctorImage} 
          />
          <View style={styles.doctorInfo}>
            <Text style={styles.doctorName}>{appointment.doctorName}</Text>
            <Text style={styles.specialty}>{appointment.doctorSpecialty}</Text>
          </View>
        </View>

        {/* Details List */}
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
          <Text style={[styles.value, { color: '#199A8E' }]}>Rs. {appointment.totalAmount}</Text>
        </View>

        {/* CRUD Buttons */}
        <View style={styles.actionsContainer}>
          {loading ? (
            <ActivityIndicator size="large" color="#199A8E" />
          ) : (
            <>
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