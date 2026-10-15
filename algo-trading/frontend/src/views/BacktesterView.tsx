import { useState, useMemo } from 'react';
import {
  Play,
  TrendingUp,
  Percent,
  AlertTriangle,
  Receipt,
  CheckCircle,
  BookOpen,
  Sparkles,
  Layers,
  Zap,
  Sliders,
} from 'lucide-react';
import { EquityChart } from '../components/EquityChart';
import { CandleChart } from '../components/CandleChart';
import { MultiEquityChart } from '../components/MultiEquityChart';
import { StrategyCompareTable } from '../components/StrategyCompareTable';
import { GlossaryModal } from '../components/GlossaryModal';
import { StrategyExplainer } from '../components/StrategyExplainer';
import { TradeInspectorCard } from '../components/TradeInspectorCard';
import type {
  StockMetadata,
  BacktestResult,
  CandleData,
  VolumeData,
  TradeRecord,
  StrategyConfig,
  CompareResponse,
} from '../types';

interface BacktesterViewProps {
  stocks: StockMetadata[];
}

const DEFAULT_COMPARE_STRATEGIES: StrategyConfig[] = [
  {
    name: 'Standard Trend EMA (20/50)',
    strategy: 'EMA_CROSSOVER',
    stop_loss_pct: 0.05,
    take_profit_pct: 0.15,
    params: { fast_period: 20, slow_period: 50 },
  },
  {
    name: 'Conservative Golden Cross (50/200)',
    strategy: 'EMA_CROSSOVER',
    stop_loss_pct: 0.08,
    take_profit_pct: 0.25,
    params: { fast_period: 50, slow_period: 200 },
  },
  {
    name: 'Quick Momentum EMA (10/30)',
    strategy: 'EMA_CROSSOVER',
    stop_loss_pct: 0.03,
    take_profit_pct: 0.10,
    params: { fast_period: 10, slow_period: 30 },
  },
  {
    name: 'Standard RSI Dip-Buyer (14 / 30-70)',
    strategy: 'RSI_MEAN_REVERSION',
    stop_loss_pct: 0.05,
    take_profit_pct: 0.12,
    params: { rsi_period: 14, oversold: 30, overbought: 70, trend_period: 200 },
  },
  {
    name: 'Sniper Oversold RSI (7 / 20-65)',
    strategy: 'RSI_MEAN_REVERSION',
    stop_loss_pct: 0.04,
    take_profit_pct: 0.10,
    params: { rsi_period: 7, oversold: 20, overbought: 65, trend_period: 100 },
  },
];

export const BacktesterView = ({ stocks }: BacktesterViewProps) => {
  // Mode: Single Strategy vs Compare Multiple
  const [mode, setMode] = useState<'single' | 'compare'>('compare');

  // Common Configuration
  const [selectedSymbol, setSelectedSymbol] = useState<string>('RELIANCE');
  const [behaviorFilter, setBehaviorFilter] = useState<string>('ALL');
  const [capital, setCapital] = useState<number>(100000);

  // Single Strategy Params
  const [strategy, setStrategy] = useState<'EMA_CROSSOVER' | 'RSI_MEAN_REVERSION'>('EMA_CROSSOVER');
  const [stopLossPct, setStopLossPct] = useState<number>(5);
  const [takeProfitPct, setTakeProfitPct] = useState<number>(15);
  const [fastPeriod, setFastPeriod] = useState<number>(20);
  const [slowPeriod, setSlowPeriod] = useState<number>(50);
  const [rsiPeriod, setRsiPeriod] = useState<number>(14);
  const [oversold, setOversold] = useState<number>(30);
  const [overbought, setOverbought] = useState<number>(70);
  const [trendPeriod, setTrendPeriod] = useState<number>(200);

  // Single Strategy State
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [volumes, setVolumes] = useState<VolumeData[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<TradeRecord | null>(null);

  // Compare Strategies State
  const compareStrategies = DEFAULT_COMPARE_STRATEGIES;
  const [selectedStrategyNames, setSelectedStrategyNames] = useState<string[]>(
    DEFAULT_COMPARE_STRATEGIES.map((s) => s.name)
  );
  const [compareLoading, setCompareLoading] = useState<boolean>(false);
  const [compareResult, setCompareResult] = useState<CompareResponse | null>(null);

  // General State
  const [error, setError] = useState<string | null>(null);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState<boolean>(false);

  // Filtered stocks based on behavioral tag
  const filteredStocks = useMemo(() => {
    if (behaviorFilter === 'ALL') return stocks;
    return stocks.filter((s) => s.behavior_tag === behaviorFilter);
  }, [stocks, behaviorFilter]);

  // Toggle selection in compare list
  const toggleStrategySelection = (name: string) => {
    if (selectedStrategyNames.includes(name)) {
      if (selectedStrategyNames.length <= 2) return; // Keep at least 2 for comparison
      setSelectedStrategyNames(selectedStrategyNames.filter((n) => n !== name));
    } else {
      if (selectedStrategyNames.length >= 5) return; // Max 5
      setSelectedStrategyNames([...selectedStrategyNames, name]);
    }
  };

  // Run Comparison
  const handleRunComparison = async () => {
    setCompareLoading(true);
    setError(null);

    const activeConfigs = compareStrategies.filter((s) =>
      selectedStrategyNames.includes(s.name)
    );

    try {
      const res = await fetch('/api/backtest/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: selectedSymbol,
          initial_capital: capital,
          strategies: activeConfigs,
        }),
      });

      if (!res.ok) {
        let errorMsg = 'Comparison failed';
        try {
          const errData = await res.json();
          errorMsg = errData.detail || errorMsg;
        } catch {
          errorMsg = (await res.text()) || `Server error (${res.status})`;
        }
        throw new Error(errorMsg);
      }

      const data: CompareResponse = await res.json();
      setCompareResult(data);
    } catch (err: any) {
      setError(err.message || 'Error executing strategy comparison.');
    } finally {
      setCompareLoading(false);
    }
  };

  // Preset Loaders for Single Mode
  const loadEmaPreset = (type: 'conservative' | 'standard' | 'aggressive') => {
    if (type === 'conservative') {
      setFastPeriod(50);
      setSlowPeriod(200);
      setStopLossPct(8);
      setTakeProfitPct(25);
    } else if (type === 'standard') {
      setFastPeriod(20);
      setSlowPeriod(50);
      setStopLossPct(5);
      setTakeProfitPct(15);
    } else {
      setFastPeriod(10);
      setSlowPeriod(30);
      setStopLossPct(3);
      setTakeProfitPct(10);
    }
  };

  const loadRsiPreset = (type: 'standard' | 'aggressive') => {
    if (type === 'standard') {
      setRsiPeriod(14);
      setOversold(30);
      setOverbought(70);
      setTrendPeriod(200);
      setStopLossPct(5);
      setTakeProfitPct(12);
    } else {
      setRsiPeriod(7);
      setOversold(20);
      setOverbought(65);
      setTrendPeriod(100);
      setStopLossPct(4);
      setTakeProfitPct(10);
    }
  };

  // Run Single Backtest
  const handleRunSingleBacktest = async () => {
    setLoading(true);
    setError(null);
    setSelectedTrade(null);

    const params =
      strategy === 'EMA_CROSSOVER'
        ? { fast_period: fastPeriod, slow_period: slowPeriod }
        : {
            rsi_period: rsiPeriod,
            oversold: oversold,
            overbought: overbought,
            trend_period: trendPeriod,
          };

    try {
      const res = await fetch('/api/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          strategy,
          symbol: selectedSymbol,
          initial_capital: capital,
          stop_loss_pct: stopLossPct / 100,
          take_profit_pct: takeProfitPct / 100,
          params,
        }),
      });

      if (!res.ok) {
        let errorMsg = 'Backtest failed';
        try {
          const errData = await res.json();
          errorMsg = errData.detail || errorMsg;
        } catch {
          errorMsg = (await res.text()) || `Server error (${res.status})`;
        }
        throw new Error(errorMsg);
      }

      const data: BacktestResult = await res.json();
      setResult(data);

      const candleRes = await fetch(`/api/candles/${selectedSymbol}`);
      if (candleRes.ok) {
        const cData = await candleRes.json();
        setCandles(cData.candles);
        setVolumes(cData.volumes);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during backtest execution.');
    } finally {
      setLoading(false);
    }
  };

  // Trade markers
  const tradeMarkers = useMemo(() => {
    if (!result || !result.trades) return [];
    const markers: any[] = [];
    result.trades.forEach((trade) => {
      markers.push({
        time: trade.entry_date,
        position: 'belowBar',
        color: '#22c55e',
        shape: 'arrowUp',
        text: `BUY ₹${trade.entry_price}`,
      });
      const isWin = trade.net_pnl > 0;
      markers.push({
        time: trade.exit_date,
        position: 'aboveBar',
        color: isWin ? '#06b6d4' : '#ef4444',
        shape: 'arrowDown',
        text: `${trade.exit_reason} (₹${trade.exit_price})`,
      });
    });
    return markers;
  }, [result]);

  return (
    <div className="space-y-6">
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-cyan-400" />
            Strategy Backtesting Studio
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare win rates, profit targets, and holding durations across quantitative strategies
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mode Switcher */}
          <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setMode('compare')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'compare'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Compare Multiple
            </button>
            <button
              onClick={() => setMode('single')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'single'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Single Strategy
            </button>
          </div>

          <button
            onClick={() => setIsGlossaryOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-400 hover:text-cyan-300 text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            Guide & Glossary
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODE 1: MULTI-STRATEGY COMPARISON                                         */}
      {/* ========================================================================= */}
      {mode === 'compare' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Compare Setup Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Multi-Strategy Comparison Setup
                </h2>
                <p className="text-xs text-slate-400">
                  Select a stock and choose 2 to 5 strategies to compare Win Rates and Days-to-Target side-by-side
                </p>
              </div>

              {/* Stock Selector with Filter */}
              <div className="flex items-center gap-3">
                <div className="flex gap-1 text-[10px]">
                  {['ALL', 'Steady Trend', 'High Volatility', 'Defensive'].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setBehaviorFilter(tag)}
                      className={`px-2 py-1 rounded ${
                        behaviorFilter === tag
                          ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/40'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tag === 'ALL' ? 'All' : tag.split(' ')[0]}
                    </button>
                  ))}
                </div>

                <select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                >
                  {filteredStocks.map((stock) => (
                    <option key={stock.symbol} value={stock.symbol}>
                      [{stock.behavior_tag || 'Stock'}] {stock.symbol}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Strategies Selection Cards */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                Select Strategies to Compare (Pick 2 to 5):
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {compareStrategies.map((strat) => {
                  const isChecked = selectedStrategyNames.includes(strat.name);
                  return (
                    <button
                      key={strat.name}
                      type="button"
                      onClick={() => toggleStrategySelection(strat.name)}
                      className={`p-3.5 rounded-xl border text-left transition-all flex items-start justify-between cursor-pointer ${
                        isChecked
                          ? 'bg-cyan-950/30 border-cyan-500/60 shadow-md shadow-cyan-500/10'
                          : 'bg-slate-950/40 border-slate-800 opacity-60 hover:opacity-90'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs text-white flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isChecked ? 'bg-cyan-400' : 'bg-slate-600'
                            }`}
                          />
                          {strat.name}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-1">
                          SL: {strat.stop_loss_pct! * 100}% | Target: {strat.take_profit_pct! * 100}%
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-bold ${
                          isChecked
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isChecked ? 'Included' : 'Off'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-400">
                Comparing <strong>{selectedStrategyNames.length} strategies</strong> on{' '}
                <strong className="text-cyan-400">{selectedSymbol}</strong> with ₹
                {capital.toLocaleString()} capital
              </span>

              <button
                onClick={handleRunComparison}
                disabled={compareLoading || selectedStrategyNames.length < 2}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-cyan-600/30 transition-all disabled:opacity-50 cursor-pointer text-sm"
              >
                {compareLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 fill-white" />
                )}
                {compareLoading ? 'Comparing Past 7.5 Years...' : 'Compare All Strategies'}
              </button>
            </div>
          </div>

          {/* Comparison Results */}
          {compareResult && (
            <div className="space-y-6">
              {/* Leaderboard & Winners */}
              <StrategyCompareTable comparison={compareResult} />

              {/* Multi-Line Equity Overlay Chart */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    Simultaneous Equity Curve Overlay ({selectedSymbol})
                  </h3>
                  <span className="text-xs text-slate-400">
                    See how each strategy grew capital over time
                  </span>
                </div>
                <MultiEquityChart equityCurves={compareResult.equity_curves} height={360} />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODE 2: SINGLE STRATEGY DEEP DIVE                                         */}
      {/* ========================================================================= */}
      {mode === 'single' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Collapsible Strategy Explainer Accordion */}
          <StrategyExplainer strategy={strategy} />

          {/* Main Configuration Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
              <span className="text-sm font-bold text-white uppercase tracking-wider">
                Strategy & Stock Configuration
              </span>

              {/* Preset Buttons */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 mr-1 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Presets:
                </span>
                {strategy === 'EMA_CROSSOVER' ? (
                  <>
                    <button
                      onClick={() => loadEmaPreset('standard')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
                    >
                      Standard (20/50)
                    </button>
                    <button
                      onClick={() => loadEmaPreset('conservative')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
                    >
                      Conservative (50/200)
                    </button>
                    <button
                      onClick={() => loadEmaPreset('aggressive')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
                    >
                      Aggressive (10/30)
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => loadRsiPreset('standard')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
                    >
                      Standard (14 / 30-70)
                    </button>
                    <button
                      onClick={() => loadRsiPreset('aggressive')}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700"
                    >
                      Sniper (7 / 20-65)
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Strategy
                </label>
                <select
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="EMA_CROSSOVER">EMA Trend Follower (Crossover)</option>
                  <option value="RSI_MEAN_REVERSION">RSI Mean Reversion (Dip Buyer)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Stock Universe
                </label>
                <select
                  value={selectedSymbol}
                  onChange={(e) => setSelectedSymbol(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                >
                  {filteredStocks.map((stock) => (
                    <option key={stock.symbol} value={stock.symbol}>
                      [{stock.behavior_tag || 'Stock'}] {stock.symbol} ({stock.company_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                  Capital (₹)
                </label>
                <input
                  type="number"
                  value={capital}
                  onChange={(e) => setCapital(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                  step={10000}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Stop Loss %
                  </label>
                  <input
                    type="number"
                    value={stopLossPct}
                    onChange={(e) => setStopLossPct(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                    step={0.5}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    Target %
                  </label>
                  <input
                    type="number"
                    value={takeProfitPct}
                    onChange={(e) => setTakeProfitPct(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
                    step={1}
                  />
                </div>
              </div>
            </div>

            {/* Parameter Details */}
            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-5">
                {strategy === 'EMA_CROSSOVER' ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-semibold">Fast EMA:</span>
                      <input
                        type="number"
                        value={fastPeriod}
                        onChange={(e) => setFastPeriod(Number(e.target.value))}
                        className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white font-mono"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-semibold">Slow EMA:</span>
                      <input
                        type="number"
                        value={slowPeriod}
                        onChange={(e) => setSlowPeriod(Number(e.target.value))}
                        className="w-20 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm text-white font-mono"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-semibold">RSI:</span>
                      <input
                        type="number"
                        value={rsiPeriod}
                        onChange={(e) => setRsiPeriod(Number(e.target.value))}
                        className="w-18 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white font-mono"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-semibold">Oversold:</span>
                      <input
                        type="number"
                        value={oversold}
                        onChange={(e) => setOversold(Number(e.target.value))}
                        className="w-18 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white font-mono"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-semibold">Overbought:</span>
                      <input
                        type="number"
                        value={overbought}
                        onChange={(e) => setOverbought(Number(e.target.value))}
                        className="w-18 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white font-mono"
                      />
                    </div>
                  </>
                )}
              </div>

              <button
                onClick={handleRunSingleBacktest}
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg shadow-cyan-600/30 transition-all disabled:opacity-50 cursor-pointer text-sm"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Play className="w-4 h-4 fill-white" />
                )}
                {loading ? 'Simulating past 7.5 years...' : 'Run Backtest'}
              </button>
            </div>
          </div>

          {/* Single Strategy Results */}
          {result && (
            <div className="space-y-6">
              {/* Metric KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-xs font-semibold uppercase">Win Rate</span>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-400 font-mono">
                    {result.win_rate_pct}%
                  </div>
                  <div className="text-xs text-slate-400 mt-1 font-mono">
                    {result.winning_trades}W / {result.losing_trades}L
                  </div>
                </div>

                {/* Days to Target Metric */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-xs font-semibold uppercase">Days to Target</span>
                    <Zap className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-bold text-cyan-400 font-mono">
                    {result.avg_days_to_target > 0 ? `~${result.avg_days_to_target}d` : '-'}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    Target hit: {result.target_hit_rate_pct}%
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-xs font-semibold uppercase">Total Return</span>
                    <Percent className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div
                    className={`text-2xl font-bold font-mono ${
                      result.total_return_pct >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}
                  >
                    {result.total_return_pct >= 0 ? '+' : ''}
                    {result.total_return_pct}%
                  </div>
                  <div className="text-xs text-slate-400 mt-1 font-mono">
                    Final: ₹{result.final_equity.toLocaleString()}
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-xs font-semibold uppercase">CAGR</span>
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-white">{result.cagr_pct}%</div>
                  <div className="text-xs text-slate-400 mt-1">Annualized</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-xs font-semibold uppercase">Max Drawdown</span>
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="text-2xl font-bold text-rose-400 font-mono">
                    -{result.max_drawdown_pct}%
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Worst Drop</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md">
                  <div className="flex items-center justify-between text-slate-400 mb-1">
                    <span className="text-xs font-semibold uppercase">Taxes & Fees</span>
                    <Receipt className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-white font-mono">
                    ₹{result.total_fees_paid.toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">STT, Brokerage & GST</div>
                </div>
              </div>

              {/* Selected Trade Inspector Card */}
              {selectedTrade && (
                <TradeInspectorCard trade={selectedTrade} onClose={() => setSelectedTrade(null)} />
              )}

              {/* Equity Curve Chart */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Portfolio Equity Curve</h3>
                    <p className="text-xs text-slate-400">
                      Growth of ₹{result.initial_capital.toLocaleString()} net of Indian regulatory charges
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-lg border border-cyan-500/20 font-mono">
                    Profit Factor: {result.profit_factor}
                  </div>
                </div>
                <EquityChart equityCurve={result.equity_curve} height={280} />
              </div>

              {/* Candlestick Chart with Trades */}
              {candles.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-lg font-bold text-white mb-2">
                    {result.symbol} Price Action with Buy & Sell Executions
                  </h3>
                  <CandleChart
                    candles={candles}
                    volumes={volumes}
                    indicators={result.indicators}
                    markers={tradeMarkers}
                    height={380}
                  />
                </div>
              )}

              {/* Trade Log */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold text-white mb-2">
                  Trade Log ({result.trades.length} Completed Trades)
                </h3>
                <p className="text-xs text-cyan-400 mb-4">
                  👉 Click any trade below to inspect its detailed anatomy and tax breakdown!
                </p>
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-semibold sticky top-0">
                      <tr>
                        <th className="py-3 px-4">Entry Date</th>
                        <th className="py-3 px-4">Exit Date</th>
                        <th className="py-3 px-4 text-right">Entry (₹)</th>
                        <th className="py-3 px-4 text-right">Exit (₹)</th>
                        <th className="py-3 px-4 text-right">Shares</th>
                        <th className="py-3 px-4 text-right">Net PnL (₹)</th>
                        <th className="py-3 px-4 text-right">Return %</th>
                        <th className="py-3 px-4 text-center">Days</th>
                        <th className="py-3 px-4 text-center">Exit Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 cursor-pointer">
                      {result.trades.map((trade, idx) => {
                        const isWin = trade.net_pnl > 0;
                        const isSelected =
                          selectedTrade &&
                          selectedTrade.entry_date === trade.entry_date &&
                          selectedTrade.exit_date === trade.exit_date;
                        return (
                          <tr
                            key={idx}
                            onClick={() => setSelectedTrade(trade)}
                            className={`transition-colors ${
                              isSelected
                                ? 'bg-cyan-950/40 border-l-4 border-cyan-400'
                                : 'hover:bg-slate-800/40'
                            }`}
                          >
                            <td className="py-3 px-4 font-mono text-xs">{trade.entry_date}</td>
                            <td className="py-3 px-4 font-mono text-xs">{trade.exit_date}</td>
                            <td className="py-3 px-4 text-right font-mono">₹{trade.entry_price}</td>
                            <td className="py-3 px-4 text-right font-mono">₹{trade.exit_price}</td>
                            <td className="py-3 px-4 text-right font-mono">{trade.shares}</td>
                            <td
                              className={`py-3 px-4 text-right font-bold font-mono ${
                                isWin ? 'text-emerald-400' : 'text-red-400'
                              }`}
                            >
                              {isWin ? '+' : ''}₹{trade.net_pnl.toLocaleString()}
                            </td>
                            <td
                              className={`py-3 px-4 text-right font-mono ${
                                isWin ? 'text-emerald-400' : 'text-red-400'
                              }`}
                            >
                              {isWin ? '+' : ''}
                              {trade.return_pct}%
                            </td>
                            <td className="py-3 px-4 text-center text-slate-400 font-mono">
                              {trade.duration_days}d
                            </td>
                            <td className="py-3 px-4 text-center">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                  trade.exit_reason === 'Take Profit'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : trade.exit_reason === 'Stop Loss'
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                                }`}
                              >
                                {trade.exit_reason}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Glossary Modal */}
      <GlossaryModal isOpen={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} />
    </div>
  );
};
