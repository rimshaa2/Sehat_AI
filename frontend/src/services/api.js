import axios from "axios";
import { Platform } from "react-native";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "";
const derivedPythonUrlFromApi = API_BASE_URL
  ? API_BASE_URL.replace("/api", "").replace(":5000", ":5001")
  : "";
const PYTHON_URL =
  process.env.EXPO_PUBLIC_PYTHON_URL ||
  derivedPythonUrlFromApi ||
  "http://localhost:5001";

import { getAuth } from "@react-native-firebase/auth";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
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
  console.log("🚀 Syncing to:", api.defaults.baseURL + "/api/users/sync");
  if (!api.defaults.baseURL) {
    throw new Error(
      "Backend URL is not configured. Set EXPO_PUBLIC_API_URL in frontend/.env",
    );
  }
  try {
    const response = await api.post("/api/users/sync", { idToken });
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

export const recordLoginAttempt = async (email, success) => {
  const response = await api.post("/api/users/login-attempt", {
    email,
    success,
  });
  return response.data;
};

export const updateUserProfile = async (firebaseUid, payload) => {
  const response = await api.put(`/api/users/${firebaseUid}`, payload);
  return response.data;
};

// ==========================================
// 2. Doctor Service
// ==========================================
export const getDoctors = async (specialization) => {
  const response = await api.get("/api/doctors", {
    params: specialization ? { specialization } : {},
  });
  return response.data;
};

// ==========================================
// 3. Appointment Service
// ==========================================
export const bookAppointment = async (bookingData) => {
  const response = await api.post("/api/appointments/book", bookingData);
  return response.data;
};

export const rescheduleAppointment = async (
  appointmentId,
  appointmentDate,
  timeSlot,
) => {
  const response = await api.patch(
    `/api/appointments/${appointmentId}/reschedule`,
    {
      appointmentDate,
      timeSlot,
    },
  );
  return response.data;
};

export const cancelAppointment = async (appointmentId) => {
  const response = await api.patch(`/api/appointments/${appointmentId}/cancel`);
  return response.data;
};

export const getMyAppointments = async (userId, role = "patient") => {
  try {
    const response = await api.get("/api/appointments", {
      params: { userId, role },
    });
    return response.data;
  } catch (error) {
    console.error("Get Appointments Error:", error);
    return [];
  }
};

// ==========================================
// 4. Medical Records Service
// ==========================================

/** Fetch ALL records for a user (manual + auto-aggregated from appointments, medicines, wellness) */
export const fetchMedicalRecords = async (userId) => {
  try {
    const response = await api.get(`/api/records/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Fetch Records Error:", error);
    throw error;
  }
};

/** Save a new manual record */
export const saveMedicalRecord = async (recordData) => {
  try {
    const response = await api.post("/api/records/add", recordData);
    return response.data;
  } catch (error) {
    console.error("Save Record Error:", error);
    throw error;
  }
};

/** Update an existing manual record by its raw DB id */
export const updateMedicalRecord = async (recordId, recordData) => {
  try {
    const response = await api.put(`/api/records/${recordId}`, recordData);
    return response.data;
  } catch (error) {
    console.error("Update Record Error:", error);
    throw error;
  }
};

/** Delete a manual record by its raw DB id */
export const deleteMedicalRecord = async (recordId) => {
  try {
    const response = await api.delete(`/api/records/${recordId}`);
    return response.data;
  } catch (error) {
    console.error("Delete Record Error:", error);
    throw error;
  }
};

// ==========================================
// 5. AI Service (Python Direct)
// ==========================================
export const sendVoiceMessage = async (
  uri,
  language = "en-US",
  userProfile = {},
) => {
  const formData = new FormData();

  const uriParts = uri.split(".");
  const fileType = uriParts[uriParts.length - 1];

  formData.append("audio", {
    uri: Platform.OS === "android" ? uri : uri.replace("file://", ""),
    type: `audio/${fileType}`,
    name: `recording.${fileType}`,
  });

  formData.append("language", language);

  formData.append("userProfile", JSON.stringify(userProfile));

  try {
    const response = await fetch(`${PYTHON_URL}/voice-chat`, {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const text = await response.text();
    return JSON.parse(text);
  } catch (error) {
    console.error("Voice Upload Error:", error);
    throw error;
  }
};

export const sendTextMessage = async (
  text,
  language = "en-US",
  userProfile = {},
) => {
  try {
    const response = await fetch(`${PYTHON_URL}/text-chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text, language, userProfile }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Text Chat Error:", error);
    throw error;
  }
};

// ==========================================
// 6. Community Service
// ==========================================
export const getCommunityPosts = async (search = "") => {
  const response = await api.get("/api/community/posts", {
    params: search ? { search } : {},
  });
  return response.data;
};

export const createCommunityPost = async ({ title, content, tags = [] }) => {
  const response = await api.post("/api/community/posts", {
    title,
    content,
    tags,
  });
  return response.data;
};

export const toggleCommunityLike = async (postId) => {
  const response = await api.post(`/api/community/posts/${postId}/like`);
  return response.data;
};

export const addCommunityComment = async (postId, text) => {
  const response = await api.post(`/api/community/posts/${postId}/comments`, {
    text,
  });
  return response.data;
};

// ==========================================
// 7. Medicines Service
// ==========================================
export const getMyMedicines = async () => {
  const response = await api.get("/api/medicines");
  return response.data;
};

export const createMedicine = async (payload) => {
  const response = await api.post("/api/medicines", payload);
  return response.data;
};

export const updateMedicineById = async (id, payload) => {
  const response = await api.put(`/api/medicines/${id}`, payload);
  return response.data;
};

export const deleteMedicineById = async (id) => {
  const response = await api.delete(`/api/medicines/${id}`);
  return response.data;
};

// ==========================================
// 8. Wellness Service
// ==========================================
export const createWellnessEntry = async (type, payload = {}) => {
  const response = await api.post("/api/wellness/entries", { type, payload });
  return response.data;
};

export const getWellnessEntries = async (type, limit = 100) => {
  const response = await api.get("/api/wellness/entries", {
    params: { type, limit },
  });
  return response.data;
};

export default api;
