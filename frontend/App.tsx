import { NavigationContainer } from "@react-navigation/native";
import { MedicineProvider } from "./src/context/MedicineContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  return (
  <MedicineProvider>
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  </MedicineProvider>
);
}
