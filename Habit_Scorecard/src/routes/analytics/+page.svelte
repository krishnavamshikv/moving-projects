<script>
  import { onMount } from 'svelte';
  import TrendChart from '$lib/components/TrendChart.svelte';

  let period = 'week';
  let refDate = new Date().toISOString().split('T')[0];
  let analytics = null;
  let isLoading = true;

  let filterScore = 'all';
  let searchQuery = '';

  function formatMins(mins) {
    if (!mins) return '0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }

  async function fetchAnalytics() {
    isLoading = true;
    try {
      const res = await fetch(`/api/analytics?period=${period}&date=${refDate}`);
      const data = await res.json();
      if (data.success) {
        analytics = data.analytics;
      }
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      isLoading = false;
    }
  }

  function setPeriod(p) {
    if (period !== p) {
      period = p;
      fetchAnalytics();
    }
  }

  function shiftPeriod(direction) {
    const d = new Date(refDate);
    if (period === 'month') {
      d.setMonth(d.getMonth() + direction);
    } else {
      d.setDate(d.getDate() + (direction * 7));
    }
    refDate = d.toISOString().split('T')[0];
    fetchAnalytics();
  }

  function resetCurrent() {
    refDate = new Date().toISOString().split('T')[0];
    fetchAnalytics();
  }

  onMount(() => {
    fetchAnalytics();
  });

  $: filteredLogs = (analytics?.recentLogs || []).filter(l => {
    if (filterScore !== 'all' && l.score !== filterScore) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = l.habit_name.toLowerCase().includes(q);
      const matchNote = (l.reflection_note || '').toLowerCase().includes(q);
      return matchName || matchNote;
    }
    return true;
  });

  $: rangeTitle = (() => {
    if (!analytics) return '';
    const start = new Date(analytics.startDate + 'T00:00:00');
    const end = new Date(analytics.endDate + 'T00:00:00');
    if (period === 'month') {
      return start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  })();
</script>

<div class="space-y-6">
  <!-- Header / Navigation -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-900 transition-colors">
    <div class="flex items-center space-x-3">
      <!-- Week/Month toggle -->
      <div class="flex items-center border border-zinc-300 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 p-0.5">
        <button
          on:click={() => setPeriod('week')}
          class={`px-2.5 py-1 rounded text-xs font-medium transition ${
            period === 'week'
              ? 'bg-zinc-900 text-white dark:bg-white dark:text-black'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
          }`}
        >
          Week
        </button>
        <button
          on:click={() => setPeriod('month')}
          class={`px-2.5 py-1 rounded text-xs font-medium transition ${
            period === 'month'
              ? 'bg-zinc-900 text-white dark:bg-white dark:text-black'
              : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
          }`}
        >
          Month
        </button>
      </div>

      <!-- Arrow Navigation -->
      <div class="flex items-center border border-zinc-300 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950">
        <button
          on:click={() => shiftPeriod(-1)}
          aria-label="Previous period"
          class="p-1.5 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          on:click={resetCurrent}
          class="px-2.5 py-1 text-xs text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition border-x border-zinc-300 dark:border-zinc-800"
        >
          Current
        </button>
        <button
          on:click={() => shiftPeriod(1)}
          aria-label="Next period"
          class="p-1.5 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

    <div>
      <h1 class="text-base font-semibold text-zinc-900 dark:text-white tracking-tight">{rangeTitle}</h1>
      <p class="text-[11px] text-zinc-500">Analytics & Time Allocation</p>
    </div>
  </div>

  {#if isLoading}
    <div class="p-12 text-center text-zinc-500 text-xs font-mono">
      Loading analytics...
    </div>
  {:else if analytics}
    <!-- Top KPI Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <!-- Total Time -->
      <div class="p-3.5 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 shadow-sm dark:shadow-none">
        <div class="text-[11px] text-zinc-500 uppercase tracking-wider">Total Time</div>
        <div class="mt-1 text-xl font-mono font-semibold text-zinc-900 dark:text-white">{analytics.totalFormatted}</div>
        <div class="text-[11px] text-zinc-500 font-mono mt-0.5">
          {analytics.recentLogs.length} logged events
        </div>
      </div>

      <!-- Positive Time -->
      <div class="p-3.5 rounded bg-green-50/60 dark:bg-zinc-950 border border-green-200 dark:border-green-500/20 shadow-sm dark:shadow-none">
        <div class="text-[11px] text-green-700 dark:text-green-400 uppercase tracking-wider flex items-center justify-between">
          <span>+ Positive</span>
          <span class="font-mono text-xs">{analytics.positive.percentage}%</span>
        </div>
        <div class="mt-1 text-xl font-mono font-semibold text-green-700 dark:text-green-400">{analytics.positive.formatted}</div>
        <div class="text-[11px] text-zinc-500 font-mono mt-0.5">
          {analytics.positive.count} positive votes
        </div>
      </div>

      <!-- Negative Time -->
      <div class="p-3.5 rounded bg-red-50/60 dark:bg-zinc-950 border border-red-200 dark:border-red-500/20 shadow-sm dark:shadow-none">
        <div class="text-[11px] text-red-700 dark:text-red-400 uppercase tracking-wider flex items-center justify-between">
          <span>- Negative</span>
          <span class="font-mono text-xs">{analytics.negative.percentage}%</span>
        </div>
        <div class="mt-1 text-xl font-mono font-semibold text-red-700 dark:text-red-400">{analytics.negative.formatted}</div>
        <div class="text-[11px] text-zinc-500 font-mono mt-0.5">
          {analytics.negative.count} time sinks
        </div>
      </div>

      <!-- Neutral Time -->
      <div class="p-3.5 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-none">
        <div class="text-[11px] text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center justify-between">
          <span>= Neutral</span>
          <span class="font-mono text-xs text-zinc-500">{analytics.neutral.percentage}%</span>
        </div>
        <div class="mt-1 text-xl font-mono font-semibold text-zinc-800 dark:text-zinc-300">{analytics.neutral.formatted}</div>
        <div class="text-[11px] text-zinc-500 font-mono mt-0.5">
          {analytics.neutral.count} routine events
        </div>
      </div>
    </div>

    <!-- Daily Trend Visual Bar Chart -->
    <div class="p-4 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 shadow-sm dark:shadow-none">
      <div class="mb-3">
        <h2 class="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
          Daily Time Distribution
        </h2>
      </div>

      <TrendChart dailySeries={analytics.dailySeries} />
    </div>

    <!-- Two Column Breakdown: Top Bad Habits vs Top Good Habits -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Top Negative Habits (Time Drains) -->
      <div class="p-4 rounded bg-white dark:bg-zinc-950 border border-red-200 dark:border-red-500/20 shadow-sm dark:shadow-none space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-900">
          <div>
            <h3 class="text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-400 flex items-center gap-1.5">
              <span>-</span> Time-Drain Behaviors
            </h3>
            <p class="text-[11px] text-zinc-500">Actions that cast a negative vote</p>
          </div>
          <span class="text-xs font-mono text-zinc-500">{analytics.topNegative.length} habits</span>
        </div>

        {#if analytics.topNegative.length === 0}
          <div class="p-6 text-center text-xs text-zinc-500">
            No negative habits recorded for this period.
          </div>
        {:else}
          <div class="space-y-2.5">
            {#each analytics.topNegative as habit}
              {@const pct = analytics.negative.minutes > 0 ? Math.round((habit.totalMinutes / analytics.negative.minutes) * 100) : 0}
              <div class="p-3 rounded bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-900">
                <div class="flex items-center justify-between gap-2">
                  <span class="font-medium text-xs text-zinc-900 dark:text-white">{habit.name}</span>
                  <div class="text-right">
                    <span class="text-xs font-mono font-semibold text-red-700 dark:text-red-400">{formatMins(habit.totalMinutes)}</span>
                    <span class="text-[10px] text-zinc-500 block font-mono">({habit.occurrences}x &bull; {pct}%)</span>
                  </div>
                </div>

                <!-- Minimal Bar -->
                <div class="w-full h-1 bg-zinc-200 dark:bg-zinc-900 rounded-full mt-2 overflow-hidden">
                  <div class="h-full bg-red-500 rounded-full" style="width: {pct}%"></div>
                </div>

                {#if habit.reflectionNotes.length > 0}
                  <p class="mt-2 text-[11px] text-zinc-600 dark:text-zinc-500 italic">
                    "{habit.reflectionNotes[0]}"
                  </p>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Top Positive Habits -->
      <div class="p-4 rounded bg-white dark:bg-zinc-950 border border-green-200 dark:border-green-500/20 shadow-sm dark:shadow-none space-y-3">
        <div class="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-900">
          <div>
            <h3 class="text-xs font-semibold uppercase tracking-wider text-green-700 dark:text-green-400 flex items-center gap-1.5">
              <span>+</span> Constructive Habits
            </h3>
            <p class="text-[11px] text-zinc-500">Actions that cast a positive vote</p>
          </div>
          <span class="text-xs font-mono text-zinc-500">{analytics.topPositive.length} habits</span>
        </div>

        {#if analytics.topPositive.length === 0}
          <div class="p-6 text-center text-xs text-zinc-500">
            No positive habits recorded for this period.
          </div>
        {:else}
          <div class="space-y-2.5">
            {#each analytics.topPositive as habit}
              {@const pct = analytics.positive.minutes > 0 ? Math.round((habit.totalMinutes / analytics.positive.minutes) * 100) : 0}
              <div class="p-3 rounded bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-900">
                <div class="flex items-center justify-between gap-2">
                  <span class="font-medium text-xs text-zinc-900 dark:text-white">{habit.name}</span>
                  <div class="text-right">
                    <span class="text-xs font-mono font-semibold text-green-700 dark:text-green-400">{formatMins(habit.totalMinutes)}</span>
                    <span class="text-[10px] text-zinc-500 block font-mono">({habit.occurrences}x &bull; {pct}%)</span>
                  </div>
                </div>

                <!-- Minimal Bar -->
                <div class="w-full h-1 bg-zinc-200 dark:bg-zinc-900 rounded-full mt-2 overflow-hidden">
                  <div class="h-full bg-green-500 rounded-full" style="width: {pct}%"></div>
                </div>

                {#if habit.reflectionNotes.length > 0}
                  <p class="mt-2 text-[11px] text-zinc-600 dark:text-zinc-500 italic">
                    "{habit.reflectionNotes[0]}"
                  </p>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <!-- Detailed Log Table -->
    <div class="p-4 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 shadow-sm dark:shadow-none space-y-3">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-zinc-100 dark:border-zinc-900">
        <div>
          <h3 class="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
            Log History ({filteredLogs.length})
          </h3>
        </div>

        <div class="flex items-center gap-2">
          <!-- Search -->
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search habits..."
            class="bg-zinc-50 dark:bg-black border border-zinc-300 dark:border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
          />

          <!-- Filter Pills -->
          <div class="flex items-center border border-zinc-300 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-black p-0.5">
            <button
              on:click={() => filterScore = 'all'}
              class={`px-2 py-0.5 rounded text-[11px] font-medium transition ${
                filterScore === 'all'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-800'
                  : 'text-zinc-500 hover:text-black dark:hover:text-white'
              }`}
            >
              All
            </button>
            <button
              on:click={() => filterScore = '+'}
              class={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                filterScore === '+'
                  ? 'bg-green-100 text-green-800 border border-green-300 dark:bg-green-950 dark:text-green-400 dark:border-green-500/30'
                  : 'text-green-600 hover:text-green-800 dark:text-green-500 dark:hover:text-green-400'
              }`}
            >
              +
            </button>
            <button
              on:click={() => filterScore = '-'}
              class={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                filterScore === '-'
                  ? 'bg-red-100 text-red-800 border border-red-300 dark:bg-red-950 dark:text-red-400 dark:border-red-500/30'
                  : 'text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400'
              }`}
            >
              -
            </button>
            <button
              on:click={() => filterScore = '='}
              class={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                filterScore === '='
                  ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-300'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
              }`}
            >
              =
            </button>
          </div>
        </div>
      </div>

      {#if filteredLogs.length === 0}
        <div class="p-6 text-center text-xs text-zinc-500">
          No habits match current filter.
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="text-[10px] uppercase text-zinc-500 border-b border-zinc-200 dark:border-zinc-900">
              <tr>
                <th class="py-2.5 px-2 font-medium">Date & Time</th>
                <th class="py-2.5 px-2 font-medium">Score</th>
                <th class="py-2.5 px-2 font-medium">Habit</th>
                <th class="py-2.5 px-2 font-medium">Duration</th>
                <th class="py-2.5 px-2 font-medium">Reflection Note</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-200 dark:divide-zinc-900">
              {#each filteredLogs as log (log.id)}
                <tr class="hover:bg-zinc-50 dark:hover:bg-black/50 transition">
                  <td class="py-2.5 px-2 font-mono text-zinc-600 dark:text-zinc-500 whitespace-nowrap">
                    <span>{log.date}</span>
                    <span class="text-zinc-400 dark:text-zinc-600 block text-[10px]">{log.start_time} - {log.end_time}</span>
                  </td>
                  <td class="py-2.5 px-2 whitespace-nowrap">
                    <span class={`inline-flex items-center justify-center w-5 h-5 rounded font-bold text-xs border ${
                      log.score === '+'
                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-500/30'
                        : log.score === '-'
                        ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-500/30'
                        : 'bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800'
                    }`}>
                      {log.score}
                    </span>
                  </td>
                  <td class="py-2.5 px-2 font-medium text-zinc-900 dark:text-white">
                    {log.habit_name}
                  </td>
                  <td class="py-2.5 px-2 font-mono text-zinc-700 dark:text-zinc-400 whitespace-nowrap">
                    {formatMins(log.duration_minutes)}
                  </td>
                  <td class="py-2.5 px-2 text-zinc-600 dark:text-zinc-400 italic max-w-sm truncate">
                    {log.reflection_note || '—'}
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  {/if}
</div>
