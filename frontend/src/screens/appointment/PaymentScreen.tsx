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
  Modal,
  Linking,
  TextInput,
  StyleSheet,
} from "react-native";
import {
  ChevronLeft,
  Star,
  MapPin,
  Calendar,
  PenTool,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle,
  Shield,
} from "lucide-react-native";
import auth from "@react-native-firebase/auth";
import * as ImagePicker from "expo-image-picker";
import { bookAppointment as apiBookAppointment, getUserProfile } from "../../services/api";

// ── Payment methods ───────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: "cash",      label: "Cash on Visit",        desc: "Pay at the clinic",              icon: "cash"   },
  { id: "bank",      label: "Bank Transfer",        desc: "Upload payment receipt",         icon: "card"   },
];

export default ({ navigation, route = { params: {} } }: any) => {
  const { doctor, date, time, reason } = route.params || {};

  const [isLoading,      setIsLoading]      = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("cash");
  const [receiptBase64,  setReceiptBase64]  = useState("");

  const consultationFee = doctor?.priceValue || 2500;
  const adminFee        = 100;
  const total           = consultationFee + adminFee;

  const generateOrderId = () =>
    `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // ── Icon component ────────────────────────────────────────────────────────
  const PaymentIcon = ({ type }: { type: string }) => {
    if (type === "cash")   return <Banknote    size={22} color="#199A8E" />;
    if (type === "card")   return <CreditCard  size={22} color="#199A8E" />;
    return                        <Smartphone  size={22} color="#199A8E" />;
  };

  // ── Core booking — uses exported service fn (correct /api/ prefix) ────────
  const submitBooking = async (paymentStatus: "pending" | "completed") => {
    const currentUser = auth().currentUser;
    if (!currentUser) throw new Error("You must be logged in to book.");

    const userProfile = await getUserProfile(currentUser.uid);
    if (!userProfile?.id) throw new Error("Could not find user profile.");

    const payload = {
      patientId:       userProfile.id,
      doctorId:        doctor.id,
      appointmentDate: date,
      timeSlot:        time,
      reason:          reason,
      amount:          total,
      paymentMethod:   selectedMethod,
      paymentStatus:   paymentStatus,
      receiptImage:    receiptBase64 || undefined,
    };

    console.log("🚀 Booking Payload:", payload);
    const result = await apiBookAppointment(payload);
    if (!result.success) throw new Error(result.error || "Booking failed.");
    return result;
  };

  // ── CASH — confirm immediately, no payment ────────────────────────────────
  const handleCash = async () => {
    setIsLoading(true);
    try {
      await submitBooking("pending");
      navigation.replace("BookingSuccess", { doctor, date, time, paymentMethod: "cash" });
    } catch (err: any) {
      Alert.alert("Booking Failed", err.response?.data?.error || err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── BANK — upload receipt and book ──────────────────────────────────────────
  const handleBank = async () => {
    if (!receiptBase64) {
      Alert.alert("Receipt Required", "Please upload the payment receipt to proceed.");
      return;
    }
    setIsLoading(true);
    try {
      await submitBooking("pending");
      navigation.replace("BookingSuccess", { doctor, date, time, paymentMethod: "bank" });
    } catch (err: any) {
      Alert.alert("Booking Failed", err.response?.data?.error || err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePickReceipt = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "Permission to access camera roll is required!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setReceiptBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  // ── Main confirm handler ──────────────────────────────────────────────────
  const handleConfirm = () => {
    if (selectedMethod === "cash") return handleCash();
    if (selectedMethod === "bank") return handleBank();
  };

  const confirmLabel = () => {
    if (selectedMethod === "cash") return "Confirm Booking";
    if (selectedMethod === "bank") return "Confirm & Upload";
    return "Confirm";
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Loading overlay */}
      {isLoading && (
        <Modal visible transparent animationType="fade">
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#199A8E" />
              <Text style={styles.loadingText}>Confirming your appointment...</Text>
            </View>
          </View>
        </Modal>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ChevronLeft color="#1C2A3A" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <Shield size={20} color="#199A8E" />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Doctor Card */}
        <View style={styles.doctorCard}>
          <Image
            source={{ uri: doctor?.image || "https://via.placeholder.com/150" }}
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

        {/* Appointment Details */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <View style={styles.iconCircle}><Calendar size={18} color="#199A8E" /></View>
            <View>
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailValue}>{date} | {time}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.changeBtn}>
              <Text style={styles.changeLink}>Change</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.detailRow, { marginTop: 12 }]}>
            <View style={styles.iconCircle}><PenTool size={18} color="#199A8E" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Reason</Text>
              <Text style={styles.detailValue} numberOfLines={2}>{reason || "General Consultation"}</Text>
            </View>
          </View>
        </View>

        {/* Payment Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>
          <View style={styles.breakdownCard}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Consultation Fee</Text>
              <Text style={styles.paymentValue}>Rs. {consultationFee}</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Platform Fee</Text>
              <Text style={styles.paymentValue}>Rs. {adminFee}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.paymentRow}>
              <Text style={[styles.paymentLabel, { fontWeight: "700", color: "#1C2A3A" }]}>Total</Text>
              <Text style={styles.totalValue}>Rs. {total}</Text>
            </View>
          </View>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[styles.methodCard, selectedMethod === method.id && styles.methodCardActive]}
              onPress={() => { setSelectedMethod(method.id); setReceiptBase64(""); }}
            >
              <PaymentIcon type={method.icon} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.methodLabel}>{method.label}</Text>
                <Text style={styles.methodDesc}>{method.desc}</Text>
              </View>
              {selectedMethod === method.id && (
                <CheckCircle size={20} color="#199A8E" fill="#199A8E" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Bank details and receipt upload */}
        {selectedMethod === "bank" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bank Details</Text>
            <View style={styles.walletCard}>
              <Text style={{ fontSize: 13, color: "#4B5563", marginBottom: 4 }}>Bank Name: <Text style={{ fontWeight: "700" }}>Meezan Bank</Text></Text>
              <Text style={{ fontSize: 13, color: "#4B5563", marginBottom: 4 }}>Account Title: <Text style={{ fontWeight: "700" }}>Sehat AI</Text></Text>
              <Text style={{ fontSize: 13, color: "#4B5563", marginBottom: 16 }}>Account No: <Text style={{ fontWeight: "700" }}>0123456789</Text></Text>

              <Text style={styles.inputLabel}>Upload Receipt</Text>
              <TouchableOpacity onPress={handlePickReceipt} style={{ borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, borderStyle: "dashed", overflow: "hidden", backgroundColor: "#FAFAFA" }}>
                {receiptBase64 ? (
                  <Image source={{ uri: receiptBase64 }} style={{ width: '100%', height: 160 }} resizeMode="cover" />
                ) : (
                  <View style={{ padding: 24, alignItems: 'center' }}>
                    <Text style={{ color: "#199A8E", fontWeight: "600" }}>+ Select Image</Text>
                    <Text style={{ color: "#9CA3AF", fontSize: 12, marginTop: 4 }}>JPG, PNG up to 5MB</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Info banners */}
        {selectedMethod === "cash" && (
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>
              💵 Your slot is reserved right away. Pay Rs. {total} at the clinic on the day. Please arrive 10 minutes early.
            </Text>
          </View>
        )}
        {selectedMethod === "bank" && (
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>
              🏦 Transfer the exact amount to the bank account above and upload the receipt to secure your slot.
            </Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerTotalLabel}>Total Amount</Text>
          <Text style={styles.footerTotalPrice}>Rs. {total}</Text>
        </View>
        <TouchableOpacity
          style={[styles.confirmButton, isLoading && { opacity: 0.7 }]}
          onPress={handleConfirm}
          disabled={isLoading}
        >
          {isLoading
            ? <ActivityIndicator color="white" />
            : <Text style={styles.confirmButtonText}>{confirmLabel()}</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: "#F8FAFC" },
  header:          { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  backButton:      { padding: 4 },
  headerTitle:     { fontSize: 18, fontWeight: "700", color: "#1C2A3A" },
  content:         { padding: 16 },
  loadingOverlay:  { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" },
  loadingBox:      { backgroundColor: "white", borderRadius: 16, padding: 32, alignItems: "center", gap: 16 },
  loadingText:     { fontSize: 14, color: "#6B7280" },
  doctorCard:      { flexDirection: "row", backgroundColor: "white", borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2, gap: 12 },
  doctorImage:     { width: 70, height: 70, borderRadius: 14 },
  doctorInfo:      { flex: 1, justifyContent: "center" },
  doctorName:      { fontSize: 15, fontWeight: "700", color: "#1C2A3A" },
  specialty:       { fontSize: 13, color: "#6B7280", marginTop: 2 },
  ratingContainer: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  ratingText:      { fontSize: 12, color: "#199A8E", fontWeight: "600" },
  locationRow:     { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  locationText:    { fontSize: 12, color: "#6B7280" },
  detailsCard:     { backgroundColor: "white", borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
  detailRow:       { flexDirection: "row", alignItems: "center", gap: 12 },
  iconCircle:      { width: 38, height: 38, borderRadius: 10, backgroundColor: "#F0FDF9", alignItems: "center", justifyContent: "center" },
  detailLabel:     { fontSize: 11, color: "#9CA3AF", marginBottom: 2 },
  detailValue:     { fontSize: 13, fontWeight: "600", color: "#1C2A3A" },
  changeBtn:       { marginLeft: "auto" },
  changeLink:      { fontSize: 13, color: "#199A8E", fontWeight: "600" },
  section:         { marginBottom: 12 },
  sectionTitle:    { fontSize: 15, fontWeight: "700", color: "#1C2A3A", marginBottom: 10 },
  breakdownCard:   { backgroundColor: "white", borderRadius: 16, padding: 16, elevation: 2 },
  paymentRow:      { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  paymentLabel:    { fontSize: 14, color: "#6B7280" },
  paymentValue:    { fontSize: 14, color: "#1C2A3A", fontWeight: "500" },
  totalValue:      { fontSize: 16, color: "#199A8E", fontWeight: "800" },
  divider:         { height: 1, backgroundColor: "#F3F4F6", marginVertical: 8 },
  methodCard:      { flexDirection: "row", alignItems: "center", backgroundColor: "white", borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: "#F3F4F6", elevation: 1 },
  methodCardActive:{ borderColor: "#199A8E", backgroundColor: "#F0FDF9" },
  methodLabel:     { fontSize: 14, fontWeight: "600", color: "#1C2A3A" },
  methodDesc:      { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
  walletCard:      { backgroundColor: "white", borderRadius: 16, padding: 16, elevation: 2 },
  inputLabel:      { fontSize: 12, fontWeight: "600", color: "#6B7280", marginBottom: 6 },
  input:           { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#1C2A3A", backgroundColor: "#FAFAFA" },
  walletNote:      { marginTop: 10, backgroundColor: "#FFF8E1", borderRadius: 8, padding: 10 },
  walletNoteText:  { fontSize: 12, color: "#856404", lineHeight: 18 },
  infoBanner:      { backgroundColor: "#F0FDF9", borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#D1FAE5" },
  infoBannerText:  { fontSize: 13, color: "#065F46", lineHeight: 20 },
  footer:          { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, backgroundColor: "white", borderTopWidth: 1, borderTopColor: "#F3F4F6", elevation: 8 },
  footerTotalLabel:{ fontSize: 12, color: "#9CA3AF" },
  footerTotalPrice:{ fontSize: 18, fontWeight: "800", color: "#1C2A3A" },
  confirmButton:   { backgroundColor: "#199A8E", borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14, elevation: 4 },
  confirmButtonText:{ fontSize: 15, fontWeight: "700", color: "white" },
});