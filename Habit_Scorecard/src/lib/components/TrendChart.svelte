<script>
  export let dailySeries = [];

  $: maxMinutes = Math.max(
    60,
    ...dailySeries.map(d => d.totalMinutes || 0)
  );

  const chartHeight = 160;

  function formatMins(mins) {
    if (!mins) return '0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  }
</script>

<div class="w-full">
  <!-- Legend -->
  <div class="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 mb-4">
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-1.5">
        <span class="w-2.5 h-2.5 rounded-sm bg-green-500"></span>
        <span class="text-zinc-700 dark:text-zinc-300 font-medium">Effective (+)</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-2.5 h-2.5 rounded-sm bg-red-500"></span>
        <span class="text-zinc-700 dark:text-zinc-300 font-medium">Ineffective (-)</span>
      </div>
      <div class="flex items-center gap-1.5">
        <span class="w-2.5 h-2.5 rounded-sm bg-zinc-400 dark:bg-zinc-600"></span>
        <span class="text-zinc-700 dark:text-zinc-300 font-medium">Neutral (=)</span>
      </div>
    </div>
    <div class="text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
      Max: {formatMins(maxMinutes)}
    </div>
  </div>

  <!-- Bar Chart Columns -->
  <div class="h-44 flex items-end gap-1.5 sm:gap-2 px-1 pt-4 pb-1 border-b border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-black rounded overflow-x-auto transition-colors">
    {#each dailySeries as day (day.date)}
      {@const total = day.totalMinutes || 0}
      {@const posHeight = total > 0 ? (day.posMinutes / maxMinutes) * chartHeight : 0}
      {@const negHeight = total > 0 ? (day.negMinutes / maxMinutes) * chartHeight : 0}
      {@const neuHeight = total > 0 ? (day.neuMinutes / maxMinutes) * chartHeight : 0}

      <div class="flex-1 min-w-[28px] max-w-[44px] h-full flex flex-col justify-end items-center group relative">
        <!-- Minimal Tooltip -->
        <div class="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-30">
          <div class="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white text-[11px] rounded px-2.5 py-1.5 shadow-lg whitespace-nowrap space-y-1">
            <div class="font-medium text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-0.5">{day.fullLabel}</div>
            <div class="text-green-600 dark:text-green-400 font-mono">+ {formatMins(day.posMinutes)}</div>
            <div class="text-red-600 dark:text-red-400 font-mono">- {formatMins(day.negMinutes)}</div>
            <div class="text-zinc-600 dark:text-zinc-400 font-mono">= {formatMins(day.neuMinutes)}</div>
            <div class="text-zinc-400 dark:text-zinc-500 text-[10px] pt-0.5 border-t border-zinc-100 dark:border-zinc-800 font-mono">Total: {formatMins(total)}</div>
          </div>
        </div>

        <!-- Stacked Bar Column -->
        <div class="w-full flex flex-col justify-end rounded-t overflow-hidden bg-zinc-200 dark:bg-zinc-950 transition-all cursor-pointer">
          <!-- Neutral (=) at top -->
          {#if neuHeight > 0}
            <div style="height: {neuHeight}px" class="w-full bg-zinc-400 dark:bg-zinc-600"></div>
          {/if}

          <!-- Ineffective (-) in middle -->
          {#if negHeight > 0}
            <div style="height: {negHeight}px" class="w-full bg-red-500"></div>
          {/if}

          <!-- Effective (+) at bottom -->
          {#if posHeight > 0}
            <div style="height: {posHeight}px" class="w-full bg-green-500"></div>
          {/if}

          {#if total === 0}
            <div class="h-0.5 w-full bg-zinc-300 dark:bg-zinc-900 rounded-t"></div>
          {/if}
        </div>

        <!-- X-Axis Label -->
        <span class="mt-2 text-[10px] text-zinc-500 dark:text-zinc-500 group-hover:text-zinc-800 dark:group-hover:text-zinc-300 transition font-mono truncate max-w-full text-center">
          {day.label}
        </span>
      </div>
    {/each}
  </div>
</div>
