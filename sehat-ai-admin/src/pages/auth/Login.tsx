import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import api from '../../lib/api';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const token = await user.getIdToken();

      const response = await api.post('/users/sync', {idToken: token});
      const {role} = response.data.user;

      console.log("Login success! Role: ", role) ;

      if( role === 'admin'){
        navigate('/admin');
      } else if(role === 'doctor'){
        navigate('/doctor/dashboard')
      }else{
        navigate('/')
      }
      
    } catch (err: any) {
      console.error(err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      
      {/* LEFT SIDE: Brand & Illustration (Matches your Screenshot) */}
      <div className="hidden lg:flex lg:w-1/2 bg-sehat-teal relative items-center justify-center overflow-hidden">
        {/* Decorative Circle */}
        <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl -top-20 -left-20"></div>
        
        <div className="relative z-10 text-center px-10">
          <div className="mb-8">
             {/* Replace this URL with your actual Robot Image */}
            <img 
              src="https://img.freepik.com/free-vector/cute-artificial-intelligence-robot-isometric-icon_1284-63045.jpg?t=st=1709587000" 
              alt="Sehat AI Robot" 
              className="w-80 mx-auto rounded-full shadow-2xl border-4 border-white/20 mix-blend-multiply" 
            />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-md">
            Sehat AI Admin
          </h2>
          <p className="text-teal-50 text-lg max-w-md mx-auto">
            "Describe your symptoms, let AI assist you."
            <br />
            <span className="text-sm opacity-80 mt-2 block">Doctor & Patient Management Portal</span>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: The Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="max-w-md w-full space-y-8">
          
          {/* Mobile Logo (Visible only on small screens) */}
          <div className="lg:hidden text-center mb-10">
            <h1 className="text-3xl font-bold text-sehat-teal">Sehat AI</h1>
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-sm text-gray-500">Please sign in to access the dashboard</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm text-center border border-red-100">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              
              {/* Email Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-sehat-teal focus:border-sehat-teal sm:text-sm transition-all"
                  placeholder="Admin Email"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-sehat-teal focus:border-sehat-teal sm:text-sm transition-all"
                  placeholder="Password"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-sehat-teal focus:ring-sehat-teal border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-sehat-purple hover:text-indigo-500">
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Login Button - Matches your 'Purple' Banner buttons */}
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-sehat-purple hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sehat-purple transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </button>
          </form>
          
          <div className="text-center mt-4">
            <p className="text-xs text-gray-400">
              © 2026 Sehat AI. Restricted Area.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};