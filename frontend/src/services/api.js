import axios from 'axios';
import { Platform } from 'react-native';

// 🟢 Python Backend (Keep Local for now if running on laptop)
const PYTHON_URL = 'http://192.168.100.153:5001';

import { getAuth } from '@react-native-firebase/auth';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Error attaching token:", error);
  }
  return config;
});

// ==========================================
// 1. User Service
// ==========================================
export const syncUser = async (idToken) => {
  console.log("🚀 Syncing to:", api.defaults.baseURL + '/api/users/sync');
  try {
    const response = await api.post('/api/users/sync', { idToken });
    return response.data;
  } catch (error) {
    console.error("Sync Error:", error);
    throw error;
  }
};

export const getUserProfile = async (firebaseUid) => {
  try {
    const response = await api.get(`/api/users/${firebaseUid}`);
    return response.data;
  } catch (error) {
    console.error("Get User Error:", error);
    throw error;
  }
};

// ==========================================
// 2. Doctor Service
// ==========================================
export const getDoctors = async (specialization) => {
  const response = await api.get('/api/doctors', {
    params: specialization ? { specialization } : {}
  });
  return response.data;
};

// ==========================================
// 3. Appointment Service
// ==========================================
export const bookAppointment = async (bookingData) => {
  const response = await api.post('/api/appointments/book', bookingData);
  return response.data;
};

export const rescheduleAppointment = async (appointmentId, appointmentDate, timeSlot) => {
  const response = await api.patch(`/api/appointments/${appointmentId}/reschedule`, {
    appointmentDate,
    timeSlot
  });
  return response.data;
};

export const cancelAppointment = async (appointmentId) => {
  const response = await api.patch(`/api/appointments/${appointmentId}/cancel`);
  return response.data;
};

export const getMyAppointments = async (userId, role = 'patient') => {
  try {
    const response = await api.get('/api/appointments', { 
      params: { userId, role } 
    });
    return response.data;
  } catch (error) {
    console.error("Get Appointments Error:", error);
    return []; // Return empty array on error to prevent crashes
  }
};

// ==========================================
// 4. Medical Records Service 
// ==========================================

// Fetch records for a specific user
export const fetchMedicalRecords = async (userId) => {
  try {
    const response = await api.get(`/api/records/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Fetch Records Error:", error);
    throw error;
  }
};

// Save a new record (AI chat or other)
export const saveMedicalRecord = async (recordData) => {
  try {
    // recordData should match backend model: { userId, title, record_type, details, ... }
    const response = await api.post('/api/records/add', recordData);
    return response.data;
  } catch (error) {
    console.error("Save Record Error:", error);
    throw error;
  }
};

// ==========================================
// 5. AI Service (Python Direct)
// ==========================================
export const sendVoiceMessage = async (uri, language = 'en-US', userProfile = {}) => {
  const formData = new FormData();
  
  // 1. Audio File Setup
  const uriParts = uri.split('.');
  const fileType = uriParts[uriParts.length - 1];
  
  formData.append('audio', {
    uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''),
    type: `audio/${fileType}`,
    name: `recording.${fileType}`,
  });
  
  // 2. Language
  formData.append('language', language);

  // 3. Append Profile Data
  formData.append('userProfile', JSON.stringify(userProfile));

  try {
    const response = await fetch(`${PYTHON_URL}/voice-chat`, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const text = await response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error("Voice Upload Error:", error);
    throw error;
  }
};

export default api;