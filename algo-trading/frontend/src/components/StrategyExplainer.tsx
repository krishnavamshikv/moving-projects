import { useState } from 'react';
import { ChevronDown, ChevronUp, Lightbulb, TrendingUp, RefreshCw, Compass } from 'lucide-react';

interface StrategyExplainerProps {
  strategy: 'EMA_CROSSOVER' | 'RSI_MEAN_REVERSION';
}

export const StrategyExplainer = ({ strategy }: StrategyExplainerProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition-all">
      {/* Header / Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-slate-800/40 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <span className="text-sm font-bold text-white">
              {strategy === 'EMA_CROSSOVER'
                ? 'How Does EMA Trend Following Work?'
                : 'How Does RSI Mean Reversion Work?'}
            </span>
            <span className="text-xs text-slate-400 ml-2 hidden sm:inline">
              (Click to {isOpen ? 'collapse' : 'expand'} plain-English explainer)
            </span>
          </div>
        </div>
        <div className="text-slate-400">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="px-5 pb-5 pt-1 border-t border-slate-800/60 text-xs text-slate-300 space-y-3">
          {strategy === 'EMA_CROSSOVER' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Concept */}
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 font-bold text-cyan-400 mb-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  The Concept
                </div>
                <p className="leading-relaxed">
                  Moving Averages smooth out daily noise. The <strong>Fast EMA</strong> reacts quickly to recent prices, while the <strong>Slow EMA</strong> shows the broader trend. When the fast line crosses above the slow line, momentum is accelerating upward.
                </p>
              </div>

              {/* Exact Rules */}
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
                  <Compass className="w-3.5 h-3.5" />
                  Exact Rules
                </div>
                <ul className="space-y-1 list-disc list-inside leading-relaxed text-slate-300">
                  <li><strong>Buy Signal:</strong> Fast EMA crosses above Slow EMA.</li>
                  <li><strong>Exit Signal:</strong> Fast EMA crosses below Slow EMA, OR Stop Loss (cuts bad trades), OR Target is hit.</li>
                </ul>
              </div>

              {/* Best Conditions */}
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
                  <Lightbulb className="w-3.5 h-3.5" />
                  Market Regime
                </div>
                <p className="leading-relaxed">
                  <strong>Thrives:</strong> Strong bull runs and directional uptrends (e.g. <em>Steady Trend</em> stocks like Reliance, TCS, Titan).<br/>
                  <strong>Struggles:</strong> Choppy, sideways markets where false crossovers cause minor whipsaw losses.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Concept */}
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 font-bold text-cyan-400 mb-1">
                  <RefreshCw className="w-3.5 h-3.5" />
                  The Concept (Buy The Dip)
                </div>
                <p className="leading-relaxed">
                  RSI (Relative Strength Index) measures whether a stock is over-stretched. Good companies occasionally drop too fast due to short-term fear (Oversold &lt; 30) before snapping back like a rubber band toward their mean.
                </p>
              </div>

              {/* Exact Rules */}
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
                  <Compass className="w-3.5 h-3.5" />
                  Exact Rules
                </div>
                <ul className="space-y-1 list-disc list-inside leading-relaxed text-slate-300">
                  <li><strong>Trend Filter:</strong> Stock price must be above 200 EMA (never catch falling knives in a macro bear market!).</li>
                  <li><strong>Buy:</strong> RSI drops into oversold (&lt;30) and starts turning up.</li>
                  <li><strong>Sell:</strong> RSI hits overbought (&gt;70) or stop loss is touched.</li>
                </ul>
              </div>

              {/* Best Conditions */}
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
                  <Lightbulb className="w-3.5 h-3.5" />
                  Market Regime
                </div>
                <p className="leading-relaxed">
                  <strong>Thrives:</strong> High win-rate in range-bound and healthy trending markets (e.g. <em>Defensive</em> or <em>Steady Trend</em> stocks).<br/>
                  <strong>Struggles:</strong> Protracted one-way bear market crashes if the trend filter is disabled.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
