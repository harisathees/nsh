// src/pages/NotLoggedIn.tsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GiGoldBar } from "react-icons/gi";

export const NotLoggedIn: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-yellow-50 to-yellow-100 font-sans">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md">
        <GiGoldBar className="text-yellow-600 mx-auto mb-4" size={60} />
        <h1 className="text-2xl font-bold text-yellow-700 mb-2">You are not logged in</h1>
        <p className="text-gray-600 mb-6">
          Please login to access your gold loan dashboard. Redirecting to login page...
        </p>
        <button
          onClick={() => navigate("/login")}
          className="bg-yellow-600 text-white px-6 py-2 rounded-md text-lg font-medium hover:bg-yellow-700 transition-colors"
        >
          Go to Login
        </button>
      </div>
    </div>
  );
};
