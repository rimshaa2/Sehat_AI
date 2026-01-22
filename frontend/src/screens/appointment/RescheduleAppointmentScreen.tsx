import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { ChevronLeft } from "lucide-react-native";
import { getFirestore, doc, updateDoc, serverTimestamp } from "@react-native-firebase/firestore";
import styles from "./styles/RescheduleAppointmentStyles";

// Generate next 7 days logic
const generateDates = () => {
  const dates = [];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      day: days[d.getDay()],
      date: d.getDate(),
      fullDate: d.toISOString().split("T")[0],
    });
  }
  return dates;
};

const TIME_SLOTS = [
  "09:00 AM", "10:00 AM", "11:00 AM",
  "01:00 PM", "02:00 PM", "03:00 PM",
  "04:00 PM", "07:00 PM", "08:00 PM",
];

export default ({ navigation, route }: any) => {
  const { appointment } = route.params || {};
  
  const dates = generateDates();
  
  // Initialize with current appointment data if possible, else default to today
  const [selectedDate, setSelectedDate] = useState(appointment?.date || dates[0].fullDate);
  const [selectedTime, setSelectedTime] = useState(appointment?.time || null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    if (!selectedTime) {
      Alert.alert("Select Time", "Please select a new time slot.");
      return;
    }

    // Check if user actually changed something
    if (selectedDate === appointment.date && selectedTime === appointment.time) {
      Alert.alert("No Changes", "You selected the same date and time.");
      return;
    }

    setIsLoading(true);

    try {
      const db = getFirestore();
      const appointmentRef = doc(db, "appointments", appointment.id);

      // Update the document
      await updateDoc(appointmentRef, {
        date: selectedDate,
        time: selectedTime,
        status: "rescheduled",
        updatedAt: serverTimestamp(),
      });

      Alert.alert(
        "Success", 
        "Appointment rescheduled successfully!",
        [{ text: "OK", onPress: () => navigation.navigate("Home") }]
      );

    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to reschedule. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
          <ChevronLeft color="#1C2A3A" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reschedule</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Current Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>Rescheduling appointment with:</Text>
          <Text style={[styles.sectionTitle, { marginBottom: 8 }]}>{appointment?.doctorName}</Text>
          <Text style={styles.infoText}>Currently booked for:</Text>
          <Text style={styles.currentSlotText}>
            {appointment?.date} at {appointment?.time}
          </Text>
        </View>

        {/* Date Selector */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Select New Date</Text>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.dateScroll}
        >
          {dates.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.dateCard, 
                selectedDate === item.fullDate && styles.dateCardActive
              ]}
              onPress={() => setSelectedDate(item.fullDate)}
            >
              <Text style={[styles.dayText, selectedDate === item.fullDate && styles.textActive]}>
                {item.day}
              </Text>
              <Text style={[styles.dateNumText, selectedDate === item.fullDate && styles.textActive]}>
                {item.date}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Time Selector */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Select New Time</Text>
        </View>
        <View style={styles.timeGrid}>
          {TIME_SLOTS.map((time, index) => (
            <TouchableOpacity 
              key={index}
              style={[
                styles.timeSlot, 
                selectedTime === time && styles.timeSlotActive
              ]}
              onPress={() => setSelectedTime(time)}
            >
              <Text style={[styles.timeText, selectedTime === time && styles.textActive]}>
                {time}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.confirmButton} 
          onPress={handleUpdate}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Reschedule</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};