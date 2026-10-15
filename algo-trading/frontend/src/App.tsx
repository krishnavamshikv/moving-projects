import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BacktesterView } from './views/BacktesterView';
import { ExplorerView } from './views/ExplorerView';
import { DataManagementView } from './views/DataManagementView';
import type { StockMetadata, UniverseResponse } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<'backtest' | 'explorer' | 'data'>('backtest');
  const [stocks, setStocks] = useState<StockMetadata[]>([]);
  const [cachedCount, setCachedCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUniverse = async () => {
    try {
      const res = await fetch('/api/universe');
      if (res.ok) {
        const data: UniverseResponse = await res.json();
        setStocks(data.constituents);
        setCachedCount(data.cached_count);
      }
    } catch (err) {
      console.error('Failed to load universe:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniverse();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cachedCount={cachedCount}
        totalCount={stocks.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-400 text-sm">Initializing Nifty Algo Studio...</p>
          </div>
        ) : (
          <>
            {activeTab === 'backtest' && <BacktesterView stocks={stocks} />}
            {activeTab === 'explorer' && <ExplorerView stocks={stocks} />}
            {activeTab === 'data' && (
              <DataManagementView stocks={stocks} onRefreshUniverse={fetchUniverse} />
            )}
          </>
        )}
      </main>

      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        Nifty 100 Algorithmic Trading Lab • Built with React, Vite, Tailwind CSS & FastAPI
      </footer>
    </div>
  );
}

export default App;
