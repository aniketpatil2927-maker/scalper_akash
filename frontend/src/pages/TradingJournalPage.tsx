import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { 
  BookOpen, 
  PlusCircle, 
  Trash2, 
  Edit3, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Smile, 
  Frown, 
  Meh, 
  AlertTriangle, 
  CheckCircle, 
  Filter, 
  Calendar,
  X,
  ExternalLink,
  Upload,
  Download,
  FileSpreadsheet,
  Check
} from 'lucide-react';

interface JournalEntry {
  id: number;
  tradeId?: number | null;
  asset: string;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercentage: number;
  strategy: string;
  emotion: 'DISCIPLINED' | 'GREEDY' | 'FOMO' | 'ANXIOUS' | 'REVENGE' | 'CALM';
  mistake: 'NONE' | 'EARLY_EXIT' | 'CHASED_ENTRY' | 'OVER_LEVERAGED' | 'IGNORED_SL' | 'OVER_TRADED' | 'LATE_ENTRY';
  notes?: string | null;
  screenshotUrl?: string | null;
  entryDate: string;
  exitDate: string;
}

interface AiWeeklyReview {
  tradesAnalyzed: number;
  winRate: number;
  totalPnl: number;
  mostCommonMistake: string;
  bestSetup: string;
  disciplineScore: number;
  aiSummary: string;
  improvementArea: string;
}

export const TradingJournalPage: React.FC = () => {
  const { apiGet, apiPost, apiDelete } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [aiReview, setAiReview] = useState<AiWeeklyReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [filterEmotion, setFilterEmotion] = useState('');
  const [filterMistake, setFilterMistake] = useState('');

  // Import states
  const [selectedBroker, setSelectedBroker] = useState<'ZERODHA' | 'DHAN' | 'ANGEL' | 'GROWW' | 'GENERIC'>('ZERODHA');
  const [importing, setImporting] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<any[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    asset: 'BANKNIFTY 48200 CE',
    direction: 'BUY',
    entryPrice: '',
    exitPrice: '',
    quantity: '15',
    strategy: 'ORB Breakout',
    emotion: 'DISCIPLINED',
    mistake: 'NONE',
    notes: '',
    screenshotUrl: '',
  });

  useEffect(() => {
    fetchJournal();
    fetchAiReview();
  }, [filterEmotion, filterMistake]);

  const fetchJournal = async () => {
    try {
      setLoading(true);
      let query = '';
      const params = new URLSearchParams();
      if (filterEmotion) params.append('emotion', filterEmotion);
      if (filterMistake) params.append('mistake', filterMistake);
      if (params.toString()) query = `?${params.toString()}`;

      const data = await apiGet(`/journal${query}`);
      setEntries(data);
    } catch (err: any) {
      console.error('Failed to fetch journal:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAiReview = async () => {
    try {
      const data = await apiGet('/journal/ai-review');
      setAiReview(data);
    } catch (err: any) {
      console.error('Failed to fetch AI review:', err);
    }
  };

  const handleCreateEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiPost('/journal', {
        ...formData,
        entryPrice: parseFloat(formData.entryPrice),
        exitPrice: parseFloat(formData.exitPrice),
        quantity: parseInt(formData.quantity) || 1,
      });
      setShowAddModal(false);
      setFormData({
        asset: 'BANKNIFTY 48200 CE',
        direction: 'BUY',
        entryPrice: '',
        exitPrice: '',
        quantity: '15',
        strategy: 'ORB Breakout',
        emotion: 'DISCIPLINED',
        mistake: 'NONE',
        notes: '',
        screenshotUrl: '',
      });
      fetchJournal();
      fetchAiReview();
    } catch (err: any) {
      alert(err.message || 'Failed to create journal entry');
    }
  };

  const handleDeleteEntry = async (id: number) => {
    if (!window.confirm('Delete this trade journal entry?')) return;
    try {
      await apiDelete(`/journal/${id}`);
      fetchJournal();
      fetchAiReview();
    } catch (err: any) {
      alert(err.message || 'Failed to delete entry');
    }
  };

  // CSV File Parsing for Broker statements
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        alert('CSV file is empty or does not contain headers.');
        return;
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]+/g, ''));
      const parsed: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',').map(cell => cell.trim().replace(/['"]+/g, ''));
        if (row.length < 3) continue;

        // Auto-match common broker columns
        let asset = 'NIFTY / BANKNIFTY';
        let direction: 'BUY' | 'SELL' = 'BUY';
        let entryPrice = 0;
        let exitPrice = 0;
        let qty = 15;
        let pnl = 0;

        headers.forEach((h, idx) => {
          const val = row[idx];
          if (!val) return;

          if (h.includes('symbol') || h.includes('scrip') || h.includes('stock') || h.includes('instrument') || h.includes('contract')) {
            asset = val;
          }
          if (h.includes('type') || h.includes('buy/sell') || h.includes('side') || h.includes('transaction')) {
            direction = val.toUpperCase().includes('SELL') ? 'SELL' : 'BUY';
          }
          if (h.includes('qty') || h.includes('quantity') || h.includes('shares')) {
            qty = Math.abs(parseInt(val)) || 15;
          }
          if (h.includes('entry') || h.includes('buy price') || h.includes('trade price') || (h.includes('price') && entryPrice === 0)) {
            entryPrice = parseFloat(val) || 0;
          }
          if (h.includes('exit') || h.includes('sell price') || h.includes('close price')) {
            exitPrice = parseFloat(val) || 0;
          }
          if (h.includes('pnl') || h.includes('p&l') || h.includes('profit') || h.includes('gain')) {
            pnl = parseFloat(val) || 0;
          }
        });

        if (exitPrice === 0 && entryPrice > 0) {
          exitPrice = pnl !== 0 ? entryPrice + (pnl / qty) : entryPrice * 1.02;
        }

        parsed.push({
          asset,
          direction,
          entryPrice,
          exitPrice,
          quantity: qty,
          pnl: pnl !== 0 ? pnl : (exitPrice - entryPrice) * qty,
          strategy: `${selectedBroker} Tradebook`,
          emotion: 'DISCIPLINED',
          mistake: 'NONE',
          broker: selectedBroker,
          entryDate: new Date().toISOString()
        });
      }

      setParsedPreview(parsed);
    };

    reader.readAsText(file);
  };

  const handleBulkImportConfirm = async () => {
    if (parsedPreview.length === 0) return;
    try {
      setImporting(true);
      await apiPost('/journal/bulk-import', { entries: parsedPreview });
      setShowImportModal(false);
      setParsedPreview([]);
      fetchJournal();
      fetchAiReview();
      alert(`Successfully imported ${parsedPreview.length} trades from your broker statement!`);
    } catch (err: any) {
      alert(err.message || 'Failed to import trades');
    } finally {
      setImporting(false);
    }
  };

  // Export Journal to CSV
  const handleExportCsv = () => {
    if (entries.length === 0) {
      alert('No journal entries to export.');
      return;
    }

    const headers = ['ID', 'Date', 'Asset', 'Direction', 'Entry Price', 'Exit Price', 'Quantity', 'P&L (INR)', 'P&L (%)', 'Strategy', 'Emotion', 'Mistake', 'Notes'];
    const rows = entries.map(e => [
      e.id,
      new Date(e.entryDate).toLocaleDateString(),
      `"${e.asset}"`,
      e.direction,
      e.entryPrice,
      e.exitPrice,
      e.quantity,
      e.pnl,
      e.pnlPercentage,
      `"${e.strategy}"`,
      e.emotion,
      e.mistake,
      `"${e.notes || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `trading_journal_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-dark-900 border border-dark-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black text-white tracking-tight">PERSONAL TRADING JOURNAL</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-accent-gold/10 border border-accent-gold/30 text-accent-gold text-[10px] font-bold">
              DISCIPLINE SYSTEM
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Log your executions, import broker tradebooks, track psychology, and receive automated AI performance reviews.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-dark-800 hover:bg-dark-700 border border-dark-700 text-xs font-bold text-gray-300 hover:text-white transition-all shadow-md"
            title="Export Journal as CSV"
          >
            <Download className="h-4 w-4 text-[#d2fd2a]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#7c5cfc]/15 hover:bg-[#7c5cfc]/25 border border-[#7c5cfc]/40 text-xs font-bold text-violet-300 hover:text-white transition-all shadow-md"
          >
            <Upload className="h-4 w-4 text-violet-400" />
            <span>Import Broker CSV</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="lime-gradient-btn"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Log New Trade</span>
          </button>
        </div>
      </div>

      {/* AI Weekly Review Hero Card */}
      {aiReview && (
        <div className="relative bg-gradient-to-br from-dark-900 via-dark-950 to-dark-900 border border-accent-cyan/30 rounded-2xl p-6 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Sparkles className="h-40 w-40 text-accent-cyan" />
          </div>

          <div className="flex items-center space-x-2 mb-3">
            <Sparkles className="h-5 w-5 text-accent-gold animate-bounce" />
            <h2 className="text-sm font-black text-white uppercase tracking-wider">WEEKLY AI MENTAL & STRATEGY REVIEW</h2>
          </div>

          <p className="text-xs text-gray-300 leading-relaxed max-w-3xl mb-4 font-medium">
            {aiReview.aiSummary}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-dark-900/80 border border-dark-800 rounded-xl p-3">
              <span className="text-[10px] text-gray-400 font-bold block">Discipline Score</span>
              <div className="flex items-center space-x-2 mt-1">
                <div className="text-lg font-black text-emerald-400">{aiReview.disciplineScore}/100</div>
                <div className="w-12 bg-dark-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${aiReview.disciplineScore}%` }} />
                </div>
              </div>
            </div>

            <div className="bg-dark-900/80 border border-dark-800 rounded-xl p-3">
              <span className="text-[10px] text-gray-400 font-bold block">Top Recurring Mistake</span>
              <span className="text-xs font-black text-accent-rose mt-1 block">
                {aiReview.mostCommonMistake}
              </span>
            </div>

            <div className="bg-dark-900/80 border border-dark-800 rounded-xl p-3">
              <span className="text-[10px] text-gray-400 font-bold block">Best Strategy Setup</span>
              <span className="text-xs font-black text-accent-cyan mt-1 block">
                {aiReview.bestSetup}
              </span>
            </div>

            <div className="bg-dark-900/80 border border-dark-800 rounded-xl p-3">
              <span className="text-[10px] text-gray-400 font-bold block">AI Growth Focus</span>
              <span className="text-xs font-bold text-gray-200 mt-1 block truncate">
                {aiReview.improvementArea}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 bg-dark-900 border border-dark-800 p-4 rounded-xl">
        <div className="flex items-center space-x-2 text-xs text-gray-400 font-semibold">
          <Filter className="h-4 w-4" />
          <span>Filters:</span>
        </div>

        <select
          value={filterEmotion}
          onChange={(e) => setFilterEmotion(e.target.value)}
          className="bg-dark-950 border border-dark-700 text-xs text-gray-300 rounded-lg px-3 py-1.5 focus:outline-none"
        >
          <option value="">All Emotional States</option>
          <option value="DISCIPLINED">Disciplined</option>
          <option value="CALM">Calm</option>
          <option value="FOMO">FOMO</option>
          <option value="GREEDY">Greedy</option>
          <option value="ANXIOUS">Anxious</option>
          <option value="REVENGE">Revenge</option>
        </select>

        <select
          value={filterMistake}
          onChange={(e) => setFilterMistake(e.target.value)}
          className="bg-dark-950 border border-dark-700 text-xs text-gray-300 rounded-lg px-3 py-1.5 focus:outline-none"
        >
          <option value="">All Mistake Categories</option>
          <option value="NONE">No Mistakes (Flawless)</option>
          <option value="CHASED_ENTRY">Chased Entry</option>
          <option value="EARLY_EXIT">Early Exit</option>
          <option value="OVER_LEVERAGED">Over Leveraged</option>
          <option value="IGNORED_SL">Ignored Stop Loss</option>
          <option value="OVER_TRADED">Over Traded</option>
        </select>

        {(filterEmotion || filterMistake) && (
          <button
            onClick={() => { setFilterEmotion(''); setFilterMistake(''); }}
            className="text-xs text-accent-rose hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Journal Entries Table */}
      <div className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-dark-950 border-b border-dark-800 text-gray-400 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Asset</th>
                <th className="px-4 py-3">Side</th>
                <th className="px-4 py-3">Entry / Exit</th>
                <th className="px-4 py-3">P&L (₹)</th>
                <th className="px-4 py-3">Strategy</th>
                <th className="px-4 py-3">Mindset</th>
                <th className="px-4 py-3">Mistake</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-800 text-gray-300">
              {entries.length === 0 && !loading && (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-gray-500">
                    No journal entries recorded. Click "Log New Trade" to begin your journal!
                  </td>
                </tr>
              )}
              {entries.map((entry) => {
                const isProfitable = Number(entry.pnl) >= 0;
                return (
                  <tr key={entry.id} className="hover:bg-dark-800/40 transition-colors">
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                      {new Date(entry.entryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 font-bold text-white whitespace-nowrap">
                      {entry.asset}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                        entry.direction === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {entry.direction}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300 whitespace-nowrap">
                      ₹{entry.entryPrice} → ₹{entry.exitPrice}
                    </td>
                    <td className="px-4 py-3 font-black whitespace-nowrap">
                      <span className={isProfitable ? 'text-emerald-400' : 'text-accent-rose'}>
                        {isProfitable ? '+' : ''}₹{entry.pnl.toLocaleString('en-IN')} ({entry.pnlPercentage}%)
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300 font-medium">
                      {entry.strategy}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        entry.emotion === 'DISCIPLINED' || entry.emotion === 'CALM'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}>
                        {entry.emotion}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        entry.mistake === 'NONE'
                          ? 'bg-dark-800 text-gray-400'
                          : 'bg-accent-rose/10 text-accent-rose border border-accent-rose/30'
                      }`}>
                        {entry.mistake.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 max-w-xs truncate" title={entry.notes || ''}>
                      {entry.notes || '—'}
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="p-1 text-gray-500 hover:text-accent-rose transition-colors"
                        title="Delete Entry"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Trade Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-xl w-full bg-dark-900 border border-dark-700 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-dark-800 mb-4">
              <h3 className="text-base font-black text-white">Log Executed Trade</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEntry} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Asset / Strike</label>
                  <input
                    type="text"
                    required
                    value={formData.asset}
                    onChange={(e) => setFormData({ ...formData, asset: e.target.value })}
                    className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-accent-cyan"
                    placeholder="e.g. BANKNIFTY 48200 CE"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Trade Direction</label>
                  <select
                    value={formData.direction}
                    onChange={(e) => setFormData({ ...formData, direction: e.target.value as any })}
                    className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Entry Price (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={formData.entryPrice}
                    onChange={(e) => setFormData({ ...formData, entryPrice: e.target.value })}
                    className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                    placeholder="310.00"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Exit Price (₹)</label>
                  <input
                    type="number"
                    step="0.05"
                    required
                    value={formData.exitPrice}
                    onChange={(e) => setFormData({ ...formData, exitPrice: e.target.value })}
                    className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                    placeholder="440.00"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Quantity / Lots</label>
                  <input
                    type="number"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Strategy</label>
                  <select
                    value={formData.strategy}
                    onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
                    className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="ORB Breakout">ORB Breakout</option>
                    <option value="VWAP Rejection">VWAP Rejection</option>
                    <option value="Supply/Demand">Supply/Demand</option>
                    <option value="Scalp Reversal">Scalp Reversal</option>
                    <option value="Delta Neutral">Delta Neutral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Mindset / Emotion</label>
                  <select
                    value={formData.emotion}
                    onChange={(e) => setFormData({ ...formData, emotion: e.target.value as any })}
                    className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="DISCIPLINED">Disciplined</option>
                    <option value="CALM">Calm</option>
                    <option value="FOMO">FOMO</option>
                    <option value="GREEDY">Greedy</option>
                    <option value="ANXIOUS">Anxious</option>
                    <option value="REVENGE">Revenge</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Mistake Made</label>
                  <select
                    value={formData.mistake}
                    onChange={(e) => setFormData({ ...formData, mistake: e.target.value as any })}
                    className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  >
                    <option value="NONE">None (Flawless)</option>
                    <option value="CHASED_ENTRY">Chased Entry</option>
                    <option value="EARLY_EXIT">Early Exit</option>
                    <option value="OVER_LEVERAGED">Over Leveraged</option>
                    <option value="IGNORED_SL">Ignored Stop Loss</option>
                    <option value="OVER_TRADED">Over Traded</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 font-bold mb-1">Notes & Lessons Learned</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-dark-950 border border-dark-700 rounded-xl px-3 py-2 text-white focus:outline-none"
                  placeholder="e.g. Great patience waiting for 15m candle close above VWAP..."
                />
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-dark-800 text-gray-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="lime-gradient-btn !py-2 !px-5"
                >
                  Save Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broker CSV Tradebook Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-dark-900 border border-violet-500/30 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-dark-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-[#7c5cfc]/20 text-violet-400">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white">Import Broker Tradebook (CSV)</h3>
                  <p className="text-xs text-gray-400">Auto-parse and synchronize your trades from top Indian brokers</p>
                </div>
              </div>
              <button
                onClick={() => { setShowImportModal(false); setParsedPreview([]); }}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-dark-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Select Broker Tabs */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-2">Select Your Broker Format:</label>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { id: 'ZERODHA', label: 'Zerodha Kite' },
                  { id: 'DHAN', label: 'Dhan' },
                  { id: 'ANGEL', label: 'Angel One' },
                  { id: 'GROWW', label: 'Groww' },
                  { id: 'GENERIC', label: 'Generic CSV' }
                ].map(b => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBroker(b.id as any)}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all border ${
                      selectedBroker === b.id 
                        ? 'bg-[#d2fd2a] text-black border-[#d2fd2a] shadow-[0_0_12px_rgba(210,253,42,0.3)]'
                        : 'bg-dark-950 text-gray-400 border-dark-700 hover:text-white'
                    }`}
                  >
                    {b.label}
                  </button>
                ))}
              </div>
            </div>

            {/* File Upload Dropzone */}
            <div className="border-2 border-dashed border-dark-700 hover:border-violet-400/50 rounded-2xl p-6 text-center bg-dark-950/60 transition-colors">
              <Upload className="h-8 w-8 text-violet-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-white mb-1">
                Upload your {selectedBroker} tradebook CSV file
              </p>
              <p className="text-[11px] text-gray-400 mb-3">
                Export tradebook/orders from your broker console and drop the .csv file here
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="broker-csv-input"
              />
              <label
                htmlFor="broker-csv-input"
                className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold cursor-pointer shadow-lg transition-all"
              >
                <span>Select .CSV File</span>
              </label>
            </div>

            {/* Parsed Trades Preview */}
            {parsedPreview.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-300">
                    Parsed <span className="text-[#d2fd2a]">{parsedPreview.length}</span> trades ready for import:
                  </span>
                  <span className="text-[11px] text-gray-400">
                    Net P&L: <span className={parsedPreview.reduce((a,c) => a + c.pnl, 0) >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      ₹{parsedPreview.reduce((a,c) => a + c.pnl, 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </span>
                </div>

                <div className="max-h-40 overflow-y-auto border border-dark-800 rounded-xl bg-dark-950">
                  <table className="w-full text-[11px] text-left">
                    <thead className="bg-dark-900 text-gray-400 text-[10px] uppercase font-bold sticky top-0">
                      <tr>
                        <th className="p-2">Asset</th>
                        <th className="p-2">Side</th>
                        <th className="p-2">Qty</th>
                        <th className="p-2">Entry</th>
                        <th className="p-2">Exit</th>
                        <th className="p-2">P&L</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-800 text-gray-300">
                      {parsedPreview.slice(0, 10).map((t, idx) => (
                        <tr key={idx}>
                          <td className="p-2 font-medium truncate max-w-[120px]">{t.asset}</td>
                          <td className="p-2">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${t.direction === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                              {t.direction}
                            </span>
                          </td>
                          <td className="p-2">{t.quantity}</td>
                          <td className="p-2">₹{t.entryPrice}</td>
                          <td className="p-2">₹{t.exitPrice}</td>
                          <td className={`p-2 font-bold ${t.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            ₹{t.pnl.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setParsedPreview([])}
                    className="px-4 py-2 rounded-xl bg-dark-800 text-gray-300 text-xs font-semibold"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    disabled={importing}
                    onClick={handleBulkImportConfirm}
                    className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-[#d2fd2a] hover:bg-[#bcf018] text-black text-xs font-black shadow-lg transition-all"
                  >
                    {importing ? (
                      <span>Importing...</span>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        <span>Confirm Import ({parsedPreview.length} Trades)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
