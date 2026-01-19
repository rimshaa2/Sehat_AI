import axios from 'axios';

// 🔴 REPLACE WITH YOUR IP ADDRESS FROM STEP 1
// Do NOT use 'localhost'. Use your computer's IP.
const API_URL = 'http://192.168.100.153:5000/api'; 
const AI_URL = 'http://192.168.100.153:5000/api/ai';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. User Service
export const syncUser = async (idToken) => {
  try {
    const response = await api.post('/users/sync', { idToken });
    return response.data;
  } catch (error) {
    console.error("Sync Error:", error);
    throw error;
  }
};

// 2. Doctor Service
export const getDoctors = async (specialization) => {
  const url = specialization ? `/doctors?specialization=${specialization}` : '/doctors';
  const response = await api.get(url);
  return response.data;
};

// 3. Appointment Service
export const bookAppointment = async (bookingData) => {
  const response = await api.post('/appointments/book', bookingData);
  return response.data;
};

// 4. AI Service (Through Node Gateway)
export const analyzeSymptoms = async (symptoms) => {
  const response = await api.post('/ai/analyze', { symptoms });
  return response.data;
};

export default api;