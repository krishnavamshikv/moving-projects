<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  export let isOpen = false;
  export let catalog = [];

  let newName = '';
  let newScore = '+';
  let newDuration = 30;
  let newNotes = '';
  let isSaving = false;
  let errorMsg = '';
  let searchQuery = '';

  $: filteredCatalog = catalog.filter(h => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return h.name.toLowerCase().includes(q) || (h.notes || '').toLowerCase().includes(q);
  });

  function close() {
    dispatch('close');
  }

  function handleSelect(habit) {
    dispatch('select', habit);
  }

  async function handleAddCatalog() {
    if (!newName.trim()) return;
    isSaving = true;
    errorMsg = '';
    try {
      const res = await fetch('/api/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName.trim(),
          default_score: newScore,
          default_duration: Number(newDuration) || 30,
          notes: newNotes.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        catalog = [...catalog, data.habit];
        newName = '';
        newNotes = '';
        dispatch('catalogUpdated', catalog);
      } else {
        errorMsg = data.error || 'Failed to add habit';
      }
    } catch (err) {
      errorMsg = err.message;
    } finally {
      isSaving = false;
    }
  }

  async function handleDelete(id) {
    if (!confirm('Remove habit from catalog?')) return;
    try {
      const res = await fetch(`/api/catalog/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        catalog = catalog.filter(h => h.id !== id);
        dispatch('catalogUpdated', catalog);
      }
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg max-w-xl w-full p-6 shadow-2xl relative transition-colors">
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-900">
        <div>
          <h2 class="text-base font-semibold text-zinc-900 dark:text-white">Routine Catalog</h2>
          <p class="text-xs text-zinc-500 mt-0.5">Predefined behaviors for fast logging</p>
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

      <!-- Add New Habit Form -->
      <form on:submit|preventDefault={handleAddCatalog} class="mt-4 p-4 rounded bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-900 space-y-3">
        <div class="text-xs font-semibold text-zinc-800 dark:text-zinc-300">Add to Catalog</div>
        
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="sm:col-span-2">
            <label for="catalog-name-input" class="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">Habit Name</label>
            <input
              id="catalog-name-input"
              type="text"
              bind:value={newName}
              placeholder="e.g., Cold Shower, Read 15 mins..."
              class="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded px-3 py-1.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
              required
            />
          </div>

          <div>
            <span class="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">Evaluation</span>
            <div class="grid grid-cols-3 gap-1">
              <button
                type="button"
                on:click={() => newScore = '+'}
                class={`py-1.5 rounded text-xs font-bold border transition ${
                  newScore === '+'
                    ? 'bg-green-50 text-green-700 border-green-300 dark:bg-green-950/30 dark:text-green-400 dark:border-green-500/50'
                    : 'bg-white dark:bg-zinc-950 text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                +
              </button>
              <button
                type="button"
                on:click={() => newScore = '-'}
                class={`py-1.5 rounded text-xs font-bold border transition ${
                  newScore === '-'
                    ? 'bg-red-50 text-red-700 border-red-300 dark:bg-red-950/30 dark:text-red-400 dark:border-red-500/50'
                    : 'bg-white dark:bg-zinc-950 text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                -
              </button>
              <button
                type="button"
                on:click={() => newScore = '='}
                class={`py-1.5 rounded text-xs font-bold border transition ${
                  newScore === '='
                    ? 'bg-zinc-200 text-zinc-900 border-zinc-300 dark:bg-zinc-800 dark:text-white dark:border-zinc-600'
                    : 'bg-white dark:bg-zinc-950 text-zinc-500 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                =
              </button>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label for="catalog-duration-input" class="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">Duration (mins)</label>
            <input
              id="catalog-duration-input"
              type="number"
              bind:value={newDuration}
              min="1"
              max="1440"
              class="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded px-3 py-1.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-zinc-500 font-mono"
            />
          </div>
          <div class="sm:col-span-2">
            <label for="catalog-notes-input" class="block text-xs text-zinc-600 dark:text-zinc-400 mb-1">Reflection Note</label>
            <input
              id="catalog-notes-input"
              type="text"
              bind:value={newNotes}
              placeholder="Why is this good, bad, or neutral?"
              class="w-full bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded px-3 py-1.5 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-500"
            />
          </div>
        </div>

        {#if errorMsg}
          <p class="text-xs text-red-600 dark:text-red-400">{errorMsg}</p>
        {/if}

        <div class="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isSaving || !newName.trim()}
            class="px-3 py-1.5 bg-zinc-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-xs font-semibold rounded transition shadow-sm"
          >
            {isSaving ? 'Saving...' : 'Add Habit'}
          </button>
        </div>
      </form>

      <!-- Catalog List Header & Search -->
      <div class="mt-4">
        <div class="flex items-center justify-between gap-3 mb-2.5">
          <div class="text-xs font-medium text-zinc-600 dark:text-zinc-400 shrink-0">
            Catalog ({filteredCatalog.length}{searchQuery ? ` of ${catalog.length}` : ''})
          </div>

          <!-- Quick Search Box -->
          <div class="relative w-44 sm:w-56">
            <input
              type="text"
              bind:value={searchQuery}
              placeholder="Search habits..."
              class="w-full bg-white dark:bg-black border border-zinc-300 dark:border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600"
            />
            {#if searchQuery}
              <button
                type="button"
                on:click={() => searchQuery = ''}
                aria-label="Clear search"
                class="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs"
              >
                &times;
              </button>
            {/if}
          </div>
        </div>

        <div class="max-h-60 overflow-y-auto space-y-1.5 pr-1">
          {#if filteredCatalog.length === 0}
            <p class="text-xs text-zinc-400 dark:text-zinc-600 py-4 text-center">
              {searchQuery ? 'No routine habits match your search.' : 'Catalog is empty.'}
            </p>
          {/if}

          {#each filteredCatalog as habit (habit.id)}
            <div class="flex items-center justify-between p-2.5 rounded bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-800 transition">
              <div class="flex items-center space-x-3 flex-1 min-w-0 pr-3">
                <span class={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs shrink-0 border ${
                  habit.default_score === '+'
                    ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-400 dark:border-green-500/30'
                    : habit.default_score === '-'
                    ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-500/30'
                    : 'bg-zinc-200 text-zinc-700 border-zinc-300 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800'
                }`}>
                  {habit.default_score}
                </span>
                <div class="truncate">
                  <div class="text-xs font-medium text-zinc-900 dark:text-white truncate">{habit.name}</div>
                  <div class="text-[11px] text-zinc-500 flex items-center gap-2">
                    <span class="font-mono">{habit.default_duration || 30}m</span>
                    {#if habit.notes}
                      <span class="truncate italic text-zinc-400 dark:text-zinc-500">"{habit.notes}"</span>
                    {/if}
                  </div>
                </div>
              </div>

              <div class="flex items-center space-x-2 shrink-0">
                <button
                  on:click={() => handleSelect(habit)}
                  class="px-2 py-1 bg-white hover:bg-zinc-100 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white rounded text-xs transition border border-zinc-300 dark:border-zinc-800"
                >
                  Insert
                </button>
                <button
                  on:click={() => handleDelete(habit.id)}
                  aria-label="Delete habit"
                  class="p-1 text-zinc-400 hover:text-red-600 dark:text-zinc-600 dark:hover:text-red-400 rounded transition"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <div class="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900 flex justify-end">
        <button
          on:click={close}
          class="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded text-xs font-medium transition"
        >
          Close
        </button>
      </div>
    </div>
  </div>
{/if}
