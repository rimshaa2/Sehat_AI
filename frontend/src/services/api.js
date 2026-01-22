import axios from 'axios';
const PYTHON_URL = 'http://192.168.1.15:5001';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. User Service
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

// 2. Doctor Service
export const getDoctors = async (specialization) => {
  const url = specialization ? `/api/doctors?specialization=${specialization}` : '/api/doctors';
  const response = await api.get(url);
  return response.data;
};

// 3. Appointment Service
export const bookAppointment = async (bookingData) => {
  const response = await api.post('/api/appointments/book', bookingData);
  return response.data;
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

// 4. AI Service (Through Node Gateway)
export const sendVoiceMessage = async (uri, language = 'en-US') => {
  const formData = new FormData();
  
  formData.append('audio', {
    uri: uri,
    type: 'audio/m4a', // Expo records in m4a usually
    name: 'upload.m4a',
  });
  formData.append('language', language);

  const response = await fetch(`${PYTHON_URL}/voice-chat`, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return await response.json();
};

export default api;
