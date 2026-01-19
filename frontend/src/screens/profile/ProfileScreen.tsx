import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { 
  ChevronLeft, 
  Edit2, 
  Calendar, 
  FileText, 
  Pill, 
  User, 
  Bell, 
  Globe, 
  ChevronRight 
} from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native"; // Import this!
import { getAuth } from "@react-native-firebase/auth";
import { getFirestore, doc, getDoc } from "@react-native-firebase/firestore";
import styles from "./styles/ProfileScreenStyles";

export default ({ navigation }: any) => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // CHANGED: uses useFocusEffect instead of useEffect
  useFocusEffect(
    useCallback(() => {
      const fetchProfile = async () => {
        // setLoading(true); // Optional: Uncomment if you want spinner on every revisit
        try {
          const auth = getAuth();
          const db = getFirestore();
          const user = auth.currentUser;

          if (user) {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              setUserData(docSnap.data());
            } else {
              setUserData({
                fullName: user.displayName || "User",
                email: user.email,
                phone: "", 
              });
            }
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
    }, [])
  );

  const MenuItem = ({ icon, title, subtitle, color = "#E0E7FF" }: any) => (
    <TouchableOpacity style={styles.menuItem}>
      <View style={[styles.menuIconBox, { backgroundColor: color }]}>
        {icon}
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuSubtitle}>{subtitle}</Text>
      </View>
      <ChevronRight size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#66CDAA" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft color="#FFFFFF" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <View style={styles.profileBlock}>
          <View style={styles.avatarContainer}>
            <User size={40} color="#FFFFFF" />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{userData?.fullName || "Guest User"}</Text>
            <Text style={styles.userEmail}>{userData?.email}</Text>
            <Text style={styles.userPhone}>{userData?.phone || "No phone added"}</Text>
          </View>
          
          {/* 👇 EDIT BUTTON LOGIC */}
          <TouchableOpacity 
            style={styles.editIcon}
            onPress={() => navigation.navigate("EditProfile", { userData })} 
          >
            <Edit2 size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
      >
        {/* Health Overview, Quick Access, Menu Items, etc. */}
        
        {/* Placeholders for existing UI components to ensure file completeness */}
        <View style={styles.overviewCard}>
          <Text style={styles.cardTitle}>Health Overview</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Calendar size={24} color="#6366F1" /> 
              </View>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Appointments</Text>
            </View>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <FileText size={24} color="#F59E0B" />
              </View>
              <Text style={styles.statNumber}>24</Text>
              <Text style={styles.statLabel}>Records</Text>
            </View>
            <View style={styles.statItem}>
              <View style={styles.statIconContainer}>
                <Pill size={24} color="#EF4444" />
              </View>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Medicines</Text>
            </View>
          </View>
        </View>

        <View style={styles.quickAccessContainer}>
          <Text style={styles.quickAccessTitle}>Quick Access</Text>
          <View style={styles.quickAccessButtons}>
            <TouchableOpacity style={styles.accessBtn}>
              <Text style={styles.accessBtnText}>Medical ID</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.accessBtn}>
              <Text style={styles.accessBtnText}>Insurance</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.accessBtn}>
              <Text style={styles.accessBtnText}>Documents</Text>
            </TouchableOpacity>
          </View>
        </View>

        <MenuItem 
          icon={<User size={20} color="#3B82F6" />}
          title="Personal Information"
          subtitle="Update your details"
          color="#EFF6FF"
          onPress={() => navigation.navigate("EditProfile", { userData })}
        />
        <MenuItem 
          icon={<Bell size={20} color="#8B5CF6" />}
          title="Notifications"
          subtitle="Manage notification preferences"
          color="#F5F3FF"
        />
        <MenuItem 
          icon={<Globe size={20} color="#10B981" />}
          title="Language"
          subtitle="English, اردو, ਪੰਜਾਬੀ"
          color="#ECFDF5"
        />
      </ScrollView>
    </View>
  );
};