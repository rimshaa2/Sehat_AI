// frontend/src/navigation/types.ts
// ─── Navigation param types ───────────────────────────────────────────────────
// CHANGE: Added  LiveChat  to AuthStackParamList

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
  ForgotPassword: undefined;

  // Dashboard
  Home: undefined;
  Appointments: undefined;
  Settings: undefined;

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
  Payment: {
    doctor: {
      id: number | string;
      name: string;
      specialty: string;
      image?: string;
      rating?: number;
      priceValue?: number;
    };
    date: string;
    time: string;
    reason: string;
  };
  PaymentMethod: { selectedMethod?: string } | undefined;
  BookingSuccess: {
    doctor: { name: string; specialty: string; image?: string };
    date: string;
    time: string;
  };
  AppointmentDetails: undefined;
  RescheduleAppointment: undefined;

  // ── NEW: Live Chat with Doctor (Mockup M13) ─────────────────────────────────
  LiveChat: {
    appointmentId: string;
    doctorName: string;
    doctorSpecialty: string;
    doctorImage?: string;
  };

  // Profile
  Profile: undefined;
  EditProfile: undefined;

  // Other
  AiAssistant: undefined;

  MedicalRecords: undefined;
  MedicalRecordDetail: { record: any };
  AddMedicalRecord: { record?: any } | undefined;
  Community: undefined;
  HealthArticles: undefined;

  // Emergency Alert
  Emergency: undefined;

  // Notifications
  Notifications: undefined;

  // Medicine Tracker
  MedicineDashboard: undefined;
  AddMedicine: { editMed?: Medicine };
  MedicineDetail: { medicineId: string | number };
  RefillManager: undefined;
};