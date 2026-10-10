import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { 
  Bot, 
  Send, 
  Sparkles, 
  PlusCircle, 
  Trash2, 
  TrendingUp, 
  AlertCircle, 
  ShieldAlert, 
  Zap, 
  MessageSquare,
  Lock,
  ArrowRight,
  RefreshCw,
  Award,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Message {
  id: number;
  sender: 'USER' | 'AI';
  message: string;
  contextData?: any;
  createdAt: string;
}

interface Conversation {
  id: number;
  title: string;
  updatedAt: string;
  AiMessages?: Message[];
}

interface UsageInfo {
  tier: string;
  maxQueries: number;
  usedQueries: number;
  remainingQueries: number;
  planName: string;
}

const suggestedPrompts = [
  "📊 Analyze my trading performance this week",
  "⚠️ What is my biggest recurring mistake in losing trades?",
  "📈 Explain the risk/reward on current BankNifty trade signals",
  "🎓 Recommend courses & webinars to improve my scalping",
  "🎯 How should I manage stop-losses when Target 1 is hit?",
];

export const AiAssistantPage: React.FC = () => {
  const { apiGet, apiPost, apiDelete, user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
    loadUsage();
  }, []);

  useEffect(() => {
    if (activeConvId) {
      loadMessages(activeConvId);
    }
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  const loadUsage = async () => {
    try {
      const data = await apiGet('/ai/usage');
      setUsage(data);
    } catch (err: any) {
      console.error('Failed to load AI usage:', err);
    }
  };

  const loadConversations = async () => {
    try {
      setIsLoading(true);
      const data = await apiGet('/ai/conversations');
      setConversations(data);
      if (data.length > 0 && !activeConvId) {
        setActiveConvId(data[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load conversations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (convId: number) => {
    try {
      const data = await apiGet(`/ai/conversations/${convId}`);
      setMessages(data.AiMessages || []);
    } catch (err: any) {
      console.error('Failed to load messages:', err);
    }
  };

  const handleNewConversation = async () => {
    try {
      const newConv = await apiPost('/ai/conversations', { title: 'New Trading Analysis' });
      setConversations(prev => [newConv, ...prev]);
      setActiveConvId(newConv.id);
      setMessages([]);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start conversation');
    }
  };

  const handleDeleteConversation = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Delete this conversation?')) return;
    try {
      await apiDelete(`/ai/conversations/${id}`);
      const remaining = conversations.filter(c => c.id !== id);
      setConversations(remaining);
      if (activeConvId === id) {
        setActiveConvId(remaining.length > 0 ? remaining[0].id : null);
        setMessages([]);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete conversation');
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isSending) return;

    if (usage && usage.remainingQueries <= 0 && user?.roles && !user.roles.includes('SUPER_ADMIN')) {
      setShowUpgradeModal(true);
      return;
    }

    let targetConvId = activeConvId;
    if (!targetConvId) {
      try {
        const newConv = await apiPost('/ai/conversations', { title: text.substring(0, 30) });
        setConversations(prev => [newConv, ...prev]);
        setActiveConvId(newConv.id);
        targetConvId = newConv.id;
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to initialize conversation');
        return;
      }
    }

    // Optimistic user message append
    const tempUserMsg: Message = {
      id: Date.now(),
      sender: 'USER',
      message: text,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setInputMessage('');
    setIsSending(true);
    setErrorMsg(null);

    try {
      const response = await apiPost(`/ai/conversations/${targetConvId}/messages`, { message: text });
      setMessages(prev => [...prev.filter(m => m.id !== tempUserMsg.id), response.userMessage, response.aiMessage]);
      if (response.usage) {
        setUsage(prev => prev ? { ...prev, ...response.usage } : null);
      }
      loadConversations(); // refresh title & last updated
    } catch (err: any) {
      if (err.message && err.message.includes('limit reached')) {
        setShowUpgradeModal(true);
      } else {
        setErrorMsg(err.message || 'Failed to generate AI response');
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] gap-4">
      {/* Sidebar: Conversation History & Quota */}
      <div className="hidden md:flex flex-col w-72 bg-dark-900 border border-dark-800 rounded-2xl p-4 overflow-hidden flex-shrink-0">
        <button
          onClick={handleNewConversation}
          className="flex items-center justify-center space-x-2 w-full py-2.5 px-4 rounded-xl bg-accent-cyan/10 hover:bg-accent-cyan/20 border border-accent-cyan/30 text-accent-cyan font-bold text-xs transition-all mb-4 shadow-sm"
        >
          <PlusCircle className="h-4 w-4" />
          <span>New Analysis Session</span>
        </button>

        {/* Quota Indicator */}
        {usage && (
          <div className="bg-dark-950 border border-dark-800 rounded-xl p-3 mb-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[11px] font-bold text-gray-400">Monthly AI Capacity</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-accent-gold/20 text-accent-gold border border-accent-gold/30">
                {usage.tier}
              </span>
            </div>
            <div className="w-full bg-dark-800 h-2 rounded-full overflow-hidden mb-1.5">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  usage.remainingQueries <= 2 ? 'bg-accent-rose' : 'bg-gradient-to-r from-accent-cyan to-blue-500'
                }`}
                style={{ width: `${Math.min(100, (usage.usedQueries / usage.maxQueries) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-400">
              <span>Used: {usage.usedQueries} / {usage.maxQueries}</span>
              <span className={usage.remainingQueries === 0 ? 'text-accent-rose font-bold' : 'text-accent-cyan'}>
                {usage.remainingQueries} left
              </span>
            </div>
          </div>
        )}

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
          <div className="text-[10px] font-extrabold uppercase tracking-wider text-gray-500 px-2 py-1">
            Recent Conversations
          </div>
          {conversations.length === 0 && !isLoading && (
            <div className="text-center py-8 text-xs text-gray-500">
              No previous analyses. Start your first session!
            </div>
          )}
          {conversations.map((c) => {
            const isActive = activeConvId === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setActiveConvId(c.id)}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-colors text-xs ${
                  isActive 
                    ? 'bg-dark-800 text-white font-semibold border border-dark-700' 
                    : 'text-gray-400 hover:bg-dark-800/50 hover:text-gray-200'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <MessageSquare className="h-3.5 w-3.5 flex-shrink-0 text-accent-cyan" />
                  <span className="truncate">{c.title}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteConversation(c.id, e)}
                  className="opacity-0 group-hover:opacity-100 hover:text-accent-rose transition-opacity p-1"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Upgrade Box */}
        {usage && usage.tier !== 'VIP' && (
          <div className="mt-3 p-3 rounded-xl bg-gradient-to-br from-dark-950 to-dark-800 border border-accent-gold/30 text-center">
            <p className="text-[11px] font-bold text-white mb-1">Upgrade for Unlimited AI</p>
            <p className="text-[10px] text-gray-400 mb-2">Get 250+ queries/month, VIP calls & live market reviews.</p>
            <Link 
              to="/dashboard/plans" 
              className="inline-flex items-center justify-center space-x-1 w-full py-1.5 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-extrabold text-[10px] hover:opacity-95"
            >
              <span>Upgrade Plan</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-dark-950/80 border-b border-dark-800">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent-cyan to-blue-600 text-dark-950 font-black shadow-[0_0_15px_rgba(0,229,188,0.4)]">
              <Bot className="h-5 w-5 text-black" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-black text-white tracking-wide">SCALPER AI</h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-[9px]">
                  ONLINE
                </span>
              </div>
              <p className="text-[10px] text-gray-400">Intelligent Trading Analytics, Signal Breakdown & Risk Advisor</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex items-center space-x-1 px-3 py-1 rounded-full bg-dark-800 text-[10px] text-gray-300 border border-dark-700">
              <Sparkles className="h-3 w-3 text-accent-gold" />
              <span>Context: <b>Your Personal Journal & Calls</b></span>
            </div>
          </div>
        </div>

        {/* Chat Feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center space-y-6">
              <div className="h-16 w-16 rounded-2xl bg-dark-800/80 border border-dark-700 flex items-center justify-center shadow-lg">
                <Bot className="h-8 w-8 text-accent-cyan animate-pulse" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">How can Scalper AI help your trading today?</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Ask for performance diagnosis, strategy reviews, or explanations on active trade signals.
                </p>
              </div>

              {/* Suggested Questions Grid */}
              <div className="grid grid-cols-1 gap-2 w-full">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="flex items-center justify-between text-left p-3 rounded-xl bg-dark-950/80 hover:bg-dark-800 border border-dark-800 hover:border-accent-cyan/40 text-xs text-gray-300 hover:text-white transition-all group"
                  >
                    <span>{prompt}</span>
                    <ChevronRight className="h-4 w-4 text-gray-500 group-hover:text-accent-cyan transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => {
              const isUser = m.sender === 'USER';
              return (
                <div
                  key={m.id}
                  className={`flex items-start space-x-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-dark-800 border border-dark-700 text-accent-cyan flex-shrink-0 mt-0.5">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-2xl rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-line shadow-md ${
                      isUser
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium rounded-tr-none'
                        : 'bg-[#08090d] border border-[#1c202e] text-gray-200 rounded-tl-none font-normal'
                    }`}
                  >
                    {m.message}
                  </div>
                  {isUser && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-600/30 border border-violet-500/40 text-violet-300 font-bold text-xs flex-shrink-0 mt-0.5">
                      {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {isSending && (
            <div className="flex items-start space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#141722] border border-[#1c202e] text-[#ccff00] flex-shrink-0">
                <Bot className="h-4 w-4 animate-spin" />
              </div>
              <div className="bg-[#08090d] border border-[#1c202e] rounded-2xl rounded-tl-none px-4 py-3 text-xs text-gray-400 flex items-center space-x-2">
                <span className="inline-block h-2 w-2 rounded-full bg-[#ccff00] animate-ping" />
                <span>Scalper AI is analyzing your trading activity...</span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#08090d]/90 border-t border-[#1c202e]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask Scalper AI about your win-rate, setups, risk sizing..."
              disabled={isSending}
              className="flex-1 bg-[#0e1017] border border-[#1c202e] focus:border-[#ccff00] rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={isSending || !inputMessage.trim()}
              className="lime-gradient-btn !py-3 !px-5 !text-xs disabled:opacity-50"
            >
              <span>Ask</span>
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
          <div className="flex justify-between items-center mt-2 px-1 text-[10px] text-gray-500">
            <span>AI insights are educational and based on your platform logs. Never guarantees future profitability.</span>
            <span>Powered by Scalper Akash Deep Market Engine</span>
          </div>
        </div>
      </div>

      {/* Upgrade CTA Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-md w-full bg-dark-900 border border-accent-gold/40 rounded-3xl p-6 text-center relative shadow-[0_0_40px_rgba(245,158,11,0.2)]">
            <div className="h-14 w-14 rounded-2xl bg-accent-gold/20 border border-accent-gold/40 flex items-center justify-center mx-auto mb-4 text-accent-gold">
              <Lock className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-black text-white mb-2">Monthly AI Capacity Reached</h3>
            <p className="text-xs text-gray-300 leading-relaxed mb-6">
              You have used all queries allocated to your current subscription tier. Upgrade to <b className="text-accent-gold">VIP Plan</b> for 250+ queries/month, live trader reviews, and full webinar masterclasses.
            </p>
            <div className="space-y-2">
              <Link
                to="/dashboard/plans"
                className="block w-full py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-extrabold text-xs shadow-lg hover:opacity-90"
              >
                Upgrade to VIP Now
              </Link>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="block w-full py-2.5 rounded-xl bg-dark-800 text-gray-400 hover:text-white text-xs font-semibold"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
