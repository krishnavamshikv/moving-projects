import { X, BookOpen, TrendingUp, Award, DollarSign } from 'lucide-react';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlossaryModal = ({ isOpen, onClose }: GlossaryModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Backtesting & Quantitative Trading Guide</h2>
              <p className="text-xs text-slate-400">Demystifying metrics, statistics, and strategy math for beginners</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm text-slate-300">
          {/* Section 1: What is Backtesting? */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              What is Backtesting?
            </h3>
            <p className="leading-relaxed text-slate-300">
              Backtesting is the process of applying an exact set of mathematical trading rules to historical market data to see how they would have performed in the past.
            </p>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-emerald-300">
                <span className="font-bold block mb-1">✓ Why it's powerful:</span>
                It removes human fear and greed, proves whether a concept has an edge, and tests through real historical market crashes (like 2020 COVID).
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-amber-300">
                <span className="font-bold block mb-1">⚠ Beginner Caution (Overfitting):</span>
                Never tweak 20 different parameters just to make past returns look artificially 1,000%. Simple rules that work across multiple stocks perform far better in live markets.
              </div>
            </div>
          </div>

          {/* Section 2: Core Metrics */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              Key Performance Metrics Explained
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CAGR */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-cyan-400 text-sm">CAGR (Compound Growth)</span>
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Annualized</span>
                </div>
                <p className="text-xs text-slate-300 mb-2">
                  The smoothed annual return rate your portfolio grew at over the multi-year testing period.
                </p>
                <div className="text-xs font-mono bg-slate-900/80 p-2 rounded border border-slate-800 text-slate-300">
                  <span className="text-emerald-400 font-bold">&gt;18%:</span> Outperforming Nifty 50 index<br/>
                  <span className="text-cyan-400 font-bold">12% - 15%:</span> Broad market match<br/>
                  <span className="text-rose-400 font-bold">&lt;8%:</span> Barely beating a Bank Fixed Deposit
                </div>
              </div>

              {/* Sharpe Ratio */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-amber-400 text-sm">Sharpe Ratio</span>
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Risk / Reward</span>
                </div>
                <p className="text-xs text-slate-300 mb-2">
                  Measures how much return you generated per unit of risk/volatility taken above the risk-free rate (6%).
                </p>
                <div className="text-xs font-mono bg-slate-900/80 p-2 rounded border border-slate-800 text-slate-300">
                  <span className="text-emerald-400 font-bold">&gt;1.5:</span> Excellent risk-adjusted returns<br/>
                  <span className="text-cyan-400 font-bold">1.0 - 1.5:</span> Good, solid strategy<br/>
                  <span className="text-rose-400 font-bold">&lt;0.8:</span> Too much roller-coaster ride for the return
                </div>
              </div>

              {/* Max Drawdown */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-rose-400 text-sm">Maximum Drawdown (MDD)</span>
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">Worst Pain</span>
                </div>
                <p className="text-xs text-slate-300 mb-2">
                  The deepest loss from peak to trough in your account equity before recovering to a new high.
                </p>
                <div className="text-xs font-mono bg-slate-900/80 p-2 rounded border border-slate-800 text-slate-300">
                  <span className="text-emerald-400 font-bold">&lt;15%:</span> Very conservative, easy to trade live<br/>
                  <span className="text-cyan-400 font-bold">15% - 25%:</span> Typical for equities swing trading<br/>
                  <span className="text-rose-400 font-bold">&gt;35%:</span> Danger of emotional quitting / capital loss
                </div>
              </div>

              {/* Win Rate & Profit Factor */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-emerald-400 text-sm">Win Rate & Profit Factor</span>
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">The Quant Edge</span>
                </div>
                <p className="text-xs text-slate-300 mb-2">
                  Win Rate = % of winning trades. Profit Factor = Total Gross Profit ÷ Total Gross Loss.
                </p>
                <div className="text-xs font-mono bg-slate-900/80 p-2 rounded border border-slate-800 text-slate-300">
                  <span className="text-slate-300">A trend strategy with only <strong>45% win rate</strong> can be wildly profitable if winners make ₹15,000 while losers are cut at ₹5,000! (Profit Factor &gt; 1.6)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Indian Regulatory Taxes */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-blue-400" />
              Indian Regulatory Cost Model (Why our results are realistic)
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              Most online backtesters show inflated profits because they ignore Indian regulatory taxes. This app deducts real-world costs on every trade:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Brokerage</span>
                <span className="text-white font-bold">₹20 / order</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">STT (Delivery)</span>
                <span className="text-white font-bold">0.1% Buy & Sell</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">GST</span>
                <span className="text-white font-bold">18% on Fees</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Exchange & Stamp</span>
                <span className="text-white font-bold">0.015% + Charges</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs rounded-xl shadow-md transition-colors"
          >
            Got It! Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
