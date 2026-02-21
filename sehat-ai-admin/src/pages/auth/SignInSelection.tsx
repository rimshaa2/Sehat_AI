import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserCog, Stethoscope, ArrowRight } from 'lucide-react';

export const SignInSelection = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold text-gray-900">Welcome to Sehat AI</h2>
        <p className="text-gray-500 mt-2">Please select your portal to continue</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* DOCTOR CARD */}
        <Link to="/doctor-login" className="group">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:border-sehat-teal hover:shadow-xl transition-all cursor-pointer h-full relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-sehat-teal group-hover:w-full transition-all duration-500 opacity-5"></div>
            
            <div className="w-16 h-16 bg-teal-50 text-sehat-teal rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Stethoscope size={32} />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Join as Doctor</h3>
            <p className="text-gray-500 mb-6">
              Access patient records, manage appointments, and use AI diagnostic tools.
            </p>
            
            <div className="flex items-center text-sehat-teal font-semibold group-hover:gap-2 transition-all">
              Login to Portal <ArrowRight size={18} className="ml-2" />
            </div>
          </motion.div>
        </Link>

        {/* ADMIN CARD */}
        <Link to="/login?role=admin" className="group">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:border-sehat-purple hover:shadow-xl transition-all cursor-pointer h-full relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-sehat-purple group-hover:w-full transition-all duration-500 opacity-5"></div>
            
            <div className="w-16 h-16 bg-purple-50 text-sehat-purple rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <UserCog size={32} />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Login as Admin</h3>
            <p className="text-gray-500 mb-6">
              Manage users, verify doctor licenses, and view platform analytics.
            </p>
            
            <div className="flex items-center text-sehat-purple font-semibold group-hover:gap-2 transition-all">
              Access Dashboard <ArrowRight size={18} className="ml-2" />
            </div>
          </motion.div>
        </Link>
      </div>

      <p className="mt-12 text-gray-400 text-sm">
        Are you a patient? <span className="text-gray-600 font-medium">Please download our mobile app.</span>
      </p>
    </div>
  );
};