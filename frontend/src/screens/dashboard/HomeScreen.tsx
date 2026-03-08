import React, { useState, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { getAuth } from "@react-native-firebase/auth";
import { useFocusEffect } from "@react-navigation/native"; 
import { 
  Search, 
  Calendar, 
  Clock, 
  MessageCircle, 
  Home, 
  User as UserIcon, 
  CalendarDays 
} from "lucide-react-native";

// 🟢 IMPORT API SERVICES (This replaces Firestore)
import { getUserProfile, getMyAppointments } from "../../services/api";

import styles from "./styles/HomeScreenStyles";

export default ({ navigation }: any) => {
  const [userName, setUserName] = useState("User");
  const [nextAppointment, setNextAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const auth = getAuth();

  // 1. Fetch User Data & Appointments (Runs on Focus)
  useFocusEffect(
    useCallback(() => {
      let isActive = true; // Cleanup flag to prevent state updates if screen unmounts

      const fetchData = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        try {
          // A. Fetch User Profile from Backend (using Firebase UID)
          const userProfile = await getUserProfile(currentUser.uid);
          
          if (isActive && userProfile) {
            setUserName(userProfile.fullName?.split(" ")[0] || "User");

            // B. Fetch Appointments (using the MySQL ID we just got)
            // Note: userProfile.id is the MySQL ID (e.g., 1), not the Firebase UID
            const appointments = await getMyAppointments(userProfile.id, 'patient');
            
            if (appointments && appointments.length > 0) {
              // Get the most recent/upcoming appointment
              const upcoming = appointments[0]; 

              // C. Map Backend Data to UI Structure
              setNextAppointment({
                id: upcoming.id,
                doctorId: upcoming.doctorId,
                doctorName: upcoming.doctor?.user?.fullName || "Unknown Doctor",
                doctorSpecialty: upcoming.doctor?.specialization || "General",
                doctorImage: upcoming.doctor?.user?.profilePicture,
                date: upcoming.appointmentDate,
                time: upcoming.timeSlot
              });
            } else {
              setNextAppointment(null);
            }
          }
        } catch (error) {
          console.error("Home Data Error:", error);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      fetchData();

      return () => { isActive = false; };
    }, [])
  );

  // Helper Component for Grid Items
  const GridItem = ({ title, subtitle, icon, color, onPress }: any) => (
    <TouchableOpacity 
      style={[styles.gridItem, { backgroundColor: color }]} 
      onPress={onPress}
    >
      <View style={styles.gridIconContainer}>
        <Image source={icon} style={styles.gridIcon} resizeMode="contain" />
      </View>
      <Text style={styles.gridTitle}>{title}</Text>
      <Text style={styles.gridSubtitle}>{subtitle}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }} 
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hi {userName}!</Text>
            <Text style={styles.subGreeting}>I hope you are doing fine!!</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate("Profile")}
          >
             <UserIcon color="#1C2A3A" size={24} />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search color="#A1A8B0" size={20} style={styles.searchIcon} />
          <TextInput 
            placeholder="symptoms, diseases..." 
            style={styles.searchInput}
            placeholderTextColor="#A1A8B0"
          />
          <TouchableOpacity style={styles.filterButton}>
             <View style={styles.filterLine1} />
             <View style={styles.filterLine2} />
             <View style={styles.filterLine3} />
          </TouchableOpacity>
        </View>

        {/* 3. Dynamic Appointment Card */}
        {loading ? (
           <ActivityIndicator size="small" color="#199A8E" style={{ marginVertical: 20 }}/>
        ) : nextAppointment ? (
          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={() => navigation.navigate("AppointmentDetails", { appointment: nextAppointment })}
          >
            <View style={styles.appointmentCard}>
              <View style={styles.doctorInfo}>
                <Image 
                  source={{ uri: nextAppointment.doctorImage || 'https://via.placeholder.com/150' }} 
                  style={styles.doctorImage} 
                />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={styles.doctorName}>{nextAppointment.doctorName}</Text>
                  <Text style={styles.doctorSpeciality}>{nextAppointment.doctorSpecialty}</Text>
                </View>
                <TouchableOpacity style={styles.chatButton}>
                  <MessageCircle color="#FFFFFF" size={20} fill="white" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.dateContainer}>
                <View style={styles.dateItem}>
                  <Calendar color="#FFFFFF" size={16} />
                  <Text style={styles.dateText}>
                    {nextAppointment.date ? `Date: ${nextAppointment.date}` : "Upcoming"}
                  </Text>
                </View>
                <View style={styles.dateItem}>
                  <Clock color="#FFFFFF" size={16} />
                  <Text style={styles.dateText}>{nextAppointment.time}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          // Optional: You can put a "No upcoming appointments" text here if you want
          null 
        )}

        {/* Grid Menu */}
        <View style={styles.gridContainer}>
          <GridItem 
            title="Book an Appointment" 
            subtitle="Find a Doctor or specialist"
            icon={{ uri: 'https://cdn-icons-png.flaticon.com/512/2693/2693507.png' }} 
            color="#E8F1FF" 
            onPress={() => navigation.navigate("BookAppointment")}
          />
          <GridItem 
            title="Medical Records" 
            subtitle="view medical reports and history"
            icon={{ uri: 'https://cdn-icons-png.flaticon.com/512/3004/3004458.png' }}
            color="#EBFDF2"
            onPress={() => navigation.navigate("MedicalRecords")}  
          />
          <GridItem 
            title="Check Symptoms" 
            subtitle="Get trusted medical advice instantly with virtual assistant."
            icon={{ uri: 'https://cdn-icons-png.flaticon.com/512/2966/2966327.png' }}
            color="#F2E7FE"
            onPress={() => navigation.navigate("AiAssistant")} 
          />
          <GridItem 
            title="Report an emergency" 
            subtitle="Take help in emergency situation"
            icon={{ uri: 'https://cdn-icons-png.flaticon.com/512/564/564619.png' }}
            color="#FFEEEE" 
            onPress={() => console.log("Emergency!")}
          />
          <GridItem 
            title="Log Medicines" 
            subtitle="get reminded to take medicines"
            icon={{ uri: 'https://cdn-icons-png.flaticon.com/512/883/883360.png' }}
            color="#FFF5EB" 
            onPress={() => console.log("Medicine Log")}
          />
          <GridItem 
            title="Mental Wellness" 
            subtitle="seek Mental health support"
            icon={{ uri: 'https://cdn-icons-png.flaticon.com/512/2913/2913520.png' }}
            color="#FEFCE4" 
            onPress={() => console.log("Mental Wellness")}
          />
        </View>

        {/* Promo Banner */}
        <View style={styles.promoBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.promoTitle}>How AI is Revolutionizing Medical Consultations</Text>
            <TouchableOpacity>
              <Text style={styles.promoLink}>Find out now →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.promoImagePlaceholder}>
              <Text style={{color:'white', fontWeight:'bold'}}>AI</Text>
          </View>
        </View>

      </ScrollView>

      {/* Floating Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Home color="#1C2A3A" size={24} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigation.navigate("AiAssistant")}>
          <MessageCircle color="#FFFFFF" size={24} />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <UserIcon color="#FFFFFF" size={24} />
        </TouchableOpacity>
        
        <TouchableOpacity>
          <CalendarDays color="#FFFFFF" size={24} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};