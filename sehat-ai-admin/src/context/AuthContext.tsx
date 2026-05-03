import { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import api from '../lib/api'; // Your Axios instance

interface AuthContextType {
  user: FirebaseUser | null;
  role: 'admin' | 'doctor' | 'patient' | null;
  loading: boolean;
  dbUserId: number | null;
  dbUserName: string | null;
}

const AuthContext = createContext<AuthContextType>({ user: null, role: null, loading: true, dbUserId: null, dbUserName: null });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<AuthContextType['role']>(null);
  const [loading, setLoading] = useState(true);
  const [dbUserId, setDbUserId] = useState<number | null>(null);
  const [dbUserName, setDbUserName] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    
    // Listen for Firebase Login/Logout
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          // 1. Get Token
          const token = await firebaseUser.getIdToken();
          
          // 2. Ask Backend: "Who is this?"
          const response = await api.post('/users/sync', { idToken: token });
          
          // 3. Save Role + DB user metadata
          setRole(response.data.user.role);
          setDbUserId(response.data.user.id ?? null);
          setDbUserName(response.data.user.fullName ?? response.data.user.name ?? null);
        } catch (error) {
          console.error("Failed to fetch role:", error);
          setRole(null);
          setDbUserId(null);
          setDbUserName(null);
        }
      } else {
        setRole(null);
        setDbUserId(null);
        setDbUserName(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading, dbUserId, dbUserName }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);