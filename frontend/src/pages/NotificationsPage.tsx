import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { Bell, Check, CheckSquare, Trash, RefreshCw } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { notifications, markNotificationAsRead, apiPut, fetchNotifications } = useAuth();

  const handleMarkAllRead = async () => {
    try {
      await apiPut('/notifications/read-all', {});
      await fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleMarkSingleRead = async (id: number) => {
    await markNotificationAsRead(id);
  };

  return (
    <div className="py-12 px-4 max-w-3xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-dark-800 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white">Notifications Center</h1>
          <p className="text-xs text-gray-400 mt-1">Real-time alerts regarding subscriptions, transactions, and trade signals.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            disabled={notifications.filter(n => !n.isRead).length === 0}
            className="flex items-center gap-1 px-3 py-1.5 bg-dark-800 border border-dark-700 hover:bg-dark-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <CheckSquare className="h-3.5 w-3.5" /> Mark All Read
          </button>
          <button 
            onClick={fetchNotifications}
            className="p-1.5 bg-dark-800 border border-dark-700 hover:bg-dark-700 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="rounded-xl border border-dark-700 bg-dark-905 p-12 text-center space-y-3">
          <Bell className="h-8 w-8 text-gray-600 mx-auto" />
          <p className="text-xs text-gray-500">Your notifications feed is currently empty.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map(noti => (
            <div 
              key={noti.id}
              className={`rounded-xl border p-4 flex justify-between items-start gap-4 transition-all ${
                noti.isRead 
                  ? 'border-dark-700 bg-dark-900/30 opacity-70' 
                  : 'border-accent-blue bg-dark-800'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{noti.title}</span>
                  <span className="text-[9px] font-mono text-gray-500">{new Date(noti.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-gray-400 leading-normal">{noti.message}</p>
              </div>

              {!noti.isRead && (
                <button
                  onClick={() => handleMarkSingleRead(noti.id)}
                  className="p-1.5 rounded-full hover:bg-dark-700 text-gray-400 hover:text-accent-emerald transition-colors"
                  title="Mark as Read"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
