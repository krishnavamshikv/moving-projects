import { Trophy, Zap, TrendingUp, Clock, CheckCircle, Percent } from 'lucide-react';
import type { CompareResponse } from '../types';

interface StrategyCompareTableProps {
  comparison: CompareResponse;
}

const STRATEGY_COLORS = ['#06b6d4', '#f59e0b', '#a855f7', '#10b981', '#ec4899'];

export const StrategyCompareTable = ({ comparison }: StrategyCompareTableProps) => {
  const { winners, rankings } = comparison;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Winners Spotlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Highest Win Rate Winner */}
        <div className="bg-gradient-to-br from-emerald-950/40 to-slate-900 border-2 border-emerald-500/50 rounded-2xl p-4 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0 shadow-lg shadow-emerald-500/10">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Highest Win Rate
            </div>
            <div className="text-base font-bold text-white truncate">{winners.highest_win_rate.name}</div>
            <div className="text-sm font-bold font-mono text-emerald-300 mt-0.5">
              {winners.highest_win_rate.win_rate_pct}% Win Rate{' '}
              <span className="text-xs text-slate-400 font-normal">
                ({winners.highest_win_rate.total_return_pct >= 0 ? '+' : ''}
                {winners.highest_win_rate.total_return_pct}% return)
              </span>
            </div>
          </div>
        </div>

        {/* Fastest to Target Winner */}
        <div className="bg-gradient-to-br from-cyan-950/40 to-slate-900 border-2 border-cyan-500/50 rounded-2xl p-4 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0 shadow-lg shadow-cyan-500/10">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
              Fastest to Profit Target
            </div>
            <div className="text-base font-bold text-white truncate">
              {winners.fastest_target ? winners.fastest_target.name : 'N/A'}
            </div>
            <div className="text-sm font-bold font-mono text-cyan-300 mt-0.5">
              {winners.fastest_target && winners.fastest_target.avg_days_to_target > 0 ? (
                <>
                  ~{winners.fastest_target.avg_days_to_target} days to target{' '}
                  <span className="text-xs text-slate-400 font-normal">
                    ({winners.fastest_target.target_hit_rate_pct}% target hit rate)
                  </span>
                </>
              ) : (
                'No take-profit hits'
              )}
            </div>
          </div>
        </div>

        {/* Highest Total Return Winner */}
        <div className="bg-gradient-to-br from-amber-950/40 to-slate-900 border-2 border-amber-500/50 rounded-2xl p-4 shadow-xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0 shadow-lg shadow-amber-500/10">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
              Maximum Total Return
            </div>
            <div className="text-base font-bold text-white truncate">{winners.highest_return.name}</div>
            <div className="text-sm font-bold font-mono text-amber-300 mt-0.5">
              +{winners.highest_return.total_return_pct}% Net Profit
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Leaderboard Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Strategy Comparison Leaderboard ({rankings.length} Strategies)
            </h3>
            <p className="text-xs text-slate-400">
              Sorted by Win Rate & time required to achieve target profits
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase font-semibold">
              <tr>
                <th className="py-3.5 px-4 text-center">Rank</th>
                <th className="py-3.5 px-4">Strategy</th>
                <th className="py-3.5 px-4 text-right bg-emerald-950/30 text-emerald-400">
                  <div className="flex items-center justify-end gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Win Rate %
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right bg-cyan-950/30 text-cyan-400">
                  <div className="flex items-center justify-end gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Days to Target
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right text-cyan-300">Target Hit %</th>
                <th className="py-3.5 px-4 text-right">Avg Hold</th>
                <th className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Percent className="w-3.5 h-3.5" />
                    Return %
                  </div>
                </th>
                <th className="py-3.5 px-4 text-right">CAGR %</th>
                <th className="py-3.5 px-4 text-right">Drawdown</th>
                <th className="py-3.5 px-4 text-center">Trades (W/L)</th>
                <th className="py-3.5 px-4 text-right">Profit Factor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {rankings.map((res, idx) => {
                const isTopWin = res.strategy_name === winners.highest_win_rate.name;
                const isFastest = winners.fastest_target && res.strategy_name === winners.fastest_target.name;

                return (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      idx === 0 ? 'bg-slate-850/50' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                      {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 1}`}
                    </td>
                    <td className="py-3.5 px-4 font-sans font-bold text-white flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: STRATEGY_COLORS[idx % STRATEGY_COLORS.length] }}
                      />
                      <span>{res.strategy_name}</span>
                      {isTopWin && (
                        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-normal">
                          Best Win Rate
                        </span>
                      )}
                      {isFastest && (
                        <span className="text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded font-normal">
                          Fastest
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-400 bg-emerald-950/20 text-base">
                      {res.win_rate_pct}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-cyan-300 bg-cyan-950/20 text-base">
                      {res.avg_days_to_target > 0 ? `~${res.avg_days_to_target}d` : '-'}
                    </td>
                    <td className="py-3.5 px-4 text-right text-cyan-400">
                      {res.target_hit_rate_pct}%
                    </td>
                    <td className="py-3.5 px-4 text-right text-slate-400">
                      {res.avg_holding_days}d
                    </td>
                    <td
                      className={`py-3.5 px-4 text-right font-bold ${
                        res.total_return_pct >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {res.total_return_pct >= 0 ? '+' : ''}
                      {res.total_return_pct}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-white">
                      {res.cagr_pct}%
                    </td>
                    <td className="py-3.5 px-4 text-right text-rose-400">
                      -{res.max_drawdown_pct}%
                    </td>
                    <td className="py-3.5 px-4 text-center text-xs text-slate-300">
                      <span className="text-emerald-400">{res.winning_trades}W</span> /{' '}
                      <span className="text-rose-400">{res.losing_trades}L</span> ({res.total_trades})
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-cyan-400">
                      {res.profit_factor}
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
