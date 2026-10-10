import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { User, Phone, Mail, Lock, Gift, RefreshCw, KeyRound } from 'lucide-react';
import { TradingBackground } from '../components/TradingBackground.js';

export const RegisterPage: React.FC = () => {
  const { apiPost } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('planId');

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    password: '',
    referralCode: '',
  });

  const [step, setStep] = useState<'REGISTER' | 'OTP'>('REGISTER');
  const [otpVal, setOtpVal] = useState<string>('');
  const [mockOtp, setMockOtp] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiPost('/auth/register', formData);
      setMockOtp(response.otpMock); // mock OTP from response
      setOtpVal(response.otpMock);  // autofill mock OTP for local developer ease
      setSuccess('Account created. Please verify mobile OTP.');
      setStep('OTP');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      await apiPost('/auth/verify-otp', {
        email: formData.email,
        otp: otpVal,
      });

      setSuccess('Mobile number verified! Redirecting to login...');
      setTimeout(() => {
        navigate(`/login${planId ? `?planId=${planId}` : ''}`);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center py-20 px-4 relative min-h-[calc(100vh-4rem)] overflow-hidden">
      {/* Animated Trading Chart Background */}
      <TradingBackground />

      <div className="w-full max-w-md rounded-3xl p-8 sm:p-10 shadow-2xl glass-panel animate-fade-in relative z-10 border border-dark-700/80">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ccff00] text-black font-black text-xl shadow-[0_0_20px_rgba(204,255,0,0.4)] mb-4">
            ⚡
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Create Account</h1>
          <p className="text-xs text-gray-400 mt-1.5">
            {step === 'REGISTER' 
              ? <>Join <span className="text-[#ccff00] font-semibold">Scalper Akash</span> and unlock high-probability conviction setups.</> 
              : 'Enter verification OTP code sent to your mobile.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-accent-rose/10 border border-accent-rose/25 p-3.5 text-xs text-accent-rose">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-xl bg-accent-cyan/10 border border-accent-cyan/25 p-3.5 text-xs text-accent-cyan">
            {success}
          </div>
        )}

        {step === 'REGISTER' ? (
          <form onSubmit={handleRegister} className="space-y-4">
            
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="Enter full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-dark-900/90 border border-dark-700/90 pl-10 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Mobile Number</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                  <Phone className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  name="mobile"
                  required
                  placeholder="Enter 10-digit number"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-dark-900/90 border border-dark-700/90 pl-10 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-dark-900/90 border border-dark-700/90 pl-10 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Create password (min 6 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-dark-900/90 border border-dark-700/90 pl-10 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Referral Code (Optional)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                  <Gift className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  name="referralCode"
                  placeholder="Enter referral code"
                  value={formData.referralCode}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-dark-900/90 border border-dark-700/90 pl-10 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30 focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="lime-gradient-btn !w-full !rounded-xl !py-3.5 !text-xs !font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-6"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Register & Verify Mobile'}
            </button>

            <div className="text-center text-xs text-gray-400 mt-6 pt-4 border-t border-dark-700/50">
              Already have an account?{' '}
              <Link to={`/login${planId ? `?planId=${planId}` : ''}`} className="text-accent-cyan font-bold hover:underline">
                Sign In
              </Link>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="rounded-2xl bg-dark-900/90 border border-dark-700 p-4 text-center">
              <span className="text-xs text-gray-400 block mb-1">Developer Helper</span>
              <p className="text-xs text-accent-gold font-bold leading-normal">
                Simulated SMS code generated: <span className="underline select-all">{mockOtp}</span>
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Enter 6-Digit OTP</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                  <KeyRound className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="123456"
                  maxLength={6}
                  value={otpVal}
                  onChange={(e) => setOtpVal(e.target.value)}
                  className="w-full rounded-xl bg-dark-900/90 border border-dark-700/90 pl-10 pr-4 py-3.5 text-center text-sm font-semibold tracking-[0.4em] text-white focus:border-accent-cyan focus:ring-1 focus:ring-accent-cyan/30 focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="lime-gradient-btn !w-full !rounded-xl !py-3.5 !text-xs !font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Confirm Verification'}
            </button>

            <div className="text-center text-xs">
              <button 
                type="button" 
                onClick={() => setStep('REGISTER')} 
                className="text-gray-400 hover:text-white underline"
              >
                Back to Registration
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
