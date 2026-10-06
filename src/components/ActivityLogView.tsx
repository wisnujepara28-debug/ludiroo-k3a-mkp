import React, { useState } from 'react';
import { ActivityLog } from '../types';
import { FileText, Search, Shield, Clock, User, Filter, X } from 'lucide-react';

interface ActivityLogViewProps {
  logs: ActivityLog[];
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('All');

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.operatorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAction = actionFilter === 'All' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-sky-600" />
            <span>Audit Trail &amp; Log Aktivitas Realtime</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Riwayat seluruh aksi CRUD dan operasional tercatat langsung di Firebase Firestore
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Integritas Log: Terjamin &amp; Immutable</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari aktivitas, operator, entitas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0 mr-1" />
          {(['All', 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'SYSTEM'] as const).map((action) => (
            <button
              key={action}
              onClick={() => setActionFilter(action)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer ${
                actionFilter === action
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {action === 'All' ? 'Semua Aksi' : action}
            </button>
          ))}
        </div>
      </div>

      {/* Logs List */}
      {filteredLogs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">Belum ada riwayat aktivitas</h3>
          <p className="text-xs text-slate-500 mt-1">Aktivitas penambahan, perubahan, dan penghapusan data akan muncul di sini secara realtime.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {filteredLogs.map((log) => {
            const actionBadge = {
              'CREATE': 'bg-emerald-50 text-emerald-700 border-emerald-200',
              'UPDATE': 'bg-sky-50 text-sky-700 border-sky-200',
              'DELETE': 'bg-rose-50 text-rose-700 border-rose-200',
              'LOGIN': 'bg-indigo-50 text-indigo-700 border-indigo-200',
              'SYSTEM': 'bg-purple-50 text-purple-700 border-purple-200'
            }[log.action] || 'bg-slate-50 text-slate-700 border-slate-200';

            const formattedTime = new Date(log.timestamp).toLocaleString('id-ID', {
              dateStyle: 'medium',
              timeStyle: 'medium'
            });

            return (
              <div key={log.id} className="p-4 sm:p-5 hover:bg-slate-50/70 transition flex items-start gap-4">
                <div className="shrink-0 mt-0.5">
                  <span className={`inline-block font-mono text-[10px] font-bold px-2.5 py-1 rounded-md border ${actionBadge}`}>
                    {log.action}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                      {log.entityType}
                    </span>
                    <span className="text-xs text-slate-700 font-medium">
                      {log.details}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      <span className="text-slate-600 font-medium">{log.operatorEmail}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{formattedTime}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
