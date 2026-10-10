import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { 
  CreditCard, 
  Lock, 
  RefreshCw, 
  CheckCircle2, 
  XCircle,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { CommunityChannels } from '../components/CommunityChannels.js';

interface Plan {
  id: number;
  name: string;
  price: number;
  promoPrice: number | null;
  validityDays: number;
  allowedTrades: number;
  accessTier: string;
}

export const CheckoutPage: React.FC = () => {
  const { apiGet, apiPost, fetchProfile } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const planId = Number(searchParams.get('planId'));

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [order, setOrder] = useState<any>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [paymentStep, setPaymentStep] = useState<'DETAILS' | 'AUTHORIZING' | 'SUCCESS' | 'FAILED'>('DETAILS');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [invoiceNum, setInvoiceNum] = useState<string | null>(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  useEffect(() => {
    if (!planId) {
      navigate('/pricing');
      return;
    }
    fetchPlanDetails();
  }, [planId]);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      const data = await apiGet(`/plans/${planId}`);
      setPlan(data);
    } catch (err: any) {
      console.error('Failed to load plan:', err);
      setErrorMessage('Plan details could not be loaded.');
      setPlan(null);
    } finally {
      setLoading(false);
    }
  };

  const handleValidateCoupon = async () => {
    if (!couponCode.trim() || !plan) return;
    try {
      setValidatingCoupon(true);
      setCouponError(null);
      const res = await apiPost('/coupons/validate', {
        code: couponCode.trim(),
        orderType: 'PLAN',
        amount: plan.price
      });

      if (res.valid) {
        setAppliedCoupon(res);
      } else {
        setCouponError(res.reason || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (err: any) {
      setCouponError(err.message || 'Failed to validate promo code');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleCheckout = async () => {
    try {
      setSubmitting(true);
      setErrorMessage(null);

      // 1. Create order on the server with couponCode
      const orderData = await apiPost('/payments/create-order', {
        orderType: 'PLAN',
        planId,
        couponCode: appliedCoupon ? appliedCoupon.code : (couponCode.trim() || undefined)
      });
      setOrder(orderData);
      
      // 2. Open payment authorization simulation
      setPaymentStep('AUTHORIZING');
    } catch (err: any) {
      console.error('Order creation failed:', err);
      setErrorMessage(err.message || 'Failed to initialize payment order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulatePayment = async (status: 'SUCCESS' | 'FAILED') => {
    if (!order) return;
    try {
      setSubmitting(true);
      setPaymentStep('AUTHORIZING');
      
      // Artificial short delay to simulate network latency
      await new Promise(resolve => setTimeout(resolve, 1500));

      const paymentGatewayId = `pay_mock_${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

      // 3. Post verification to the server
      const verifyResponse = await apiPost('/payments/verify', {
        orderId: order.orderId,
        paymentGatewayId,
        status
      });

      if (verifyResponse.status === 'SUCCESS') {
        setInvoiceNum(verifyResponse.invoiceNumber);
        setPaymentStep('SUCCESS');
        await fetchProfile(); // refresh local subscription context state
      } else {
        setPaymentStep('FAILED');
      }
    } catch (err: any) {
      console.error('Payment verification failed:', err);
      setErrorMessage(err.message || 'Payment verification failed on the server');
      setPaymentStep('FAILED');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCw className="h-8 w-8 text-accent-blue animate-spin mb-4" />
        <span className="text-sm text-gray-400">Loading plan specifications...</span>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="py-16 px-4 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Order Checkout</h1>
        <p className="text-gray-400 text-xs mt-1">Complete your subscription for {plan.name}.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: Summary & Simulated gateway */}
        <div className="md:col-span-2 space-y-6">
          
          {paymentStep === 'DETAILS' && (
            <div className="rounded-xl bg-dark-800 p-6 glow-card animate-fade-in">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-accent-blue" />
                <span>Payment Options</span>
              </h2>

              <div className="space-y-4">
                <div className="rounded-lg border border-dark-600 bg-dark-850 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input type="radio" defaultChecked className="text-accent-blue focus:ring-0" />
                    <div>
                      <span className="text-xs font-semibold text-white block">Secure Indian UPI / NetBanking / Cards</span>
                      <span className="text-[10px] text-gray-400">Razorpay Encrypted Payment Core</span>
                    </div>
                  </div>
                  <Lock className="h-4 w-4 text-gray-500" />
                </div>
              </div>

              {errorMessage && (
                <div className="mt-4 rounded-lg bg-accent-rose/10 border border-accent-rose/20 p-3 text-xs text-accent-rose">
                  {errorMessage}
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={submitting}
                className="mt-6 w-full py-4 rounded-lg bg-accent-blue hover:bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {submitting ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <span>Initialize Gateway Order</span>
                )}
              </button>
            </div>
          )}

          {paymentStep === 'AUTHORIZING' && (
            <div className="rounded-xl bg-dark-800 p-8 text-center space-y-6 glow-card animate-fade-in border-accent-blue">
              <div className="flex justify-center">
                <RefreshCw className="h-10 w-10 text-accent-blue animate-spin" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Authorizing with Gateway</h3>
                <p className="text-xs text-gray-400 mt-1">Simulating payment processing environment. Please choose transaction outcome below:</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <button
                  onClick={() => handleSimulatePayment('SUCCESS')}
                  disabled={submitting}
                  className="px-6 py-3 rounded-lg bg-accent-emerald hover:bg-emerald-600 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Simulate Payment Success
                </button>
                <button
                  onClick={() => handleSimulatePayment('FAILED')}
                  disabled={submitting}
                  className="px-6 py-3 rounded-lg bg-accent-rose hover:bg-rose-600 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Simulate Payment Failure
                </button>
              </div>
            </div>
          )}

          {paymentStep === 'SUCCESS' && (
            <div className="rounded-2xl border border-emerald-500/40 bg-dark-900 p-8 text-center space-y-6 shadow-2xl glass-panel">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">Payment Verified Successfully!</h3>
                <p className="text-xs text-gray-400 mt-2">Your subscription is now ACTIVE and your trade signal credits have been allocated.</p>
                {invoiceNum && (
                  <span className="inline-block mt-3 px-3.5 py-1.5 rounded-xl bg-dark-950 border border-dark-700 text-xs font-mono font-bold text-accent-cyan">
                    Receipt: {invoiceNum}
                  </span>
                )}
              </div>

              {/* VIP Community Links */}
              <div className="text-left">
                <CommunityChannels isVip={true} />
              </div>

              <div className="pt-2">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full lime-gradient-btn !py-4 !text-xs"
                >
                  Access Member Trading Dashboard
                </button>
              </div>
            </div>
          )}

          {paymentStep === 'FAILED' && (
            <div className="rounded-xl border border-accent-rose bg-dark-800 p-8 text-center space-y-6">
              <div className="flex justify-center">
                <XCircle className="h-14 w-14 text-accent-rose" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Payment Authorization Failed</h3>
                <p className="text-xs text-gray-400 mt-2">The payment gateway transaction was rejected or cancelled.</p>
              </div>

              <button
                onClick={() => setPaymentStep('DETAILS')}
                className="px-6 py-3 rounded-lg bg-dark-700 hover:bg-dark-600 text-white font-bold text-xs transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

        </div>

        {/* Right Side: Order Summary Card */}
        <div className="rounded-xl bg-dark-800 p-6 h-fit glow-card animate-fade-in" style={{ animationDelay: '150ms' }}>
          <h2 className="text-xs font-bold text-white uppercase tracking-wider mb-4">Order Summary</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between text-xs border-b border-dark-700 pb-3">
              <span className="text-gray-400">Plan Name</span>
              <span className="font-semibold text-white">{plan.name}</span>
            </div>
            
            <div className="flex justify-between text-xs border-b border-dark-700 pb-3">
              <span className="text-gray-400">Duration</span>
              <span className="text-white">{plan.validityDays} Days</span>
            </div>

            <div className="flex justify-between text-xs border-b border-dark-700 pb-3">
              <span className="text-gray-400">Signal Credits</span>
              <span className="font-semibold text-white">{plan.allowedTrades} Setups</span>
            </div>

            {/* Promo Code Input Box */}
            <div className="pt-1 border-b border-dark-700 pb-3">
              <label className="block text-[11px] font-bold text-gray-300 mb-1.5">Have a Promo Coupon?</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. AKASH50"
                  className="flex-1 bg-dark-950 border border-dark-700 rounded-lg px-2.5 py-1.5 text-xs text-white uppercase focus:outline-none focus:border-[#d2fd2a]"
                />
                <button
                  type="button"
                  onClick={handleValidateCoupon}
                  disabled={validatingCoupon || !couponCode.trim()}
                  className="px-3 py-1.5 bg-[#d2fd2a] hover:bg-[#bcf018] text-black text-xs font-black rounded-lg transition-all"
                >
                  {validatingCoupon ? '...' : 'Apply'}
                </button>
              </div>
              {couponError && (
                <p className="text-[10px] text-rose-400 mt-1 font-semibold">{couponError}</p>
              )}
              {appliedCoupon && (
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded-md">
                  <span>Coupon {appliedCoupon.code} Applied!</span>
                  <span>-₹{appliedCoupon.discountAmount}</span>
                </div>
              )}
            </div>

            {appliedCoupon && (
              <div className="flex justify-between text-xs text-emerald-400 font-bold">
                <span>Discount Applied</span>
                <span>-₹{appliedCoupon.discountAmount}</span>
              </div>
            )}

            <div className="flex justify-between items-baseline pt-1">
              <span className="text-xs font-bold text-white">Final Amount Payable</span>
              <div className="text-right">
                <span className="text-lg font-black text-emerald-400">
                  ₹{appliedCoupon ? (plan.price - appliedCoupon.discountAmount).toLocaleString('en-IN') : plan.price.toLocaleString('en-IN')}
                </span>
                {appliedCoupon && (
                  <span className="block text-[10px] text-gray-500 line-through">
                    ₹{plan.price.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-lg bg-dark-900/60 border border-dark-750 p-3.5 flex gap-2">
            <ShieldCheck className="h-4 w-4 text-accent-emerald shrink-0 mt-0.5" />
            <p className="text-[10px] text-gray-400 leading-normal">
              Immutable receipt and order logs are recorded server-side for financial audit compliance.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
