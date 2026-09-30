import React, { useEffect, useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  ShieldCheck,
  LogIn,
  UserPlus
} from 'lucide-react';

export default function AuthModal({
  isOpen,
  onClose,
  initialRole = 'citizen',
  onAuthSuccess
}) {
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState(initialRole || 'citizen');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Update role whenever the modal is opened with a different role
  useEffect(() => {
    if (isOpen) {
      setRole(initialRole || 'citizen');
      setErrorMsg('');
    }
  }, [isOpen, initialRole]);

  if (!isOpen) return null;

  // --------------------------------------------------
  // Input change
  // --------------------------------------------------
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // --------------------------------------------------
  // Change role
  // --------------------------------------------------
  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setErrorMsg('');
  };

  // --------------------------------------------------
  // Switch between Login and Register
  // --------------------------------------------------
  const handleRegisterMode = () => {
    setIsRegister(true);
    setErrorMsg('');
  };

  const handleLoginMode = () => {
    setIsRegister(false);
    setErrorMsg('');
  };

  // --------------------------------------------------
  // Demo Citizen
  // --------------------------------------------------
  const fillDemoCitizen = () => {
    setIsRegister(false);
    setRole('citizen');

    setFormData({
      name: 'Ishita Bansal',
      email: 'ishita@mukand.ac.in',
      phone: '9876543210',
      password: 'citizen123'
    });

    setErrorMsg('');
  };

  // --------------------------------------------------
  // Demo Admin
  // --------------------------------------------------
  const fillDemoAdmin = () => {
    setIsRegister(false);
    setRole('admin');

    setFormData({
      name: 'Chief Redressal Administrator',
      email: 'admin@sahaayai.gov.in',
      phone: '011-23456789',
      password: 'admin123'
    });

    setErrorMsg('');
  };

  // --------------------------------------------------
  // Submit Login / Registration
  // --------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    setErrorMsg('');
    setLoading(true);

    try {
      // ----------------------------------------------
      // Basic frontend validation
      // ----------------------------------------------
      if (isRegister) {
        if (!formData.name.trim()) {
          throw new Error('Please enter your full name.');
        }

        if (!formData.email.trim()) {
          throw new Error('Please enter your email address.');
        }

        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters.');
        }
      }

      // ----------------------------------------------
      // Select backend endpoint
      // ----------------------------------------------
      const endpoint = isRegister
        ? '/api/auth/register'
        : '/api/auth/login';

      // ----------------------------------------------
      // Registration sends role
      // Login only needs email/password
      // ----------------------------------------------
      const payload = isRegister
        ? {
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            phone: formData.phone.trim(),
            password: formData.password,
            role: role
          }
        : {
            email: formData.email.trim().toLowerCase(),
            password: formData.password
          };

      // ----------------------------------------------
      // API request
      // ----------------------------------------------
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      // ----------------------------------------------
      // Backend error
      // ----------------------------------------------
      if (!res.ok) {
        throw new Error(
          data.error ||
          data.detail ||
          'Authentication failed. Please try again.'
        );
      }

      // ----------------------------------------------
      // Verify that backend returned authentication data
      // ----------------------------------------------
      if (!data.token || !data.user) {
        throw new Error(
          'Authentication succeeded, but the server did not return a valid user session.'
        );
      }

      // ----------------------------------------------
      // IMPORTANT:
      // Always use the role returned by backend.
      // Do not trust only the frontend role selection.
      // ----------------------------------------------
      const authenticatedUser = data.user;

      // ----------------------------------------------
      // Save login session
      // ----------------------------------------------
      localStorage.setItem('sahaay_token', data.token);

      localStorage.setItem(
        'sahaay_user',
        JSON.stringify(authenticatedUser)
      );

      // ----------------------------------------------
      // Tell App.jsx about successful authentication
      // ----------------------------------------------
      onAuthSuccess(authenticatedUser);

      // Close modal
      onClose();

    } catch (error) {
      console.error('Authentication error:', error);
      setErrorMsg(error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = role === 'admin';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">

      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 sm:p-8 animate-fade-in relative">

        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">

          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3 ${
              isAdmin
                ? 'bg-amber-100 text-amber-600'
                : 'bg-sky-100 text-sky-600'
            }`}
          >
            {isAdmin ? (
              <ShieldCheck className="w-6 h-6" />
            ) : (
              <User className="w-6 h-6" />
            )}
          </div>

          <h3 className="text-2xl font-bold text-slate-900">
            {isRegister
              ? isAdmin
                ? 'Create Admin Account'
                : 'Create Citizen Account'
              : isAdmin
                ? 'Admin Portal Login'
                : 'Citizen Portal Login'}
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            {isRegister
              ? isAdmin
                ? 'Create an administrator account to manage grievances.'
                : 'Create your SahaayAI citizen account to submit and track grievances.'
              : isAdmin
                ? 'Access the SahaayAI grievance administration portal.'
                : 'Access grievance submission, tracking, and your dashboard.'}
          </p>
        </div>

        {/* Role Selection */}
        <div className="mb-5">

          <label className="block text-xs font-semibold text-slate-700 mb-2">
            Account Type
          </label>

          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">

            {/* Citizen */}
            <button
              type="button"
              onClick={() => handleRoleChange('citizen')}
              className={`py-2.5 rounded-lg transition-all text-xs font-semibold flex items-center justify-center gap-1.5 ${
                role === 'citizen'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <User className="w-4 h-4" />
              Citizen
            </button>

            {/* Admin */}
            <button
              type="button"
              onClick={() => handleRoleChange('admin')}
              className={`py-2.5 rounded-lg transition-all text-xs font-semibold flex items-center justify-center gap-1.5 ${
                role === 'admin'
                  ? 'bg-white text-amber-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin
            </button>

          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mb-5 flex flex-wrap gap-2 justify-center">

          <button
            type="button"
            onClick={fillDemoCitizen}
            className="text-[11px] px-2.5 py-1 bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 rounded-lg font-medium transition-colors"
          >
            Fill Demo Citizen
          </button>

          <button
            type="button"
            onClick={fillDemoAdmin}
            className="text-[11px] px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-lg font-medium transition-colors"
          >
            Fill Demo Admin
          </button>

        </div>

        {/* Error */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {errorMsg}
          </div>
        )}

        {/* Registration Notice */}
        {isRegister && isAdmin && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl">
            <div className="flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />

              <div>
                <p className="font-semibold mb-1">
                  Administrator Account
                </p>

                <p className="leading-relaxed">
                  Admin accounts have access to all registered grievances,
                  complaint management tools, and system analytics.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name + Phone - Registration Only */}
          {isRegister && (
            <>
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>

                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder={
                      isAdmin
                        ? 'Administrator Name'
                        : 'Ishita Bansal'
                    }
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mobile Phone
                </label>

                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="9876543210"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address
            </label>

            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={
                  isAdmin
                    ? 'admin@example.com'
                    : 'citizen@example.com'
                }
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>

            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:outline-none"
                required
                minLength={6}
              />
            </div>

            {isRegister && (
              <p className="text-[10px] text-slate-400 mt-1">
                Password must contain at least 6 characters.
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 text-white rounded-xl text-xs font-semibold shadow-md transition-colors flex items-center justify-center space-x-1.5 disabled:opacity-50 ${
              isAdmin
                ? 'bg-slate-900 hover:bg-slate-800'
                : 'bg-sky-600 hover:bg-sky-700'
            }`}
          >

            {loading ? (
              <span>
                {isRegister
                  ? 'Creating Account...'
                  : 'Signing In...'}
              </span>
            ) : isRegister ? (
              <>
                <UserPlus className="w-4 h-4" />

                <span>
                  {isAdmin
                    ? 'Create Admin Account'
                    : 'Create Citizen Account'}
                </span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />

                <span>
                  {isAdmin
                    ? 'Sign In as Admin'
                    : 'Sign In as Citizen'}
                </span>
              </>
            )}

          </button>

        </form>

        {/* Login / Register Toggle */}
        <div className="mt-5 text-center text-xs text-slate-500">

          {isRegister ? (
            <span>
              Already have an account?{' '}

              <button
                type="button"
                onClick={handleLoginMode}
                className="text-sky-600 hover:underline font-bold"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account?{' '}

              <button
                type="button"
                onClick={handleRegisterMode}
                className="text-sky-600 hover:underline font-bold"
              >
                Create an account
              </button>
            </span>
          )}

        </div>

        {/* Admin Security Note */}
        {isRegister && isAdmin && (
          <p className="text-[10px] text-center text-slate-400 mt-4 leading-relaxed">
            In a production deployment, administrator accounts should be
            created or approved by an authorized system administrator.
          </p>
        )}

      </div>
    </div>
  );
}