<script>
  import { onMount, onDestroy } from 'svelte';
  import TimelineItem from '$lib/components/TimelineItem.svelte';
  import TimelineGap from '$lib/components/TimelineGap.svelte';
  import LiveTracker from '$lib/components/LiveTracker.svelte';
  import HabitModal from '$lib/components/HabitModal.svelte';
  import CatalogModal from '$lib/components/CatalogModal.svelte';
  import ShortcutsModal from '$lib/components/ShortcutsModal.svelte';

  let selectedDate = new Date().toISOString().split('T')[0];

  let logs = [];
  let catalog = [];
  let isLoading = true;
  let isCopying = false;
  let toastMsg = '';

  let isHabitModalOpen = false;
  let editingItem = null;
  let initialModalData = null;
  let isCatalogModalOpen = false;
  let isShortcutsModalOpen = false;

  let liveTrackerRef;
  let sortOrder = 'asc'; // 'asc' = Chronological, 'desc' = Reverse

  function toggleSortOrder() {
    sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    try {
      localStorage.setItem('scorecard_sort_order', sortOrder);
    } catch (e) {}
  }

  function showToast(msg) {
    toastMsg = msg;
    setTimeout(() => {
      if (toastMsg === msg) toastMsg = '';
    }, 2500);
  }

  $: positiveLogs = logs.filter(l => l.score === '+');
  $: negativeLogs = logs.filter(l => l.score === '-');
  $: neutralLogs = logs.filter(l => l.score === '=');

  $: posMins = positiveLogs.reduce((acc, l) => acc + (l.duration_minutes || 0), 0);
  $: negMins = negativeLogs.reduce((acc, l) => acc + (l.duration_minutes || 0), 0);
  $: neuMins = neutralLogs.reduce((acc, l) => acc + (l.duration_minutes || 0), 0);
  $: totalMins = posMins + negMins + neuMins;

  function formatMins(mins) {
    if (!mins) return '0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }

  function parseTimeMins(timeStr) {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  }

  // Interleave timeline items with detected untracked gaps
  $: timelineEntries = (() => {
    if (!logs || logs.length === 0) return [];
    const sorted = [...logs].sort((a, b) => a.start_time.localeCompare(b.start_time));
    const entries = [];

    for (let i = 0; i < sorted.length; i++) {
      entries.push({ type: 'habit', data: sorted[i] });

      // Check gap between this habit end_time and next habit start_time
      if (i < sorted.length - 1) {
        const currEnd = sorted[i].end_time;
        const nextStart = sorted[i + 1].start_time;

        const currEndMins = parseTimeMins(currEnd);
        const nextStartMins = parseTimeMins(nextStart);

        // Gap exists on same day if nextStartMins > currEndMins
        if (nextStartMins - currEndMins >= 15) {
          const gapMinutes = nextStartMins - currEndMins;
          entries.push({
            type: 'gap',
            startTime: currEnd,
            endTime: nextStart,
            durationMinutes: gapMinutes
          });
        }
      }
    }

    if (sortOrder === 'desc') {
      return entries.reverse();
    }
    return entries;
  })();

  function changeDateBy(days) {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    selectedDate = d.toISOString().split('T')[0];
    fetchLogs();
  }

  function setToday() {
    selectedDate = new Date().toISOString().split('T')[0];
    fetchLogs();
  }

  $: formattedDateDisplay = (() => {
    try {
      const d = new Date(selectedDate + 'T00:00:00');
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return selectedDate;
    }
  })();

  async function fetchLogs() {
    isLoading = true;
    try {
      const res = await fetch(`/api/logs?date=${selectedDate}`);
      const data = await res.json();
      if (data.success) {
        logs = data.logs;
      }
    } catch (err) {
      console.error('Failed to load logs', err);
    } finally {
      isLoading = false;
    }
  }

  async function fetchCatalog() {
    try {
      const res = await fetch('/api/catalog');
      const data = await res.json();
      if (data.success) {
        catalog = data.catalog;
      }
    } catch (err) {
      console.error('Failed to load catalog', err);
    }
  }

  function handleKeydown(e) {
    // Ignore keyboard shortcuts if the user is typing into an input or textarea
    const tag = e.target?.tagName?.toUpperCase();
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
      if (e.key === 'Escape') {
        e.target.blur();
      }
      return;
    }

    if (e.key === 'Escape') {
      isHabitModalOpen = false;
      isCatalogModalOpen = false;
      isShortcutsModalOpen = false;
      return;
    }

    if (e.key === 'n' || e.key === 'N') {
      e.preventDefault();
      openAddModal();
    } else if (e.key === 's' || e.key === 'S') {
      e.preventDefault();
      if (liveTrackerRef?.toggle) {
        liveTrackerRef.toggle();
      }
    } else if (e.key === 't' || e.key === 'T') {
      e.preventDefault();
      setToday();
    } else if (e.key === '[') {
      e.preventDefault();
      changeDateBy(-1);
    } else if (e.key === ']') {
      e.preventDefault();
      changeDateBy(1);
    } else if (e.key === '?') {
      e.preventDefault();
      isShortcutsModalOpen = !isShortcutsModalOpen;
    }
  }

  onMount(() => {
    try {
      const savedSort = localStorage.getItem('scorecard_sort_order');
      if (savedSort === 'asc' || savedSort === 'desc') {
        sortOrder = savedSort;
      }
    } catch (e) {}
    fetchLogs();
    fetchCatalog();
  });

  function openAddModal() {
    editingItem = null;
    initialModalData = null;
    isHabitModalOpen = true;
  }

  function openEditModal(event) {
    editingItem = event.detail;
    initialModalData = null;
    isHabitModalOpen = true;
  }

  function handleFillGap(event) {
    editingItem = null;
    initialModalData = {
      startTime: event.detail.startTime,
      endTime: event.detail.endTime,
      score: '+'
    };
    isHabitModalOpen = true;
  }

  function handleLiveLogCompleted(event) {
    editingItem = null;
    initialModalData = {
      habitName: event.detail.habitName,
      startTime: event.detail.startTime,
      endTime: event.detail.endTime,
      score: '+'
    };
    isHabitModalOpen = true;
  }

  async function handleToggleScore(event) {
    const { item, nextScore } = event.detail;
    const oldScore = item.score;

    // Optimistic update
    item.score = nextScore;
    logs = [...logs];

    try {
      const res = await fetch(`/api/logs/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, score: nextScore })
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Score set to ${nextScore}`);
      } else {
        item.score = oldScore;
        logs = [...logs];
        showToast('Failed to update score');
      }
    } catch (err) {
      item.score = oldScore;
      logs = [...logs];
      showToast('Error: ' + err.message);
    }
  }

  async function handleAddToCatalog(event) {
    const item = event.detail;
    const exists = catalog.some(c => c.name.toLowerCase() === item.habit_name.toLowerCase());
    if (exists) {
      showToast(`"${item.habit_name}" is already in catalog`);
      return;
    }

    try {
      const res = await fetch('/api/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: item.habit_name,
          default_score: item.score,
          default_duration: item.duration_minutes || 30,
          notes: item.reflection_note || ''
        })
      });
      const data = await res.json();
      if (data.success) {
        catalog = [...catalog, data.habit];
        showToast(`Saved "${item.habit_name}" to catalog`);
      } else {
        showToast(data.error || 'Failed to save to catalog');
      }
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  }

  async function handleDelete(event) {
    const id = event.detail;
    if (!confirm('Delete this habit entry?')) return;
    try {
      const res = await fetch(`/api/logs/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        logs = logs.filter(l => l.id !== id);
        showToast('Habit removed');
      }
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  }

  function handleHabitSaved(event) {
    const saved = event.detail;
    const existingIndex = logs.findIndex(l => l.id === saved.id);
    if (existingIndex >= 0) {
      logs[existingIndex] = saved;
      logs = [...logs.sort((a, b) => a.start_time.localeCompare(b.start_time))];
      showToast('Habit updated');
    } else {
      logs = [...logs, saved].sort((a, b) => a.start_time.localeCompare(b.start_time));
      showToast('Habit logged');
    }
  }

  async function quickInsert(catalogHabit) {
    let startTime = '08:00';
    if (logs.length > 0) {
      const sorted = [...logs].sort((a, b) => a.start_time.localeCompare(b.start_time));
      startTime = sorted[sorted.length - 1].end_time;
    }

    const duration = catalogHabit.default_duration || 30;
    const [sH, sM] = startTime.split(':').map(Number);
    const endTot = sH * 60 + sM + duration;
    const eH = String(Math.floor(endTot / 60) % 24).padStart(2, '0');
    const eM = String(endTot % 60).padStart(2, '0');
    const endTime = `${eH}:${eM}`;

    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          habit_name: catalogHabit.name,
          start_time: startTime,
          end_time: endTime,
          score: catalogHabit.default_score,
          reflection_note: catalogHabit.notes || ''
        })
      });
      const data = await res.json();
      if (data.success) {
        logs = [...logs, data.log].sort((a, b) => a.start_time.localeCompare(b.start_time));
        showToast(`Added ${catalogHabit.name}`);
      }
    } catch (err) {
      showToast('Error: ' + err.message);
    }
  }

  async function handleCopyYesterday() {
    isCopying = true;
    try {
      const res = await fetch('/api/logs/copy-yesterday', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetDate: selectedDate })
      });
      const data = await res.json();
      if (data.success) {
        if (data.copiedCount > 0) {
          showToast(data.message);
          fetchLogs();
        } else {
          showToast(data.message);
        }
      } else {
        showToast(data.error || 'Failed to copy yesterday');
      }
    } catch (err) {
      showToast('Error: ' + err.message);
    } finally {
      isCopying = false;
    }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="space-y-5">
  <!-- Minimalist Toast Notification -->
  {#if toastMsg}
    <div class="fixed bottom-6 right-6 z-50 px-3 py-2 rounded border text-xs font-mono transition bg-zinc-900 dark:bg-zinc-950 text-white border-zinc-700 shadow-xl animate-fade-in">
      {toastMsg}
    </div>
  {/if}

  <!-- Live Stopwatch Punch-In Bar -->
  <LiveTracker
    bind:this={liveTrackerRef}
    catalog={catalog}
    on:logCompleted={handleLiveLogCompleted}
  />

  <!-- Date Navigation & Primary Controls -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-900 transition-colors">
    <div class="flex items-center space-x-3">
      <!-- Date Switcher Buttons -->
      <div class="flex items-center border border-zinc-300 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950">
        <button
          on:click={() => changeDateBy(-1)}
          aria-label="Previous day (press [)"
          title="Previous day [ ]"
          class="p-1.5 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          on:click={setToday}
          title="Jump to today (T)"
          class="px-2.5 py-1 text-xs text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white transition border-x border-zinc-300 dark:border-zinc-800"
        >
          Today
        </button>

        <button
          on:click={() => changeDateBy(1)}
          aria-label="Next day (press ])"
          title="Next day [ ]"
          class="p-1.5 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div>
        <h1 class="text-base font-semibold text-zinc-900 dark:text-white tracking-tight">{formattedDateDisplay}</h1>
        <p class="text-[11px] text-zinc-500">Timeline Scorecard</p>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-2">
      <input
        type="date"
        aria-label="Select date"
        bind:value={selectedDate}
        on:change={fetchLogs}
        class="bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded px-2.5 py-1.5 text-xs font-mono text-zinc-900 dark:text-zinc-300 focus:outline-none focus:border-zinc-500"
      />

      <button
        on:click={handleCopyYesterday}
        disabled={isCopying}
        class="px-2.5 py-1.5 rounded text-xs text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white bg-white hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 transition"
      >
        {isCopying ? 'Copying...' : 'Copy Yesterday'}
      </button>

      <button
        on:click={() => isCatalogModalOpen = true}
        class="px-2.5 py-1.5 rounded text-xs text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white bg-white hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 transition"
      >
        Catalog
      </button>

      <button
        on:click={openAddModal}
        title="Log habit (N)"
        class="px-3 py-1.5 rounded text-xs font-semibold bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition shadow-sm"
      >
        + Log Habit
      </button>

      <!-- Keyboard shortcuts trigger button -->
      <button
        on:click={() => isShortcutsModalOpen = true}
        aria-label="Keyboard shortcuts"
        title="Keyboard shortcuts (?)"
        class="p-1.5 rounded text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-mono transition"
      >
        ?
      </button>
    </div>
  </div>

  <!-- Summary KPI Cards -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
    <!-- Total Time -->
    <div class="p-3.5 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 shadow-sm dark:shadow-none">
      <div class="text-[11px] text-zinc-500 uppercase tracking-wider">Total Tracked</div>
      <div class="mt-1 text-xl font-mono font-semibold text-zinc-900 dark:text-white">{formatMins(totalMins)}</div>
      <div class="text-[11px] text-zinc-500 font-mono mt-0.5">{logs.length} habits</div>
    </div>

    <!-- Positive (+) -->
    <div class="p-3.5 rounded bg-green-50/60 dark:bg-zinc-950 border border-green-200 dark:border-green-500/20 shadow-sm dark:shadow-none">
      <div class="text-[11px] text-green-700 dark:text-green-400 uppercase tracking-wider flex items-center justify-between">
        <span>+ Positive</span>
        <span class="font-mono text-xs">{positiveLogs.length}</span>
      </div>
      <div class="mt-1 text-xl font-mono font-semibold text-green-700 dark:text-green-400">{formatMins(posMins)}</div>
      <div class="text-[11px] text-zinc-500 font-mono mt-0.5">
        {totalMins > 0 ? Math.round((posMins / totalMins) * 100) : 0}% of time
      </div>
    </div>

    <!-- Negative (-) -->
    <div class="p-3.5 rounded bg-red-50/60 dark:bg-zinc-950 border border-red-200 dark:border-red-500/20 shadow-sm dark:shadow-none">
      <div class="text-[11px] text-red-700 dark:text-red-400 uppercase tracking-wider flex items-center justify-between">
        <span>- Negative</span>
        <span class="font-mono text-xs">{negativeLogs.length}</span>
      </div>
      <div class="mt-1 text-xl font-mono font-semibold text-red-700 dark:text-red-400">{formatMins(negMins)}</div>
      <div class="text-[11px] text-zinc-500 font-mono mt-0.5">
        {totalMins > 0 ? Math.round((negMins / totalMins) * 100) : 0}% of time
      </div>
    </div>

    <!-- Neutral (=) -->
    <div class="p-3.5 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-sm dark:shadow-none">
      <div class="text-[11px] text-zinc-600 dark:text-zinc-400 uppercase tracking-wider flex items-center justify-between">
        <span>= Neutral</span>
        <span class="font-mono text-xs text-zinc-500">{neutralLogs.length}</span>
      </div>
      <div class="mt-1 text-xl font-mono font-semibold text-zinc-800 dark:text-zinc-300">{formatMins(neuMins)}</div>
      <div class="text-[11px] text-zinc-500 font-mono mt-0.5">
        {totalMins > 0 ? Math.round((neuMins / totalMins) * 100) : 0}% of time
      </div>
    </div>
  </div>

  <!-- Quick Add Catalog Chips -->
  {#if catalog.length > 0}
    <div class="p-3 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 shadow-sm dark:shadow-none transition-colors">
      <div class="flex items-center justify-between mb-2">
        <span class="text-[11px] text-zinc-500 uppercase tracking-wider">Quick Add:</span>
        <button
          on:click={() => isCatalogModalOpen = true}
          class="text-[11px] text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"
        >
          Manage catalog ({catalog.length})
        </button>
      </div>

      <div class="flex items-center gap-1.5 overflow-x-auto pb-1">
        {#each catalog.slice(0, 10) as habit}
          <button
            on:click={() => quickInsert(habit)}
            class="shrink-0 text-xs px-2.5 py-1 rounded bg-zinc-50 hover:bg-zinc-100 dark:bg-black dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 flex items-center gap-1.5 transition"
          >
            <span class={`font-bold ${
              habit.default_score === '+' ? 'text-green-600 dark:text-green-400' : habit.default_score === '-' ? 'text-red-600 dark:text-red-400' : 'text-zinc-500'
            }`}>
              {habit.default_score}
            </span>
            <span>{habit.name}</span>
            <span class="text-[10px] font-mono text-zinc-400 dark:text-zinc-600">+{habit.default_duration}m</span>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Timeline with Gap Detection & Sort Toggle -->
  <div class="space-y-2.5 pt-1">
    <div class="flex items-center justify-between">
      <h2 class="text-xs font-semibold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
        <span>Timeline ({logs.length})</span>
        <span class="text-[10px] font-normal lowercase text-zinc-400 dark:text-zinc-600 hidden sm:inline">(click score badge to toggle + / - / =)</span>
      </h2>
      {#if logs.length > 0}
        <button
          on:click={toggleSortOrder}
          type="button"
          class="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 transition"
          title={`Currently sorted ${sortOrder === 'asc' ? 'chronologically (earliest first)' : 'in reverse chronology (latest first)'}. Click to toggle.`}
        >
          {#if sortOrder === 'asc'}
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            <span>Chronological</span>
          {:else}
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
            </svg>
            <span>Reverse</span>
          {/if}
        </button>
      {/if}
    </div>

    {#if isLoading}
      <div class="p-8 text-center text-zinc-500 text-xs font-mono">
        Loading...
      </div>
    {:else if logs.length === 0}
      <!-- Empty State -->
      <div class="p-12 text-center rounded border border-dashed border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950">
        <p class="text-sm text-zinc-600 dark:text-zinc-400 font-medium">No habits recorded for this day</p>
        <p class="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
          Start logging behaviors chronologically or punch in with the live tracker above.
        </p>
        <div class="mt-4 flex items-center justify-center gap-2">
          <button
            on:click={openAddModal}
            class="px-3 py-1.5 rounded bg-zinc-900 hover:bg-black text-white dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold transition"
          >
            + Log First Habit
          </button>
          <button
            on:click={handleCopyYesterday}
            class="px-3 py-1.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:text-white border border-zinc-300 dark:border-zinc-800 text-xs transition"
          >
            Copy Yesterday
          </button>
        </div>
      </div>
    {:else}
      <!-- Interleaved Timeline (Habits + Untracked Gaps) -->
      <div class="space-y-2">
        {#each timelineEntries as entry}
          {#if entry.type === 'habit'}
            <TimelineItem
              item={entry.data}
              on:edit={openEditModal}
              on:delete={handleDelete}
              on:toggleScore={handleToggleScore}
              on:addToCatalog={handleAddToCatalog}
            />
          {:else if entry.type === 'gap'}
            <TimelineGap
              startTime={entry.startTime}
              endTime={entry.endTime}
              durationMinutes={entry.durationMinutes}
              on:fillGap={handleFillGap}
            />
          {/if}
        {/each}
      </div>
    {/if}
  </div>

  <!-- Modals -->
  <HabitModal
    isOpen={isHabitModalOpen}
    date={selectedDate}
    editItem={editingItem}
    initialData={initialModalData}
    catalog={catalog}
    on:close={() => { isHabitModalOpen = false; initialModalData = null; }}
    on:saved={handleHabitSaved}
    on:catalogUpdated={() => fetchCatalog()}
  />

  <CatalogModal
    isOpen={isCatalogModalOpen}
    catalog={catalog}
    on:close={() => isCatalogModalOpen = false}
    on:select={(e) => {
      isCatalogModalOpen = false;
      quickInsert(e.detail);
    }}
    on:catalogUpdated={(e) => catalog = e.detail}
  />

  <ShortcutsModal
    isOpen={isShortcutsModalOpen}
    on:close={() => isShortcutsModalOpen = false}
  />
</div>
