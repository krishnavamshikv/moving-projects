<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let isOpen = false;

  const shortcuts = [
    { key: 'N', desc: 'Open Log New Habit modal' },
    { key: 'S', desc: 'Punch In / Stop & Log live tracker' },
    { key: 'T', desc: 'Jump to Today' },
    { key: '[', desc: 'Go to Previous Day' },
    { key: ']', desc: 'Go to Next Day' },
    { key: 'Click Score', desc: 'Click score badge on timeline to cycle + / - / =' },
    { key: '?', desc: 'Toggle keyboard shortcuts guide' },
    { key: 'Esc', desc: 'Close any active dialog' }
  ];

  function close() {
    dispatch('close');
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg max-w-sm w-full p-5 shadow-2xl relative transition-colors">
      <div class="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900">
        <div>
          <h2 class="text-sm font-semibold text-zinc-900 dark:text-white">Keyboard Shortcuts</h2>
          <p class="text-[11px] text-zinc-500">Fast navigation & habit logging</p>
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

      <div class="mt-3 space-y-2">
        {#each shortcuts as s}
          <div class="flex items-center justify-between py-1.5 text-xs border-b border-zinc-100 dark:border-zinc-900/60 last:border-none">
            <span class="text-zinc-600 dark:text-zinc-400">{s.desc}</span>
            <kbd class="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">
              {s.key}
            </kbd>
          </div>
        {/each}
      </div>

      <div class="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 flex justify-end">
        <button
          on:click={close}
          class="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded text-xs transition"
        >
          Got it
        </button>
      </div>
    </div>
  </div>
{/if}
