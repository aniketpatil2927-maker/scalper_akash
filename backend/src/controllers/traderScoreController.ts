import { Request, Response } from 'express';
import { TradingJournalEntry, Trade } from '../models/index';

export const getTraderScore = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.id;

    // Fetch user's journal entries
    const entries = await TradingJournalEntry.findAll({
      where: { userId },
      order: [['entryDate', 'DESC']],
      limit: 50,
    });

    const totalTrades = entries.length;

    // Default baseline score for new accounts
    if (totalTrades === 0) {
      res.json({
        totalScore: 70,
        grade: 'B+',
        tierLabel: 'Developing Trader',
        components: {
          riskManagement: { score: 18, max: 25, label: 'Risk Control' },
          discipline: { score: 18, max: 25, label: 'Trade Discipline' },
          consistency: { score: 17, max: 25, label: 'Strategy Win-Rate' },
          journalAdherence: { score: 17, max: 25, label: 'Journaling Habit' },
        },
        weakAreas: ['Insufficient journal logs', 'Execute more logged trades to calibrate your score'],
        recommendations: [
          'Log your next 5 trades with entry/exit rationale and stop-loss levels',
          'Maintain a consistent 1:2 risk-to-reward ratio on every setup',
          'Avoid risking more than 2% of total capital on any single position',
        ],
        recentTradesAnalyzed: 0,
      });
      return;
    }

    // 1. Calculate Win Rate & Consistency (Max 25 pts)
    const winningTrades = entries.filter(e => Number(e.pnl) > 0);
    const winRate = (winningTrades.length / totalTrades) * 100;
    let consistencyScore = Math.min(25, Math.round((winRate / 100) * 20 + 5));

    // 2. Risk Management (Max 25 pts) - check stopLoss compliance and avg loss size
    const losingTrades = entries.filter(e => Number(e.pnl) < 0);
    const avgWin = winningTrades.length > 0
      ? winningTrades.reduce((acc, curr) => acc + Number(curr.pnl), 0) / winningTrades.length
      : 1;
    const avgLoss = losingTrades.length > 0
      ? Math.abs(losingTrades.reduce((acc, curr) => acc + Number(curr.pnl), 0) / losingTrades.length)
      : 1;

    const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 2.0;
    let riskScore = 15;
    if (profitFactor >= 2.0) riskScore = 25;
    else if (profitFactor >= 1.5) riskScore = 22;
    else if (profitFactor >= 1.0) riskScore = 18;
    else riskScore = 12;

    // 3. Discipline (Max 25 pts) - tags, emotions, mistake logging
    const entriesWithNotes = entries.filter(e => (e.mistake && e.mistake !== 'NONE') || e.notes || (e.emotion && e.emotion === 'DISCIPLINED'));
    const notesRatio = totalTrades > 0 ? entriesWithNotes.length / totalTrades : 1;
    let disciplineScore = Math.min(25, Math.round(notesRatio * 20 + 5));

    // 4. Journal Adherence (Max 25 pts) - regularity
    let adherenceScore = 20;
    if (totalTrades >= 20) adherenceScore = 25;
    else if (totalTrades >= 10) adherenceScore = 22;
    else adherenceScore = 17;

    const totalScore = Math.min(100, Math.max(10, riskScore + disciplineScore + consistencyScore + adherenceScore));

    let grade = 'A';
    let tierLabel = 'Elite Disciplined Trader';
    if (totalScore < 50) {
      grade = 'D';
      tierLabel = 'High Risk Trader';
    } else if (totalScore < 70) {
      grade = 'C+';
      tierLabel = 'Emerging Trader';
    } else if (totalScore < 85) {
      grade = 'B+';
      tierLabel = 'Consistent Trader';
    }

    const weakAreas: string[] = [];
    const recommendations: string[] = [];

    if (riskScore < 18) {
      weakAreas.push('Average loss is too large relative to average win');
      recommendations.push('Tighten your stop loss and cut losing trades faster');
    }
    if (disciplineScore < 18) {
      weakAreas.push('Incomplete trade notes and reason-for-exit logging');
      recommendations.push('Record emotional state and entry checklist for every trade');
    }
    if (consistencyScore < 16) {
      weakAreas.push('Low win rate on recent executions');
      recommendations.push('Trade exclusively high-probability setups from Akash Playbooks');
    }
    if (weakAreas.length === 0) {
      recommendations.push('Maintain strict risk control and scale position sizing gradually');
      recommendations.push('Review weekly trade metrics to prevent overconfidence drawdowns');
    }

    res.json({
      totalScore,
      grade,
      tierLabel,
      components: {
        riskManagement: { score: riskScore, max: 25, label: 'Risk Control & R:R' },
        discipline: { score: disciplineScore, max: 25, label: 'Execution Discipline' },
        consistency: { score: consistencyScore, max: 25, label: 'Strategy Win Rate' },
        journalAdherence: { score: adherenceScore, max: 25, label: 'Journaling Consistency' },
      },
      weakAreas,
      recommendations,
      recentTradesAnalyzed: totalTrades,
      winRate: Number(winRate.toFixed(1)),
      profitFactor: Number(profitFactor.toFixed(2)),
    });
  } catch (error: any) {
    console.error('Error calculating trader score:', error);
    res.status(500).json({ error: 'Failed to calculate trader score' });
  }
};
