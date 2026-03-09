import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import {
  ChevronLeft,
  MoreVertical,
  MapPin,
  Star,
  MessageSquare,
} from "lucide-react-native";

// 🟢 Import your API
import api from "../../services/api";
import styles from "./styles/DoctorDetailsStyles";
import BookingSuccessScreen from "./BookingSuccessScreen";
import PaymentScreen from "./PaymentScreen";

// UI Helper: Generate next 7 days for the horizontal scroll
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
      fullDate: d.toISOString().split("T")[0], // YYYY-MM-DD
    });
  }
  return dates;
};

export default ({ navigation, route }: any) => {
  const { doctor } = route.params || {};

  const dates = generateDates();

  // State
  const [selectedDate, setSelectedDate] = useState(dates[0].fullDate);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [reason, setReason] = useState("");

  // 1. Fetch Slots whenever Date Changes
  useEffect(() => {
    const fetchSlots = async () => {
      setLoadingSlots(true);
      setAvailableSlots([]); // Clear previous slots
      setSelectedTime(null); // Reset selection

      try {
        console.log(`📅 Checking availability for Doctor ${doctor.id} on ${selectedDate}`);

        // Call Backend: /api/appointments/doctors/1/slots?date=2026-01-21
        const response = await api.get(`/api/appointments/doctors/${doctor.id}/slots`, {
          params: { date: selectedDate }
        });

        if (response.data && response.data.availableSlots) {
          setAvailableSlots(response.data.availableSlots);
        }
      } catch (error) {
        console.error("Slot Fetch Error:", error);
        // Optional: Alert.alert("Error", "Could not fetch availability");
      } finally {
        setLoadingSlots(false);
      }
    };

    if (doctor?.id) {
      fetchSlots();
    }
  }, [selectedDate, doctor]);

  // 2. Handle Booking
  const handleBookAppointment = () => {
    if (!selectedTime) {
      Alert.alert("Select Time", "Please select a time slot to continue.");
      return;
    }

    if (reason.trim().length === 0) {
      Alert.alert("Reason Required", "Please enter a brief reason for your appointment.");
      return;
    }

    // Navigate to Confirmation/Payment Screen
    // We pass all the booking details to the next screen
    navigation.navigate("Payment", {
      doctor: doctor,
      date: selectedDate,
      time: selectedTime,
      reason: reason,
      amount: doctor.priceValue || 1500, // Fallback price if missing
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconButton}
        >
          <ChevronLeft color="#1C2A3A" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Appointment</Text>
        <TouchableOpacity style={styles.iconButton}>
          <MoreVertical color="#1C2A3A" size={24} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Doctor Profile */}
          <View style={styles.profileContainer}>
            <Image
              source={{
                uri: doctor?.image || "https://via.placeholder.com/150",
              }}
              style={styles.doctorImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.doctorName}>
                {doctor?.name || "Dr. Name"}
              </Text>
              <Text style={styles.specialty}>
                {doctor?.specialty || "Specialist"}
              </Text>

              <View style={styles.ratingContainer}>
                <Star size={12} color="#199A8E" fill="#199A8E" />
                <Text style={styles.ratingText}>{doctor?.rating || 4.5}</Text>
              </View>

              <View style={styles.locationContainer}>
                <MapPin size={12} color="#6B7280" />
                <Text style={styles.locationText}>800m away</Text>
              </View>
            </View>
          </View>

          {/* About Section */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.aboutText} numberOfLines={3}>
              {doctor?.bio || "Experienced specialist dedicated to providing top-notch healthcare services. Verified by Sehat AI."}
              <Text style={styles.readMore}> Read more</Text>
            </Text>
          </View>

          {/* Date Selector */}
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
                  selectedDate === item.fullDate && styles.dateCardActive,
                ]}
                onPress={() => setSelectedDate(item.fullDate)}
              >
                <Text
                  style={[
                    styles.dayText,
                    selectedDate === item.fullDate && styles.textActive,
                  ]}
                >
                  {item.day}
                </Text>
                <Text
                  style={[
                    styles.dateNumText,
                    selectedDate === item.fullDate && styles.textActive,
                  ]}
                >
                  {item.date}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.sectionContainer}>
            <View style={{ height: 1, backgroundColor: "#F3F4F6", marginBottom: 20 }} />
          </View>

          {/* Time Selector (Dynamic Data) */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Available Slots</Text>

            {loadingSlots ? (
              <ActivityIndicator size="small" color="#199A8E" style={{ marginTop: 20 }} />
            ) : (
              <View style={styles.timeGrid}>
                {availableSlots.length > 0 ? (
                  availableSlots.map((time, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.timeSlot,
                        selectedTime === time && styles.timeSlotActive,
                      ]}
                      onPress={() => setSelectedTime(time)}
                    >
                      <Text
                        style={[
                          styles.timeText,
                          selectedTime === time && styles.textActive,
                        ]}
                      >
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  // Empty State if no slots found from Backend
                  <Text style={{ color: '#EF4444', fontStyle: 'italic', marginTop: 10 }}>
                    No available slots for this date.
                  </Text>
                )}
              </View>
            )}
          </View>

          {/* Reason Input Field */}
          <View style={styles.reasonContainer}>
            <Text style={styles.reasonLabel}>Reason for Appointment</Text>
            <TextInput
              style={styles.reasonInput}
              placeholder="E.g., Severe headache and nausea..."
              placeholderTextColor="#9CA3AF"
              multiline={true}
              numberOfLines={4}
              value={reason}
              onChangeText={setReason}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.chatButton}>
          <MessageSquare size={24} color="#199A8E" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.bookButton, (!selectedTime || loadingSlots) && { opacity: 0.6 }]}
          onPress={handleBookAppointment}
          disabled={!selectedTime || loadingSlots}
        >
          <Text style={styles.bookButtonText}>
            {loadingSlots ? "Checking..." : "Book Appointment"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};