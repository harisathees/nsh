import { ArrowLeft, Home, TrendingUp, Coins, AlertCircle } from 'lucide-react';
import { useNavigate } from "react-router-dom";


export default function GoldLoan404() {
  const navigate = useNavigate();

  const handleDashboardNavigation = () => {
    navigate('/dashboard');
  };

  const handleBackNavigation = () => {
    // Navigate back in history
    navigate(-1);
    // Example: window.history.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {/* Animated Gold Coins */}
        <div className="relative mb-8">
          <div className="flex justify-center items-center space-x-4 mb-4">
            <div className="animate-bounce delay-100">
              <Coins className="w-16 h-16 text-yellow-500" />
            </div>
            <div className="animate-bounce delay-300">
              <Coins className="w-20 h-20 text-amber-500" />
            </div>
            <div className="animate-bounce delay-500">
              <Coins className="w-16 h-16 text-yellow-600" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-yellow-200">
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 rounded-full p-3">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
          </div>
          
          <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
          
          <h2 className="text-2xl font-semibold text-gray-700 mb-3">
            Page Not Found
          </h2>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            Oops! The gold loan page you're looking for seems to have gone missing. 
            Don't worry, your financial journey continues from here.
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleDashboardNavigation}
              className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <Home className="w-5 h-5" />
              <span>Go to Dashboard</span>
            </button>
            
            <button
              onClick={handleBackNavigation}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 pt-6 border-t border-yellow-200">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <TrendingUp className="w-4 h-4 text-yellow-500" />
              <span>Secure Gold Loan Solutions</span>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-4">
            Need help? Contact our support team
          </p>
          <div className="flex justify-center space-x-6 text-sm">
            <button className="text-yellow-600 hover:text-yellow-700 font-medium transition-colors">
              Support
            </button>
            <button className="text-yellow-600 hover:text-yellow-700 font-medium transition-colors">
              Loan Calculator
            </button>
            <button className="text-yellow-600 hover:text-yellow-700 font-medium transition-colors">
              Apply Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}