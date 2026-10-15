import { useState, useEffect, useMemo } from 'react';
import { Search, BarChart3 } from 'lucide-react';
import { CandleChart } from '../components/CandleChart';
import type { StockMetadata, CandleData, VolumeData } from '../types';

interface ExplorerViewProps {
  stocks: StockMetadata[];
}

export const ExplorerView = ({ stocks }: ExplorerViewProps) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('RELIANCE');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('ALL');

  // Chart state
  const [loading, setLoading] = useState<boolean>(false);
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [volumes, setVolumes] = useState<VolumeData[]>([]);
  const [indicators, setIndicators] = useState<Record<string, { time: string; value: number }[]>>({});

  // Indicator Toggles
  const [showEMA20, setShowEMA20] = useState<boolean>(true);
  const [showEMA50, setShowEMA50] = useState<boolean>(true);
  const [showEMA200, setShowEMA200] = useState<boolean>(false);

  // Extract unique sectors
  const sectors = useMemo(() => {
    const set = new Set<string>();
    stocks.forEach((s) => {
      if (s.sector) set.add(s.sector);
    });
    return ['ALL', ...Array.from(set).sort()];
  }, [stocks]);

  // Filter stocks list
  const filteredStocks = useMemo(() => {
    return stocks.filter((s) => {
      const matchSearch =
        s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.company_name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchSector = selectedSector === 'ALL' || s.sector === selectedSector;
      return matchSearch && matchSector;
    });
  }, [stocks, searchQuery, selectedSector]);

  // Load candle data when symbol changes
  useEffect(() => {
    const fetchCandles = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/candles/${selectedSymbol}`);
        if (res.ok) {
          const data = await res.json();
          setCandles(data.candles);
          setVolumes(data.volumes);

          // Calculate simple EMAs client-side for immediate inspection
          const closes = data.candles.map((c: CandleData) => c.close);
          const times = data.candles.map((c: CandleData) => c.time);

          const calcEMA = (period: number) => {
            const k = 2 / (period + 1);
            let ema = closes[0];
            const result: { time: string; value: number }[] = [];
            for (let i = 0; i < closes.length; i++) {
              ema = closes[i] * k + ema * (1 - k);
              if (i >= period - 1) {
                result.push({ time: times[i], value: Math.round(ema * 100) / 100 });
              }
            }
            return result;
          };

          const indMap: Record<string, { time: string; value: number }[]> = {};
          if (showEMA20) indMap['EMA 20'] = calcEMA(20);
          if (showEMA50) indMap['EMA 50'] = calcEMA(50);
          if (showEMA200) indMap['EMA 200'] = calcEMA(200);

          setIndicators(indMap);
        }
      } catch (err) {
        console.error('Error fetching candles:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCandles();
  }, [selectedSymbol, showEMA20, showEMA50, showEMA200]);

  const currentStock = stocks.find((s) => s.symbol === selectedSymbol);
  const latestCandle = candles.length > 0 ? candles[candles.length - 1] : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Left Sidebar: Stock Browser */}
      <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col h-[750px]">
        <h3 className="font-bold text-white text-base mb-3 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          Nifty Constituents
        </h3>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search stock..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Sector Filter */}
        <div className="mb-3">
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            {sectors.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>
        </div>

        {/* Stock List */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {filteredStocks.map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => setSelectedSymbol(stock.symbol)}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between ${
                selectedSymbol === stock.symbol
                  ? 'bg-cyan-600 text-white font-semibold shadow-md shadow-cyan-600/30'
                  : 'text-slate-300 hover:bg-slate-800/60'
              }`}
            >
              <div className="truncate">
                <div className="font-mono">{stock.symbol}</div>
                <div className="text-xs opacity-75 truncate">{stock.company_name}</div>
              </div>
              {stock.is_cached && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="lg:col-span-3 space-y-4">
        {/* Stock Header Banner */}
        {currentStock && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-white font-mono">{currentStock.symbol}</h2>
                <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">
                  {currentStock.sector}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{currentStock.company_name}</p>
            </div>

            {/* Price Snapshot */}
            {latestCandle && (
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-xs text-slate-400 uppercase font-semibold">Latest Close</div>
                  <div className="text-2xl font-bold text-white font-mono">
                    ₹{latestCandle.close.toFixed(2)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase font-semibold">Day Range</div>
                  <div className="text-sm font-mono text-slate-300">
                    ₹{latestCandle.low.toFixed(2)} - ₹{latestCandle.high.toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            {/* Indicator Toggles */}
            <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setShowEMA20(!showEMA20)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  showEMA20 ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400'
                }`}
              >
                EMA 20
              </button>
              <button
                onClick={() => setShowEMA50(!showEMA50)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  showEMA50 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400'
                }`}
              >
                EMA 50
              </button>
              <button
                onClick={() => setShowEMA200(!showEMA200)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  showEMA200 ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-slate-400'
                }`}
              >
                EMA 200
              </button>
            </div>
          </div>
        )}

        {/* Interactive Candlestick Chart */}
        {loading ? (
          <div className="h-[480px] bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center">
            <div className="flex items-center gap-3 text-cyan-400 font-medium">
              <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              Loading OHLCV candles...
            </div>
          </div>
        ) : candles.length > 0 ? (
          <CandleChart
            candles={candles}
            volumes={volumes}
            indicators={indicators}
            height={480}
          />
        ) : (
          <div className="h-[480px] bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center text-slate-500">
            No candlestick data available.
          </div>
        )}

        {/* Recent 5 Trading Days Table */}
        {candles.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <h4 className="text-sm font-bold text-white mb-3">Recent Historical Bars</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3 text-right">Open (₹)</th>
                    <th className="py-2.5 px-3 text-right">High (₹)</th>
                    <th className="py-2.5 px-3 text-right">Low (₹)</th>
                    <th className="py-2.5 px-3 text-right">Close (₹)</th>
                    <th className="py-2.5 px-3 text-right">Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  {candles.slice(-6).map((c, i) => (
                    <tr key={i} className="hover:bg-slate-800/40">
                      <td className="py-2.5 px-3 text-slate-400">{c.time}</td>
                      <td className="py-2.5 px-3 text-right">₹{c.open.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right">₹{c.high.toFixed(2)}</td>
                      <td className="py-2.5 px-3 text-right">₹{c.low.toFixed(2)}</td>
                      <td
                        className={`py-2.5 px-3 text-right font-bold ${
                          c.close >= c.open ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        ₹{c.close.toFixed(2)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-400">
                        {volumes[candles.length - 6 + i]?.value.toLocaleString() || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
