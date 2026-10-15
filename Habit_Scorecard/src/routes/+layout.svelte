<script>
  import '../app.css';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';

  let isDark = true;

  onMount(() => {
    isDark = document.documentElement.classList.contains('dark');
  });

  function toggleTheme() {
    isDark = !isDark;
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }
</script>

<div class="min-h-screen bg-white text-zinc-900 dark:bg-black dark:text-white flex flex-col transition-colors duration-150">
  <!-- Minimalist Top Navigation Header -->
  <header class="border-b border-zinc-200 dark:border-zinc-900 bg-white/90 dark:bg-black/90 backdrop-blur sticky top-0 z-40 transition-colors">
    <div class="max-w-5xl mx-auto px-4 sm:px-6">
      <div class="flex items-center justify-between h-14">
        <!-- Logo & Title -->
        <div class="flex items-center space-x-3">
          <div class="w-7 h-7 rounded border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 flex items-center justify-center">
            <span class="text-sm font-semibold text-zinc-900 dark:text-white">±</span>
          </div>
          <div class="flex items-baseline space-x-2">
            <span class="font-semibold text-sm tracking-tight text-zinc-900 dark:text-white">Habit Scorecard</span>
            <span class="text-[11px] text-zinc-500 font-normal hidden sm:inline">Atomic Habits</span>
          </div>
        </div>

        <!-- Navigation Tabs & Theme Toggle -->
        <div class="flex items-center space-x-3">
          <nav class="flex items-center space-x-1">
            <a
              href="/"
              class={`px-3 py-1.5 rounded text-xs font-medium transition ${
                $page.url.pathname === '/'
                  ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-800'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              Daily Scorecard
            </a>

            <a
              href="/analytics"
              class={`px-3 py-1.5 rounded text-xs font-medium transition ${
                $page.url.pathname.startsWith('/analytics')
                  ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-white border border-zinc-300 dark:border-zinc-800'
                  : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
              }`}
            >
              Analytics
            </a>
          </nav>

          <!-- Light / Dark Mode Toggle Switch -->
          <div class="h-4 w-px bg-zinc-200 dark:bg-zinc-800"></div>

          <button
            on:click={toggleTheme}
            type="button"
            aria-label="Toggle light and dark mode"
            class="flex items-center gap-1.5 px-2.5 py-1 rounded border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs transition"
            title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
          >
            {#if isDark}
              <!-- Moon Icon for dark -->
              <svg class="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              <span class="text-[11px] font-mono">Dark</span>
            {:else}
              <!-- Sun Icon for light -->
              <svg class="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span class="text-[11px] font-mono">Light</span>
            {/if}
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Main Content Area -->
  <main class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
    <slot />
  </main>

  <!-- Minimalist Footer -->
  <footer class="border-t border-zinc-200 dark:border-zinc-900 py-6 text-center text-xs text-zinc-500 dark:text-zinc-600 transition-colors">
    <span>James Clear &bull; Habits Scorecard &bull; Awareness Before Change</span>
  </footer>
</div>
