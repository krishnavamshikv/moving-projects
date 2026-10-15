export interface StockMetadata {
  symbol: string;
  ticker: string;
  company_name: string;
  sector: string;
  behavior_tag?: string;
  is_cached?: boolean;
}

export interface UniverseResponse {
  total_constituents: number;
  cached_count: number;
  constituents: StockMetadata[];
}

export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface VolumeData {
  time: string;
  value: number;
  color: string;
}

export interface CandlesResponse {
  symbol: string;
  metadata?: StockMetadata;
  count: number;
  candles: CandleData[];
  volumes: VolumeData[];
}

export interface TradeRecord {
  entry_date: string;
  exit_date: string;
  symbol: string;
  entry_price: number;
  exit_price: number;
  shares: number;
  entry_cost: number;
  exit_cost: number;
  gross_pnl: number;
  net_pnl: number;
  return_pct: number;
  duration_days: number;
  exit_reason: string;
}

export interface EquityPoint {
  time: string;
  value: number;
  drawdown: number;
}

export interface BacktestResult {
  symbol: string;
  strategy_name?: string;
  initial_capital: number;
  final_equity: number;
  total_return_pct: number;
  cagr_pct: number;
  sharpe_ratio: number;
  sortino_ratio: number;
  max_drawdown_pct: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate_pct: number;
  profit_factor: number;
  total_fees_paid: number;
  avg_holding_days: number;
  avg_days_to_target: number;
  target_hit_count: number;
  target_hit_rate_pct: number;
  equity_curve: EquityPoint[];
  trades: TradeRecord[];
  indicators?: Record<string, { time: string; value: number }[]>;
}

export interface StrategyConfig {
  name: string;
  strategy: 'EMA_CROSSOVER' | 'RSI_MEAN_REVERSION';
  stop_loss_pct?: number;
  take_profit_pct?: number;
  params: Record<string, any>;
}

export interface CompareBacktestRequest {
  symbol: string;
  initial_capital: number;
  start_date?: string;
  end_date?: string;
  strategies: StrategyConfig[];
}

export interface CompareResponse {
  symbol: string;
  strategy_count: number;
  winners: {
    highest_win_rate: {
      name: string;
      win_rate_pct: number;
      total_return_pct: number;
    };
    fastest_target?: {
      name: string;
      avg_days_to_target: number;
      target_hit_rate_pct: number;
    };
    highest_return: {
      name: string;
      total_return_pct: number;
    };
  };
  rankings: BacktestResult[];
  equity_curves: Record<string, EquityPoint[]>;
}

export interface BacktestRequest {
  strategy: 'EMA_CROSSOVER' | 'RSI_MEAN_REVERSION';
  symbol: string;
  initial_capital: number;
  start_date?: string;
  end_date?: string;
  stop_loss_pct?: number;
  take_profit_pct?: number;
  params: Record<string, any>;
}

export interface StorageSummaryItem {
  symbol: string;
  rows: number;
  start_date: string;
  end_date: string;
  size_kb: number;
}

export interface StorageSummaryResponse {
  cached_symbols_count: number;
  total_bars_cached: number;
  total_storage_mb: number;
  summary: StorageSummaryItem[];
}
