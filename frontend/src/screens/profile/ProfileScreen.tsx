import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
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
  ChevronRight,
  LogOut,
  MessageCircle,
  Heart,
} from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getAuth, signOut } from "@react-native-firebase/auth";
import { getUserProfile, getMyAppointments, fetchMedicalRecords } from "../../services/api";
import styles from "./styles/ProfileScreenStyles";

export default ({ navigation }: any) => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [recordCount, setRecordCount] = useState(0);

  const auth = getAuth();

  // ─── Fetch everything from Railway backend ───
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchProfile = async () => {
        setLoading(true);
        try {
          const currentUser = auth.currentUser;
          if (!currentUser) { if (isActive) setLoading(false); return; }

          const profile = await getUserProfile(currentUser.uid);
          if (!isActive || !profile) return;

          setUserData(profile);

          const [appointments, records] = await Promise.all([
            getMyAppointments(profile.id, "patient").catch(() => []),
            fetchMedicalRecords(profile.id).catch(() => []),
          ]);

          if (isActive) {
            setAppointmentCount(Array.isArray(appointments) ? appointments.length : 0);
            setRecordCount(Array.isArray(records) ? records.length : 0);
          }
        } catch (error) {
          console.error("Profile fetch error:", error);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      fetchProfile();
      return () => { isActive = false; };
    }, [])
  );

  // ─── Sign-out ───
  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
            navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
          } catch (e) {
            Alert.alert("Error", "Could not sign out. Please try again.");
          }
        },
      },
    ]);
  };

  const fmtDate = (d: string) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  };

  // ─── Loading state ───
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F1F5F9" }}>
        <ActivityIndicator size="large" color="#199A8E" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.headerBg}>
        <View style={styles.navRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <ChevronLeft color="#FFF" size={20} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* ── Profile Card ── */}
        <View style={styles.profileCardWrapper}>
          <View style={styles.profileCard}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => navigation.navigate("EditProfile", { userData })}
              activeOpacity={0.7}
            >
              <Edit2 size={15} color="#64748B" />
            </TouchableOpacity>

            <View style={styles.avatarRing}>
              <View style={styles.avatarInner}>
                <User size={32} color="#199A8E" />
              </View>
            </View>

            <Text style={styles.userName}>{userData?.fullName || "Guest User"}</Text>
            <Text style={styles.userEmail}>{userData?.email || "No email"}</Text>
            <Text style={styles.userPhone}>{userData?.phoneNumber || "No phone added"}</Text>

            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{userData?.role || "patient"}</Text>
            </View>

            {userData?.createdAt && (
              <Text style={styles.memberSince}>Member since {fmtDate(userData.createdAt)}</Text>
            )}
          </View>
        </View>

        {/* ── Stats Strip ── */}
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate("MyAppointments")}>
            <View style={[styles.statIconWrap, { backgroundColor: "#EEF2FF" }]}>
              <Calendar size={20} color="#6366F1" />
            </View>
            <Text style={styles.statNumber}>{appointmentCount}</Text>
            <Text style={styles.statLabel}>Appointments</Text>
          </TouchableOpacity>

          <View style={styles.statDivider} />

          <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate("MedicalRecords")}>
            <View style={[styles.statIconWrap, { backgroundColor: "#FEF3C7" }]}>
              <FileText size={20} color="#F59E0B" />
            </View>
            <Text style={styles.statNumber}>{recordCount}</Text>
            <Text style={styles.statLabel}>Records</Text>
          </TouchableOpacity>

          <View style={styles.statDivider} />

          <TouchableOpacity style={styles.statItem} onPress={() => navigation.navigate("MedicineDashboard")}>
            <View style={[styles.statIconWrap, { backgroundColor: "#FEE2E2" }]}>
              <Pill size={20} color="#EF4444" />
            </View>
            <Text style={styles.statNumber}>—</Text>
            <Text style={styles.statLabel}>Medicines</Text>
          </TouchableOpacity>
        </View>

        {/* ── Quick Actions ── */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickGrid}>
          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate("BookAppointment")}>
            <View style={[styles.quickIconWrap, { backgroundColor: "#EEF2FF" }]}>
              <Calendar size={18} color="#6366F1" />
            </View>
            <View style={styles.quickTextWrap}>
              <Text style={styles.quickBtnTitle}>Book Appointment</Text>
              <Text style={styles.quickBtnSub}>Find a doctor</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate("AiAssistant")}>
            <View style={[styles.quickIconWrap, { backgroundColor: "#ECFDF5" }]}>
              <MessageCircle size={18} color="#10B981" />
            </View>
            <View style={styles.quickTextWrap}>
              <Text style={styles.quickBtnTitle}>AI Assistant</Text>
              <Text style={styles.quickBtnSub}>Check symptoms</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate("MedicalRecords")}>
            <View style={[styles.quickIconWrap, { backgroundColor: "#FEF3C7" }]}>
              <FileText size={18} color="#F59E0B" />
            </View>
            <View style={styles.quickTextWrap}>
              <Text style={styles.quickBtnTitle}>Medical Records</Text>
              <Text style={styles.quickBtnSub}>View history</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickBtn} onPress={() => navigation.navigate("MentalHealth")}>
            <View style={[styles.quickIconWrap, { backgroundColor: "#FCE7F3" }]}>
              <Heart size={18} color="#EC4899" />
            </View>
            <View style={styles.quickTextWrap}>
              <Text style={styles.quickBtnTitle}>Mental Wellness</Text>
              <Text style={styles.quickBtnSub}>Self-care tools</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Settings Menu ── */}
        <Text style={styles.sectionTitle}>Settings</Text>
        <View style={styles.menuSection}>
          <View style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("EditProfile", { userData })}>
              <View style={[styles.menuIconBox, { backgroundColor: "#EFF6FF" }]}>
                <User size={17} color="#3B82F6" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Personal Information</Text>
                <Text style={styles.menuSubtitle}>Update your details</Text>
              </View>
              <ChevronRight size={16} color="#CBD5E1" />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("MyAppointments")}>
              <View style={[styles.menuIconBox, { backgroundColor: "#EEF2FF" }]}>
                <Calendar size={17} color="#6366F1" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>My Appointments</Text>
                <Text style={styles.menuSubtitle}>{appointmentCount} total appointments</Text>
              </View>
              <ChevronRight size={16} color="#CBD5E1" />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => Alert.alert("Coming Soon", "Notification preferences will be available soon!")}
            >
              <View style={[styles.menuIconBox, { backgroundColor: "#F5F3FF" }]}>
                <Bell size={17} color="#8B5CF6" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Notifications</Text>
                <Text style={styles.menuSubtitle}>Manage preferences</Text>
              </View>
              <ChevronRight size={16} color="#CBD5E1" />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => Alert.alert("Coming Soon", "Language settings will be available soon!")}
            >
              <View style={[styles.menuIconBox, { backgroundColor: "#ECFDF5" }]}>
                <Globe size={17} color="#10B981" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Language</Text>
                <Text style={styles.menuSubtitle}>English, اردو, ਪੰਜਾਬੀ</Text>
              </View>
              <ChevronRight size={16} color="#CBD5E1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Sign Out ── */}
        <View style={styles.signOutSection}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} activeOpacity={0.7}>
            <LogOut size={18} color="#EF4444" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};