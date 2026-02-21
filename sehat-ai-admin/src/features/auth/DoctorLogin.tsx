import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
import { Stethoscope, Chrome, ArrowRight, Loader2 } from 'lucide-react';
import api from '../../lib/api';

export const DoctorLogin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Shared Logic after Firebase Login
  const handlePostLogin = async (user: any) => {
    const token = await user.getIdToken();
    // 1. Sync User to DB
    await api.post('/users/sync', { idToken: token });
    // 2. Go to the "Traffic Cop" to decide next screen
    navigate('/doctor/check-status'); 
  };

  const handleGoogleLogin = async () => {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await handlePostLogin(result.user);
    } catch (error) {
      console.error("Google Login Failed", error);
      alert("Login failed");
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const auth = getAuth();
      const result = await signInWithEmailAndPassword(auth, email, password);
      await handlePostLogin(result.user);
    } catch (error) {
      alert("Invalid Email or Password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left: Branding */}
      <div className="hidden lg:flex w-1/2 bg-sehat-teal text-white flex-col justify-center px-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="z-10">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-sm">
            <Stethoscope size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-6">Doctor Portal</h1>
          <p className="text-teal-50 text-lg leading-relaxed max-w-md">
            Join the Sehat AI network. Manage patients, digital prescriptions, and AI-assisted diagnostics in one place.
          </p>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="max-w-md w-full">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Doctor</h2>
          <p className="text-gray-500 mb-8">Please sign in to access your clinic.</p>

          {/* Option 1: Google */}
          <button 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 p-3 rounded-xl hover:bg-gray-50 transition-all font-medium text-gray-700 mb-6 group"
          >
            <Chrome size={20} className="text-blue-600" />
            Sign in with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Or continue with email</span></div>
          </div>

          {/* Option 2: Email Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sehat-teal focus:border-sehat-teal outline-none transition-all"
                placeholder="doctor@hospital.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-sehat-teal focus:border-sehat-teal outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-sehat-teal text-white p-4 rounded-xl font-bold hover:bg-teal-600 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Login to Clinic <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};