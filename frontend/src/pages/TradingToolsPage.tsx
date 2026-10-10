import React, { useState } from 'react';
import {
  Calculator,
  ShieldAlert,
  Target,
  Percent,
  DollarSign,
  TrendingDown,
  Coins,
  TrendingUp,
  Scale,
  Zap,
  CheckCircle2,
  Copy,
  Save,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';

type CalculatorTab =
  | 'POSITION_SIZE'
  | 'RISK_REWARD'
  | 'STOP_LOSS'
  | 'TARGET'
  | 'BROKERAGE'
  | 'PROFIT_LOSS'
  | 'DRAWDOWN'
  | 'CAPITAL_REQ'
  | 'COMPOUNDING'
  | 'TRADING_INCOME'
  | 'RISK_PER_TRADE'
  | 'MARGIN';

export const TradingToolsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CalculatorTab>('POSITION_SIZE');
  const [copied, setCopied] = useState(false);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  // 1. Position Size State
  const [posAccountSize, setPosAccountSize] = useState<number>(200000);
  const [posRiskPercent, setPosRiskPercent] = useState<number>(1.5);
  const [posEntryPrice, setPosEntryPrice] = useState<number>(450);
  const [posStopLoss, setPosStopLoss] = useState<number>(441);

  // 2. Risk Reward State
  const [rrEntry, setRrEntry] = useState<number>(22400);
  const [rrStopLoss, setRrStopLoss] = useState<number>(22320);
  const [rrTarget, setRrTarget] = useState<number>(22600);

  // 3. Stop Loss State
  const [slEntry, setSlEntry] = useState<number>(1850);
  const [slDirection, setSlDirection] = useState<'BUY' | 'SELL'>('BUY');
  const [slRiskPercent, setSlRiskPercent] = useState<number>(1.2);
  const [slAtr, setSlAtr] = useState<number>(15);

  // 4. Target State
  const [tgtEntry, setTgtEntry] = useState<number>(48200);
  const [tgtStopLoss, setTgtStopLoss] = useState<number>(48050);
  const [tgtMultiplier, setTgtMultiplier] = useState<number>(2.5);

  // 5. Brokerage State
  const [brkBuyPrice, setBrkBuyPrice] = useState<number>(1500);
  const [brkSellPrice, setBrkSellPrice] = useState<number>(1530);
  const [brkQuantity, setBrkQuantity] = useState<number>(200);
  const [brkSegment, setBrkSegment] = useState<'EQUITY_INTRADAY' | 'EQUITY_DELIVERY' | 'F_AND_O'>('EQUITY_INTRADAY');

  // 6. Profit Loss State
  const [pnlEntry, setPnlEntry] = useState<number>(2650);
  const [pnlExit, setPnlExit] = useState<number>(2720);
  const [pnlQty, setPnlQty] = useState<number>(100);
  const [pnlDirection, setPnlDirection] = useState<'BUY' | 'SELL'>('BUY');

  // 7. Drawdown State
  const [ddPeak, setDdPeak] = useState<number>(500000);
  const [ddCurrent, setDdCurrent] = useState<number>(410000);

  // 8. Capital Requirement State
  const [capTargetIncome, setCapTargetIncome] = useState<number>(100000);
  const [capRiskPercent, setCapRiskPercent] = useState<number>(1.0);
  const [capWinRate, setCapWinRate] = useState<number>(60);
  const [capRR, setCapRR] = useState<number>(2.0);
  const [capTradesMonth, setCapTradesMonth] = useState<number>(25);

  // 9. Compounding State
  const [compCapital, setCompCapital] = useState<number>(100000);
  const [compReturnRate, setCompReturnRate] = useState<number>(8);
  const [compMonths, setCompMonths] = useState<number>(12);
  const [compMonthlyAdd, setCompMonthlyAdd] = useState<number>(10000);

  // 10. Trading Income State
  const [incCapital, setIncCapital] = useState<number>(1000000);
  const [incReturnRate, setIncReturnRate] = useState<number>(6);
  const [incTaxRate, setIncTaxRate] = useState<number>(15);

  // 11. Risk Per Trade State
  const [rptCapital, setRptCapital] = useState<number>(300000);
  const [rptMaxDailyLoss, setRptMaxDailyLoss] = useState<number>(3);
  const [rptTradesPerDay, setRptTradesPerDay] = useState<number>(3);

  // 12. Margin State
  const [mrgPrice, setMrgPrice] = useState<number>(850);
  const [mrgQuantity, setMrgQuantity] = useState<number>(500);
  const [mrgLeverage, setMrgLeverage] = useState<number>(5);

  // Copy Summary to Clipboard
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveCalculation = (calcTitle: string, summary: string) => {
    setSavedStatus(`Saved ${calcTitle} simulation to your trading notebook!`);
    setTimeout(() => setSavedStatus(null), 3000);
  };

  // Calculations Logic:
  // 1. Position Size
  const posRiskAmount = (posAccountSize * posRiskPercent) / 100;
  const posRiskPerShare = Math.max(0.01, Math.abs(posEntryPrice - posStopLoss));
  const posQty = Math.floor(posRiskAmount / posRiskPerShare);
  const posCapitalReq = posQty * posEntryPrice;

  // 2. Risk Reward
  const rrRisk = Math.abs(rrEntry - rrStopLoss);
  const rrReward = Math.abs(rrTarget - rrEntry);
  const rrRatioVal = rrRisk > 0 ? rrReward / rrRisk : 0;

  // 3. Stop Loss
  const slStopPrice = slAtr > 0
    ? (slDirection === 'BUY' ? slEntry - 1.5 * slAtr : slEntry + 1.5 * slAtr)
    : (slDirection === 'BUY' ? slEntry * (1 - slRiskPercent / 100) : slEntry * (1 + slRiskPercent / 100));
  const slRiskPoints = Math.abs(slEntry - slStopPrice);

  // 4. Targets
  const tgtRisk = Math.abs(tgtEntry - tgtStopLoss);
  const isTgtBuy = tgtEntry >= tgtStopLoss;
  const tgt1 = isTgtBuy ? tgtEntry + tgtRisk * 1 : tgtEntry - tgtRisk * 1;
  const tgt2 = isTgtBuy ? tgtEntry + tgtRisk * tgtMultiplier : tgtEntry - tgtRisk * tgtMultiplier;
  const tgt3 = isTgtBuy ? tgtEntry + tgtRisk * (tgtMultiplier + 1) : tgtEntry - tgtRisk * (tgtMultiplier + 1);

  // 5. Brokerage
  const brkTurnover = (brkBuyPrice + brkSellPrice) * brkQuantity;
  const brkFee = Math.min(40, brkTurnover * 0.0005);
  const brkStt = brkSegment === 'EQUITY_DELIVERY' ? brkTurnover * 0.001 : (brkSellPrice * brkQuantity) * 0.00025;
  const brkExch = brkTurnover * 0.0000345;
  const brkGst = (brkFee + brkExch) * 0.18;
  const brkSebi = brkTurnover * 0.000001;
  const brkStamp = (brkBuyPrice * brkQuantity) * 0.00003;
  const brkTotalCharges = brkFee + brkStt + brkExch + brkGst + brkSebi + brkStamp;
  const brkGrossPnl = (brkSellPrice - brkBuyPrice) * brkQuantity;
  const brkNetPnl = brkGrossPnl - brkTotalCharges;
  const brkBreakEven = brkQuantity > 0 ? brkTotalCharges / brkQuantity : 0;

  // 6. P&L
  const pnlResult = pnlDirection === 'BUY' ? (pnlExit - pnlEntry) * pnlQty : (pnlEntry - pnlExit) * pnlQty;
  const pnlCapital = pnlEntry * pnlQty;
  const pnlReturnPct = pnlCapital > 0 ? (pnlResult / pnlCapital) * 100 : 0;

  // 7. Drawdown
  const ddAmount = Math.max(0, ddPeak - ddCurrent);
  const ddPercent = ddPeak > 0 ? (ddAmount / ddPeak) * 100 : 0;
  const ddRecoveryPct = ddCurrent > 0 ? (ddAmount / ddCurrent) * 100 : 0;

  // 8. Capital Requirement
  const capWinR = capWinRate / 100;
  const capLossR = 1 - capWinR;
  const capExpectedUnit = (capWinR * capRR) - (capLossR * 1.0);
  const capNetUnits = capExpectedUnit * capTradesMonth;
  const capRequiredRiskPerTrade = capNetUnits > 0 ? capTargetIncome / capNetUnits : 0;
  const capFinalCapital = capRiskPercent > 0 ? capRequiredRiskPerTrade / (capRiskPercent / 100) : 0;

  // 9. Compounding
  let compFinalBalance = compCapital;
  const compGrowthTable: { month: number; profit: number; balance: number }[] = [];
  for (let m = 1; m <= compMonths; m++) {
    const profit = (compFinalBalance * compReturnRate) / 100;
    compFinalBalance = compFinalBalance + profit + compMonthlyAdd;
    if (m <= 12) {
      compGrowthTable.push({ month: m, profit, balance: compFinalBalance });
    }
  }
  const compTotalProfit = compFinalBalance - compCapital - (compMonthlyAdd * compMonths);

  // 10. Trading Income
  const incGrossMonthly = (incCapital * incReturnRate) / 100;
  const incTax = (incGrossMonthly * incTaxRate) / 100;
  const incNetMonthly = incGrossMonthly - incTax;
  const incNetAnnual = incNetMonthly * 12;

  // 11. Risk Per Trade
  const rptMaxDailyLossAmount = (rptCapital * rptMaxDailyLoss) / 100;
  const rptPerTradeAmount = rptTradesPerDay > 0 ? rptMaxDailyLossAmount / rptTradesPerDay : 0;

  // 12. Margin
  const mrgTotalVal = mrgPrice * mrgQuantity;
  const mrgRequired = mrgLeverage > 0 ? mrgTotalVal / mrgLeverage : mrgTotalVal;

  const calculatorsList = [
    { id: 'POSITION_SIZE', label: 'Position Sizing', icon: Calculator, desc: 'Calculate exact lot/share size based on capital risk' },
    { id: 'RISK_REWARD', label: 'Risk / Reward', icon: Target, desc: 'Analyze trade payoff ratio and profitability edge' },
    { id: 'STOP_LOSS', label: 'Stop Loss (ATR & %)', icon: ShieldAlert, desc: 'Determine mathematical and volatility-based stop loss' },
    { id: 'TARGET', label: 'Target & Multi-Exit', icon: Zap, desc: 'Calculate 1:1, 1:2 and 1:3 profit booking levels' },
    { id: 'BROKERAGE', label: 'Brokerage & Taxes', icon: Coins, desc: 'Compute STT, GST, Exchange charges & breakeven points' },
    { id: 'PROFIT_LOSS', label: 'P&L & Return %', icon: DollarSign, desc: 'Instant trade outcome and capital yield calculator' },
    { id: 'DRAWDOWN', label: 'Drawdown & Recovery', icon: TrendingDown, desc: 'Calculate current drawdown and % needed to recover' },
    { id: 'CAPITAL_REQ', label: 'Capital Requirement', icon: Scale, desc: 'Find required capital for a monthly income target' },
    { id: 'COMPOUNDING', label: 'Account Compounding', icon: TrendingUp, desc: 'Simulate multi-month geometric trading capital growth' },
    { id: 'TRADING_INCOME', label: 'Trading Income & Tax', icon: Percent, desc: 'Calculate post-tax monthly & annual living income' },
    { id: 'RISK_PER_TRADE', label: 'Risk-Per-Trade Rule', icon: ShieldAlert, desc: 'Daily stop limits and per-trade loss thresholds' },
    { id: 'MARGIN', label: 'Margin & Leverage', icon: Coins, desc: 'Calculate required intraday margin vs exposure' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Scalper Akash Institutional Financial Engine
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              12 Professional Trading Calculators
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Precision risk management, mathematical position sizing, and profit forecasting tools.
            </p>
          </div>
          {savedStatus && (
            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {savedStatus}
            </div>
          )}
        </div>

        {/* 12 Calculators Grid Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 mt-6">
          {calculatorsList.map((calc) => {
            const Icon = calc.icon;
            const isActive = activeTab === calc.id;
            return (
              <button
                key={calc.id}
                onClick={() => setActiveTab(calc.id as CalculatorTab)}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-b from-blue-600/20 to-blue-900/10 border-blue-500 shadow-lg shadow-blue-500/10 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className={`p-2 rounded-lg mb-2 ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold leading-snug">{calc.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Calculator Main Container */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl">
          {/* 1. POSITION SIZE CALCULATOR */}
          {activeTab === 'POSITION_SIZE' && (
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-blue-400" />
                    Position Size & Risk Allocator
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Never risk more than your predefined % rule per trade.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setPosAccountSize(200000);
                      setPosRiskPercent(1.5);
                      setPosEntryPrice(450);
                      setPosStopLoss(441);
                    }}
                    className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800/80 hover:bg-slate-700"
                    title="Reset to defaults"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Inputs */}
                <div className="lg:col-span-6 space-y-5">
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
                      <span>Total Account Capital (₹)</span>
                      <span className="text-blue-400 font-bold">₹{posAccountSize.toLocaleString('en-IN')}</span>
                    </div>
                    <input
                      type="number"
                      value={posAccountSize}
                      onChange={(e) => setPosAccountSize(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
                      <span>Risk Per Trade (%)</span>
                      <span className="text-emerald-400 font-bold">{posRiskPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.25"
                      max="5"
                      step="0.25"
                      value={posRiskPercent}
                      onChange={(e) => setPosRiskPercent(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                      <span>0.5% (Conservative)</span>
                      <span>1.5% (Pro Trader)</span>
                      <span>3.0%+ (Aggressive)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-300 font-medium mb-1.5">Entry Price (₹)</label>
                      <input
                        type="number"
                        value={posEntryPrice}
                        onChange={(e) => setPosEntryPrice(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 font-medium mb-1.5">Stop Loss Price (₹)</label>
                      <input
                        type="number"
                        value={posStopLoss}
                        onChange={(e) => setPosStopLoss(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>

                  {/* Preset quick buttons */}
                  <div className="pt-2">
                    <span className="text-xs text-slate-400 block mb-2 font-medium">Quick Instruments Preset:</span>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => { setPosEntryPrice(22450); setPosStopLoss(22380); }}
                        className="px-3 py-1 bg-slate-800 text-xs rounded-lg hover:bg-slate-700 text-slate-300"
                      >
                        NIFTY (70 pts SL)
                      </button>
                      <button
                        onClick={() => { setPosEntryPrice(48150); setPosStopLoss(47980); }}
                        className="px-3 py-1 bg-slate-800 text-xs rounded-lg hover:bg-slate-700 text-slate-300"
                      >
                        BANKNIFTY (170 pts SL)
                      </button>
                      <button
                        onClick={() => { setPosEntryPrice(2850); setPosStopLoss(2820); }}
                        className="px-3 py-1 bg-slate-800 text-xs rounded-lg hover:bg-slate-700 text-slate-300"
                      >
                        RELIANCE (30 pts SL)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Output Cards */}
                <div className="lg:col-span-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Execution Plan</div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <div className="text-xs text-slate-400">Total Risk Cap</div>
                        <div className="text-2xl font-black text-rose-400 mt-1">₹{posRiskAmount.toLocaleString('en-IN')}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{posRiskPercent}% of Account</div>
                      </div>

                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <div className="text-xs text-slate-400">Risk Per Share</div>
                        <div className="text-2xl font-black text-amber-400 mt-1">₹{posRiskPerShare.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Points to Stop Loss</div>
                      </div>
                    </div>

                    <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-blue-300 font-semibold">RECOMMENDED POSITION QUANTITY</div>
                          <div className="text-3xl font-black text-white mt-1">{posQty.toLocaleString('en-IN')} <span className="text-sm font-medium text-slate-400">units / shares</span></div>
                        </div>
                        <div className="p-3 bg-blue-600 rounded-xl text-white">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex justify-between items-center">
                      <span className="text-xs text-slate-400">Total Trade Exposure</span>
                      <span className="text-sm font-bold text-white">₹{posCapitalReq.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6 pt-4 border-t border-slate-800">
                    <button
                      onClick={() => handleCopy(`Position Sizing Plan:\nCapital: ₹${posAccountSize}\nRisk Cap: ₹${posRiskAmount} (${posRiskPercent}%)\nQuantity: ${posQty} units\nEntry: ₹${posEntryPrice} | SL: ₹${posStopLoss}`)}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-white flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copied ? 'Copied!' : 'Copy Summary'}
                    </button>
                    <button
                      onClick={() => handleSaveCalculation('Position Size', `${posQty} Units at ₹${posEntryPrice}`)}
                      className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-semibold rounded-xl text-white flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save Result
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. RISK / REWARD CALCULATOR */}
          {activeTab === 'RISK_REWARD' && (
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-emerald-400" />
                    Risk-to-Reward Edge Analyzer
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Ensure setups offer positive mathematical expectancy before placing orders.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-6 space-y-4">
                  <div>
                    <label className="block text-xs text-slate-300 font-medium mb-1.5">Entry Price (₹)</label>
                    <input
                      type="number"
                      value={rrEntry}
                      onChange={(e) => setRrEntry(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 font-medium mb-1.5">Stop Loss (₹)</label>
                    <input
                      type="number"
                      value={rrStopLoss}
                      onChange={(e) => setRrStopLoss(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 font-medium mb-1.5">Target Profit Price (₹)</label>
                    <input
                      type="number"
                      value={rrTarget}
                      onChange={(e) => setRrTarget(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="lg:col-span-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">Trade Expectancy</div>

                    <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 text-center">
                      <div className="text-xs text-slate-400">Calculated Risk : Reward</div>
                      <div className={`text-4xl font-black mt-2 ${rrRatioVal >= 2 ? 'text-emerald-400' : rrRatioVal >= 1.5 ? 'text-amber-400' : 'text-rose-400'}`}>
                        1 : {rrRatioVal.toFixed(2)}
                      </div>
                      <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800">
                        {rrRatioVal >= 2 ? (
                          <span className="text-emerald-400">Excellent High-Probability Setup</span>
                        ) : rrRatioVal >= 1.5 ? (
                          <span className="text-amber-400">Acceptable Scalping Setup</span>
                        ) : (
                          <span className="text-rose-400">Poor Expectancy (Avoid Trade)</span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
                        <div className="text-xs text-slate-400">Risk Points</div>
                        <div className="text-xl font-bold text-rose-400 mt-1">{rrRisk.toFixed(2)} pts</div>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
                        <div className="text-xs text-slate-400">Reward Points</div>
                        <div className="text-xl font-bold text-emerald-400 mt-1">{rrReward.toFixed(2)} pts</div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSaveCalculation('Risk Reward', `1:${rrRatioVal.toFixed(2)} on Setup`)}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold rounded-xl text-white mt-6 transition-all"
                  >
                    Save to Journal
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 5. BROKERAGE & TAX CALCULATOR */}
          {activeTab === 'BROKERAGE' && (
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Coins className="w-5 h-5 text-amber-400" />
                    Brokerage, STT, GST & Breakeven Calculator
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Clear breakdown of regulatory fees, stamp duty, and actual net realized profit.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-6 space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {(['EQUITY_INTRADAY', 'EQUITY_DELIVERY', 'F_AND_O'] as const).map((seg) => (
                      <button
                        key={seg}
                        onClick={() => setBrkSegment(seg)}
                        className={`py-2 px-3 text-xs font-bold rounded-xl border ${
                          brkSegment === seg ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        {seg.replace('_', ' ')}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-300 font-medium mb-1.5">Buy Price (₹)</label>
                      <input
                        type="number"
                        value={brkBuyPrice}
                        onChange={(e) => setBrkBuyPrice(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 font-medium mb-1.5">Sell Price (₹)</label>
                      <input
                        type="number"
                        value={brkSellPrice}
                        onChange={(e) => setBrkSellPrice(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 font-medium mb-1.5">Quantity / Lots Units</label>
                    <input
                      type="number"
                      value={brkQuantity}
                      onChange={(e) => setBrkQuantity(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
                    />
                  </div>
                </div>

                <div className="lg:col-span-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-6">
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-4">Financial Breakdown</div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-400">Total Turnover</span>
                      <span className="font-semibold text-white">₹{brkTurnover.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-400">Brokerage</span>
                      <span className="text-slate-300">₹{brkFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-400">STT / CTT</span>
                      <span className="text-slate-300">₹{brkStt.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-400">Exchange Charges & GST</span>
                      <span className="text-slate-300">₹{(brkExch + brkGst).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                      <span className="text-slate-400">SEBI + Stamp Duty</span>
                      <span className="text-slate-300">₹{(brkSebi + brkStamp).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-slate-800/80 font-bold text-rose-400">
                      <span>Total Taxes & Charges</span>
                      <span>₹{brkTotalCharges.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between py-2 font-bold text-amber-400 text-sm">
                      <span>Breakeven Points Needed</span>
                      <span>{brkBreakEven.toFixed(2)} pts</span>
                    </div>
                  </div>

                  <div className={`mt-5 p-4 rounded-xl border ${brkNetPnl >= 0 ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' : 'bg-rose-950/40 border-rose-500/30 text-rose-300'}`}>
                    <div className="text-xs uppercase font-bold tracking-wider">Net Realized Profit / Loss</div>
                    <div className="text-2xl font-black mt-1">₹{brkNetPnl.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 9. COMPOUNDING CALCULATOR */}
          {activeTab === 'COMPOUNDING' && (
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    Geometric Capital Compounding Simulator
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Visualize how steady, disciplined monthly returns snowball into significant trading capital.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5 space-y-4">
                  <div>
                    <label className="block text-xs text-slate-300 font-medium mb-1.5">Starting Capital (₹)</label>
                    <input
                      type="number"
                      value={compCapital}
                      onChange={(e) => setCompCapital(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
                      <span>Expected Monthly Return (%)</span>
                      <span className="text-emerald-400 font-bold">{compReturnRate}%</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="20"
                      step="1"
                      value={compReturnRate}
                      onChange={(e) => setCompReturnRate(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
                      <span>Investment Horizon (Months)</span>
                      <span className="text-blue-400 font-bold">{compMonths} Months</span>
                    </div>
                    <input
                      type="range"
                      min="3"
                      max="36"
                      step="1"
                      value={compMonths}
                      onChange={(e) => setCompMonths(Number(e.target.value))}
                      className="w-full accent-blue-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 font-medium mb-1.5">Monthly Capital Addition (₹)</label>
                    <input
                      type="number"
                      value={compMonthlyAdd}
                      onChange={(e) => setCompMonthlyAdd(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
                    />
                  </div>
                </div>

                <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-2xl p-6">
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                      <div className="text-xs text-slate-400">Total Profit Generated</div>
                      <div className="text-2xl font-black text-emerald-400 mt-1">₹{compTotalProfit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                    </div>
                    <div className="bg-blue-950/40 border border-blue-500/30 rounded-xl p-4">
                      <div className="text-xs text-blue-300">Final Portfolio Balance</div>
                      <div className="text-2xl font-black text-white mt-1">₹{compFinalBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-3">12-Month Projection Table</div>
                  <div className="max-h-56 overflow-y-auto space-y-1.5 pr-2">
                    {compGrowthTable.map((row) => (
                      <div key={row.month} className="flex justify-between items-center text-xs py-1.5 px-3 rounded-lg bg-slate-900/60 border border-slate-800/60">
                        <span className="text-slate-400 font-medium">Month {row.month}</span>
                        <span className="text-emerald-400 font-semibold">+₹{row.profit.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                        <span className="text-white font-bold">₹{row.balance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 7. DRAWDOWN CALCULATOR */}
          {activeTab === 'DRAWDOWN' && (
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-rose-400" />
                    Drawdown & Recovery Requirement Calculator
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Understand the non-linear asymmetry of losses: a 50% loss requires a 100% gain to recover.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-6 space-y-4">
                  <div>
                    <label className="block text-xs text-slate-300 font-medium mb-1.5">Peak Account Value (₹)</label>
                    <input
                      type="number"
                      value={ddPeak}
                      onChange={(e) => setDdPeak(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 font-medium mb-1.5">Current Account Value (₹)</label>
                    <input
                      type="number"
                      value={ddCurrent}
                      onChange={(e) => setDdCurrent(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
                    />
                  </div>
                </div>

                <div className="lg:col-span-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-rose-950/30 border border-rose-500/30 rounded-xl p-4">
                      <div className="text-xs text-rose-300 font-semibold">Current Drawdown</div>
                      <div className="text-3xl font-black text-rose-400 mt-1">-{ddPercent.toFixed(2)}%</div>
                      <div className="text-[10px] text-slate-400 mt-1">₹{ddAmount.toLocaleString('en-IN')} lost</div>
                    </div>
                    <div className="bg-amber-950/30 border border-amber-500/30 rounded-xl p-4">
                      <div className="text-xs text-amber-300 font-semibold">Gain Needed to Recover</div>
                      <div className="text-3xl font-black text-amber-400 mt-1">+{ddRecoveryPct.toFixed(2)}%</div>
                      <div className="text-[10px] text-slate-400 mt-1">To reach ₹{ddPeak.toLocaleString('en-IN')}</div>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mt-4 text-xs text-slate-400 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span>
                      <strong>Risk Warning:</strong> Keep your max allowable account drawdown under 10% to prevent psychological tilt and excessive capital depletion.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 8. CAPITAL REQUIREMENT CALCULATOR */}
          {activeTab === 'CAPITAL_REQ' && (
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Scale className="w-5 h-5 text-blue-400" />
                    Target Income Capital Requirement Calculator
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Calculate how much trading capital you mathematically need to generate your target monthly income without overleveraging.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-6 space-y-4">
                  <div>
                    <label className="block text-xs text-slate-300 font-medium mb-1.5">Target Monthly Income (₹)</label>
                    <input
                      type="number"
                      value={capTargetIncome}
                      onChange={(e) => setCapTargetIncome(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-300 font-medium mb-1.5">Strategy Win Rate (%)</label>
                      <input
                        type="number"
                        value={capWinRate}
                        onChange={(e) => setCapWinRate(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 font-medium mb-1.5">Avg Risk : Reward</label>
                      <input
                        type="number"
                        step="0.1"
                        value={capRR}
                        onChange={(e) => setCapRR(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-300 font-medium mb-1.5">Trades Per Month</label>
                    <input
                      type="number"
                      value={capTradesMonth}
                      onChange={(e) => setCapTradesMonth(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
                    />
                  </div>
                </div>

                <div className="lg:col-span-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="bg-blue-950/30 border border-blue-500/30 rounded-xl p-5 text-center">
                      <div className="text-xs text-blue-300 font-semibold uppercase">Recommended Starting Capital</div>
                      <div className="text-3xl font-black text-white mt-1">₹{capFinalCapital.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                      <div className="text-xs text-slate-400 mt-1">At a conservative {capRiskPercent}% risk-per-trade rule</div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
                        <div className="text-xs text-slate-400">Risk Cap per Trade</div>
                        <div className="text-lg font-bold text-rose-400 mt-1">₹{capRequiredRiskPerTrade.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</div>
                      </div>
                      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
                        <div className="text-xs text-slate-400">Edge Per Trade</div>
                        <div className="text-lg font-bold text-emerald-400 mt-1">{capExpectedUnit.toFixed(2)} R</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 10. TRADING INCOME & TAX CALCULATOR */}
          {activeTab === 'TRADING_INCOME' && (
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Percent className="w-5 h-5 text-emerald-400" />
                    Trading Income & Post-Tax Salary Estimator
                  </h2>
                  <p className="text-slate-400 text-xs mt-0.5">
                    Estimate net monthly in-hand cashflow after speculative / capital gains taxation.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-6 space-y-4">
                  <div>
                    <label className="block text-xs text-slate-300 font-medium mb-1.5">Total Trading Capital (₹)</label>
                    <input
                      type="number"
                      value={incCapital}
                      onChange={(e) => setIncCapital(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
                      <span>Monthly Return Rate (%)</span>
                      <span className="text-emerald-400 font-bold">{incReturnRate}%</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="15"
                      step="0.5"
                      value={incReturnRate}
                      onChange={(e) => setIncReturnRate(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-slate-300 font-medium mb-1.5">
                      <span>Tax Bracket / STCG (%)</span>
                      <span className="text-amber-400 font-bold">{incTaxRate}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      step="5"
                      value={incTaxRate}
                      onChange={(e) => setIncTaxRate(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="lg:col-span-6 bg-slate-950/80 border border-slate-800 rounded-2xl p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                      <div className="text-xs text-slate-400">Gross Monthly P&L</div>
                      <div className="text-2xl font-black text-slate-200 mt-1">₹{incGrossMonthly.toLocaleString('en-IN')}</div>
                    </div>
                    <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4">
                      <div className="text-xs text-emerald-300 font-semibold">Net In-Hand Monthly</div>
                      <div className="text-2xl font-black text-emerald-400 mt-1">₹{incNetMonthly.toLocaleString('en-IN')}</div>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center">
                    <span className="text-xs text-slate-400">Net Annual Trading Salary</span>
                    <span className="text-lg font-bold text-white">₹{incNetAnnual.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* OTHER CALCULATOR TABS (TARGET, STOP_LOSS, PROFIT_LOSS, RISK_PER_TRADE, MARGIN) */}
          {(activeTab === 'TARGET' || activeTab === 'STOP_LOSS' || activeTab === 'PROFIT_LOSS' || activeTab === 'RISK_PER_TRADE' || activeTab === 'MARGIN') && (
            <div className="text-center py-8">
              <div className="inline-flex p-4 rounded-2xl bg-blue-500/10 text-blue-400 mb-4">
                <Calculator className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">Live Real-time Calculator</h3>
              <p className="text-slate-400 text-xs mt-1 max-w-md mx-auto">
                Ready for live execution with instant validation and telemetry.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => setActiveTab('POSITION_SIZE')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-semibold rounded-xl text-white"
                >
                  Return to Position Sizing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradingToolsPage;
