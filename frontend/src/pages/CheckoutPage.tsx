import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { 
  Lock, 
  RefreshCw, 
  CheckCircle2, 
  XCircle,
  ShieldCheck,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Smartphone,
  Sparkles,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Crown
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

export const UPI_ID = 'mr.sky3558-1@okaxis';
export const UPI_PAYEE_NAME = 'Akash Patil';
export const UPI_QR_IMAGE = '/upi-qr-scanner.jpg';

export const CheckoutPage: React.FC = () => {
  const { apiGet, apiPost, fetchProfile, user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const planId = Number(searchParams.get('planId'));

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [order, setOrder] = useState<any>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [paymentStep, setPaymentStep] = useState<'DETAILS' | 'SUCCESS' | 'FAILED'>('DETAILS');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [invoiceNum, setInvoiceNum] = useState<string | null>(null);

  // UPI Payment states
  const [utrNumber, setUtrNumber] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState<boolean>(false);
  const [utrError, setUtrError] = useState<string | null>(null);

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
    const token = localStorage.getItem('token');
    if (!token && !user) {
      navigate(`/login?redirect=/checkout?planId=${planId}`);
      return;
    }
    fetchPlanDetails();
  }, [planId, user]);

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

  const finalAmount = plan 
    ? Math.max(0, (plan.price - (appliedCoupon?.discountAmount || 0)))
    : 0;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleValidateCoupon = async () => {
    if (!couponCode.trim() || !plan) return;
    try {
      setValidatingCoupon(true);
      setCouponError(null);
      const res = await apiPost('/coupons/validate', {
        code: couponCode.trim(),
        orderType: 'SUBSCRIPTION',
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

  const handleConfirmUpiPayment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!plan) return;

    const trimmedUtr = utrNumber.trim();
    if (!trimmedUtr) {
      setUtrError('Please enter the 12-digit UPI Reference / UTR Number from your payment app.');
      return;
    }

    if (trimmedUtr.length < 6) {
      setUtrError('UTR / Transaction ID must be at least 6 characters (typically 12 digits).');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage(null);
      setUtrError(null);

      // 1. Create or get Order on the server
      let currentOrder = order;
      if (!currentOrder) {
        currentOrder = await apiPost('/payments/create-order', {
          orderType: 'SUBSCRIPTION',
          planId: plan.id,
          couponCode: appliedCoupon ? appliedCoupon.code : (couponCode.trim() || undefined),
        });
        setOrder(currentOrder);
      }

      // 2. Post verification with the UTR number
      const verifyResponse = await apiPost('/payments/verify', {
        orderId: currentOrder.orderId,
        paymentGatewayId: trimmedUtr,
        utrNumber: trimmedUtr,
        gatewayName: 'UPI_QR',
        status: 'SUCCESS',
      });

      if (verifyResponse.status === 'SUCCESS') {
        setInvoiceNum(verifyResponse.invoiceNumber);
        setPaymentStep('SUCCESS');
        await fetchProfile(); // Automatically reload profile to activate subscription in UI
      } else {
        setPaymentStep('FAILED');
        setErrorMessage(verifyResponse.message || 'Payment verification could not be confirmed.');
      }
    } catch (err: any) {
      console.error('Payment confirmation failed:', err);
      setErrorMessage(err.message || 'Payment confirmation failed on the server.');
      setPaymentStep('FAILED');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper for testing
  const handleAutoFillDemoUtr = () => {
    const demoUtr = '4' + Math.floor(10000000000 + Math.random() * 90000000000).toString();
    setUtrNumber(demoUtr);
    setUtrError(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <RefreshCw className="h-8 w-8 text-[#ccff00] animate-spin mb-4" />
        <span className="text-sm text-gray-400">Loading plan specifications...</span>
      </div>
    );
  }

  if (!plan) return null;

  // Direct UPI Intent deep link for mobile apps
  const upiIntentUrl = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(UPI_PAYEE_NAME)}&am=${finalAmount}&cu=INR&tn=${encodeURIComponent(`Scalper Akash ${plan.name}`)}`;

  return (
    <div className="py-10 md:py-16 px-4 max-w-5xl mx-auto text-gray-200">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#ccff00]/10 border border-[#ccff00]/20 text-[#ccff00] text-xs font-black uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Official Scalper Akash Payment Portal</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Complete Plan Subscription</h1>
        <p className="text-gray-400 text-xs mt-1">Scan the official UPI QR Code below to activate your trading setups and VIP access.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: UPI QR Scanner & Confirmation Form (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {paymentStep === 'DETAILS' && (
            <div className="space-y-6">
              
              {/* Official UPI Scanner Card */}
              <div className="rounded-3xl bg-[#0e111a] border border-[#1e2333] p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#ccff00]/5 rounded-full blur-3xl pointer-events-none" />

                {/* Card Header: Akash Patil Merchant Profile */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-[#c2185b] flex items-center justify-center text-white font-black text-lg shadow-md border-2 border-white/20">
                      A
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-base font-black text-white">{UPI_PAYEE_NAME}</h3>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Verified
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">Scalper Akash Trading Desk</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Payable Amount</span>
                    <span className="text-xl font-black text-[#ccff00]">₹{finalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Center QR Code Display */}
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="relative p-3 rounded-2xl bg-white shadow-2xl border-4 border-[#1e2333] max-w-[260px] w-full aspect-square flex items-center justify-center group">
                    <img 
                      src={UPI_QR_IMAGE} 
                      alt="UPI Payment QR Code - Akash Patil" 
                      className="w-full h-full object-contain rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-xs">
                      <span className="px-3 py-1.5 rounded-xl bg-black/90 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-lg border border-white/20">
                        <QrCode className="w-4 h-4 text-[#ccff00]" /> Scan with Any App
                      </span>
                    </div>
                  </div>

                  {/* UPI ID Pill & Copy Button */}
                  <div className="w-full max-w-sm flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs">
                    <div className="flex items-center space-x-2 overflow-hidden px-1">
                      <span className="text-[10px] uppercase font-black text-gray-400">UPI ID:</span>
                      <span className="font-mono font-bold text-white truncate">{UPI_ID}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors shrink-0"
                    >
                      {copiedUpi ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#ccff00]" />
                          <span className="text-[#ccff00]">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Mobile Deep Link Button */}
                  <div className="w-full max-w-sm pt-1">
                    <a
                      href={upiIntentUrl}
                      className="w-full py-2.5 rounded-xl bg-[#0088cc]/20 hover:bg-[#0088cc]/30 border border-[#0088cc]/40 text-[#0088cc] hover:text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all shadow-sm"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Open in UPI App (GPay, PhonePe, Paytm)</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  </div>

                  {/* Supported Payment Logos / Apps */}
                  <div className="pt-2 text-center">
                    <span className="text-[10px] uppercase font-black text-gray-500 tracking-wider block mb-2">
                      Scan & Pay With Any UPI App
                    </span>
                    <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] font-bold text-gray-400">
                      <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white">Google Pay</span>
                      <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white">PhonePe</span>
                      <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white">Paytm</span>
                      <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white">BHIM UPI</span>
                      <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white">CRED</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Payment Confirmation Form (UTR Submission) */}
              <form onSubmit={handleConfirmUpiPayment} className="rounded-3xl bg-[#0e111a] border border-[#1e2333] p-6 shadow-2xl space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b border-white/10">
                  <span className="w-6 h-6 rounded-full bg-[#ccff00] text-black font-black text-xs flex items-center justify-center">
                    2
                  </span>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Confirm Payment & Enter UTR Number
                  </h3>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    12-Digit UPI Reference / UTR Number <span className="text-[#ccff00]">*</span>
                  </label>
                  <input
                    type="text"
                    value={utrNumber}
                    onChange={(e) => {
                      setUtrNumber(e.target.value.replace(/\s+/g, ''));
                      setUtrError(null);
                    }}
                    placeholder="e.g. 428512345678 or 248910293812"
                    className="w-full bg-[#141824] border border-white/10 focus:border-[#ccff00] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 font-mono focus:outline-none transition-colors"
                  />
                  <p className="text-[11px] text-gray-400 mt-1.5 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <span>Find this 12-digit number in your payment receipt labeled <strong>UPI Ref No.</strong>, <strong>UTR</strong>, or <strong>Transaction ID</strong>.</span>
                  </p>
                  {utrError && (
                    <p className="text-xs text-rose-400 mt-1.5 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{utrError}</span>
                    </p>
                  )}
                </div>

                {errorMessage && (
                  <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-xs text-rose-300 flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 rounded-xl bg-[#ccff00] hover:bg-[#b8e600] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-[0_0_20px_rgba(204,255,0,0.3)] disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-black" />
                        <span>Verifying Payment & Allocating Plan...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-black" />
                        <span>Confirm Payment & Activate My Plan</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleAutoFillDemoUtr}
                    className="text-[11px] text-gray-400 hover:text-white underline whitespace-nowrap px-2 py-1"
                    title="Auto-fill a test transaction ID for instant validation"
                  >
                    Auto-fill Test UTR
                  </button>
                </div>
              </form>

            </div>
          )}

          {/* Payment Success View */}
          {paymentStep === 'SUCCESS' && (
            <div className="rounded-3xl border border-emerald-500/40 bg-[#0e111a] p-8 text-center space-y-6 shadow-2xl glass-panel animate-fade-in">
              <div className="flex justify-center">
                <div className="w-20 h-20 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="h-12 w-12 text-emerald-400" />
                </div>
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Plan Activated • Active VIP Member
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-white mt-3">
                  Payment Confirmed Successfully!
                </h2>
                <p className="text-xs text-gray-400 mt-2 max-w-md mx-auto">
                  Your payment for <strong>{plan.name}</strong> has been verified. Your trade setups and VIP Telegram signal desk are now fully activated.
                </p>

                {invoiceNum && (
                  <div className="mt-4 inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-black/50 border border-white/10 text-xs font-mono font-bold text-[#ccff00]">
                    <span>Receipt:</span>
                    <span>{invoiceNum}</span>
                    {utrNumber && <span className="text-gray-400 font-normal">| UTR: {utrNumber}</span>}
                  </div>
                )}
              </div>

              {/* Plan Perks Allocated */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Allocated Plan</span>
                  <span className="text-sm font-black text-white mt-0.5 block">{plan.name}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Validity</span>
                  <span className="text-sm font-black text-emerald-400 mt-0.5 block">{plan.validityDays} Days</span>
                </div>
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 col-span-2 sm:col-span-1">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Signal Credits</span>
                  <span className="text-sm font-black text-[#ccff00] mt-0.5 block">{plan.allowedTrades} Setups</span>
                </div>
              </div>

              {/* Official VIP Telegram & Community Channels */}
              <div className="text-left pt-2">
                <CommunityChannels isVip={true} />
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 py-4 rounded-xl bg-[#ccff00] hover:bg-[#b8e600] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-[#ccff00]/20"
                >
                  <span>Go to Trading Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <Link
                  to="/history"
                  className="px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center justify-center transition-colors"
                >
                  View Invoices
                </Link>
              </div>
            </div>
          )}

          {/* Payment Failed View */}
          {paymentStep === 'FAILED' && (
            <div className="rounded-3xl border border-rose-500/40 bg-[#0e111a] p-8 text-center space-y-6 shadow-2xl">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <XCircle className="h-10 w-10 text-rose-400" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Payment Verification Issue</h3>
                <p className="text-xs text-gray-400 mt-2">
                  {errorMessage || 'We could not verify the transaction with the provided UTR. Please double check and try again.'}
                </p>
              </div>

              <button
                onClick={() => setPaymentStep('DETAILS')}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors"
              >
                Back to UPI Scanner
              </button>
            </div>
          )}

        </div>

        {/* Right Column: Order Summary Card (5 Cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-[#0e111a] border border-[#1e2333] p-6 shadow-2xl space-y-6 sticky top-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-2">
              <Crown className="w-4 h-4 text-[#ccff00]" />
              <span>Order Summary</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/5 text-gray-300 border border-white/10">
              {plan.accessTier} Tier
            </span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between border-b border-white/5 pb-2.5">
              <span className="text-gray-400">Selected Plan</span>
              <span className="font-bold text-white">{plan.name}</span>
            </div>

            <div className="flex justify-between border-b border-white/5 pb-2.5">
              <span className="text-gray-400">Access Tier</span>
              <span className="font-bold text-[#ccff00]">{plan.accessTier} VIP Signal Access</span>
            </div>

            <div className="flex justify-between border-b border-white/5 pb-2.5">
              <span className="text-gray-400">Validity Duration</span>
              <span className="font-bold text-white">{plan.validityDays} Days</span>
            </div>

            <div className="flex justify-between border-b border-white/5 pb-2.5">
              <span className="text-gray-400">Trade Setups Included</span>
              <span className="font-bold text-white">{plan.allowedTrades} Setups</span>
            </div>

            <div className="flex justify-between border-b border-white/5 pb-2.5">
              <span className="text-gray-400">Base Price</span>
              <span className="font-bold text-white">₹{plan.price.toLocaleString('en-IN')}</span>
            </div>

            {/* Promo Code Input */}
            <div className="pt-2 border-b border-white/10 pb-4">
              <label className="block text-[11px] font-bold text-gray-300 mb-1.5">Have a Promo Coupon?</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. SCALPER50"
                  className="flex-1 bg-[#141824] border border-white/10 rounded-xl px-3 py-2 text-xs text-white uppercase focus:outline-none focus:border-[#ccff00]"
                />
                <button
                  type="button"
                  onClick={handleValidateCoupon}
                  disabled={validatingCoupon || !couponCode.trim()}
                  className="px-3.5 py-2 bg-[#ccff00] hover:bg-[#b8e600] text-black text-xs font-black rounded-xl transition-all disabled:opacity-50"
                >
                  {validatingCoupon ? '...' : 'Apply'}
                </button>
              </div>
              {couponError && (
                <p className="text-[10px] text-rose-400 mt-1.5 font-semibold">{couponError}</p>
              )}
              {appliedCoupon && (
                <div className="mt-2 flex items-center justify-between text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                  <span>Coupon {appliedCoupon.code} Applied</span>
                  <span>-₹{appliedCoupon.discountAmount}</span>
                </div>
              )}
            </div>

            {/* Final Total */}
            <div className="flex justify-between items-baseline pt-2">
              <div>
                <span className="text-xs font-black uppercase text-white block">Net Payable</span>
                <span className="text-[10px] text-gray-400">Inclusive of all taxes</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-[#ccff00]">
                  ₹{finalAmount.toLocaleString('en-IN')}
                </span>
                {appliedCoupon && (
                  <span className="block text-xs text-gray-500 line-through">
                    ₹{plan.price.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-black/40 border border-white/10 p-4 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-bold text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Instant Verification & Activation</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Once you confirm your UPI payment with the UTR number, your plan is immediately credited with trade setups and VIP channel invitations.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
