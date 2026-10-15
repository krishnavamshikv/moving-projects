<script>
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let catalog = [];

  let habitName = '';
  let isRunning = false;
  let startTimeISO = null;
  let elapsedSeconds = 0;
  let timerInterval = null;

  $: suggestions = habitName && habitName.length > 0 && !isRunning
    ? catalog.filter(c => c.name.toLowerCase().includes(habitName.toLowerCase()) && c.name.toLowerCase() !== habitName.toLowerCase()).slice(0, 4)
    : [];

  function formatElapsed(totalSecs) {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    if (h > 0) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function startTimer(name) {
    if (name) habitName = name;
    if (!habitName.trim()) habitName = 'Current Activity';

    isRunning = true;
    startTimeISO = new Date().toISOString();
    elapsedSeconds = 0;

    localStorage.setItem('scorecard_live_tracker', JSON.stringify({
      habitName: habitName.trim(),
      startTimeISO
    }));

    clearInterval(timerInterval);
    timerInterval = setInterval(tick, 1000);
  }

  function tick() {
    if (!startTimeISO) return;
    const diff = Math.floor((Date.now() - new Date(startTimeISO).getTime()) / 1000);
    elapsedSeconds = Math.max(0, diff);
  }

  function stopAndLog() {
    if (!startTimeISO) return;
    const startDate = new Date(startTimeISO);
    const endDate = new Date();

    const startH = String(startDate.getHours()).padStart(2, '0');
    const startM = String(startDate.getMinutes()).padStart(2, '0');
    const startTime = `${startH}:${startM}`;

    const endH = String(endDate.getHours()).padStart(2, '0');
    const endM = String(endDate.getMinutes()).padStart(2, '0');
    const endTime = `${endH}:${endM}`;

    const loggedName = habitName;
    discard();

    dispatch('logCompleted', {
      habitName: loggedName,
      startTime,
      endTime
    });
  }

  function discard() {
    isRunning = false;
    startTimeISO = null;
    elapsedSeconds = 0;
    habitName = '';
    clearInterval(timerInterval);
    localStorage.removeItem('scorecard_live_tracker');
  }

  // Allow parent component or shortcuts to toggle
  export function toggle() {
    if (isRunning) {
      stopAndLog();
    } else {
      startTimer();
    }
  }

  onMount(() => {
    try {
      const saved = localStorage.getItem('scorecard_live_tracker');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.startTimeISO) {
          habitName = data.habitName || '';
          startTimeISO = data.startTimeISO;
          isRunning = true;
          tick();
          timerInterval = setInterval(tick, 1000);
        }
      }
    } catch (e) {}
  });

  onDestroy(() => {
    clearInterval(timerInterval);
  });
</script>

<div class={`p-3.5 rounded-lg border transition-all ${
  isRunning
    ? 'bg-zinc-50 dark:bg-zinc-950 border-green-500/50 ring-1 ring-green-500/20 shadow-sm'
    : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-900 shadow-sm dark:shadow-none'
}`}>
  <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
    <!-- Left: Status & Habit Input -->
    <div class="flex items-center gap-3 flex-1 min-w-0">
      <div class="flex items-center gap-2 shrink-0">
        {#if isRunning}
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <span class="text-xs font-semibold uppercase tracking-wider text-green-700 dark:text-green-400 font-mono">Live</span>
        {:else}
          <span class="h-2.5 w-2.5 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
          <span class="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono">Punch-In</span>
        {/if}
      </div>

      <!-- Habit input or live display -->
      <div class="flex-1 relative min-w-0">
        {#if isRunning}
          <div class="font-medium text-sm text-zinc-900 dark:text-white truncate">
            {habitName || 'Current Activity'}
          </div>
          <div class="text-[11px] text-zinc-500">
            Tracking ongoing habit in real-time
          </div>
        {:else}
          <input
            type="text"
            bind:value={habitName}
            placeholder="Track habit in real-time (or press 'S' to punch in)..."
            class="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 transition"
          />

          {#if suggestions.length > 0}
            <div class="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded shadow-lg overflow-hidden py-1">
              {#each suggestions as s}
                <button
                  type="button"
                  on:click={() => { habitName = s.name; startTimer(s.name); }}
                  class="w-full text-left px-2.5 py-1 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between"
                >
                  <span>{s.name}</span>
                  <span class="text-[10px] text-zinc-500 font-mono">Start &rarr;</span>
                </button>
              {/each}
            </div>
          {/if}
        {/if}
      </div>
    </div>

    <!-- Right: Elapsed Timer & Action Buttons -->
    <div class="flex items-center justify-between sm:justify-end gap-3 shrink-0">
      <!-- Elapsed Timer -->
      <div class="font-mono text-base sm:text-lg font-bold text-zinc-900 dark:text-white tracking-wider">
        {formatElapsed(elapsedSeconds)}
      </div>

      <div class="flex items-center gap-2">
        {#if isRunning}
          <button
            type="button"
            on:click={stopAndLog}
            class="px-3 py-1.5 rounded bg-green-600 hover:bg-green-500 text-white text-xs font-semibold tracking-tight shadow-sm transition"
          >
            Stop & Log
          </button>
          <button
            type="button"
            on:click={discard}
            class="p-1.5 text-zinc-400 hover:text-red-500 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
            title="Discard timer"
            aria-label="Discard live timer"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        {:else}
          <button
            type="button"
            on:click={() => startTimer()}
            class="px-3 py-1.5 rounded bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold tracking-tight shadow-sm transition"
          >
            Punch In
          </button>
        {/if}
      </div>
    </div>
  </div>
</div>
