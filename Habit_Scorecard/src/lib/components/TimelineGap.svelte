<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let startTime = '';
  export let endTime = '';
  export let durationMinutes = 0;

  function formatMins(mins) {
    if (!mins) return '0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }
</script>

<div class="flex items-center justify-between px-3.5 py-2.5 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950/40 text-xs text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-700 transition">
  <div class="flex items-center gap-2">
    <span class="w-2 h-2 rounded-full bg-amber-500/80 shrink-0"></span>
    <span class="font-mono text-zinc-600 dark:text-zinc-400">{startTime} &ndash; {endTime}</span>
    <span class="text-zinc-400 dark:text-zinc-600">&bull;</span>
    <span class="italic text-zinc-500">{formatMins(durationMinutes)} untracked gap</span>
  </div>

  <button
    type="button"
    on:click={() => dispatch('fillGap', { startTime, endTime })}
    class="px-2.5 py-1 rounded bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 text-[11px] font-medium transition"
  >
    + Fill Gap
  </button>
</div>
