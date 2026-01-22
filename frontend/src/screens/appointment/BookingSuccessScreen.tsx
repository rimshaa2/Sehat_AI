import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { Calendar } from "lucide-react-native";
import styles from "./styles/BookingSuccessStyles";

export default ({ navigation, route }: any) => {
  // Get data passed from PaymentScreen
  const { doctor, date, time } = route.params || {};

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#66CDAA" />
      
      {/* White Sheet */}
      <View style={styles.contentSheet}>
        
        {/* Floating Logo Badge */}
        <View style={styles.logoContainer}>
           {/* Replace with your Sehat AI logo asset */}
           <Image 
             source={{ uri: "https://cdn-icons-png.flaticon.com/512/3004/3004458.png" }} 
             style={styles.logoIcon}
             resizeMode="contain"
           />
        </View>

        <Text style={styles.title}>
          You have successfully made an appointment
        </Text>
        
        <Text style={styles.subtitle}>
          The appointment confirmation has been sent to your email.
        </Text>

        {/* Doctor Info */}
        <View style={styles.doctorContainer}>
          <Image 
            source={{ uri: doctor?.image || "https://via.placeholder.com/150" }} 
            style={styles.doctorImage} 
          />
          <Text style={styles.doctorName}>{doctor?.name || "Dr. Name"}</Text>
          <Text style={styles.specialty}>{doctor?.specialty || "Specialist"}</Text>
        </View>

        {/* Appointment Details */}
        <View style={styles.detailCard}>
          <View style={styles.iconBox}>
            <Calendar size={24} color="#199A8E" />
          </View>
          <View>
            <Text style={styles.detailLabel}>Appointment</Text>
            <Text style={styles.detailValue}>
              {date} | {time}
            </Text>
          </View>
        </View>

        {/* Back to Home Button */}
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={() => navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          })}
        >
          <Text style={styles.homeButtonText}>Back to home</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
};