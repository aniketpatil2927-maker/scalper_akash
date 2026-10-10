import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { TradingJournalEntry, Trade } from '../models/index';
import { Op } from 'sequelize';

export const getJournalEntries = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { emotion, mistake, strategy, search } = req.query;

    const where: any = { userId };
    if (emotion) where.emotion = emotion;
    if (mistake) where.mistake = mistake;
    if (strategy) where.strategy = strategy;
    if (search) where.asset = { [Op.like]: `%${search}%` };

    const entries = await TradingJournalEntry.findAll({
      where,
      order: [['entryDate', 'DESC']],
      include: [
        {
          model: Trade,
          attributes: ['id', 'asset', 'direction', 'target1', 'stopLoss'],
        },
      ],
    });

    res.json(entries);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch journal entries' });
  }
};

export const createJournalEntry = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const {
      tradeId,
      asset,
      direction,
      entryPrice,
      exitPrice,
      quantity = 1,
      strategy = 'Breakout',
      emotion = 'DISCIPLINED',
      mistake = 'NONE',
      notes,
      screenshotUrl,
      entryDate = new Date(),
      exitDate = new Date(),
    } = req.body;

    if (!asset || !direction || entryPrice === undefined || exitPrice === undefined) {
      res.status(400).json({ error: 'Asset, direction, entry price, and exit price are required.' });
      return;
    }

    const numEntry = Number(entryPrice);
    const numExit = Number(exitPrice);
    const numQty = Number(quantity);

    // Calculate PnL
    const diff = direction === 'BUY' ? (numExit - numEntry) : (numEntry - numExit);
    const pnl = diff * numQty;
    const pnlPercentage = numEntry > 0 ? ((diff / numEntry) * 100).toFixed(2) : '0.00';

    const entry = await TradingJournalEntry.create({
      userId,
      tradeId: tradeId || null,
      asset,
      direction,
      entryPrice: numEntry,
      exitPrice: numExit,
      quantity: numQty,
      pnl,
      pnlPercentage: Number(pnlPercentage),
      strategy,
      emotion,
      mistake,
      notes,
      screenshotUrl,
      entryDate,
      exitDate,
    });

    res.status(201).json(entry);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create journal entry' });
  }
};

export const updateJournalEntry = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const {
      asset,
      direction,
      entryPrice,
      exitPrice,
      quantity,
      strategy,
      emotion,
      mistake,
      notes,
      screenshotUrl,
    } = req.body;

    const entry = await TradingJournalEntry.findOne({ where: { id, userId } });
    if (!entry) {
      res.status(404).json({ error: 'Journal entry not found' });
      return;
    }

    if (entryPrice !== undefined && exitPrice !== undefined) {
      const numEntry = Number(entryPrice);
      const numExit = Number(exitPrice);
      const numQty = Number(quantity || entry.quantity);
      const dir = direction || entry.direction;
      const diff = dir === 'BUY' ? (numExit - numEntry) : (numEntry - numExit);
      entry.pnl = diff * numQty;
      entry.pnlPercentage = Number(((diff / numEntry) * 100).toFixed(2));
      entry.entryPrice = numEntry;
      entry.exitPrice = numExit;
      entry.quantity = numQty;
    }

    if (asset) entry.asset = asset;
    if (direction) entry.direction = direction;
    if (strategy) entry.strategy = strategy;
    if (emotion) entry.emotion = emotion;
    if (mistake) entry.mistake = mistake;
    if (notes !== undefined) entry.notes = notes;
    if (screenshotUrl !== undefined) entry.screenshotUrl = screenshotUrl;

    await entry.save();
    res.json(entry);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update journal entry' });
  }
};

export const deleteJournalEntry = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const deleted = await TradingJournalEntry.destroy({ where: { id, userId } });
    if (!deleted) {
      res.status(404).json({ error: 'Journal entry not found or unauthorized' });
      return;
    }

    res.json({ message: 'Journal entry deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to delete journal entry' });
  }
};

export const getAiWeeklyReview = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const now = new Date();
    const d7 = new Date();
    d7.setDate(now.getDate() - 7);

    const entries = await TradingJournalEntry.findAll({
      where: {
        userId,
        entryDate: { [Op.gte]: d7 },
      },
      order: [['entryDate', 'DESC']],
    });

    const tradeCount = entries.length;
    const wins = entries.filter(e => Number(e.pnl) > 0);
    const losses = entries.filter(e => Number(e.pnl) <= 0);
    const winRate = tradeCount > 0 ? ((wins.length / tradeCount) * 100).toFixed(1) : '0';
    const totalPnl = entries.reduce((acc, curr) => acc + Number(curr.pnl), 0);

    // Calculate common mistakes
    const mistakeCounts: Record<string, number> = {};
    entries.forEach(e => {
      if (e.mistake && e.mistake !== 'NONE') {
        mistakeCounts[e.mistake] = (mistakeCounts[e.mistake] || 0) + 1;
      }
    });

    let topMistake = 'None (Clean Execution)';
    let maxMistakeCount = 0;
    Object.entries(mistakeCounts).forEach(([m, count]) => {
      if (count > maxMistakeCount) {
        maxMistakeCount = count;
        topMistake = m.replace('_', ' ');
      }
    });

    // Calculate disciplined score
    const disciplinedTrades = entries.filter(e => e.emotion === 'DISCIPLINED' || e.emotion === 'CALM').length;
    const disciplineScore = tradeCount > 0 ? Math.round((disciplinedTrades / tradeCount) * 100) : 85;

    res.json({
      tradesAnalyzed: tradeCount,
      winRate: Number(winRate),
      totalPnl,
      mostCommonMistake: topMistake,
      bestSetup: 'Opening Range Breakout (ORB)',
      disciplineScore,
      aiSummary: tradeCount > 0 
        ? `You logged ${tradeCount} trades this week with a net P&L of ₹${totalPnl.toLocaleString('en-IN')} (${winRate}% win rate). Your main area for optimization is avoiding ${topMistake}. Your discipline score is ${disciplineScore}/100.`
        : `Start logging your daily trades in the journal to receive personalized AI weakness diagnosis and setup optimization!`,
      improvementArea: 'Pre-market level marking & strict VWAP confluence',
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to generate AI weekly review' });
  }
};

export const bulkImportJournalEntries = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { entries } = req.body;

    if (!Array.isArray(entries) || entries.length === 0) {
      res.status(400).json({ error: 'Valid array of trades is required.' });
      return;
    }

    const created = await Promise.all(
      entries.map(async (t: any) => {
        const numEntry = Number(t.entryPrice) || 0;
        const numExit = Number(t.exitPrice) || 0;
        const numQty = Number(t.quantity) || 1;
        const direction = (t.direction || 'BUY').toUpperCase() === 'SELL' ? 'SELL' : 'BUY';
        const diff = direction === 'BUY' ? (numExit - numEntry) : (numEntry - numExit);
        const pnl = t.pnl !== undefined ? Number(t.pnl) : diff * numQty;
        const pnlPercentage = numEntry > 0 ? ((diff / numEntry) * 100).toFixed(2) : '0.00';

        return TradingJournalEntry.create({
          userId,
          asset: t.asset || 'NIFTY / BANKNIFTY',
          direction,
          entryPrice: numEntry,
          exitPrice: numExit,
          quantity: numQty,
          pnl,
          pnlPercentage: Number(pnlPercentage),
          strategy: t.strategy || 'Broker Tradebook Import',
          emotion: t.emotion || 'DISCIPLINED',
          mistake: t.mistake || 'NONE',
          notes: t.notes || `Imported via ${t.broker || 'Broker CSV'} tradebook statement`,
          entryDate: t.entryDate ? new Date(t.entryDate) : new Date(),
          exitDate: t.exitDate ? new Date(t.exitDate) : new Date(),
        });
      })
    );

    res.status(201).json({
      message: `Successfully imported ${created.length} trades into your trading journal.`,
      count: created.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to bulk import trades' });
  }
};
