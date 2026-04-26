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
  TextInput,
  StyleSheet,
  Modal,
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
  Lock,
} from "lucide-react-native";
import { getAuth } from "@react-native-firebase/auth";
import api, { getUserProfile } from "../../services/api";

// ── Payment Methods ────────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  {
    id: "cash",
    label: "Cash on Visit",
    desc: "Pay at the clinic",
    icon: "cash",
  },
  {
    id: "card",
    label: "Credit / Debit Card",
    desc: "Visa, Mastercard, UnionPay",
    icon: "card",
  },
  {
    id: "easypaisa",
    label: "EasyPaisa",
    desc: "Pay via mobile wallet",
    icon: "mobile",
  },
  {
    id: "jazzcash",
    label: "JazzCash",
    desc: "Pay via mobile wallet",
    icon: "mobile",
  },
];

// ── Payment Gateway Service ──────────────────────────────────────────────────
// This handles payment processing BEFORE booking the appointment.
// Replace the simulate* functions with real gateway SDK calls when ready.

const processCardPayment = async (
  amount: number,
  cardNumber: string,
  cardName: string,
  cardExpiry: string,
  cardCVV: string
): Promise<{ success: boolean; transactionId: string; error?: string }> => {
  try {
    // ── OPTION A: Use your own backend to charge via Stripe/HBL/Meezan ──────
    // const response = await api.post("/payments/charge-card", {
    //   amount,
    //   cardNumber: cardNumber.replace(/\s/g, ""),
    //   cardName,
    //   cardExpiry,
    //   cardCVV,
    // });
    // return { success: true, transactionId: response.data.transactionId };

    // ── OPTION B: Stripe React Native SDK ───────────────────────────────────
    // import { useStripe } from "@stripe/stripe-react-native";
    // const { confirmPayment } = useStripe();
    // const clientSecret = await api.post("/payments/create-intent", { amount });
    // const { error, paymentIntent } = await confirmPayment(clientSecret, { ... });

    // ── SIMULATION (remove when real gateway is integrated) ──────────────────
    await new Promise((r) => setTimeout(r, 2000));
    const mockDeclined = cardNumber.replace(/\s/g, "").startsWith("0000");
    if (mockDeclined) {
      return { success: false, transactionId: "", error: "Card was declined." };
    }
    return {
      success: true,
      transactionId: "TXN-CARD-" + Date.now(),
    };
  } catch (err: any) {
    return {
      success: false,
      transactionId: "",
      error: err.response?.data?.error || "Card payment failed.",
    };
  }
};

const processMobileWalletPayment = async (
  provider: "easypaisa" | "jazzcash",
  amount: number,
  mobileNumber: string
): Promise<{ success: boolean; transactionId: string; error?: string }> => {
  try {
    // ── OPTION A: Use your own backend to initiate wallet payment ────────────
    // const response = await api.post("/payments/mobile-wallet", {
    //   provider,       // "easypaisa" | "jazzcash"
    //   amount,
    //   mobileNumber,
    // });
    // The backend sends an OTP/push to the user's phone. Poll or webhook for confirmation.
    // return { success: true, transactionId: response.data.transactionId };

    // ── OPTION B: JazzCash REST API (direct) ─────────────────────────────────
    // Requires merchant credentials from JazzCash/EasyPaisa.
    // Call their sandbox API for testing: https://sandbox.jazzcash.com.pk/

    // ── SIMULATION (remove when real gateway is integrated) ──────────────────
    await new Promise((r) => setTimeout(r, 2500));
    return {
      success: true,
      transactionId: `TXN-${provider.toUpperCase()}-` + Date.now(),
    };
  } catch (err: any) {
    return {
      success: false,
      transactionId: "",
      error: err.response?.data?.error || `${provider} payment failed.`,
    };
  }
};

// ── OTP / PIN Confirmation Modal ─────────────────────────────────────────────
const OTPModal = ({
  visible,
  provider,
  mobileNumber,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  provider: string;
  mobileNumber: string;
  onConfirm: (otp: string) => void;
  onCancel: () => void;
}) => {
  const [otp, setOtp] = useState("");
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <Smartphone size={36} color="#199A8E" style={{ alignSelf: "center", marginBottom: 12 }} />
          <Text style={modalStyles.title}>Confirm Payment</Text>
          <Text style={modalStyles.subtitle}>
            A confirmation code was sent to {"\n"}
            <Text style={{ fontWeight: "700" }}>0{mobileNumber.slice(1)}</Text>{" "}
            via {provider === "easypaisa" ? "EasyPaisa" : "JazzCash"}
          </Text>
          <TextInput
            style={modalStyles.otpInput}
            placeholder="Enter 6-digit OTP"
            placeholderTextColor="#9CA3AF"
            value={otp}
            onChangeText={(t) => setOtp(t.replace(/\D/g, "").slice(0, 6))}
            keyboardType="numeric"
            maxLength={6}
          />
          <TouchableOpacity
            style={[modalStyles.confirmBtn, otp.length < 6 && { opacity: 0.5 }]}
            onPress={() => onConfirm(otp)}
            disabled={otp.length < 6}
          >
            <Text style={modalStyles.confirmBtnText}>Verify & Pay</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onCancel} style={{ marginTop: 12 }}>
            <Text style={{ color: "#6B7280", textAlign: "center" }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ── Processing Modal ──────────────────────────────────────────────────────────
const ProcessingModal = ({ visible, message }: { visible: boolean; message: string }) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={modalStyles.overlay}>
      <View style={[modalStyles.sheet, { alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#199A8E" />
        <Text style={[modalStyles.subtitle, { marginTop: 16, textAlign: "center" }]}>
          {message}
        </Text>
      </View>
    </View>
  </Modal>
);

// ── Main Screen ───────────────────────────────────────────────────────────────
export default ({ navigation, route = { params: {} } }: any) => {
  const { doctor, date, time, reason } = route.params || {};

  const [isLoading, setIsLoading] = useState(false);
  const [processingMessage, setProcessingMessage] = useState("");
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("cash");

  // Card fields
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");

  // Mobile wallet fields
  const [walletNumber, setWalletNumber] = useState("");

  // Fee Calculations
  const consultationFee = doctor?.priceValue || 2500;
  const adminFee = 100;
  const total = consultationFee + adminFee;

  // ── Formatters ──────────────────────────────────────────────────────────────
  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 16);
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(" ") : cleaned;
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, "").slice(0, 4);
    if (cleaned.length >= 2) return cleaned.slice(0, 2) + "/" + cleaned.slice(2);
    return cleaned;
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const validatePayment = (): boolean => {
    if (selectedMethod === "card") {
      if (cardNumber.replace(/\s/g, "").length < 16) {
        Alert.alert("Invalid Card", "Please enter a valid 16-digit card number.");
        return false;
      }
      if (cardName.trim().length < 2) {
        Alert.alert("Invalid Name", "Please enter the cardholder name.");
        return false;
      }
      if (cardExpiry.length < 5) {
        Alert.alert("Invalid Expiry", "Please enter a valid expiry date (MM/YY).");
        return false;
      }
      if (cardCVV.length < 3) {
        Alert.alert("Invalid CVV", "Please enter a valid 3-digit CVV.");
        return false;
      }
    }

    if (selectedMethod === "easypaisa" || selectedMethod === "jazzcash") {
      if (walletNumber.length < 11) {
        Alert.alert("Invalid Number", "Please enter a valid 11-digit mobile number.");
        return false;
      }
    }

    return true;
  };

  // ── Book Appointment (after payment success) ──────────────────────────────
  const bookAppointment = async (transactionId: string) => {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) throw new Error("You must be logged in to book.");

    const userProfile = await getUserProfile(currentUser.uid);
    if (!userProfile?.id) throw new Error("Could not find user profile in database.");

    const payload = {
      patientId: userProfile.id,
      doctorId: doctor.id,
      appointmentDate: date,
      timeSlot: time,
      reason: reason,
      amount: total,
      paymentMethod: selectedMethod,
      transactionId: transactionId, // attach payment proof
      paymentStatus: selectedMethod === "cash" ? "pending" : "paid",
    };

    console.log("🚀 Booking Payload:", payload);

    const response = await api.post("/appointments/book", payload);

    if (!response.data.success) {
      throw new Error(response.data.error || "Booking failed.");
    }
  };

  // ── Main Flow ───────────────────────────────────────────────────────────────
  const handleConfirmBooking = async () => {
    if (!validatePayment()) return;

    // For mobile wallets, show OTP modal first
    if (selectedMethod === "easypaisa" || selectedMethod === "jazzcash") {
      setShowOTPModal(true);
      return;
    }

    await runPaymentAndBook();
  };

  const runPaymentAndBook = async (otp?: string) => {
    setIsLoading(true);
    try {
      let transactionId = "CASH-" + Date.now();

      // ── Step 1: Process Payment ────────────────────────────────────────────
      if (selectedMethod === "card") {
        setProcessingMessage("Processing your card payment...");
        const result = await processCardPayment(
          total,
          cardNumber,
          cardName,
          cardExpiry,
          cardCVV
        );
        if (!result.success) {
          Alert.alert("Payment Failed", result.error || "Card was declined.");
          return;
        }
        transactionId = result.transactionId;
      }

      if (selectedMethod === "easypaisa" || selectedMethod === "jazzcash") {
        setProcessingMessage("Verifying wallet payment...");
        const result = await processMobileWalletPayment(
          selectedMethod as "easypaisa" | "jazzcash",
          total,
          walletNumber
        );
        if (!result.success) {
          Alert.alert("Payment Failed", result.error || "Wallet payment failed.");
          return;
        }
        transactionId = result.transactionId;
      }

      // ── Step 2: Book Appointment ───────────────────────────────────────────
      setProcessingMessage("Confirming your appointment...");
      await bookAppointment(transactionId);

      // ── Step 3: Navigate to Success ────────────────────────────────────────
      navigation.replace("BookingSuccess", {
        doctor,
        date,
        time,
        transactionId,
        paymentMethod: selectedMethod,
      });
    } catch (error: any) {
      console.error("Booking Error:", error);
      Alert.alert(
        "Booking Failed",
        error.response?.data?.error || error.message || "Something went wrong."
      );
    } finally {
      setIsLoading(false);
      setProcessingMessage("");
    }
  };

  const handleOTPConfirm = async (otp: string) => {
    setShowOTPModal(false);
    // OTP is verified by your backend during processMobileWalletPayment
    // Pass it along if your API requires it
    await runPaymentAndBook(otp);
  };

  // ── Icons ──────────────────────────────────────────────────────────────────
  const PaymentIcon = ({ type }: { type: string }) => {
    if (type === "cash") return <Banknote size={22} color="#199A8E" />;
    if (type === "card") return <CreditCard size={22} color="#199A8E" />;
    return <Smartphone size={22} color="#199A8E" />;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Modals */}
      <ProcessingModal visible={isLoading} message={processingMessage} />
      <OTPModal
        visible={showOTPModal}
        provider={selectedMethod}
        mobileNumber={walletNumber}
        onConfirm={handleOTPConfirm}
        onCancel={() => setShowOTPModal(false)}
      />

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
            <View style={styles.iconCircle}>
              <Calendar size={18} color="#199A8E" />
            </View>
            <View>
              <Text style={styles.detailLabel}>Date & Time</Text>
              <Text style={styles.detailValue}>{date} | {time}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.changeBtn}>
              <Text style={styles.changeLink}>Change</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.detailRow, { marginTop: 12 }]}>
            <View style={styles.iconCircle}>
              <PenTool size={18} color="#199A8E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Reason</Text>
              <Text style={styles.detailValue} numberOfLines={2}>
                {reason || "General Consultation"}
              </Text>
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
              <Text style={[styles.paymentLabel, { fontWeight: "700", color: "#1C2A3A" }]}>
                Total
              </Text>
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
              style={[
                styles.methodCard,
                selectedMethod === method.id && styles.methodCardActive,
              ]}
              onPress={() => setSelectedMethod(method.id)}
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

        {/* Card Details Form */}
        {selectedMethod === "card" && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Card Details</Text>
            <View style={styles.formCard}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor="#9CA3AF"
                value={cardNumber}
                onChangeText={(t) => setCardNumber(formatCardNumber(t))}
                keyboardType="numeric"
                maxLength={19}
              />

              <Text style={styles.inputLabel}>Cardholder Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Name on card"
                placeholderTextColor="#9CA3AF"
                value={cardName}
                onChangeText={setCardName}
                autoCapitalize="words"
              />

              <View style={styles.cardRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.inputLabel}>Expiry Date</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="MM/YY"
                    placeholderTextColor="#9CA3AF"
                    value={cardExpiry}
                    onChangeText={(t) => setCardExpiry(formatExpiry(t))}
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>CVV</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="123"
                    placeholderTextColor="#9CA3AF"
                    value={cardCVV}
                    onChangeText={(t) => setCardCVV(t.replace(/\D/g, "").slice(0, 3))}
                    keyboardType="numeric"
                    maxLength={3}
                    secureTextEntry
                  />
                </View>
              </View>

              <View style={styles.secureNote}>
                <Lock size={12} color="#199A8E" />
                <Text style={styles.secureText}>
                  Your payment info is encrypted and secure
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Mobile Wallet Form */}
        {(selectedMethod === "easypaisa" || selectedMethod === "jazzcash") && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {selectedMethod === "easypaisa" ? "EasyPaisa" : "JazzCash"} Details
            </Text>
            <View style={styles.formCard}>
              <Text style={styles.inputLabel}>Registered Mobile Number</Text>
              <TextInput
                style={styles.input}
                placeholder="03XXXXXXXXX"
                placeholderTextColor="#9CA3AF"
                value={walletNumber}
                onChangeText={(t) => setWalletNumber(t.replace(/\D/g, "").slice(0, 11))}
                keyboardType="numeric"
                maxLength={11}
              />
              <View style={styles.walletNote}>
                <Text style={styles.walletNoteText}>
                  📲 You will receive a confirmation OTP on this number. Enter it
                  on the next screen to complete payment of Rs. {total}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Cash Note */}
        {selectedMethod === "cash" && (
          <View style={styles.cashNote}>
            <Text style={styles.cashNoteText}>
              💵 You will pay Rs. {total} directly at the clinic on the day of
              your appointment. Please arrive 10 minutes early.
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
          onPress={handleConfirmBooking}
          disabled={isLoading}
        >
          <Text style={styles.confirmButtonText}>
            {selectedMethod === "cash" ? "Confirm Booking" : "Pay Now"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ── Modal Styles ──────────────────────────────────────────────────────────────
const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 28,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1C2A3A",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 20,
  },
  otpInput: {
    borderWidth: 2,
    borderColor: "#199A8E",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 24,
    fontWeight: "700",
    color: "#1C2A3A",
    textAlign: "center",
    letterSpacing: 8,
    marginBottom: 20,
  },
  confirmBtn: {
    backgroundColor: "#199A8E",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
  },
  confirmBtnText: { fontSize: 16, fontWeight: "700", color: "white" },
});

// ── Screen Styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#1C2A3A" },

  content: { padding: 16 },

  doctorCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    gap: 12,
  },
  doctorImage: { width: 70, height: 70, borderRadius: 14 },
  doctorInfo: { flex: 1, justifyContent: "center" },
  doctorName: { fontSize: 15, fontWeight: "700", color: "#1C2A3A" },
  specialty: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  ratingContainer: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  ratingText: { fontSize: 12, color: "#199A8E", fontWeight: "600" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  locationText: { fontSize: 12, color: "#6B7280" },

  detailsCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#F0FDF9",
    alignItems: "center",
    justifyContent: "center",
  },
  detailLabel: { fontSize: 11, color: "#9CA3AF", marginBottom: 2 },
  detailValue: { fontSize: 13, fontWeight: "600", color: "#1C2A3A" },
  changeBtn: { marginLeft: "auto" },
  changeLink: { fontSize: 13, color: "#199A8E", fontWeight: "600" },

  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: "#1C2A3A", marginBottom: 10 },

  breakdownCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  paymentRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  paymentLabel: { fontSize: 14, color: "#6B7280" },
  paymentValue: { fontSize: 14, color: "#1C2A3A", fontWeight: "500" },
  totalValue: { fontSize: 16, color: "#199A8E", fontWeight: "800" },
  divider: { height: 1, backgroundColor: "#F3F4F6", marginVertical: 8 },

  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: "#F3F4F6",
    elevation: 1,
  },
  methodCardActive: { borderColor: "#199A8E", backgroundColor: "#F0FDF9" },
  methodLabel: { fontSize: 14, fontWeight: "600", color: "#1C2A3A" },
  methodDesc: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },

  formCard: { backgroundColor: "white", borderRadius: 16, padding: 16, elevation: 2 },
  inputLabel: { fontSize: 12, fontWeight: "600", color: "#6B7280", marginBottom: 6, marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: "#1C2A3A",
    backgroundColor: "#FAFAFA",
  },
  cardRow: { flexDirection: "row" },
  secureNote: {
    marginTop: 14,
    backgroundColor: "#F0FDF9",
    borderRadius: 8,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    justifyContent: "center",
  },
  secureText: { fontSize: 12, color: "#199A8E" },

  walletNote: { marginTop: 12, backgroundColor: "#FFF8E1", borderRadius: 8, padding: 10 },
  walletNoteText: { fontSize: 12, color: "#856404", lineHeight: 18 },

  cashNote: {
    backgroundColor: "#F0FDF9",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cashNoteText: { fontSize: 13, color: "#065F46", lineHeight: 20 },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    elevation: 8,
  },
  footerTotalLabel: { fontSize: 12, color: "#9CA3AF" },
  footerTotalPrice: { fontSize: 18, fontWeight: "800", color: "#1C2A3A" },
  confirmButton: {
    backgroundColor: "#199A8E",
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 14,
    elevation: 4,
  },
  confirmButtonText: { fontSize: 15, fontWeight: "700", color: "white" },
});