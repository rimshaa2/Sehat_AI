import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";

// Pages
import { LandingPage } from "./pages/LandingPage";
import { SignInSelection } from "./pages/auth/SignInSelection";
import { Login } from "./pages/auth/Login";

// Features
import { AdminLayout } from "./components/layout/AdminLayout";
import { Dashboard } from "./features/dashboard/Dashboard";
import { DoctorLogin } from "./features/auth/DoctorLogin";
import { DoctorStatusRoute } from "./features/doctors/DoctorStatusRoute";
import { DoctorApplication } from "./features/doctors/DoctorApplication";
import { PendingVerification } from "./features/doctors/PendingVerification";
import { DoctorsManagement } from "./features/admin/DoctorManagement";
import { AppointmentsManagement } from "./pages/appointments/AppointmentManagement";
import { DoctorDashboard } from "./features/doctors/DoctorDashboard";
import { DoctorLayout } from "./features/doctors/DoctorLayout";
import { MyAppointments } from "./pages/appointments/MyAppointments";
import { ScheduleManagement } from "./pages/schedule/ScheduleManagement";
import { AdminSettings } from "./pages/settings/AdminSettings";
import { DoctorProfile } from "./pages/profile/DoctorProfile";
import { PatientRecords } from "./pages/patients/PatientRecords";
import { ReportsAnalytics } from "./pages/reports/ReportsAnalytics";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signin-select" element={<SignInSelection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/doctor-login" element={<DoctorLogin />} />

          <Route
            path="/unauthorized"
            element={
              <div className="p-10 text-center">
                <h1>Access Denied</h1>
              </div>
            }
          />

          {/* --- DOCTOR ONBOARDING (FIXED) --- */}
          {/* We must wrap each route individually so ProtectedRoute receives the component as 'children' */}

          <Route
            path="/doctor/check-status"
            element={
              <ProtectedRoute allowedRoles={["patient", "doctor"]}>
                <DoctorStatusRoute />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/apply"
            element={
              <ProtectedRoute allowedRoles={["patient", "doctor"]}>
                <DoctorApplication />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/pending"
            element={
              <ProtectedRoute allowedRoles={["patient", "doctor"]}>
                <PendingVerification />
              </ProtectedRoute>
            }
          />

          {/* --- VERIFIED DOCTOR DASHBOARD --- */}
          <Route
            path="/doctor"
            element={
              <ProtectedRoute allowedRoles={["doctor"]}>
                <DoctorLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DoctorDashboard />} />
            <Route path="dashboard" element={<DoctorDashboard />} />
            <Route path="appointments" element={<MyAppointments />} />
            <Route path="patients" element={<PatientRecords />} />
            <Route path="schedule" element={<ScheduleManagement />} />
            <Route path="profile" element={<DoctorProfile />} />
          </Route>

          {/* --- ADMIN ROUTES --- */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="doctors" element={<DoctorsManagement />} />
            <Route path="appointments" element={<AppointmentsManagement />} />
            <Route path="patients" element={<div>Patient List Page</div>} />
            <Route path="reports" element={<ReportsAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;