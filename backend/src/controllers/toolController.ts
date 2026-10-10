import { Request, Response } from 'express';
import { SavedCalculation } from '../models/index';

// 1. Unified Calculation Engine for 12 Pro Calculators
export const calculate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, params } = req.body;

    let result: any = {};

    switch (type) {
      case 'POSITION_SIZE': {
        const { accountSize, riskPercent, entryPrice, stopLossPrice } = params;
        const totalRiskAmount = (accountSize * riskPercent) / 100;
        const riskPerShare = Math.abs(entryPrice - stopLossPrice);
        const quantity = riskPerShare > 0 ? Math.floor(totalRiskAmount / riskPerShare) : 0;
        const totalCapitalRequired = quantity * entryPrice;
        result = {
          riskAmount: Number(totalRiskAmount.toFixed(2)),
          riskPerShare: Number(riskPerShare.toFixed(2)),
          recommendedQuantity: quantity,
          totalCapitalRequired: Number(totalCapitalRequired.toFixed(2)),
        };
        break;
      }

      case 'RISK_REWARD': {
        const { entryPrice, stopLoss, targetPrice } = params;
        const risk = Math.abs(entryPrice - stopLoss);
        const reward = Math.abs(targetPrice - entryPrice);
        const ratio = risk > 0 ? reward / risk : 0;
        result = {
          riskPerUnit: Number(risk.toFixed(2)),
          rewardPerUnit: Number(reward.toFixed(2)),
          riskRewardRatio: `1:${ratio.toFixed(2)}`,
          ratioValue: Number(ratio.toFixed(2)),
          isFavorable: ratio >= 1.5,
        };
        break;
      }

      case 'STOP_LOSS': {
        const { entryPrice, direction, riskPercent, atr } = params;
        let stopLoss = 0;
        if (atr && atr > 0) {
          stopLoss = direction === 'BUY' ? entryPrice - 1.5 * atr : entryPrice + 1.5 * atr;
        } else {
          const delta = (entryPrice * riskPercent) / 100;
          stopLoss = direction === 'BUY' ? entryPrice - delta : entryPrice + delta;
        }
        result = {
          recommendedStopLoss: Number(stopLoss.toFixed(2)),
          riskPoints: Number(Math.abs(entryPrice - stopLoss).toFixed(2)),
        };
        break;
      }

      case 'TARGET': {
        const { entryPrice, stopLoss, targetRatio = 2 } = params;
        const risk = Math.abs(entryPrice - stopLoss);
        const isBuy = entryPrice >= stopLoss;
        const target1 = isBuy ? entryPrice + risk * 1 : entryPrice - risk * 1;
        const target2 = isBuy ? entryPrice + risk * targetRatio : entryPrice - risk * targetRatio;
        const target3 = isBuy ? entryPrice + risk * (targetRatio + 1) : entryPrice - risk * (targetRatio + 1);
        result = {
          target1: Number(target1.toFixed(2)),
          target2: Number(target2.toFixed(2)),
          target3: Number(target3.toFixed(2)),
          riskPoints: Number(risk.toFixed(2)),
        };
        break;
      }

      case 'BROKERAGE': {
        const { buyPrice, sellPrice, quantity, segment = 'EQUITY_INTRADAY' } = params;
        const turnover = (buyPrice + sellPrice) * quantity;
        // Standard Indian broker calculation
        const brokerage = Math.min(40, turnover * 0.0005);
        const stt = segment === 'EQUITY_DELIVERY' ? turnover * 0.001 : (sellPrice * quantity) * 0.00025;
        const exchangeCharges = turnover * 0.0000345;
        const gst = (brokerage + exchangeCharges) * 0.18;
        const sebiCharges = turnover * 0.000001;
        const stampDuty = (buyPrice * quantity) * 0.00003;
        const totalCharges = brokerage + stt + exchangeCharges + gst + sebiCharges + stampDuty;
        const grossPnl = (sellPrice - buyPrice) * quantity;
        const netPnl = grossPnl - totalCharges;

        result = {
          turnover: Number(turnover.toFixed(2)),
          brokerage: Number(brokerage.toFixed(2)),
          stt: Number(stt.toFixed(2)),
          exchangeCharges: Number(exchangeCharges.toFixed(2)),
          gst: Number(gst.toFixed(2)),
          stampDuty: Number(stampDuty.toFixed(2)),
          totalTaxesAndCharges: Number(totalCharges.toFixed(2)),
          grossPnl: Number(grossPnl.toFixed(2)),
          netPnl: Number(netPnl.toFixed(2)),
          breakEvenPoints: Number((totalCharges / quantity).toFixed(2)),
        };
        break;
      }

      case 'PROFIT_LOSS': {
        const { entryPrice, exitPrice, quantity, direction = 'BUY' } = params;
        const pnl = direction === 'BUY' ? (exitPrice - entryPrice) * quantity : (entryPrice - exitPrice) * quantity;
        const investedAmount = entryPrice * quantity;
        const returnPercent = investedAmount > 0 ? (pnl / investedAmount) * 100 : 0;
        result = {
          pnl: Number(pnl.toFixed(2)),
          investedAmount: Number(investedAmount.toFixed(2)),
          returnPercent: Number(returnPercent.toFixed(2)),
          isProfitable: pnl > 0,
        };
        break;
      }

      case 'DRAWDOWN': {
        const { peakCapital, currentCapital } = params;
        const dropAmount = peakCapital - currentCapital;
        const drawdownPercent = peakCapital > 0 ? (dropAmount / peakCapital) * 100 : 0;
        const recoveryRequiredPercent = currentCapital > 0 ? (dropAmount / currentCapital) * 100 : 0;
        result = {
          drawdownAmount: Number(dropAmount.toFixed(2)),
          drawdownPercent: Number(drawdownPercent.toFixed(2)),
          recoveryRequiredPercent: Number(recoveryRequiredPercent.toFixed(2)),
        };
        break;
      }

      case 'CAPITAL_REQUIREMENT': {
        const { targetMonthlyIncome, riskPerTradePercent, winRatePercent, avgRiskRewardRatio, tradesPerMonth } = params;
        // Expected value per trade = (WinRate * Reward) - (LossRate * Risk)
        const winRate = winRatePercent / 100;
        const lossRate = 1 - winRate;
        const expectedUnitReturn = (winRate * avgRiskRewardRatio) - (lossRate * 1.0);
        const netExpectedUnits = expectedUnitReturn * tradesPerMonth;
        const requiredRiskPerTrade = netExpectedUnits > 0 ? targetMonthlyIncome / netExpectedUnits : 0;
        const requiredCapital = riskPerTradePercent > 0 ? (requiredRiskPerTrade / (riskPerTradePercent / 100)) : 0;

        result = {
          requiredCapital: Number(requiredCapital.toFixed(2)),
          requiredRiskPerTrade: Number(requiredRiskPerTrade.toFixed(2)),
          expectedMonthlyTrades: tradesPerMonth,
          edgePerTrade: Number(expectedUnitReturn.toFixed(2)),
        };
        break;
      }

      case 'COMPOUNDING': {
        const { startingCapital, monthlyReturnPercent, months, monthlyDeposit = 0 } = params;
        let capital = startingCapital;
        const growthBreakdown = [];

        for (let m = 1; m <= months; m++) {
          const profit = (capital * monthlyReturnPercent) / 100;
          capital = capital + profit + monthlyDeposit;
          growthBreakdown.push({
            month: m,
            profit: Number(profit.toFixed(2)),
            balance: Number(capital.toFixed(2)),
          });
        }

        const totalProfit = capital - startingCapital - (monthlyDeposit * months);

        result = {
          finalBalance: Number(capital.toFixed(2)),
          totalProfit: Number(totalProfit.toFixed(2)),
          totalDeposits: Number((monthlyDeposit * months).toFixed(2)),
          growthBreakdown: growthBreakdown.slice(0, 24), // first 24 months preview
        };
        break;
      }

      case 'TRADING_INCOME': {
        const { capital, expectedMonthlyReturnPercent, taxRatePercent = 15 } = params;
        const grossMonthlyIncome = (capital * expectedMonthlyReturnPercent) / 100;
        const taxDeduction = (grossMonthlyIncome * taxRatePercent) / 100;
        const netMonthlyIncome = grossMonthlyIncome - taxDeduction;
        const netAnnualIncome = netMonthlyIncome * 12;

        result = {
          grossMonthlyIncome: Number(grossMonthlyIncome.toFixed(2)),
          taxDeduction: Number(taxDeduction.toFixed(2)),
          netMonthlyIncome: Number(netMonthlyIncome.toFixed(2)),
          netAnnualIncome: Number(netAnnualIncome.toFixed(2)),
        };
        break;
      }

      case 'RISK_PER_TRADE': {
        const { capital, maxDailyLossPercent, maxTradesPerDay } = params;
        const maxDailyLossAmount = (capital * maxDailyLossPercent) / 100;
        const riskPerTrade = maxTradesPerDay > 0 ? maxDailyLossAmount / maxTradesPerDay : 0;

        result = {
          maxDailyLossAmount: Number(maxDailyLossAmount.toFixed(2)),
          riskPerTrade: Number(riskPerTrade.toFixed(2)),
          riskPerTradePercent: Number(((riskPerTrade / capital) * 100).toFixed(2)),
        };
        break;
      }

      case 'MARGIN': {
        const { price, quantity, leverage = 5 } = params;
        const totalValue = price * quantity;
        const marginRequired = leverage > 0 ? totalValue / leverage : totalValue;

        result = {
          totalValue: Number(totalValue.toFixed(2)),
          marginRequired: Number(marginRequired.toFixed(2)),
          leverageFactor: `${leverage}x`,
        };
        break;
      }

      default:
        res.status(400).json({ error: `Unknown calculator type: ${type}` });
        return;
    }

    res.json({ type, params, result });
  } catch (error: any) {
    console.error('Calculation error:', error);
    res.status(500).json({ error: error.message || 'Calculation failed' });
  }
};

// 2. Save calculation to user profile
export const saveCalculation = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { calcType, inputs, results, notes } = req.body;

    const saved = await SavedCalculation.create({
      userId,
      calcType,
      inputs,
      results,
      notes: notes || null,
    });

    res.status(201).json(saved);
  } catch (error: any) {
    console.error('Error saving calculation:', error);
    res.status(500).json({ error: 'Failed to save calculation' });
  }
};

// 3. Get user saved calculations
export const getSavedCalculations = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const calculations = await SavedCalculation.findAll({
      where: { userId },
      order: [['id', 'DESC']],
    });
    res.json(calculations);
  } catch (error: any) {
    console.error('Error fetching saved calculations:', error);
    res.status(500).json({ error: 'Failed to fetch calculations' });
  }
};

// 4. Delete saved calculation
export const deleteSavedCalculation = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const calc = await SavedCalculation.findOne({
      where: { id, userId },
    });

    if (!calc) {
      res.status(404).json({ error: 'Calculation not found' });
      return;
    }

    await calc.destroy();
    res.json({ message: 'Calculation deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting calculation:', error);
    res.status(500).json({ error: 'Failed to delete calculation' });
  }
};
