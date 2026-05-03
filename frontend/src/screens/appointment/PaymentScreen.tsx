import React, { useState, useRef } from "react";
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
  TextInput,
  StyleSheet,
} from "react-native";
import { WebView } from "react-native-webview";
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
  X,
  Lock,
} from "lucide-react-native";
import auth from "@react-native-firebase/auth";
import { bookAppointment as apiBookAppointment, getUserProfile } from "../../services/api";

// ── Safepay config ──────────────────────────────────────────────────────────
const SAFEPAY_CLIENT_KEY = "8a840a1acf2d5fee0a0d6cef657c5342358043c424a722456c781c853b1f63f4";
const SAFEPAY_BASE       = "https://api.getsafepay.com";   // swap → https://api.getsafepay.com for prod
const SAFEPAY_SUCCESS_URL = "https://sehatai.app/payment/success";  // deep-link callback
const SAFEPAY_CANCEL_URL  = "https://sehatai.app/payment/cancel";

// ── Payment methods ──────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  { id: "cash",      label: "Cash on Visit",        desc: "Pay at the clinic",             icon: "cash"   },
  { id: "card",      label: "Credit / Debit Card",  desc: "Via Safepay secure checkout",   icon: "card"   },
  { id: "easypaisa", label: "EasyPaisa",             desc: "Pay via mobile wallet",         icon: "mobile" },
  { id: "jazzcash",  label: "JazzCash",              desc: "Pay via mobile wallet",         icon: "mobile" },
];

// ── Safepay API helpers ──────────────────────────────────────────────────────
/**
 * Step 1 — Create a payment token (tracker) on Safepay's servers.
 * POST /order/payments/v4/init
 * Returns { data: { token: "tok_..." } }
 */
const createSafepayToken = async (amountPKR: number, orderId: string): Promise<string> => {
  const body = {
    client: {
      key: SAFEPAY_CLIENT_KEY,
    },
    order: {
      id:           orderId,
      amount:       amountPKR * 100,   // Safepay expects paisa (1 PKR = 100 paisa)
      currency:     "PKR",
    },
  };

  const response = await fetch(`${SAFEPAY_BASE}/order/payments/v4/init`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Safepay token error (${response.status}): ${err}`);
  }

  const data = await response.json();
  const token = data?.data?.token ?? data?.token;
  if (!token) throw new Error("Safepay did not return a payment token.");
  return token;
};

/**
 * Step 2 — Build the hosted checkout URL from the token.
 * Opens inside a WebView so the user never leaves the app.
 */
const buildCheckoutUrl = (token: string, orderId: string): string =>
  `${SAFEPAY_BASE}/checkout/pay?` +
  `token=${token}` +
  `&client_key=${SAFEPAY_CLIENT_KEY}` +
  `&order_id=${orderId}` +
  `&source=mobile` +
  `&success_url=${encodeURIComponent(SAFEPAY_SUCCESS_URL)}` +
  `&cancel_url=${encodeURIComponent(SAFEPAY_CANCEL_URL)}`;

// ── Main Component ───────────────────────────────────────────────────────────
export default ({ navigation, route = { params: {} } }: any) => {
  const { doctor, date, time, reason } = route.params || {};

  const [isLoading,        setIsLoading]        = useState(false);
  const [selectedMethod,   setSelectedMethod]   = useState("cash");
  const [walletNumber,     setWalletNumber]     = useState("");

  // Safepay WebView state
  const [safepayVisible,   setSafepayVisible]   = useState(false);
  const [checkoutUrl,      setCheckoutUrl]      = useState("");
  const [safepayLoading,   setSafepayLoading]   = useState(true);
  const [currentOrderId,   setCurrentOrderId]   = useState("");
  const webViewRef = useRef<any>(null);

  const consultationFee = doctor?.priceValue || 2500;
  const adminFee        = 100;
  const total           = consultationFee + adminFee;

  const generateOrderId = () =>
    `ORD-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;

  // ── Icon component ─────────────────────────────────────────────────────────
  const PaymentIcon = ({ type }: { type: string }) => {
    if (type === "cash")  return <Banknote   size={22} color="#199A8E" />;
    if (type === "card")  return <CreditCard size={22} color="#199A8E" />;
    return                       <Smartphone size={22} color="#199A8E" />;
  };

  // ── Core booking ───────────────────────────────────────────────────────────
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
      reason,
      amount:          total,
      paymentMethod:   selectedMethod,
      paymentStatus,
    };

    const result = await apiBookAppointment(payload);
    if (!result.success) throw new Error(result.error || "Booking failed.");
    return result;
  };

  // ── CASH ───────────────────────────────────────────────────────────────────
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

  // ── WALLET (EasyPaisa / JazzCash) ─────────────────────────────────────────
  const handleWallet = async () => {
    if (walletNumber.length < 11) {
      Alert.alert("Invalid Number", "Please enter a valid 11-digit mobile number.");
      return;
    }
    setIsLoading(true);
    try {
      await submitBooking("completed");
      navigation.replace("BookingSuccess", { doctor, date, time, paymentMethod: selectedMethod });
    } catch (err: any) {
      Alert.alert("Booking Failed", err.response?.data?.error || err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  // ── CARD — Safepay SDK (WebView checkout) ─────────────────────────────────
  const handleCard = async () => {
    setIsLoading(true);
    const orderId = generateOrderId();
    setCurrentOrderId(orderId);

    try {
      // 1. Create payment token on Safepay servers
      const token = await createSafepayToken(total, orderId);

      // 2. Build the hosted checkout URL
      const url = buildCheckoutUrl(token, orderId);
      setCheckoutUrl(url);

      // 3. Open the in-app WebView checkout
      setSafepayLoading(true);
      setSafepayVisible(true);
    } catch (err: any) {
      console.error("Safepay init error:", err);
      Alert.alert(
        "Payment Error",
        err.message?.includes("token")
          ? "Could not reach Safepay. Check your internet connection and try again."
          : err.message || "Could not start payment. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Called by WebView whenever the URL changes.
   * Safepay redirects to success_url or cancel_url on completion.
   */
  const handleWebViewNavigation = async (navState: { url: string }) => {
    const { url } = navState;

    // ── Payment SUCCESS ──────────────────────────────────────────────────────
    if (url.startsWith(SAFEPAY_SUCCESS_URL)) {
      setSafepayVisible(false);
      setIsLoading(true);
      try {
        await submitBooking("completed");
        navigation.replace("BookingSuccess", { doctor, date, time, paymentMethod: "card" });
      } catch (err: any) {
        Alert.alert("Booking Failed", err.response?.data?.error || err.message || "Payment succeeded but booking failed. Contact support.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // ── Payment CANCELLED ────────────────────────────────────────────────────
    if (url.startsWith(SAFEPAY_CANCEL_URL)) {
      setSafepayVisible(false);
      Alert.alert("Payment Cancelled", "Your payment was cancelled. No charge was made.");
    }
  };

  // ── Main handler ──────────────────────────────────────────────────────────
  const handleConfirm = () => {
    if (selectedMethod === "cash")                                       return handleCash();
    if (selectedMethod === "easypaisa" || selectedMethod === "jazzcash") return handleWallet();
    if (selectedMethod === "card")                                       return handleCard();
  };

  const confirmLabel = () => {
    if (selectedMethod === "cash")      return "Confirm Booking";
    if (selectedMethod === "card")      return "Pay with Safepay";
    if (selectedMethod === "easypaisa") return "Confirm EasyPaisa Payment";
    if (selectedMethod === "jazzcash")  return "Confirm JazzCash Payment";
    return "Confirm";
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* ── Global loading overlay ──────────────────────────────────────────── */}
      {isLoading && (
        <Modal visible transparent animationType="fade">
          <View style={styles.loadingOverlay}>
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#199A8E" />
              <Text style={styles.loadingText}>
                {selectedMethod === "card" ? "Connecting to Safepay..." : "Confirming your appointment..."}
              </Text>
            </View>
          </View>
        </Modal>
      )}

      {/* ── Safepay WebView checkout ────────────────────────────────────────── */}
      <Modal visible={safepayVisible} animationType="slide" onRequestClose={() => {
        setSafepayVisible(false);
        Alert.alert("Payment Cancelled", "Your payment was cancelled. No charge was made.");
      }}>
        <SafeAreaView style={styles.webViewContainer}>
          {/* WebView header */}
          <View style={styles.webViewHeader}>
            <TouchableOpacity
              style={styles.webViewClose}
              onPress={() => {
                setSafepayVisible(false);
                Alert.alert("Payment Cancelled", "Your payment was cancelled. No charge was made.");
              }}
            >
              <X size={20} color="#1C2A3A" />
            </TouchableOpacity>
            <View style={styles.webViewTitleRow}>
              <Lock size={14} color="#199A8E" />
              <Text style={styles.webViewTitle}>Safepay Secure Checkout</Text>
            </View>
            <View style={{ width: 36 }} />
          </View>

          {/* Order summary bar */}
          <View style={styles.orderSummaryBar}>
            <Text style={styles.orderSummaryText}>
              Paying Rs. {total} • Order {currentOrderId}
            </Text>
          </View>

          {/* Loading spinner shown while WebView loads */}
          {safepayLoading && (
            <View style={styles.webViewSpinner}>
              <ActivityIndicator size="large" color="#199A8E" />
              <Text style={styles.webViewSpinnerText}>Loading secure payment page...</Text>
            </View>
          )}

          <WebView
            ref={webViewRef}
            source={{ uri: checkoutUrl }}
            style={{ flex: 1, opacity: safepayLoading ? 0 : 1 }}
            onLoadStart={() => setSafepayLoading(true)}
            onLoadEnd={() => setSafepayLoading(false)}
            onNavigationStateChange={handleWebViewNavigation}
            onError={(e) => {
              setSafepayVisible(false);
              Alert.alert("Connection Error", "Could not load the payment page. Please check your internet and try again.");
              console.error("WebView error:", e.nativeEvent);
            }}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState={false}
            mixedContentMode="compatibility"
            thirdPartyCookiesEnabled
          />
        </SafeAreaView>
      </Modal>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
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
          <Image source={{ uri: doctor?.image || "https://via.placeholder.com/150" }} style={styles.doctorImage} />
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
              onPress={() => { setSelectedMethod(method.id); setWalletNumber(""); }}
            >
              <PaymentIcon type={method.icon} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.methodLabel}>{method.label}</Text>
                <Text style={styles.methodDesc}>{method.desc}</Text>
              </View>
              {selectedMethod === method.id && <CheckCircle size={20} color="#199A8E" fill="#199A8E" />}
            </TouchableOpacity>
          ))}
        </View>

        {/* Wallet number input */}
        {(selectedMethod === "easypaisa" || selectedMethod === "jazzcash") && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {selectedMethod === "easypaisa" ? "EasyPaisa" : "JazzCash"} Number
            </Text>
            <View style={styles.walletCard}>
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
                  A confirmation request of Rs. {total} will be sent to this number.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Safepay info banner */}
        {selectedMethod === "card" && (
          <View style={styles.safepayBanner}>
            <View style={styles.safepayBannerRow}>
              <Lock size={14} color="#199A8E" />
              <Text style={styles.safepayBannerTitle}>Secured by Safepay</Text>
            </View>
            <Text style={styles.safepayBannerText}>
              Your card details are encrypted and processed directly by Safepay — Sehat AI never stores card information. Supports Visa, Mastercard, and all major Pakistani bank cards.
            </Text>
          </View>
        )}

        {selectedMethod === "cash" && (
          <View style={styles.infoBanner}>
            <Text style={styles.infoBannerText}>
              💵 Your slot is reserved right away. Pay Rs. {total} at the clinic on the day. Please arrive 10 minutes early.
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
  container:          { flex: 1, backgroundColor: "#F8FAFC" },
  header:             { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  backButton:         { padding: 4 },
  headerTitle:        { fontSize: 18, fontWeight: "700", color: "#1C2A3A" },
  content:            { padding: 16 },
  loadingOverlay:     { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" },
  loadingBox:         { backgroundColor: "white", borderRadius: 16, padding: 32, alignItems: "center", gap: 16 },
  loadingText:        { fontSize: 14, color: "#6B7280" },

  // WebView modal
  webViewContainer:   { flex: 1, backgroundColor: "white" },
  webViewHeader:      { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F3F4F6", backgroundColor: "white" },
  webViewClose:       { width: 36, height: 36, borderRadius: 18, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },
  webViewTitleRow:    { flexDirection: "row", alignItems: "center", gap: 6 },
  webViewTitle:       { fontSize: 14, fontWeight: "700", color: "#1C2A3A" },
  orderSummaryBar:    { backgroundColor: "#F0FDF9", paddingVertical: 8, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#D1FAE5" },
  orderSummaryText:   { fontSize: 12, color: "#065F46", textAlign: "center", fontWeight: "600" },
  webViewSpinner:     { position: "absolute", top: 100, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center", backgroundColor: "white", zIndex: 10, gap: 12 },
  webViewSpinnerText: { fontSize: 14, color: "#6B7280" },

  // Doctor card
  doctorCard:         { flexDirection: "row", backgroundColor: "white", borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2, gap: 12 },
  doctorImage:        { width: 70, height: 70, borderRadius: 14 },
  doctorInfo:         { flex: 1, justifyContent: "center" },
  doctorName:         { fontSize: 15, fontWeight: "700", color: "#1C2A3A" },
  specialty:          { fontSize: 13, color: "#6B7280", marginTop: 2 },
  ratingContainer:    { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  ratingText:         { fontSize: 12, color: "#199A8E", fontWeight: "600" },
  locationRow:        { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  locationText:       { fontSize: 12, color: "#6B7280" },

  // Details
  detailsCard:        { backgroundColor: "white", borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
  detailRow:          { flexDirection: "row", alignItems: "center", gap: 12 },
  iconCircle:         { width: 38, height: 38, borderRadius: 10, backgroundColor: "#F0FDF9", alignItems: "center", justifyContent: "center" },
  detailLabel:        { fontSize: 11, color: "#9CA3AF", marginBottom: 2 },
  detailValue:        { fontSize: 13, fontWeight: "600", color: "#1C2A3A" },
  changeBtn:          { marginLeft: "auto" },
  changeLink:         { fontSize: 13, color: "#199A8E", fontWeight: "600" },

  // Breakdown
  section:            { marginBottom: 12 },
  sectionTitle:       { fontSize: 15, fontWeight: "700", color: "#1C2A3A", marginBottom: 10 },
  breakdownCard:      { backgroundColor: "white", borderRadius: 16, padding: 16, elevation: 2 },
  paymentRow:         { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  paymentLabel:       { fontSize: 14, color: "#6B7280" },
  paymentValue:       { fontSize: 14, color: "#1C2A3A", fontWeight: "500" },
  totalValue:         { fontSize: 16, color: "#199A8E", fontWeight: "800" },
  divider:            { height: 1, backgroundColor: "#F3F4F6", marginVertical: 8 },

  // Methods
  methodCard:         { flexDirection: "row", alignItems: "center", backgroundColor: "white", borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1.5, borderColor: "#F3F4F6", elevation: 1 },
  methodCardActive:   { borderColor: "#199A8E", backgroundColor: "#F0FDF9" },
  methodLabel:        { fontSize: 14, fontWeight: "600", color: "#1C2A3A" },
  methodDesc:         { fontSize: 12, color: "#9CA3AF", marginTop: 2 },

  // Wallet
  walletCard:         { backgroundColor: "white", borderRadius: 16, padding: 16, elevation: 2 },
  inputLabel:         { fontSize: 12, fontWeight: "600", color: "#6B7280", marginBottom: 6 },
  input:              { borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: "#1C2A3A", backgroundColor: "#FAFAFA" },
  walletNote:         { marginTop: 10, backgroundColor: "#FFF8E1", borderRadius: 8, padding: 10 },
  walletNoteText:     { fontSize: 12, color: "#856404", lineHeight: 18 },

  // Banners
  safepayBanner:      { backgroundColor: "#F0FDF9", borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#D1FAE5" },
  safepayBannerRow:   { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  safepayBannerTitle: { fontSize: 13, fontWeight: "700", color: "#065F46" },
  safepayBannerText:  { fontSize: 12, color: "#065F46", lineHeight: 18 },
  infoBanner:         { backgroundColor: "#F0FDF9", borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#D1FAE5" },
  infoBannerText:     { fontSize: 13, color: "#065F46", lineHeight: 20 },

  // Footer
  footer:             { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, backgroundColor: "white", borderTopWidth: 1, borderTopColor: "#F3F4F6", elevation: 8 },
  footerTotalLabel:   { fontSize: 12, color: "#9CA3AF" },
  footerTotalPrice:   { fontSize: 18, fontWeight: "800", color: "#1C2A3A" },
  confirmButton:      { backgroundColor: "#199A8E", borderRadius: 14, paddingHorizontal: 28, paddingVertical: 14, elevation: 4 },
  confirmButtonText:  { fontSize: 15, fontWeight: "700", color: "white" },
});