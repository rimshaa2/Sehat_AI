import { getAuth } from "@react-native-firebase/auth";

const BASE_URL = "http://YOUR_BACKEND_IP:3000/api"; // replace with your backend URL

export const apiRequest = async (
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  body?: object
) => {
  const token = await getAuth().currentUser?.getIdToken();

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
};