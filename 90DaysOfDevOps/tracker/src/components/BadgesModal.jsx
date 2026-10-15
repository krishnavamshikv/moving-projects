import React, { useState } from 'react';
import { Trophy, X, Award, Flame, CheckCircle2, Lock, Sparkles } from 'lucide-react';

export default function BadgesModal({ isOpen, onClose, badgeInfo, streakInfo }) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  if (!isOpen || !badgeInfo) return null;

  const { badges, unlockedCount, totalBadges } = badgeInfo;
  const categories = ['All', ...new Set(badges.map(b => b.category))];

  const filteredBadges = badges.filter(b => {
    if (selectedCategory === 'All') return true;
    return b.category === selectedCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 w-full max-w-4xl shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-cyan-500 shadow-lg shadow-amber-500/20">
              <Trophy className="w-6 h-6 text-slate-950 font-bold" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
                DevOps Achievements & Badges
                <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {unlockedCount} / {totalBadges} Unlocked
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Complete daily tasks, maintain streaks, and master modules to unlock honors.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Highlights Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Badges Earned</div>
              <div className="text-lg font-black text-slate-100">{unlockedCount} of {totalBadges}</div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Current Streak</div>
              <div className="text-lg font-black text-orange-400">🔥 {streakInfo?.currentStreak || 0} Days</div>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Longest Streak</div>
              <div className="text-lg font-black text-cyan-300">🏆 {streakInfo?.maxStreak || 0} Days</div>
            </div>
          </div>
        </div>

        {/* Filter Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {filteredBadges.map(badge => (
            <div
              key={badge.id}
              className={`border rounded-2xl p-4 space-y-3 transition-all ${
                badge.isUnlocked
                  ? 'bg-slate-950/80 border-cyan-500/40 shadow-lg shadow-cyan-500/5 ring-1 ring-cyan-500/20'
                  : 'bg-slate-950/30 border-slate-800/80 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`text-3xl p-2.5 rounded-2xl border ${
                    badge.isUnlocked
                      ? 'bg-slate-900 border-cyan-500/30 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-900/50 border-slate-800 filter grayscale'
                  }`}>
                    {badge.icon}
                  </div>

                  <div>
                    <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                      {badge.title}
                    </h3>
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {badge.category}
                    </span>
                  </div>
                </div>

                {badge.isUnlocked ? (
                  <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> Locked
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                {badge.description}
              </p>

              {/* Progress Meter */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Progress</span>
                  <span className="font-mono font-bold text-slate-300">
                    {badge.current} / {badge.target} ({badge.progressPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      badge.isUnlocked
                        ? 'bg-gradient-to-r from-amber-400 to-cyan-400'
                        : 'bg-cyan-500/50'
                    }`}
                    style={{ width: `${badge.progressPercent}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-800">
          Tip: Complete tasks daily to build your 🔥 streak and unlock milestone honors!
        </div>

      </div>
    </div>
  );
}
