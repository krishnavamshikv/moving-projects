import { X, ShieldCheck, CheckCircle2, AlertOctagon } from 'lucide-react';
import type { TradeRecord } from '../types';

interface TradeInspectorCardProps {
  trade: TradeRecord | null;
  onClose: () => void;
}

export const TradeInspectorCard = ({ trade, onClose }: TradeInspectorCardProps) => {
  if (!trade) return null;

  const isWin = trade.net_pnl > 0;
  const totalFees = trade.entry_cost + trade.exit_cost;

  return (
    <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-2xl p-5 shadow-2xl animate-fadeIn space-y-4">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isWin
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}
          >
            {isWin ? <CheckCircle2 className="w-5 h-5" /> : <AlertOctagon className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white font-mono text-base">{trade.symbol}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  isWin
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {isWin ? 'Winning Trade' : 'Losing Trade'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Held for {trade.duration_days} calendar days ({trade.entry_date} → {trade.exit_date})
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Trade Execution Flow */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        {/* Step 1: Entry */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 block uppercase font-semibold text-[10px] mb-1">
            1. Buy Execution
          </span>
          <div className="text-white font-bold text-sm font-mono">
            {trade.shares} shares @ ₹{trade.entry_price}
          </div>
          <p className="text-slate-400 text-[11px] mt-1">
            Date: <span className="font-mono text-slate-200">{trade.entry_date}</span>
          </p>
          <p className="text-slate-400 text-[11px]">
            Capital deployed: <span className="font-mono text-slate-200">₹{(trade.shares * trade.entry_price).toLocaleString()}</span>
          </p>
        </div>

        {/* Step 2: Exit */}
        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
          <span className="text-slate-400 block uppercase font-semibold text-[10px] mb-1">
            2. Sell Execution
          </span>
          <div className="text-white font-bold text-sm font-mono">
            {trade.shares} shares @ ₹{trade.exit_price}
          </div>
          <p className="text-slate-400 text-[11px] mt-1">
            Date: <span className="font-mono text-slate-200">{trade.exit_date}</span>
          </p>
          <p className="text-slate-400 text-[11px]">
            Trigger: <span className="font-semibold text-cyan-400">{trade.exit_reason}</span>
          </p>
        </div>

        {/* Step 3: Net Bottomline */}
        <div
          className={`p-3.5 rounded-xl border ${
            isWin ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'
          }`}
        >
          <span className="text-slate-400 block uppercase font-semibold text-[10px] mb-1">
            3. Net Result (In Pocket)
          </span>
          <div
            className={`text-lg font-bold font-mono ${
              isWin ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isWin ? '+' : ''}₹{trade.net_pnl.toLocaleString()} ({trade.return_pct}%)
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Taxes/Fees deducted: ₹{totalFees.toFixed(1)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
