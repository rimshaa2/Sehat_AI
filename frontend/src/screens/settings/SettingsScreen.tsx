import React, { useEffect, useState } from "react";
import { clearPushToken } from '../../hooks/usePushNotifications';

import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { Bell, Globe, LogOut } from "lucide-react-native";
import auth from "@react-native-firebase/auth";
import BottomNavBar from "../../components/BottomNavBar";
import { getUserProfile, updateUserProfile } from "../../services/api";

export default function SettingsScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [preferredLanguage, setPreferredLanguage] = useState<"en" | "ur" | "pa">(
    "en",
  );

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const user = auth().currentUser;
        if (!user) return;
        const profile = await getUserProfile(user.uid);
        setNotificationsEnabled(
          profile?.notificationsEnabled !== undefined
            ? Boolean(profile.notificationsEnabled)
            : true,
        );
        setPreferredLanguage(profile?.preferredLanguage || "en");
      } catch (error) {
        console.warn("Settings load failed:", error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const saveSettings = async (next: {
    notificationsEnabled?: boolean;
    preferredLanguage?: "en" | "ur" | "pa";
  }) => {
    const user = auth().currentUser;
    if (!user) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, next);
    } catch (error) {
      Alert.alert("Error", "Could not save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };


  const signOut = async () => {
  try {
    await clearPushToken().catch(() => {});
    await auth().signOut();
    navigation.reset({ index: 0, routes: [{ name: "Welcome" }] });
  } catch (e) {
    Alert.alert("Error", "Could not sign out. Try again.");
  }
};

  const Row = ({
    icon,
    title,
    subtitle,
    onPress,
  }: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        marginBottom: 10,
      }}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          backgroundColor: "#F3F4F6",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: "800", color: "#111827" }}>
          {title}
        </Text>
        <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
          {subtitle}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 }}>
        <Text style={{ fontSize: 20, fontWeight: "800", color: "#1C2A3A" }}>
          Settings
        </Text>
        <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>
          Preferences and account
        </Text>
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: 120 }}>
        {loading ? (
          <ActivityIndicator size="large" color="#199A8E" style={{ marginTop: 40 }} />
        ) : (
          <>
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: 16,
                padding: 14,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                marginBottom: 10,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 14,
                  backgroundColor: "#F3F4F6",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bell size={20} color="#8B5CF6" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: "800", color: "#111827" }}>
                  Notifications
                </Text>
                <Text style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}>
                  Appointment and medicine reminders
                </Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={(value) => {
                  setNotificationsEnabled(value);
                  saveSettings({ notificationsEnabled: value });
                }}
                thumbColor="#FFFFFF"
                trackColor={{ false: "#D1D5DB", true: "#34D399" }}
              />
            </View>

            <Row
              icon={<Globe size={20} color="#10B981" />}
              title="Language"
              subtitle={
                preferredLanguage === "en"
                  ? "English"
                  : preferredLanguage === "ur"
                    ? "اردو"
                    : "Punjabi"
              }
            />
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
              {[
                { key: "en", label: "English" },
                { key: "ur", label: "اردو" },
                { key: "pa", label: "Punjabi" },
              ].map((lang) => (
                <TouchableOpacity
                  key={lang.key}
                  onPress={() => {
                    const value = lang.key as "en" | "ur" | "pa";
                    setPreferredLanguage(value);
                    saveSettings({ preferredLanguage: value });
                  }}
                  style={{
                    flex: 1,
                    borderRadius: 10,
                    paddingVertical: 10,
                    alignItems: "center",
                    backgroundColor:
                      preferredLanguage === lang.key ? "#199A8E" : "#F3F4F6",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: preferredLanguage === lang.key ? "#FFFFFF" : "#374151",
                    }}
                  >
                    {lang.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <TouchableOpacity
          onPress={signOut}
          style={{
            marginTop: 10,
            backgroundColor: "#111827",
            borderRadius: 14,
            paddingVertical: 14,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <LogOut size={18} color="#FFFFFF" />
          <Text style={{ color: "#FFFFFF", fontWeight: "800" }}>
            {saving ? "Saving..." : "Sign out"}
          </Text>
        </TouchableOpacity>
      </View>

      <BottomNavBar navigation={navigation} />
    </SafeAreaView>
  );
}

