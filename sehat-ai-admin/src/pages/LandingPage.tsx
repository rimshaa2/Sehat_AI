import { Link } from 'react-router-dom';
import { ArrowRight, Activity, ShieldCheck } from 'lucide-react';

export const LandingPage = () => {
  return (
    <div className="min-h-screen bg-linear-to-br from-sehat-bg to-white">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          {/* Replace with your actual Logo */}
          <div className="w-10 h-10 bg-sehat-teal rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
            S
          </div>
          <span className="text-2xl font-bold text-gray-800">Sehat AI</span>
        </div>
        
        <Link 
          to="/signin-select" 
          className="px-6 py-2.5 bg-white text-sehat-teal font-semibold rounded-full border border-sehat-teal hover:bg-sehat-teal hover:text-white transition-all shadow-sm hover:shadow-md"
        >
          Sign In
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="flex flex-col lg:flex-row items-center justify-between px-8 mt-2 max-w-7xl mx-auto gap-12">
        {/* Left Content */}
        <div className="lg:w-1/2 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-sehat-teal/10 text-sehat-teal rounded-full text-sm font-medium">
            <Activity size={16} />
            <span>AI-Powered Healthcare Ecosystem</span>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Advanced Care for <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-sehat-teal to-sehat-purple">
              Smart Doctors.
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
            Manage appointments, visualize patient data, and leverage AI diagnostics—all in one unified dashboard.
          </p>

          <div className="flex gap-4">
            <Link 
              to="/signin-select"
              className="px-8 py-4 bg-sehat-teal text-white rounded-xl font-bold text-lg shadow-lg hover:bg-sehat-darkTeal hover:shadow-xl transition-all flex items-center gap-2 group"
            >
              Get Started <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Right Illustration (Floating Cards Effect) */}
        <div className="lg:w-1/2 relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-sehat-purple/10 rounded-full blur-3xl -z-10"></div>
          <img 
            src="https://img.freepik.com/free-vector/health-professional-team-concept-illustration_114360-1618.jpg" 
            alt="Medical Team" 
            className="w-full drop-shadow-2xl rounded-2xl"
          />
          
          {/* Floating Badge Example */}
          <div className="absolute -bottom-6 -left-46 bg-white p-4 rounded-xl shadow-xl flex items-center gap-4 animate-bounce-slow">
            <div className="p-3 bg-green-100 text-green-600 rounded-full">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">System Status</p>
              <p className="font-bold text-gray-900">100% Secure</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};