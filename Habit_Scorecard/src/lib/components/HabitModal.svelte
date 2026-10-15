<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let isOpen = false;
  export let date = '';
  export let editItem = null;
  export let initialData = null;
  export let catalog = [];

  let habitName = '';
  let startTime = '08:00';
  let endTime = '08:30';
  let score = '+';
  let reflectionNote = '';
  let saveToCatalog = false;
  let isSaving = false;
  let errorMsg = '';

  $: durationMins = (() => {
    if (!startTime || !endTime) return 0;
    const [sH, sM] = startTime.split(':').map(Number);
    const [eH, eM] = endTime.split(':').map(Number);
    const startTot = sH * 60 + sM;
    const endTot = eH * 60 + eM;
    if (endTot >= startTot) return endTot - startTot;
    return (24 * 60 - startTot) + endTot;
  })();

  $: durationFormatted = (() => {
    const h = Math.floor(durationMins / 60);
    const m = durationMins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  })();

  $: suggestions = habitName && habitName.length > 0
    ? catalog.filter(c => c.name.toLowerCase().includes(habitName.toLowerCase()) && c.name.toLowerCase() !== habitName.toLowerCase()).slice(0, 5)
    : [];

  $: if (isOpen) {
    if (editItem) {
      habitName = editItem.habit_name;
      startTime = editItem.start_time;
      endTime = editItem.end_time;
      score = editItem.score;
      reflectionNote = editItem.reflection_note || '';
    } else if (initialData) {
      habitName = initialData.habitName || '';
      startTime = initialData.startTime || '08:00';
      endTime = initialData.endTime || '08:30';
      score = initialData.score || '+';
      reflectionNote = initialData.reflectionNote || '';
    } else {
      habitName = '';
      score = '+';
      reflectionNote = '';
      const now = new Date();
      const currentH = String(now.getHours()).padStart(2, '0');
      const currentM = String(Math.floor(now.getMinutes() / 15) * 15).padStart(2, '0');
      startTime = `${currentH}:${currentM}`;
      const endHour = String((now.getHours() + 1) % 24).padStart(2, '0');
      endTime = `${endHour}:${currentM}`;
    }
  }

  function applySuggestion(item) {
    habitName = item.name;
    score = item.default_score;
    if (item.notes && !reflectionNote) {
      reflectionNote = item.notes;
    }
    if (item.default_duration && startTime) {
      const [sH, sM] = startTime.split(':').map(Number);
      const endTot = sH * 60 + sM + item.default_duration;
      const eH = String(Math.floor(endTot / 60) % 24).padStart(2, '0');
      const eM = String(endTot % 60).padStart(2, '0');
      endTime = `${eH}:${eM}`;
    }
  }

  function close() {
    dispatch('close');
  }

  async function handleSave() {
    if (!habitName.trim()) {
      errorMsg = 'Please enter a habit name';
      return;
    }
    if (!startTime || !endTime) {
      errorMsg = 'Please provide both start and end time';
      return;
    }

    isSaving = true;
    errorMsg = '';

    const payload = {
      date,
      habit_name: habitName.trim(),
      start_time: startTime,
      end_time: endTime,
      score,
      reflection_note: reflectionNote.trim()
    };

    try {
      if (editItem) {
        const res = await fetch(`/api/logs/${editItem.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          dispatch('saved', data.log);
          close();
        } else {
          errorMsg = data.error || 'Failed to update habit';
        }
      } else {
        const res = await fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.success) {
          if (saveToCatalog) {
            try {
              const catRes = await fetch('/api/catalog', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: habitName.trim(),
                  default_score: score,
                  default_duration: durationMins || 30,
                  notes: reflectionNote.trim()
                })
              });
              const catData = await catRes.json();
              if (catData.success) {
                dispatch('catalogUpdated', catData.habit);
              }
            } catch (e) {
              console.error('Failed to save to catalog', e);
            }
          }
          dispatch('saved', data.log);
          close();
        } else {
          errorMsg = data.error || 'Failed to log habit';
        }
      }
    } catch (err) {
      errorMsg = err.message;
    } finally {
      isSaving = false;
    }
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg max-w-md w-full p-6 shadow-2xl relative transition-colors">
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-900">
        <div>
          <h2 class="text-base font-semibold text-zinc-900 dark:text-white">
            {editItem ? 'Edit Habit' : 'Log Habit'}
          </h2>
          <p class="text-xs text-zinc-500 mt-0.5">{date}</p>
        </div>
        <button
          on:click={close}
          aria-label="Close modal"
          class="text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
        >
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form on:submit|preventDefault={handleSave} class="mt-4 space-y-4">
        <!-- Habit Name -->
        <div class="relative">
          <label for="habit-name-input" class="block text-xs font-medium text-zinc-700 dark:text-zinc-400 mb-1.5">
            Behavior / Habit
          </label>
          <input
            id="habit-name-input"
            type="text"
            bind:value={habitName}
            placeholder="e.g., Deep Work, Phone scrolling, Workout..."
            class="w-full bg-zinc-50 dark:bg-black border border-zinc-300 dark:border-zinc-800 rounded px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition"
            required
            autocomplete="off"
          />

          {#if suggestions.length > 0}
            <div class="absolute z-10 left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded shadow-xl overflow-hidden py-1">
              {#each suggestions as s}
                <button
                  type="button"
                  on:click={() => applySuggestion(s)}
                  class="w-full text-left px-3 py-1.5 text-xs text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-between"
                >
                  <span>{s.name}</span>
                  <span class="text-zinc-400 dark:text-zinc-500 font-mono">{s.default_score} ({s.default_duration}m)</span>
                </button>
              {/each}
            </div>
          {/if}
        </div>

        <!-- Start & End Time -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label for="habit-start-time" class="block text-xs font-medium text-zinc-700 dark:text-zinc-400 mb-1.5">
              Start
            </label>
            <input
              id="habit-start-time"
              type="time"
              bind:value={startTime}
              class="w-full bg-zinc-50 dark:bg-black border border-zinc-300 dark:border-zinc-800 rounded px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-500 font-mono transition"
              required
            />
          </div>
          <div>
            <label for="habit-end-time" class="block text-xs font-medium text-zinc-700 dark:text-zinc-400 mb-1.5">
              End
            </label>
            <input
              id="habit-end-time"
              type="time"
              bind:value={endTime}
              class="w-full bg-zinc-50 dark:bg-black border border-zinc-300 dark:border-zinc-800 rounded px-3 py-2 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-500 font-mono transition"
              required
            />
          </div>
        </div>

        <!-- Duration Calculation -->
        <div class="flex items-center justify-between px-3 py-2 rounded bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-900 text-xs">
          <span class="text-zinc-500">Calculated duration:</span>
          <span class="font-mono text-zinc-900 dark:text-white font-medium">{durationFormatted} ({durationMins}m)</span>
        </div>

        <!-- Score Selector (+, -, =) -->
        <div>
          <span class="block text-xs font-medium text-zinc-700 dark:text-zinc-400 mb-1.5">
            Evaluation
          </span>
          <div class="grid grid-cols-3 gap-2">
            <!-- Positive -->
            <button
              type="button"
              on:click={() => score = '+'}
              class={`py-2.5 rounded border text-center transition ${
                score === '+'
                  ? 'bg-green-50 text-green-700 border-green-300 dark:bg-green-950/30 dark:text-green-400 dark:border-green-500/50 font-bold'
                  : 'bg-zinc-50 dark:bg-black text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div class="text-base font-bold leading-none mb-1">+</div>
              <div class="text-[11px]">Positive</div>
            </button>

            <!-- Negative -->
            <button
              type="button"
              on:click={() => score = '-'}
              class={`py-2.5 rounded border text-center transition ${
                score === '-'
                  ? 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950/30 dark:text-red-400 dark:border-red-500/50 font-bold'
                  : 'bg-zinc-50 dark:bg-black text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div class="text-base font-bold leading-none mb-1">-</div>
              <div class="text-[11px]">Negative</div>
            </button>

            <!-- Neutral -->
            <button
              type="button"
              on:click={() => score = '='}
              class={`py-2.5 rounded border text-center transition ${
                score === '='
                  ? 'bg-zinc-200 text-zinc-900 border-zinc-400 dark:bg-zinc-800 dark:text-white dark:border-zinc-600 font-bold'
                  : 'bg-zinc-50 dark:bg-black text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
              }`}
            >
              <div class="text-base font-bold leading-none mb-1">=</div>
              <div class="text-[11px]">Neutral</div>
            </button>
          </div>
        </div>

        <!-- Reflection Note -->
        <div>
          <label for="habit-reflection-input" class="block text-xs font-medium text-zinc-700 dark:text-zinc-400 mb-1.5">
            Reflection Note <span class="text-zinc-400 dark:text-zinc-600 font-normal">(Effect on what you want to be)</span>
          </label>
          <textarea
            id="habit-reflection-input"
            bind:value={reflectionNote}
            rows="2"
            placeholder="Why is this habit good, bad, or neutral?"
            class="w-full bg-zinc-50 dark:bg-black border border-zinc-300 dark:border-zinc-800 rounded px-3 py-2 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition resize-none"
          ></textarea>
        </div>

        {#if !editItem}
          <label class="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
            <input
              type="checkbox"
              bind:checked={saveToCatalog}
              class="rounded border-zinc-300 dark:border-zinc-800 text-black dark:text-white focus:ring-0"
            />
            <span>Also save to routine catalog for future 1-click logging</span>
          </label>
        {/if}

        {#if errorMsg}
          <div class="p-2 rounded bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:border-red-500/30 dark:text-red-400 text-xs">
            {errorMsg}
          </div>
        {/if}

        <!-- Actions -->
        <div class="pt-2 border-t border-zinc-100 dark:border-zinc-900 flex justify-end space-x-2">
          <button
            type="button"
            on:click={close}
            class="px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            class="px-4 py-1.5 bg-zinc-900 hover:bg-black text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-black rounded text-xs font-semibold tracking-tight transition shadow-sm"
          >
            {isSaving ? 'Saving...' : (editItem ? 'Save Changes' : 'Log Habit')}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
