import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { Database, RefreshCw, Terminal, Eye, AlertCircle } from 'lucide-react';

interface AuditLog {
  id: number;
  action: string;
  resource: string;
  previousValue: string | null;
  newValue: string | null;
  ipAddress: string;
  timestamp: string;
  User?: {
    fullName: string;
    email: string;
  };
}

export const AuditLogs: React.FC = () => {
  const { apiGet } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/admin/audit-logs');
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 px-4 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-dark-800 pb-6">
        <div>
          <h1 className="text-2xl font-black text-white">System Audit Trails</h1>
          <p className="text-xs text-gray-400 mt-1">Immutable change logs tracking administrative, billing, and signal operations.</p>
        </div>
        <button 
          onClick={fetchLogs}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-800 border border-dark-700 hover:bg-dark-700 rounded-lg text-xs font-semibold transition-colors"
        >
          <RefreshCw className="h-3 w-3" /> Reload Logs
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Audit Table */}
        <div className="lg:col-span-2 rounded-xl border border-dark-700 bg-dark-800 overflow-hidden shadow-xl">
          <div className="p-4 border-b border-dark-700 bg-dark-850 flex items-center gap-2">
            <Terminal className="h-4 w-4 text-accent-blue" />
            <span className="text-xs font-bold text-white uppercase">Operations Activity Stream</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <RefreshCw className="h-6 w-6 text-accent-blue animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">
              No audit logs recorded.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-dark-700">
                <thead className="bg-dark-900/50 text-gray-400 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-4">Action</th>
                    <th className="p-4">Resource</th>
                    <th className="p-4">Author</th>
                    <th className="p-4">IP Address</th>
                    <th className="p-4">Time</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700 text-gray-300">
                  {logs.map(log => (
                    <tr key={log.id} className="hover:bg-dark-850/50 transition-colors">
                      <td className="p-4 font-bold text-white">{log.action}</td>
                      <td className="p-4 text-gray-400">{log.resource}</td>
                      <td className="p-4">{log.User?.fullName || 'System (Guest)'}</td>
                      <td className="p-4 font-mono text-[10px] text-gray-500">{log.ipAddress}</td>
                      <td className="p-4 text-[10px] text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="p-4">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="p-1 rounded hover:bg-dark-750 text-accent-blue hover:text-white transition-colors"
                          title="View Value State"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Side: Detailed View */}
        <div className="lg:col-span-1">
          {selectedLog ? (
            <div className="rounded-xl border border-dark-700 bg-dark-800 p-6 space-y-6 shadow-xl">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-dark-700 pb-3 flex items-center gap-2">
                <Terminal className="h-4 w-4 text-accent-gold" />
                <span>State Payload Details</span>
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-[10px] text-gray-400">
                  <div>
                    <span className="block uppercase text-gray-500 font-bold mb-0.5">Operation Type</span>
                    <span className="font-semibold text-white">{selectedLog.action}</span>
                  </div>
                  <div>
                    <span className="block uppercase text-gray-500 font-bold mb-0.5">Author IP</span>
                    <span className="font-mono text-gray-300">{selectedLog.ipAddress}</span>
                  </div>
                </div>

                {selectedLog.previousValue && (
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">State Prior (Pre-Value)</span>
                    <pre className="rounded bg-dark-900 border border-dark-750 p-3 text-[10px] font-mono leading-normal text-accent-rose overflow-x-auto max-h-40">
                      {JSON.stringify(JSON.parse(selectedLog.previousValue), null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.newValue && (
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">State Current (Post-Value)</span>
                    <pre className="rounded bg-dark-900 border border-dark-750 p-3 text-[10px] font-mono leading-normal text-accent-emerald overflow-x-auto max-h-48">
                      {JSON.stringify(JSON.parse(selectedLog.newValue), null, 2)}
                    </pre>
                  </div>
                )}

                <div className="rounded-lg bg-dark-900/60 border border-dark-750 p-3 flex gap-2">
                  <AlertCircle className="h-4 w-4 text-accent-gold shrink-0 mt-0.5" />
                  <p className="text-[10px] text-gray-500 leading-normal">
                    Audit logs are written during database transactions and cannot be altered or deleted.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dark-700 bg-dark-900/40 p-12 text-center text-xs text-gray-500 h-fit">
              Select a specific log row using the eye button to view pre-and-post change state details.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
