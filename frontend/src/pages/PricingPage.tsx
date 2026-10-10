import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { Check, ShieldAlert, Activity, RefreshCw } from 'lucide-react';

interface Plan {
  id: number;
  name: string;
  price: number;
  promoPrice: number | null;
  validityDays: number;
  allowedTrades: number;
  accessTier: 'BASIC' | 'PREMIUM' | 'VIP';
  features: string[];
  riskInfo: string;
}

export const PricingPage: React.FC = () => {
  const { apiGet, user } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiGet('/plans');
      setPlans(data);
    } catch (err: any) {
      console.error('Error fetching plans:', err);
      setError('Unable to load pricing plans. Please try again.');
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (planId: number) => {
    if (!user) {
      // Redirect to register page first, passing the target plan
      navigate(`/register?planId=${planId}`);
    } else {
      // Redirect straight to checkout
      navigate(`/checkout?planId=${planId}`);
    }
  };

  return (
    <div className="py-6 sm:py-10 px-4 sm:px-6 max-w-7xl mx-auto min-h-[calc(100vh-4rem)] flex flex-col justify-center relative animate-fade-in overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#7c5cfc]/10 rounded-full blur-[140px] pointer-events-none animate-pulse-glow" />

      {/* Header with Compact Spacing */}
      <div className="text-center mb-6 sm:mb-8 relative z-10">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#141722] border border-white/10 px-3 py-0.5 text-[10px] font-black text-[#d2fd2a] mb-2 uppercase tracking-widest shadow-[0_0_15px_rgba(210,253,42,0.15)]">
          <Activity className="h-3 w-3 animate-pulse" />
          <span>FLEXIBLE SUBSCRIPTIONS</span>
        </span>
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">Trading Plan Pricing</h1>
        <p className="text-gray-400 text-xs sm:text-sm max-w-xl mx-auto mt-1">
          Choose a plan to get allocated high-conviction trade setups. Safe and verified transactions. Credits activate instantly.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <RefreshCw className="h-8 w-8 text-[#d2fd2a] animate-spin mb-3" />
          <span className="text-xs text-gray-400 animate-pulse">Loading verified plans...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-stretch relative z-10 max-w-6xl mx-auto w-full">
          {plans.map((plan) => {
            const isVIP = plan.accessTier === 'VIP';
            const isPremium = plan.accessTier === 'PREMIUM';
            
            return (
              <div key={plan.id} className="flex flex-col">
                <div 
                  className={`rounded-2xl p-5 sm:p-6 flex flex-col justify-between relative shadow-xl backdrop-blur-xl transition-all duration-300 flex-1 ${
                    isPremium 
                      ? 'bg-[#10131d] border-2 border-[#d2fd2a] shadow-[0_0_35px_rgba(210,253,42,0.18)] md:-translate-y-2' 
                      : isVIP 
                        ? 'bg-[#10131d] border border-violet-500/40 shadow-[0_0_30px_rgba(139,92,246,0.15)]' 
                        : 'bg-[#0e1017] border border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Badge */}
                  {isPremium && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#d2fd2a] px-3.5 py-0.5 text-[9px] font-black text-black uppercase tracking-wider shadow-md">
                      Most Popular
                    </span>
                  )}
                  
                  {isVIP && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-violet-600 px-3.5 py-0.5 text-[9px] font-black text-white uppercase tracking-wider shadow-md">
                      VIP Elite
                    </span>
                  )}

                  <div>
                    {/* Header */}
                    <div className="mb-3 border-b border-[#1c202e] pb-3">
                      <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wide mb-1">{plan.name}</h3>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl sm:text-3xl font-black text-white">₹{plan.price}</span>
                        <span className="text-[10px] sm:text-xs text-gray-400 font-bold uppercase">/ {plan.validityDays} Days</span>
                      </div>
                      {plan.promoPrice && (
                        <span className="text-[10px] text-rose-400 line-through block mt-0.5">
                          Was ₹{plan.price} (Promo: ₹{plan.promoPrice})
                        </span>
                      )}
                    </div>

                    {/* Trade credit pool */}
                    <div className="rounded-xl bg-[#08090d] py-2 px-3 border border-[#1c202e] text-center mb-3">
                      <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Allocation Pool</span>
                      <span className="text-xs sm:text-sm font-black text-[#d2fd2a]">{plan.allowedTrades} Trade Setups Guaranteed</span>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mb-4">
                      {plan.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-[11px] sm:text-xs text-gray-300">
                          <Check className="h-3.5 w-3.5 text-[#d2fd2a] shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    {/* Risk box */}
                    <div className="rounded-xl bg-[#08090d]/60 p-2.5 border border-[#1c202e] mb-4 flex gap-2">
                      <ShieldAlert className="h-3.5 w-3.5 text-violet-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[9px] font-bold text-white block uppercase">Risk Tier: {plan.accessTier}</span>
                        <p className="text-[8.5px] text-gray-400 leading-tight line-clamp-2">{plan.riskInfo}</p>
                      </div>
                    </div>

                    {/* Purchase button */}
                    <button
                      onClick={() => handlePurchase(plan.id)}
                      className={`w-full py-2.5 px-4 rounded-full text-xs font-black transition-all ${
                        isPremium 
                          ? 'lime-gradient-btn !py-2.5 !text-xs !shadow-md' 
                          : isVIP
                            ? 'purple-gradient-btn !py-2.5 !text-xs !shadow-md'
                            : 'glass-pill-btn !py-2.5 !text-xs'
                      }`}
                    >
                      Choose {plan.name}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
