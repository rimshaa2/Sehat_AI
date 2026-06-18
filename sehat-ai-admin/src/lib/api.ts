import axios from 'axios';
// CHANGE THIS LINE: Don't import getAuth directly from the SDK
// import { getAuth } from 'firebase/auth'; 

// DO THIS: Import the 'auth' you already created in your firebase.ts file
import { auth } from './firebase'; 

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  // Use the imported 'auth' object here
  const user = auth.currentUser;

  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;