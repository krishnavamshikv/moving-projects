<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let item;

  function formatMins(mins) {
    if (!mins) return '0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }

  function handleScoreClick() {
    const cycle = { '+': '-', '-': '=', '=': '+' };
    const nextScore = cycle[item.score] || '+';
    dispatch('toggleScore', { item, nextScore });
  }
</script>

<div class="group flex items-start gap-4 p-4 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-800 transition shadow-sm dark:shadow-none">
  <!-- Clickable Score Badge (+, -, =) with direct toggle -->
  <button
    type="button"
    on:click={handleScoreClick}
    title="Click to cycle score (+ / - / =)"
    aria-label={`Cycle score for ${item.habit_name}`}
    class={`w-9 h-9 rounded flex items-center justify-center font-bold text-base shrink-0 border cursor-pointer hover:scale-105 active:scale-95 transition-all select-none ${
      item.score === '+'
        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-500/30'
        : item.score === '-'
        ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-500/30'
        : 'bg-zinc-100 text-zinc-600 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800'
    }`}
  >
    {item.score}
  </button>

  <!-- Main Information -->
  <div class="flex-1 min-w-0">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <!-- Habit Name -->
      <h3 class="font-medium text-sm text-zinc-900 dark:text-white tracking-tight break-words">
        {item.habit_name}
      </h3>

      <!-- Time & Duration -->
      <div class="flex items-center gap-2">
        <span class="text-xs font-mono text-zinc-500 dark:text-zinc-500">
          {item.start_time} &ndash; {item.end_time}
        </span>
        <span class={`text-xs font-mono px-2 py-0.5 rounded border ${
          item.score === '+'
            ? 'text-green-700 bg-green-50 border-green-200 dark:text-green-400 dark:border-green-500/20 dark:bg-green-950/20'
            : item.score === '-'
            ? 'text-red-700 bg-red-50 border-red-200 dark:text-red-400 dark:border-red-500/20 dark:bg-red-950/20'
            : 'text-zinc-600 bg-zinc-100 border-zinc-200 dark:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900'
        }`}>
          {formatMins(item.duration_minutes)}
        </span>
      </div>
    </div>

    <!-- Reflection Note -->
    {#if item.reflection_note}
      <p class="mt-2 text-xs text-zinc-600 dark:text-zinc-400 italic leading-relaxed">
        "{item.reflection_note}"
      </p>
    {/if}
  </div>

  <!-- Actions -->
  <div class="flex items-center space-x-1 shrink-0 opacity-0 group-hover:opacity-100 transition">
    <button
      on:click={() => dispatch('addToCatalog', item)}
      aria-label="Save habit to routine catalog"
      class="p-1 text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
      title="Save to routine catalog"
    >
      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
    </button>
    <button
      on:click={() => dispatch('edit', item)}
      aria-label="Edit habit"
      class="p-1 text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
      title="Edit"
    >
      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
    </button>
    <button
      on:click={() => dispatch('delete', item.id)}
      aria-label="Delete habit"
      class="p-1 text-zinc-400 hover:text-red-600 dark:text-zinc-500 dark:hover:text-red-400 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 transition"
      title="Delete"
    >
      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  </div>
</div>
