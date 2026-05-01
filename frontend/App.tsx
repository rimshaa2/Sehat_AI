
import React, { useRef } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { MedicineProvider } from "./src/context/MedicineContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  const navRef = useRef(null);
  return (
    <MedicineProvider>
      <NavigationContainer ref={navRef}>
        <AppNavigator />
      </NavigationContainer>
    </MedicineProvider>
  );
}