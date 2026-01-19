import { FirebaseAuthTypes } from "@react-native-firebase/auth";
export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  PhoneNumber: undefined;
  Otp: { 
    confirmation: FirebaseAuthTypes.ConfirmationResult; 
  };
  Register: undefined;
  Home:undefined;
  BookAppointment:undefined;
  DoctorList: undefined;
  DoctorDetails:undefined;
  Payment:undefined;
  Profile:undefined;
  EditProfile:undefined;
  BookingSuccess:undefined;
  AiAssistant: undefined;
  AppointmentDetails:undefined;
  RescheduleAppointment:undefined;
  MedicalRecords: undefined;
}
