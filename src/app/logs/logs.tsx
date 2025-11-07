"use client"

import { useState } from "react";
import { api } from "~/trpc/react";

type ViewState =
  | { type: 'overview' }
  | { type: 'context', context: string, logs: any[] }
  | { type: 'detail', context: string, log: any };

export default function LogsPage() {
  const { data } = api.auditTrail.getAllLogs.useQuery();
  const [viewState, setViewState] = useState<ViewState>({ type: 'overview' });

  // Group logs by logContext
  const groupedLogs = data?.reduce((acc, log) => {
    const context = log.logContext ?? 'unknown';
    if (!acc[context]) acc[context] = [];
    acc[context].push(log);
    return acc;
  }, {} as Record<string, any[]>) ?? {};

  const contexts = Object.keys(groupedLogs);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Overview - Grid of contexts */}
        {viewState.type === 'overview' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-white tracking-tight">Audit Logs</h1>
              <div className="text-sm text-slate-400">{data?.length || 0} total logs</div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {contexts.map((context) => (
                <button
                  key={context}
                  onClick={() => setViewState({ type: 'context', context, logs: groupedLogs[context] })}
                  className="group relative bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 rounded-xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 border border-slate-600/50"
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="text-lg font-semibold text-white mb-2 capitalize">
                      {context.replace('_', ' ')}
                    </div>
                    <div className="text-3xl font-bold text-blue-400">
                      {groupedLogs[context].length}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">entries</div>
                  </div>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-300" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Context View - List of logs for a specific context */}
        {viewState.type === 'context' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewState({ type: 'overview' })}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-3xl font-bold text-white tracking-tight capitalize">
                {viewState.context.replace('_', ' ')}
              </h1>
              <div className="text-sm text-slate-400 ml-auto">{viewState.logs.length} logs</div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {viewState.logs.map((log, i) => (
                <button
                  key={i}
                  onClick={() => setViewState({ type: 'detail', context: viewState.context, log })}
                  className="group relative bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 border border-slate-600/50 text-left"
                >
                  <div className="space-y-2">
                    <div className="text-sm font-medium text-slate-300 capitalize">
                      {log.logEvent || 'Event'}
                    </div>
                    <div className="text-xs text-slate-500">
                      User: {log.userId || 'Unknown'}
                    </div>
                    {log.createdAt && (
                      <div className="text-xs text-slate-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Detail View - Full log details */}
        {viewState.type === 'detail' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewState({
                  type: 'context',
                  context: viewState.context,
                  logs: groupedLogs[viewState.context]
                })}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-3xl font-bold text-white tracking-tight capitalize">
                {viewState.context.replace('_', ' ')} → {viewState.log.logEvent || 'Details'}
              </h1>
            </div>

            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 overflow-hidden shadow-2xl">
              <div className="grid grid-cols-2 divide-x divide-slate-700/50">
                {/* Before */}
                <div className="p-8 space-y-4">
                  <h2 className="text-xl font-semibold text-slate-300 mb-6">Before</h2>
                  <div className="space-y-3">
                    {viewState.log.details?.before ? (
                      Object.entries(viewState.log.details.before).map(([key, value]) => (
                        <div key={key} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                            {key}
                          </div>
                          <div className="text-sm text-slate-200 font-mono break-all">
                            {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-slate-500 italic">No previous data</div>
                    )}
                  </div>
                </div>

                {/* After */}
                <div className="p-8 space-y-4">
                  <h2 className="text-xl font-semibold text-slate-300 mb-6">After</h2>
                  <div className="space-y-3">
                    {viewState.log.details?.after ? (
                      Object.entries(viewState.log.details.after).map(([key, value]) => (
                        <div key={key} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                          <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-1">
                            {key}
                          </div>
                          <div className="text-sm text-emerald-300 font-mono break-all">
                            {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-slate-500 italic">No new data</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional metadata */}
              <div className="border-t border-slate-700/50 p-8 bg-slate-900/30">
                <h3 className="text-lg font-semibold text-slate-300 mb-4">Metadata</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Log ID
                    </div>
                    <div className="text-sm text-slate-300 font-mono">
                      {viewState.log.id}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      User ID
                    </div>
                    <div className="text-sm text-slate-300 font-mono">
                      {viewState.log.userId}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Event
                    </div>
                    <div className="text-sm text-slate-300 font-mono capitalize">
                      {viewState.log.logEvent}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Context
                    </div>
                    <div className="text-sm text-slate-300 font-mono capitalize">
                      {viewState.log.logContext}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Created At
                    </div>
                    <div className="text-sm text-slate-300 font-mono">
                      {new Date(viewState.log.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}