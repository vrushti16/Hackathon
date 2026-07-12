import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Mail, Lock, ShieldAlert, ArrowRight } from 'lucide-react';
import ThemeToggle from '../components/common/ThemeToggle';
import Loader from '../components/common/Loader';
import { useFleet } from '../context/FleetContext';
import api from '../services/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { triggerToast } = useFleet();
  const [step, setStep] = useState('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSendOtp = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage('Please enter your email address.');
      setSuccessMessage('');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await api.post('/auth/forgot-password', { email: trimmedEmail.toLowerCase() });
      const otpValue = response?.data?.otp;
      setSuccessMessage(
        otpValue
          ? `A one-time password was generated for ${trimmedEmail}. Check your inbox or the server response for the code.`
          : `A one-time password has been sent to ${trimmedEmail}.`
      );
      setStep('verify');
      triggerToast(otpValue ? 'OTP ready for use' : 'OTP sent to your email', 'warning');
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to send reset code right now.';
      setErrorMessage(message);
      triggerToast(message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!otp.trim() || otp.trim().length !== 6) {
      setErrorMessage('Enter the 6-digit OTP you received in your email.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await api.post('/auth/verify-otp', {
        email: trimmedEmail.toLowerCase(),
        otp: otp.trim()
      });
      setSuccessMessage('OTP verified successfully! Now please create your new password.');
      setStep('reset');
      triggerToast('OTP verified successfully', 'success');
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid or expired OTP code.';
      setErrorMessage(message);
      triggerToast(message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await api.post('/auth/reset-password', {
        email: trimmedEmail.toLowerCase(),
        otp: otp.trim(),
        newPassword
      });

      setOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage(response.data.message || 'Password updated successfully.');
      triggerToast('Password updated successfully', 'success');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to reset your password right now.';
      setErrorMessage(message);
      triggerToast(message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-brand-slate-50 dark:bg-brand-slate-950 transition-colors duration-300 relative">
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-brand-slate-900 border border-brand-slate-200 dark:border-brand-slate-800 p-8 rounded-2xl shadow-lg space-y-6 animate-scale-in">
        <div className="flex flex-col items-center space-y-3.5 text-center">
          <div className="w-12 h-12 rounded-2xl bg-brand-blue flex items-center justify-center text-white shadow-lg shadow-brand-blue/30">
            <Truck className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-brand-slate-900 dark:text-white font-display">
              Reset your password
            </h2>
            <p className="text-xs text-brand-slate-500 dark:text-brand-slate-450 max-w-xs leading-relaxed">
              Enter your email to receive an OTP and create a new password.
            </p>
          </div>
        </div>

        {(errorMessage || successMessage) && (
          <div className={`flex items-start space-x-2.5 p-3 rounded-xl border animate-fade-in ${
            errorMessage
              ? 'border-brand-red/20 bg-brand-red/5 text-brand-red'
              : 'border-brand-blue/20 bg-brand-blue/5 text-brand-blue'
          }`}>
            <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-xs font-semibold leading-relaxed">{errorMessage || successMessage}</p>
          </div>
        )}

        {step === 'request' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-brand-slate-400 dark:text-brand-slate-500 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white/60 dark:bg-brand-slate-900/60 text-sm text-brand-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-blue hover:bg-brand-blue-hover disabled:opacity-50 transition-all duration-200"
            >
              {loading ? (
                <Loader size="sm" className="text-white" />
              ) : (
                <>
                  <span>Send OTP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400" htmlFor="otp">
                OTP Code
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                className="w-full px-4 py-2.5 rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white/60 dark:bg-brand-slate-900/60 text-sm text-brand-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setStep('request');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="text-sm font-semibold text-brand-slate-500 hover:text-brand-blue"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-blue hover:bg-brand-blue-hover disabled:opacity-50 transition-all duration-200"
              >
                {loading ? (
                  <Loader size="sm" className="text-white" />
                ) : (
                  <span>Verify OTP</span>
                )}
              </button>
            </div>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400" htmlFor="newPassword">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-brand-slate-400 dark:text-brand-slate-500 pointer-events-none" />
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white/60 dark:bg-brand-slate-900/60 text-sm text-brand-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-brand-slate-500 dark:text-brand-slate-400" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-brand-slate-400 dark:text-brand-slate-500 pointer-events-none" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-slate-200 dark:border-brand-slate-800 bg-white/60 dark:bg-brand-slate-900/60 text-sm text-brand-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-blue/20"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setStep('verify');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className="text-sm font-semibold text-brand-slate-500 hover:text-brand-blue"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-brand-blue hover:bg-brand-blue-hover disabled:opacity-50 transition-all duration-200"
              >
                {loading ? (
                  <Loader size="sm" className="text-white" />
                ) : (
                  <span>Reset Password</span>
                )}
              </button>
            </div>
          </form>
        )}

        <button
          type="button"
          onClick={() => navigate('/login')}
          className="w-full text-sm font-semibold text-brand-slate-500 hover:text-brand-blue"
        >
          Back to login
        </button>
      </div>

      <footer className="mt-8 text-center text-[10px] text-brand-slate-400 dark:text-brand-slate-500">
        &copy; {new Date().getFullYear()} TransitOps Logistics. Production-Grade Transport Management System.
      </footer>
    </div>
  );
};

export default ForgotPassword;
