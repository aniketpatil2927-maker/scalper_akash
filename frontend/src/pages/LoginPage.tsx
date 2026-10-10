import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Mail, Lock, RefreshCw } from 'lucide-react';
import { TradingBackground } from '../components/TradingBackground.js';

export const LoginPage: React.FC = () => {
  const { apiPost, login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('planId');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const response = await apiPost('/auth/login', { email, password });
      login(response.token, response.user);

      // Redirect logic
      if (planId) {
        navigate(`/checkout?planId=${planId}`);
      } else {
        // Check if admin or trader to redirect to correct panel
        const roles = response.user.roles || [];
        if (roles.includes('ADMIN') || roles.includes('SUPER_ADMIN')) {
          navigate('/admin');
        } else if (roles.includes('TRADER')) {
          navigate('/admin/trades');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
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
          <h1 className="text-2xl font-black text-white tracking-tight">Welcome Back</h1>
          <p className="text-xs text-gray-400 mt-1.5">Sign in to access your <span className="text-[#ccff00] font-semibold">Scalper Akash</span> conviction setups.</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-rose-500/10 border border-rose-500/25 p-3.5 text-xs text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-[#0e1017] border border-[#1c202e] pl-10 pr-4 py-3.5 text-xs text-white placeholder-gray-500 focus:border-[#ccff00] focus:outline-none transition-all"
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
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl bg-[#0e1017] border border-[#1c202e] pl-10 pr-4 py-3.5 text-xs text-white placeholder-gray-500 focus:border-[#ccff00] focus:outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="lime-gradient-btn !w-full !rounded-xl !py-3.5 !text-xs !font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 mt-6"
          >
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Sign In to Portal'}
          </button>

          <div className="text-center text-xs text-gray-400 mt-6 pt-4 border-t border-dark-700/50">
            Don't have an account?{' '}
            <Link to={`/register${planId ? `?planId=${planId}` : ''}`} className="text-accent-cyan font-bold hover:underline">
              Register Now
            </Link>
          </div>
        </form>

      </div>
    </div>
  );
};
