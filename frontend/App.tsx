
import React, { useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { MedicineProvider } from "./src/context/MedicineContext";
import AppNavigator from "./src/navigation/AppNavigator";
import usePushNotifications from "./src/hooks/usePushNotifications";

export default function App() {
  const navRef = useRef(null);
  
  // Initialize push notifications on app startup
  usePushNotifications();
  return (
    <MedicineProvider>
      <NavigationContainer ref={navRef}>
        <AppNavigator />
      </NavigationContainer>
    </MedicineProvider>
  );
}