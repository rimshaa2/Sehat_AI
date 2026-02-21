import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api'; 
import { getAuth } from 'firebase/auth';

export const DoctorStatusRoute = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<string[]>(["Initializing..."]);

  const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${msg}`]);

  useEffect(() => {
    const runCheck = async () => {
      try {
        // 1. Check if Firebase knows who we are
        const auth = getAuth();
        const user = auth.currentUser;
        
        if (!user) {
          addLog("❌ Error: Firebase User is NULL. You are not logged in.");
          addLog("Redirecting to login in 3 seconds...");
          setTimeout(() => navigate('/doctor-login'), 3000);
          return;
        }

        addLog(`✅ Logged in as: ${user.email}`);
        addLog("🚀 Sending request to backend: /doctors/status");

        // 2. Send Request
        const res = await api.get('/doctors/status');
        
        addLog(`🎉 Response Received! Status: ${res.status}`);
        addLog(`📦 Data: ${JSON.stringify(res.data)}`);

        const { status } = res.data;

        // 3. Handle Redirects
        if (status === 'not_applied') {
          addLog("➡️ Redirecting to Application Form...");
          setTimeout(() => navigate('/doctor/apply'), 1500);
        } else if (status === 'pending') {
          addLog("➡️ Redirecting to Pending Screen...");
          setTimeout(() => navigate('/doctor/pending'), 1500);
        } else if (status === 'verified') {
          addLog("➡️ Redirecting to Dashboard...");
          setTimeout(() => navigate('/doctor/dashboard'), 1500);
        } else {
          addLog(`⚠️ Unknown Status: ${status}`);
        }

      } catch (error: any) {
        console.error("Debug Error:", error);
        addLog(`❌ REQUEST FAILED`);
        addLog(`Error Message: ${error.message}`);
        if (error.response) {
          addLog(`Server Error: ${error.response.status} - ${error.response.data.error || 'Unknown'}`);
        }
      }
    };

    runCheck();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-900 text-green-400 font-mono p-10">
      <h1 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-2">
        🩺 Doctor Status Debugger
      </h1>
      <div className="space-y-2">
        {logs.map((log, index) => (
          <div key={index} className="break-all">
            {log}
          </div>
        ))}
      </div>
      <button 
        onClick={() => navigate('/doctor-login')}
        className="mt-8 bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
      >
        Force Logout / Back
      </button>
    </div>
  );
};