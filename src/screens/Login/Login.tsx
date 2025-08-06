import { CheckCircleIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { Input } from "../../components/ui/input";
import { useNavigate } from "react-router-dom";

export const Login = (): JSX.Element => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError("");
    setSuccess("");
    setPassword("");
    setConfirmPassword("");
  };

  const validateForm = () => {
    if (!email.trim() || !password.trim()) {
      return false;
    }
    if (isSignUp && !confirmPassword.trim()) {
      return false;
    }
    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      if (!email.trim() || !password.trim() || (isSignUp && !confirmPassword.trim())) {
        setError("Please fill in all required fields");
      }
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
        });

        if (error) {
          setError(error.message);
        } else {
          setSuccess("Account created successfully! Please check your email for verification.");
          setPassword("");
          setConfirmPassword("");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (error) {
          setError(error.message);
        } else {
          setSuccess("Login successful! Redirecting...");
          console.log("Redirecting...");
          // Simulate redirect delay
          setTimeout(() => {
                console.log("User authenticated:", data.user);
                navigate("/dashboard"); 
            }, 1500);

        }
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Auth error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = email.trim() && password.trim() && (!isSignUp || confirmPassword.trim());

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          {/* Logo and User Name */}
          <div className="flex items-center gap-3 mb-8">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-lg flex items-center justify-center">
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h2 className="font-bold text-gray-800 text-lg">Sabari Harish</h2>
              <p className="text-sm text-gray-500">Gold Loan Manager</p>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3">
              {isSignUp ? "Sign Up" : "Sign In"}
            </h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              {isSignUp 
                ? "Create your account to manage gold loans efficiently and securely with our comprehensive system."
                : "Welcome back! Sign in to access your gold loan management dashboard and continue your work."
              }
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full h-12 pl-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors"
                  required
                  disabled={isLoading}
                />
                {email.includes('@') && email.includes('.') && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <CheckCircleIcon className="w-5 h-5 text-blue-500" />
                  </div>
                )}
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full h-12 pl-4 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors"
                  required
                  disabled={isLoading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOffIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password Field (Sign Up only) */}
            {isSignUp && (
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full h-12 pl-4 pr-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-colors"
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                </div>
              </div>
            )}

            {/* Remember Me and Forget Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={setRememberMe}
                  className="w-5 h-5 rounded border-2 border-gray-300 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                  disabled={isLoading}
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium text-gray-700 cursor-pointer"
                >
                  Remember me?
                </label>
              </div>
              {!isSignUp && (
                <button
                  type="button"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Forgot Password?
                </button>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{isSignUp ? "Creating Account..." : "Signing In..."}</span>
                </div>
              ) : (
                isSignUp ? "Create Account" : "Sign In"
              )}
            </Button>

            {/* Toggle Mode */}
            <div className="text-center pt-4">
              <span className="text-gray-600 text-sm">
                {isSignUp ? "Already have an account? " : "Don't have an account? "}
              </span>
              <button
                type="button"
                onClick={toggleMode}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                disabled={isLoading}
              >
                {isSignUp ? "Sign In" : "Sign Up"}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Secure Gold Loan Management System
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Protected by enterprise-grade security
          </p>
        </div>
      </div>
    </div>
  );
};