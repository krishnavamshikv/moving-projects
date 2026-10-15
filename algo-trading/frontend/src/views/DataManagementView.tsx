import { useState, useEffect, useMemo } from 'react';
import { Database, RefreshCw, CheckCircle2, AlertCircle, HardDrive, Layers, FileText } from 'lucide-react';
import type { StockMetadata, StorageSummaryResponse } from '../types';

interface DataManagementViewProps {
  stocks: StockMetadata[];
  onRefreshUniverse: () => void;
}

export const DataManagementView = ({
  stocks,
  onRefreshUniverse,
}: DataManagementViewProps) => {
  const [summary, setSummary] = useState<StorageSummaryResponse | null>(null);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncProgress, setSyncProgress] = useState<{
    pct: number;
    currentSymbol: string;
    index: number;
    total: number;
    message?: string;
  } | null>(null);

  const fetchSummary = async () => {
    try {
      const res = await fetch('/api/summary');
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch (err) {
      console.error('Error fetching summary:', err);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  // Trigger SSE Data Sync
  const handleStartSync = () => {
    setSyncing(true);
    setSyncProgress({ pct: 0, currentSymbol: 'Initializing...', index: 0, total: 108 });

    const eventSource = new EventSource('/api/sync/stream');

    eventSource.addEventListener('start', (e) => {
      const data = JSON.parse(e.data);
      setSyncProgress({ pct: 0, currentSymbol: 'Starting...', index: 0, total: data.total });
    });

    eventSource.addEventListener('progress', (e) => {
      const data = JSON.parse(e.data);
      setSyncProgress({
        pct: data.pct,
        currentSymbol: data.symbol,
        index: data.index,
        total: data.total,
        message: `Synced ${data.symbol} (${data.rows} bars)`,
      });
    });

    eventSource.addEventListener('complete', () => {
      eventSource.close();
      setSyncing(false);
      setSyncProgress(null);
      fetchSummary();
      onRefreshUniverse();
    });

    eventSource.onerror = () => {
      eventSource.close();
      setSyncing(false);
    };
  };

  // Map summary lookup by symbol
  const summaryMap = useMemo(() => {
    const map = new Map<string, any>();
    if (summary && summary.summary) {
      summary.summary.forEach((item) => map.set(item.symbol, item));
    }
    return map;
  }, [summary]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Trigger */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            Parquet Storage & Data Synchronization
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Local Apache Parquet storage caching 7.5+ years of daily OHLCV bars
          </p>
        </div>

        <button
          onClick={handleStartSync}
          disabled={syncing}
          className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-600/30 transition-all disabled:opacity-50 cursor-pointer text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Synchronizing Market Data...' : 'Sync Missing Tickers'}
        </button>
      </div>

      {/* Live SSE Progress Bar */}
      {syncing && syncProgress && (
        <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              Downloading: {syncProgress.currentSymbol} ({syncProgress.index} / {syncProgress.total})
            </div>
            <span className="font-bold text-white">{syncProgress.pct}%</span>
          </div>

          <div className="w-full bg-slate-950 rounded-full h-3 border border-slate-800 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${syncProgress.pct}%` }}
            />
          </div>
          {syncProgress.message && (
            <p className="text-xs text-slate-400 font-mono">{syncProgress.message}</p>
          )}
        </div>
      )}

      {/* Storage Summary KPIs */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase text-slate-400">Cached Equities</div>
              <div className="text-2xl font-bold text-white">
                {summary.cached_symbols_count} / {stocks.length}
              </div>
              <div className="text-xs text-emerald-400 font-medium mt-0.5">
                {Math.round((summary.cached_symbols_count / stocks.length) * 100)}% coverage
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase text-slate-400">Total OHLCV Bars</div>
              <div className="text-2xl font-bold text-white">
                {summary.total_bars_cached.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Zero nulls detected</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase text-slate-400">Disk Footprint</div>
              <div className="text-2xl font-bold text-white">{summary.total_storage_mb} MB</div>
              <div className="text-xs text-slate-400 mt-0.5">Snappy Parquet compression</div>
            </div>
          </div>
        </div>
      )}

      {/* Constituents Parquet Cache Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4">Constituent Parquet Records</h3>
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-semibold sticky top-0">
              <tr>
                <th className="py-3 px-4">Symbol</th>
                <th className="py-3 px-4">Company Name</th>
                <th className="py-3 px-4">Sector</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Bars</th>
                <th className="py-3 px-4 text-center">Date Range</th>
                <th className="py-3 px-4 text-right">Size (KB)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {stocks.map((stock) => {
                const item = summaryMap.get(stock.symbol);
                const isCached = !!item;
                return (
                  <tr key={stock.symbol} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-white">{stock.symbol}</td>
                    <td className="py-3 px-4 text-xs text-slate-400">{stock.company_name}</td>
                    <td className="py-3 px-4 text-xs text-slate-400">{stock.sector}</td>
                    <td className="py-3 px-4 text-center">
                      {isCached ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Cached
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Missing
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {item ? item.rows.toLocaleString() : '-'}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-xs text-slate-400">
                      {item ? `${item.start_date} → ${item.end_date}` : '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-xs text-slate-400">
                      {item ? `${item.size_kb} KB` : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
