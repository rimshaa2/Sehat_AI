import { Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PendingVerification = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-24 h-24 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <Clock size={48} />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Verification Pending</h1>
      <p className="text-gray-500 max-w-md mb-8">
        Your application has been submitted and is currently being reviewed by our admin team. This usually takes 24-48 hours.
      </p>
      
      <div className="bg-white p-4 rounded-lg border border-gray-200 max-w-sm w-full mb-8">
        <p className="text-xs text-gray-400 uppercase font-bold text-xs mb-2">Next Steps</p>
        <div className="flex items-center gap-3 text-left">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <p className="text-sm text-gray-600">Admin reviews License</p>
        </div>
        <div className="flex items-center gap-3 text-left mt-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <p className="text-sm text-gray-600">Profile Activation</p>
        </div>
      </div>

      <Link to="/" className="text-sehat-teal font-medium hover:underline">
        Back to Home
      </Link>
    </div>
  );
};