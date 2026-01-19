import React, { useEffect, useState, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { getAuth } from "@react-native-firebase/auth";
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "@react-native-firebase/firestore";
import { useFocusEffect } from "@react-navigation/native"; 
import { 
  Search, 
  Calendar, 
  Clock, 
  MessageCircle, 
  Home, 
  User, 
  CalendarDays 
} from "lucide-react-native";

import styles from "./HomeScreenStyles";

export default ({ navigation }: any) => {
  const [userName, setUserName] = useState("User");
  const [nextAppointment, setNextAppointment] = useState<any>(null);
  const [loadingAppt, setLoadingAppt] = useState(true);

  const auth = getAuth();
  const db = getFirestore();

  // 1. Fetch User Name (Runs once on mount)
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        if (user.displayName) {
          setUserName(user.displayName.split(" ")[0]);
        } else {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserName(userData?.fullName?.split(" ")[0] || "User");
          }
        }
      }
    };
    fetchUserData();
  }, []);

  // 2. Fetch Upcoming Appointment (Runs every time screen is focused)
  useFocusEffect(
    useCallback(() => {
      const fetchAppointment = async () => {
        const user = auth.currentUser;
        if (!user) return;

        try {
          // Query: Get appointments for this specific user
          const q = query(
            collection(db, "appointments"),
            where("userId", "==", user.uid)
          );

          const snapshot = await getDocs(q);
          
          if (!snapshot.empty) {
            const appointments = snapshot.docs.map((doc: { id: any; data: () => any; }) => ({ id: doc.id, ...doc.data() }));
            
            // Sort by creation time (newest first) to show the latest booking
            // Note: In a real app, you might want to sort by 'date' to show the *next* appointment
            appointments.sort((a: any, b: any) => b.createdAt - a.createdAt);
            
            setNextAppointment(appointments[0]);
          } else {
            setNextAppointment(null);
          }
        } catch (error) {
          console.error("Error fetching appointment:", error);
        } finally {
          setLoadingAppt(false);
        }
      };

      fetchAppointment();
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
             <User color="#1C2A3A" size={24} />
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

        {/* 3. Dynamic Appointment Card (Clickable) */}
        {nextAppointment ? (
          <TouchableOpacity 
            activeOpacity={0.9}
            // Navigate to Details screen passing the appointment object
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
          // Placeholder or Null if no appointment
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
          />
          <GridItem 
            title="Log Medicines" 
            subtitle="get reminded to take medicines"
            icon={{ uri: 'https://cdn-icons-png.flaticon.com/512/883/883360.png' }}
            color="#FFF5EB" 
          />
          <GridItem 
            title="Mental Wellness" 
            subtitle="seek Mental health support"
            icon={{ uri: 'https://cdn-icons-png.flaticon.com/512/2913/2913520.png' }}
            color="#FEFCE4" 
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
          <User color="#FFFFFF" size={24} />
        </TouchableOpacity>
        
        <TouchableOpacity>
          <CalendarDays color="#FFFFFF" size={24} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};