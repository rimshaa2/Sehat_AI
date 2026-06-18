/**
 * PaymentMethodScreen.tsx
 *
 * Kept for backwards-compatibility. Immediately forwards to the full
 * PaymentScreen with ALL required params intact.
 */
import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";

export default function PaymentMethodScreen({ navigation, route }: any) {
  const { doctor, date, time, reason } = route?.params || {};

  useEffect(() => {
    navigation.replace("Payment", { doctor, date, time, reason });
  }, []);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAFC" }}>
      <ActivityIndicator size="large" color="#199A8E" />
    </View>
  );
}