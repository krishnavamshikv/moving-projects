import React, { useState, useEffect, useRef, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Flame, 
  Calendar, 
  CheckCircle2, 
  Circle, 
  ArrowUpRight, 
  RefreshCw, 
  Terminal, 
  BookOpen, 
  Zap, 
  Layers, 
  Clock,
  ChevronRight,
  ChevronLeft,
  Filter,
  Database,
  AlertTriangle,
  FileEdit,
  Edit2,
  X,
  Check,
  Award,
  Eye
} from 'lucide-react';

import tasksData from './data/tasksData.json';
import { calculateVelocityMetrics, formatDate } from './utils/velocityEngine';
import { calculateStreakInfo, calculateBadges } from './utils/gamificationEngine';
import { getRandomQuote } from './utils/quotes';
import TaskModal from './components/TaskModal';
import TaskEditorStudio from './components/TaskEditorStudio';
import BadgesModal from './components/BadgesModal';

const API_BASE = 'http://localhost:3001/api';

export default function App() {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [completionTimestamps, setCompletionTimestamps] = useState({});
  const [startDateStr, setStartDateStr] = useState('2026-08-21');
  const [selectedModule, setSelectedModule] = useState('All');
  
  // Single atomic active modal state: null | { type: 'details'|'studio', task, initialFile, initialTab }
  const [activeModal, setActiveModal] = useState(null);
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [showBadgesModal, setShowBadgesModal] = useState(false);
  const [tempStartDate, setTempStartDate] = useState('2026-08-21');
  const [dbConnected, setDbConnected] = useState(false);

  const filterScrollRef = useRef(null);

  const scrollFilters = (direction) => {
    if (filterScrollRef.current) {
      const scrollAmount = direction === 'left' ? -250 : 250;
      filterScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Fetch initial state from SQLite backend (fallback to localStorage)
  useEffect(() => {
    fetch(`${API_BASE}/state`)
      .then(res => res.json())
      .then(data => {
        const dateVal = data.startDate || new Date().toISOString().split('T')[0];
        setStartDateStr(dateVal);
        setTempStartDate(dateVal);
        localStorage.setItem('devops_30day_startdate', dateVal);
        setCompletedTasks(data.completedTasks || []);
        setCompletionTimestamps(data.completionTimestamps || {});
        setDbConnected(true);
      })
      .catch(() => {
        const savedCompleted = localStorage.getItem('devops_30day_completed');
        const savedTimestamps = localStorage.getItem('devops_30day_timestamps');
        const savedDate = localStorage.getItem('devops_30day_startdate');

        if (savedCompleted) setCompletedTasks(JSON.parse(savedCompleted));
        if (savedTimestamps) setCompletionTimestamps(JSON.parse(savedTimestamps));
        const finalDate = savedDate || new Date().toISOString().split('T')[0];
        setStartDateStr(finalDate);
        setTempStartDate(finalDate);
        setDbConnected(false);
      });
  }, []);

  const handleStartDateChange = (newDate) => {
    setStartDateStr(newDate);
    setTempStartDate(newDate);
    localStorage.setItem('devops_30day_startdate', newDate);
    setShowDatePickerModal(false);

    fetch(`${API_BASE}/start-date`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate: newDate })
    }).catch(() => {});
  };

  // Streak & Badge calculations
  const streakInfo = calculateStreakInfo(completionTimestamps);
  const badgeInfo = calculateBadges(completedTasks, completionTimestamps, tasksData, streakInfo);

  const toggleTask = (taskId) => {
    if (!taskId) return;
    const isNowCompleted = !completedTasks.includes(taskId);
    const completedAt = new Date().toISOString();

    let newCompleted;
    if (isNowCompleted) {
      newCompleted = [...completedTasks, taskId];
      const newTimestamps = { ...completionTimestamps, [taskId]: completedAt };
      setCompletionTimestamps(newTimestamps);
      confetti({ particleCount: 50, spread: 70, origin: { y: 0.8 } });

      // Check if this task unlocked a new badge
      const prevBadgeInfo = calculateBadges(completedTasks, completionTimestamps, tasksData, streakInfo);
      const nextBadgeInfo = calculateBadges(newCompleted, newTimestamps, tasksData, streakInfo);

      if (nextBadgeInfo.unlockedCount > prevBadgeInfo.unlockedCount) {
        setTimeout(() => {
          confetti({ particleCount: 120, spread: 100, origin: { y: 0.5 } });
        }, 300);
      }
    } else {
      newCompleted = completedTasks.filter(id => id !== taskId);
      setCompletionTimestamps(prev => {
        const copy = { ...prev };
        delete copy[taskId];
        return copy;
      });
    }

    setCompletedTasks(newCompleted);
    localStorage.setItem('devops_30day_completed', JSON.stringify(newCompleted));

    fetch(`${API_BASE}/completed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, isCompleted: isNowCompleted, completedAt })
    }).catch(() => {});
  };

  const toggleAcceleratedDay = (accDayObj) => {
    const dayTaskIds = accDayObj.tasks.map(t => t.id);
    const allCompleted = dayTaskIds.every(id => completedTasks.includes(id));
    const isCompleted = !allCompleted;

    let newCompleted;
    if (isCompleted) {
      const newIds = dayTaskIds.filter(id => !completedTasks.includes(id));
      newCompleted = [...completedTasks, ...newIds];
      confetti({ particleCount: 90, spread: 90, origin: { y: 0.7 } });
    } else {
      newCompleted = completedTasks.filter(id => !dayTaskIds.includes(id));
    }

    setCompletedTasks(newCompleted);
    localStorage.setItem('devops_30day_completed', JSON.stringify(newCompleted));

    fetch(`${API_BASE}/completed-batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskIds: dayTaskIds, isCompleted })
    }).catch(() => {});
  };

  const handleResetProgress = () => {
    if (window.confirm('Are you sure you want to reset all completion progress in the database?')) {
      const todayStr = new Date().toISOString().split('T')[0];
      setCompletedTasks([]);
      setCompletionTimestamps({});
      setStartDateStr(todayStr);
      setTempStartDate(todayStr);
      localStorage.removeItem('devops_30day_completed');
      localStorage.removeItem('devops_30day_timestamps');
      localStorage.setItem('devops_30day_startdate', todayStr);

      fetch(`${API_BASE}/reset`, { method: 'POST' }).catch(() => {});
    }
  };

  // Open Task Description Modal
  const handleOpenDetails = (taskObj, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!taskObj) return;
    setActiveModal({ type: 'details', task: taskObj });
  };

  // Open Text Editor Studio (with exact expectedFilename fallback and initialTab)
  const handleOpenStudio = (taskObj, initialFile, e, initialTab = 'edit') => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    if (!taskObj) return;
    const targetFile = initialFile || taskObj.expectedFilename || null;
    setActiveModal({ type: 'studio', task: taskObj, initialFile: targetFile, initialTab });
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const [quoteRefreshKey, setQuoteRefreshKey] = useState(0);

  const metrics = calculateVelocityMetrics(
    completedTasks,
    completionTimestamps,
    startDateStr,
    tasksData.totalOriginalDays
  );

  const motivationalQuote = useMemo(() => {
    return getRandomQuote(metrics.daysDelayed > 0);
  }, [metrics.daysDelayed > 0, quoteRefreshKey]);

  const filteredAcceleratedDays = tasksData.acceleratedDays.filter((accDay) => {
    if (selectedModule === 'All') return true;
    return accDay.tasks.some(t => t.module === selectedModule);
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-20 selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
              <Terminal className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <h1 className="font-bold text-base sm:text-lg text-slate-100 tracking-tight flex items-center gap-2">
                DevOps 30-Day Tracker
                <span className="hidden sm:inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Accelerated Cohort
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Database Status */}
            <div className={`hidden md:flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-full border ${
              dbConnected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              <Database className="w-3.5 h-3.5" />
              <span>{dbConnected ? 'SQLite Active (tracker.db)' : 'LocalStorage'}</span>
            </div>

            {/* Daily Streak Counter Badge */}
            <div className="flex items-center space-x-1.5 text-xs px-2.5 sm:px-3 py-1.5 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/30 font-bold shadow-sm">
              <Flame className="w-4 h-4 text-orange-400 animate-pulse shrink-0" />
              <span>🔥 {streakInfo.currentStreak} Days</span>
            </div>

            {/* Achievements & Badges Showcase Button */}
            <button
              type="button"
              onClick={() => setShowBadgesModal(true)}
              className="flex items-center space-x-1.5 text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 px-2.5 sm:px-3 py-1.5 rounded-xl transition cursor-pointer shadow-sm"
              title="Open Achievements & Badges Showcase"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="hidden sm:inline">Badges:</span>
              <span className="font-mono text-amber-400">{badgeInfo.unlockedCount}/{badgeInfo.totalBadges}</span>
            </button>

            {/* Current Today Date Badge */}
            <div 
              className="flex items-center space-x-1.5 text-xs px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-300 font-medium shadow-sm"
              title={`Current Date: ${metrics.todayDateStr}`}
            >
              <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="font-semibold text-slate-400 hidden xs:inline">Today:</span>
              <span className="text-slate-200 font-bold font-mono">{metrics.todayDateStr}</span>
            </div>

            {/* Custom Theme-Matched Start Date Button */}
            <button
              type="button"
              onClick={() => setShowDatePickerModal(true)}
              className="flex items-center space-x-2 text-xs text-slate-200 bg-slate-900 border border-cyan-500/40 hover:border-cyan-400 px-3 py-1.5 rounded-xl shadow-md shadow-cyan-500/10 hover:shadow-cyan-500/20 transition cursor-pointer"
              title="Click to edit Cohort Start Date"
            >
              <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="font-semibold text-slate-400 hidden xs:inline">Start:</span>
              <span className="text-cyan-300 font-bold font-mono">{formatDate(startDateStr)}</span>
              <Edit2 className="w-3 h-3 text-slate-400 ml-1 hover:text-cyan-400" />
            </button>

            <button
              onClick={handleResetProgress}
              className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition"
              title="Reset Progress"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Dynamic Velocity & Target End Date Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            
            {/* Column 1: Overall Progress & Gauge */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-cyan-400" /> Overall Progress
                </span>
                <span className="text-2xl font-black text-cyan-400">
                  {metrics.progressPercent}%
                </span>
              </div>

              <div className="w-full bg-slate-800/80 rounded-full h-3.5 overflow-hidden p-0.5 border border-slate-700/50">
                <div 
                  className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 h-full rounded-full transition-all duration-500 shadow-sm"
                  style={{ width: `${metrics.progressPercent}%` }}
                ></div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>{metrics.completedCount} of {metrics.totalTasks} Original Tasks</span>
                <span>Day {metrics.currentCohortDay} of 30 ({metrics.todayDateStr})</span>
              </div>
            </div>

            {/* Column 2: Dynamic Completion Date Engine */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Target Completion Date
                </span>

                {metrics.daysSaved > 0 ? (
                  <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 animate-pulse">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    -{metrics.daysSaved} Days Saved!
                  </span>
                ) : metrics.daysDelayed > 0 ? (
                  <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    +{metrics.daysDelayed} Days Delayed
                  </span>
                ) : (
                  <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                    On Target Pace
                  </span>
                )}
              </div>

              <div className="flex items-baseline space-x-3">
                <div className={`text-2xl font-extrabold ${metrics.daysDelayed > 0 ? 'text-rose-300' : 'text-slate-100'}`}>
                  {metrics.estimatedEndDateStr}
                </div>
                {(metrics.daysSaved > 0 || metrics.daysDelayed > 0) && (
                  <div className="text-xs text-slate-500 line-through">
                    Standard: {metrics.originalEndDateStr}
                  </div>
                )}
              </div>

              {/* Motivational or Encouraging Quote based on delay/target pace */}
              <div 
                onClick={() => setQuoteRefreshKey(k => k + 1)}
                className="group cursor-pointer text-xs text-slate-300/90 leading-relaxed italic border-l-2 border-cyan-500/40 hover:border-cyan-400 pl-3 py-1.5 transition bg-slate-900/40 hover:bg-slate-900/60 rounded-r-xl"
                title="Click for another quote"
              >
                <span>“{motivationalQuote}”</span>
                <span className="block text-[10px] text-slate-500 not-italic mt-1 group-hover:text-cyan-400/80 transition font-mono">
                  ↻ click for another quote
                </span>
              </div>
            </div>

            {/* Column 3: Velocity & Schedule Status Indicator */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase text-slate-400 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-cyan-400" /> Schedule Status
                </span>
                <span className={`text-xs font-bold ${metrics.statusColor}`}>
                  {metrics.paceStatus}
                </span>
              </div>

              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-black text-slate-100">
                  {metrics.velocity}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  tasks / day
                </span>
              </div>

              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Pace Target: <strong className="text-slate-200">3.0 tasks/day</strong></span>
                <span>(Day {metrics.currentCohortDay}: {metrics.completedCount}/{metrics.expectedTasksToDate} tasks)</span>
              </div>
            </div>

          </div>
        </div>

        {/* Module Filter Tabs with Slider Controls (< >) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Filter className="w-4 h-4 text-cyan-400" /> Filter DevOps Topic
            </h2>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => scrollFilters('left')}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition active:scale-95"
                title="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollFilters('right')}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/40 transition active:scale-95"
                title="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative">
            <div 
              ref={filterScrollRef}
              className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth"
            >
              <button
                onClick={() => setSelectedModule('All')}
                className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  selectedModule === 'All'
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                All Topics ({tasksData.acceleratedDays.length} Days)
              </button>

              {tasksData.modules.map((mod) => (
                <button
                  key={mod.name}
                  onClick={() => setSelectedModule(mod.name)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    selectedModule === mod.name
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {mod.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 30 Accelerated Days Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAcceleratedDays.map((accDay) => {
            const dayTaskIds = accDay.tasks.map(t => t.id);
            const completedCount = dayTaskIds.filter(id => completedTasks.includes(id)).length;
            const isFullyCompleted = completedCount === dayTaskIds.length;
            const isCurrentCohortDay = accDay.accDay === metrics.currentCohortDay;

            return (
              <div
                key={accDay.accDay}
                className={`border rounded-2xl p-5 space-y-4 transition-all duration-300 relative ${
                  isCurrentCohortDay
                    ? 'bg-slate-900/90 border-cyan-500/60 shadow-xl shadow-cyan-500/10 ring-1 ring-cyan-500/30'
                    : isFullyCompleted
                    ? 'bg-slate-900/40 border-emerald-500/40 shadow-lg shadow-emerald-500/5'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 shadow-xl'
                }`}
              >
                {isCurrentCohortDay && (
                  <span className="absolute -top-3 right-4 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider rounded-full bg-cyan-500 text-slate-950 shadow-md">
                    Today (Day {accDay.accDay})
                  </span>
                )}

                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center space-x-2.5">
                    <button
                      onClick={() => toggleAcceleratedDay(accDay)}
                      className={`p-1 rounded-lg transition ${
                        isFullyCompleted
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : 'text-slate-500 hover:text-cyan-400'
                      }`}
                      title={isFullyCompleted ? 'Uncheck all tasks for this day' : 'Check all tasks for this day'}
                    >
                      {isFullyCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div>
                      <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                        Accelerated Day {accDay.accDay}
                        <span className="text-xs font-normal text-slate-400">
                          ({completedCount}/{dayTaskIds.length})
                        </span>
                      </h3>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {accDay.modules.map(modName => (
                      <span
                        key={modName}
                        className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-800 text-cyan-400 border border-slate-700"
                      >
                        {modName}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2.5">
                  {accDay.tasks.map((task) => {
                    const isDone = completedTasks.includes(task.id);
                    return (
                      <div
                        key={task.id}
                        className={`flex items-center justify-between p-3 rounded-xl border transition ${
                          isDone
                            ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-300'
                            : 'bg-slate-950/40 border-slate-800/60 text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start space-x-2.5 flex-1 pr-2">
                          <button
                            onClick={() => toggleTask(task.id)}
                            className="mt-0.5 text-slate-400 hover:text-cyan-400 transition"
                          >
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-600" />
                            )}
                          </button>
                          
                          <div className="space-y-0.5">
                            <span 
                              className={`text-xs font-medium cursor-pointer hover:text-cyan-400 transition ${
                                isDone ? 'line-through text-slate-500' : ''
                              }`}
                              onClick={(e) => handleOpenDetails(task, e)}
                            >
                              <strong className="text-slate-400 mr-1">{task.dayFormatted}:</strong>
                              {task.title}
                            </span>
                          </div>
                        </div>

                        {/* Matching Clean Icon Action Buttons (View Solution, FileEdit & BookOpen) */}
                        <div className="flex items-center space-x-1 shrink-0">
                          {/* Conditional View Solution Preview Button (VISIBLE ONLY IF COMPLETED) */}
                          {isDone && (
                            <button
                              type="button"
                              onClick={(e) => handleOpenStudio(task, task.expectedFilename, e, 'preview')}
                              className="p-1 text-emerald-400 hover:text-emerald-300 transition rounded-lg hover:bg-slate-800 cursor-pointer"
                              title="View completed solution markdown preview"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={(e) => handleOpenStudio(task, task.expectedFilename, e, 'edit')}
                            className="p-1 text-slate-400 hover:text-cyan-400 transition rounded-lg hover:bg-slate-800 cursor-pointer"
                            title="Open solution notes in Text Editor Studio"
                          >
                            <FileEdit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={(e) => handleOpenDetails(task, e)}
                            className="p-1 text-slate-400 hover:text-cyan-400 transition rounded-lg hover:bg-slate-800 cursor-pointer"
                            title="View full task instructions"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            );
          })}
        </div>

      </main>

      {/* Start Date Picker Modal (Custom Dark Theme) */}
      {showDatePickerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
                <Calendar className="w-5 h-5" />
                <span>Select Cohort Start Date</span>
              </div>
              <button
                onClick={() => setShowDatePickerModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Choose Start Date:
                </label>
                <input
                  type="date"
                  value={tempStartDate}
                  onChange={(e) => setTempStartDate(e.target.value)}
                  className="w-full bg-slate-950 border border-cyan-500/40 text-cyan-300 font-mono text-sm font-bold p-3 rounded-2xl focus:outline-none focus:border-cyan-400 shadow-inner"
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTempStartDate(new Date().toISOString().split('T')[0])}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition"
                >
                  Set to Today
                </button>
                <button
                  type="button"
                  onClick={() => setTempStartDate('2026-08-21')}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition"
                >
                  Aug 21, 2026
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowDatePickerModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleStartDateChange(tempStartDate)}
                className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save Start Date</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Badges & Achievements Modal */}
      <BadgesModal
        isOpen={showBadgesModal}
        onClose={() => setShowBadgesModal(false)}
        badgeInfo={badgeInfo}
        streakInfo={streakInfo}
      />

      {/* Task Description Modal */}
      {activeModal?.type === 'details' && (
        <TaskModal
          task={activeModal.task}
          isOpen={true}
          onClose={handleCloseModal}
          isCompleted={completedTasks.includes(activeModal.task.id)}
          onToggleComplete={(id) => toggleTask(id)}
          onOpenStudio={(t, f, e) => handleOpenStudio(t, f, e)}
        />
      )}

      {/* Task Editor Studio (Split View Task + Text Editor) */}
      {activeModal?.type === 'studio' && (
        <TaskEditorStudio
          task={activeModal.task}
          initialFile={activeModal.initialFile || activeModal.task.expectedFilename}
          initialTab={activeModal.initialTab || 'edit'}
          isOpen={true}
          onClose={handleCloseModal}
          isCompleted={completedTasks.includes(activeModal.task.id)}
          onToggleComplete={(id) => toggleTask(id)}
        />
      )}

    </div>
  );
}
