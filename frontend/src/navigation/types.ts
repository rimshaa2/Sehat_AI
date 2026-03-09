// ─── src/navigation/types.ts ─────────────────────────────────────────────────

export interface Medicine {
  id: string | number;
  name: string;
  dose: string;
  unit: string;
  freq: string;
  times: string[];
  color: string;
  stock: number;
  durationDays: number;
  note: string;
  notifIds?: string[];
  /** 7-element array, index 0 = Monday … index 6 = Sunday */
  taken: boolean[];
}

export type AuthStackParamList = {
  // Auth
  Welcome: undefined;

  PhoneNumber: undefined;
  Otp: { confirmation: any };
  Register: undefined;
  Login: undefined;

  // Dashboard
  Home: undefined;

  // Mental Health — Core
  MentalHealth: undefined;
  DailyMoment: undefined;
  Breathing: undefined;
  Breathing478: undefined;
  BoxBreathing: undefined;
  CalmingBreath: undefined;
  Meditation: undefined;
  Journal: undefined;
  Talk: undefined;
  CrisisHelp: undefined;

  // Mental Health — Track & Assess
  MoodTracker: undefined;
  SleepTracker: undefined;
  AnxietyQuiz: undefined;
  Affirmations: undefined;

  // Appointments
  BookAppointment: undefined;
  DoctorList: undefined;
  DoctorDetails: undefined;
  Payment: undefined;
  BookingSuccess: undefined;
  AppointmentDetails: undefined;
  RescheduleAppointment: undefined;

  // Profile
  Profile: undefined;
  EditProfile: undefined;

  // Other
  AiAssistant: undefined;
  
  MedicalRecords: undefined;

  // Medicine Tracker
  MedicineDashboard: undefined;
  AddMedicine: { editMed?: Medicine };
  MedicineDetail: { medicineId: string | number };
  RefillManager: undefined;
};