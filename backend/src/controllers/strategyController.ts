import { Request, Response } from 'express';
import { TradingStrategy, Backtest, User } from '../models/index';

// 1. Get user's strategies
export const getMyStrategies = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const strategies = await TradingStrategy.findAll({
      where: { userId },
      include: [
        {
          model: Backtest,
          order: [['createdAt', 'DESC']],
          limit: 1,
        },
      ],
      order: [['updatedAt', 'DESC']],
    });
    res.json(strategies);
  } catch (error: any) {
    console.error('Error fetching strategies:', error);
    res.status(500).json({ error: 'Failed to fetch strategies' });
  }
};

// 2. Get public strategy library templates
export const getPublicStrategies = async (req: Request, res: Response): Promise<void> => {
  try {
    const strategies = await TradingStrategy.findAll({
      where: { isPublic: true },
      include: [
        {
          model: User,
          attributes: ['id', 'fullName'],
        },
        {
          model: Backtest,
          order: [['netPnl', 'DESC']],
          limit: 1,
        },
      ],
      order: [['id', 'ASC']],
    });
    res.json(strategies);
  } catch (error: any) {
    console.error('Error fetching strategy library:', error);
    res.status(500).json({ error: 'Failed to fetch strategy library' });
  }
};

// 3. Create Strategy
export const createStrategy = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { name, description, market, instrument, timeframe, entryRules, filterRules, riskRules, exitRules, isPublic } = req.body;

    const strategy = await TradingStrategy.create({
      userId,
      name,
      description: description || '',
      market: market || 'NSE',
      instrument: instrument || 'NIFTY 50',
      timeframe: timeframe || '5M',
      entryRules: entryRules || [{ indicator: 'EMA_CROSS', fast: 9, slow: 21, condition: 'CROSS_ABOVE' }],
      filterRules: filterRules || [{ indicator: 'RSI', value: 55, condition: 'GREATER_THAN' }],
      riskRules: riskRules || { stopLossPercent: 0.8, riskRewardRatio: 2.0, maxRiskPerTrade: 1500 },
      exitRules: exitRules || [{ type: 'TARGET_HIT', ratio: 2.0 }],
      status: 'DRAFT',
      isPublic: Boolean(isPublic),
      version: '1.0.0',
    });

    res.status(201).json(strategy);
  } catch (error: any) {
    console.error('Error creating strategy:', error);
    res.status(500).json({ error: error.message || 'Failed to create strategy' });
  }
};

// 4. Update Strategy
export const updateStrategy = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const strategy = await TradingStrategy.findOne({ where: { id, userId } });
    if (!strategy) {
      res.status(404).json({ error: 'Strategy not found' });
      return;
    }

    await strategy.update(req.body);
    res.json(strategy);
  } catch (error: any) {
    console.error('Error updating strategy:', error);
    res.status(500).json({ error: 'Failed to update strategy' });
  }
};

// 5. Delete Strategy
export const deleteStrategy = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const strategy = await TradingStrategy.findOne({ where: { id, userId } });
    if (!strategy) {
      res.status(404).json({ error: 'Strategy not found' });
      return;
    }

    await strategy.destroy();
    res.json({ message: 'Strategy deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting strategy:', error);
    res.status(500).json({ error: 'Failed to delete strategy' });
  }
};

// 6. Run Deterministic Backtest Engine
export const runBacktest = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;
    const { strategyId } = req.params;
    const { instrument = 'NIFTY 50', timeframe = '5M', period = 'Last 90 Days', initialCapital = 100000 } = req.body;

    const strategy = await TradingStrategy.findByPk(strategyId);
    if (!strategy) {
      res.status(404).json({ error: 'Strategy not found' });
      return;
    }

    // Deterministic simulation generator calibrated on strategy rule parameters
    const totalDays = period === 'Last 30 Days' ? 30 : period === 'Last 180 Days' ? 180 : 90;
    const tradesCount = Math.floor(totalDays * (timeframe === '1M' ? 3.5 : timeframe === '5M' ? 1.8 : 0.8));
    
    // Seed calculation based on strategyId & rules
    const rrRatio = strategy.riskRules?.riskRewardRatio || 2.0;
    const targetWinRate = Math.min(78, Math.max(48, 52 + (strategy.filterRules?.length || 1) * 3));
    
    let currentBalance = Number(initialCapital);
    let peakBalance = currentBalance;
    let maxDrawdownAmount = 0;
    const simulatedTrades = [];
    const equityCurve = [{ trade: 0, date: 'Day 1', balance: currentBalance }];

    let winCount = 0;
    let grossProfit = 0;
    let grossLoss = 0;

    for (let i = 1; i <= tradesCount; i++) {
      // Deterministic pseudo-randomness based on index and strategyId
      const pseudoRandom = Math.sin(Number(strategyId) * 100 + i * 45) * 10000;
      const roll = (pseudoRandom - Math.floor(pseudoRandom)) * 100;
      const isWin = roll < targetWinRate;

      const riskPerTrade = Math.min(currentBalance * 0.015, 3000);
      let pnl = 0;

      if (isWin) {
        winCount++;
        pnl = riskPerTrade * rrRatio * (0.85 + (roll / 100) * 0.3);
        grossProfit += pnl;
      } else {
        pnl = -riskPerTrade * (0.95 + (roll / 100) * 0.1);
        grossLoss += Math.abs(pnl);
      }

      // Subtract slippage & brokerage
      pnl -= 40;
      currentBalance += pnl;

      if (currentBalance > peakBalance) {
        peakBalance = currentBalance;
      } else {
        const dd = peakBalance - currentBalance;
        if (dd > maxDrawdownAmount) maxDrawdownAmount = dd;
      }

      simulatedTrades.push({
        id: i,
        type: isWin ? 'WIN' : 'LOSS',
        instrument: instrument,
        timeframe: timeframe,
        entryPrice: 22000 + Math.floor(i * 12.5),
        exitPrice: 22000 + Math.floor(i * 12.5) + (isWin ? 45 : -25),
        pnl: Number(pnl.toFixed(2)),
        balanceAfter: Number(currentBalance.toFixed(2)),
        date: `Trade #${i}`,
      });

      if (i % Math.max(1, Math.floor(tradesCount / 20)) === 0 || i === tradesCount) {
        equityCurve.push({
          trade: i,
          date: `T#${i}`,
          balance: Number(currentBalance.toFixed(2)),
        });
      }
    }

    const netPnl = currentBalance - initialCapital;
    const winRate = tradesCount > 0 ? (winCount / tradesCount) * 100 : 0;
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 3.0;
    const maxDrawdownPercent = peakBalance > 0 ? (maxDrawdownAmount / peakBalance) * 100 : 0;
    const sharpeRatio = maxDrawdownPercent > 0 ? (netPnl / initialCapital) / (maxDrawdownPercent / 100) : 1.8;

    const backtest = await Backtest.create({
      strategyId: Number(strategyId),
      userId,
      instrument,
      timeframe,
      period,
      initialCapital,
      totalTrades: tradesCount,
      winningTrades: winCount,
      losingTrades: tradesCount - winCount,
      winRate: Number(winRate.toFixed(2)),
      netPnl: Number(netPnl.toFixed(2)),
      profitFactor: Number(profitFactor.toFixed(2)),
      maxDrawdown: Number(maxDrawdownPercent.toFixed(2)),
      sharpeRatio: Number(Math.min(4.5, Math.max(0.5, sharpeRatio)).toFixed(2)),
      tradesData: simulatedTrades.slice(-50), // keep latest 50 trades
      equityCurve,
    });

    // Update strategy status to TESTING or VALIDATED
    await strategy.update({
      status: winRate >= 55 && profitFactor >= 1.5 ? 'VALIDATED' : 'TESTING',
    });

    res.status(201).json(backtest);
  } catch (error: any) {
    console.error('Backtesting error:', error);
    res.status(500).json({ error: error.message || 'Backtesting execution failed' });
  }
};

// 7. Get backtests for strategy
export const getStrategyBacktests = async (req: Request, res: Response): Promise<void> => {
  try {
    const { strategyId } = req.params;
    const backtests = await Backtest.findAll({
      where: { strategyId },
      order: [['createdAt', 'DESC']],
    });
    res.json(backtests);
  } catch (error: any) {
    console.error('Error fetching backtests:', error);
    res.status(500).json({ error: 'Failed to fetch backtests' });
  }
};
