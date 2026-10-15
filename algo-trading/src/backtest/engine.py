"""Event-aware backtesting engine with realistic Indian regulatory transaction costs."""

from dataclasses import asdict, dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd


@dataclass
class TransactionCostModel:
    """Calculates Indian regulatory charges (NSE Equity Delivery/Swing)."""

    brokerage_flat: float = 20.0  # Max ₹20 per order
    brokerage_pct: float = 0.0003  # 0.03%
    stt_pct: float = 0.001  # 0.1% on both Buy and Sell for Delivery
    exchange_charge_pct: float = 0.0000345  # 0.00345%
    sebi_pct: float = 0.000001  # ₹10 per crore
    stamp_duty_pct: float = 0.00015  # 0.015% on Buy only
    gst_pct: float = 0.18  # 18% on (Brokerage + Exchange)
    slippage_pct: float = 0.0005  # 0.05% slippage

    def calculate_buy_cost(self, turnover: float) -> float:
        """Calculates total costs for a buy order."""
        brokerage = min(self.brokerage_flat, turnover * self.brokerage_pct)
        stt = turnover * self.stt_pct
        exchange = turnover * self.exchange_charge_pct
        sebi = turnover * self.sebi_pct
        stamp = turnover * self.stamp_duty_pct
        gst = (brokerage + exchange) * self.gst_pct
        slippage = turnover * self.slippage_pct
        return brokerage + stt + exchange + sebi + stamp + gst + slippage

    def calculate_sell_cost(self, turnover: float) -> float:
        """Calculates total costs for a sell order."""
        brokerage = min(self.brokerage_flat, turnover * self.brokerage_pct)
        stt = turnover * self.stt_pct
        exchange = turnover * self.exchange_charge_pct
        sebi = turnover * self.sebi_pct
        stamp = 0.0  # No stamp duty on sell
        gst = (brokerage + exchange) * self.gst_pct
        slippage = turnover * self.slippage_pct
        return brokerage + stt + exchange + sebi + stamp + gst + slippage


@dataclass
class Trade:
    """Represents a completed trade."""

    entry_date: str
    exit_date: str
    symbol: str
    entry_price: float
    exit_price: float
    shares: int
    entry_cost: float
    exit_cost: float
    gross_pnl: float
    net_pnl: float
    return_pct: float
    duration_days: int
    exit_reason: str


@dataclass
class BacktestResult:
    """Comprehensive performance metrics of a backtest run."""

    symbol: str
    strategy_name: str = "Strategy"
    initial_capital: float = 100000.0
    final_equity: float = 100000.0
    total_return_pct: float = 0.0
    cagr_pct: float = 0.0
    sharpe_ratio: float = 0.0
    sortino_ratio: float = 0.0
    max_drawdown_pct: float = 0.0
    total_trades: int = 0
    winning_trades: int = 0
    losing_trades: int = 0
    win_rate_pct: float = 0.0
    profit_factor: float = 0.0
    total_fees_paid: float = 0.0
    avg_holding_days: float = 0.0
    avg_days_to_target: float = 0.0
    target_hit_count: int = 0
    target_hit_rate_pct: float = 0.0
    equity_curve: List[Dict[str, Any]] = field(default_factory=list)
    trades: List[Dict[str, Any]] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


class BacktestEngine:
    """Simulates trading strategies on historical OHLCV data."""

    def __init__(self, cost_model: Optional[TransactionCostModel] = None):
        self.cost_model = cost_model or TransactionCostModel()

    def run(
        self,
        df: pd.DataFrame,
        signals: pd.Series,
        symbol: str = "STOCK",
        strategy_name: str = "Strategy",
        initial_capital: float = 100000.0,
        allocation_pct: float = 0.95,
        stop_loss_pct: Optional[float] = None,
        take_profit_pct: Optional[float] = None,
    ) -> BacktestResult:
        """
        Executes a backtest on given price dataframe and signal series.
        Signal values:
          1 = Buy (Long entry)
         -1 = Sell (Exit)
          0 = Hold / Neutral
        """
        if df.empty or signals.empty:
            return self._empty_result(symbol, strategy_name, initial_capital)

        # Align signals with dataframe index
        aligned_signals = signals.reindex(df.index).fillna(0)

        cash = initial_capital
        position_shares = 0
        entry_price = 0.0
        entry_date = ""
        entry_cost = 0.0

        trades_list: List[Trade] = []
        equity_records: List[Dict[str, Any]] = []
        total_fees = 0.0

        peak_equity = initial_capital
        max_drawdown = 0.0

        dates = df.index
        closes = df["Close"].values
        highs = df["High"].values
        lows = df["Low"].values

        for i in range(len(df)):
            current_date = dates[i].strftime("%Y-%m-%d")
            close_price = closes[i]
            high_price = highs[i]
            low_price = lows[i]
            signal = aligned_signals.iloc[i]

            # 1. Check Exit conditions if in position
            if position_shares > 0:
                exit_signal = False
                exit_reason = "Signal Exit"
                exit_price = close_price

                # Check Stop Loss
                if stop_loss_pct is not None:
                    sl_threshold = entry_price * (1.0 - stop_loss_pct)
                    if low_price <= sl_threshold:
                        exit_signal = True
                        exit_reason = "Stop Loss"
                        exit_price = min(close_price, sl_threshold)

                # Check Take Profit
                if not exit_signal and take_profit_pct is not None:
                    tp_threshold = entry_price * (1.0 + take_profit_pct)
                    if high_price >= tp_threshold:
                        exit_signal = True
                        exit_reason = "Take Profit"
                        exit_price = max(close_price, tp_threshold)

                # Standard Signal Exit
                if not exit_signal and signal == -1:
                    exit_signal = True
                    exit_reason = "Indicator Signal"
                    exit_price = close_price

                # Execute Exit
                if exit_signal:
                    sell_turnover = position_shares * exit_price
                    exit_fee = self.cost_model.calculate_sell_cost(sell_turnover)
                    total_fees += exit_fee
                    gross_pnl = (exit_price - entry_price) * position_shares
                    net_pnl = gross_pnl - (entry_cost + exit_fee)
                    return_pct = (net_pnl / (position_shares * entry_price)) * 100

                    # Calculate duration
                    d1 = datetime.strptime(entry_date, "%Y-%m-%d")
                    d2 = datetime.strptime(current_date, "%Y-%m-%d")
                    duration = (d2 - d1).days

                    trades_list.append(
                        Trade(
                            entry_date=entry_date,
                            exit_date=current_date,
                            symbol=symbol,
                            entry_price=round(entry_price, 2),
                            exit_price=round(exit_price, 2),
                            shares=position_shares,
                            entry_cost=round(entry_cost, 2),
                            exit_cost=round(exit_fee, 2),
                            gross_pnl=round(gross_pnl, 2),
                            net_pnl=round(net_pnl, 2),
                            return_pct=round(return_pct, 2),
                            duration_days=duration,
                            exit_reason=exit_reason,
                        )
                    )

                    cash += sell_turnover - exit_fee
                    position_shares = 0
                    entry_price = 0.0

            # 2. Check Entry condition if flat
            if position_shares == 0 and signal == 1:
                usable_cash = cash * allocation_pct
                if usable_cash > close_price:
                    position_shares = int(usable_cash // close_price)
                    if position_shares > 0:
                        buy_turnover = position_shares * close_price
                        entry_cost = self.cost_model.calculate_buy_cost(buy_turnover)
                        total_fees += entry_cost
                        cash -= (buy_turnover + entry_cost)
                        entry_price = close_price
                        entry_date = current_date

            # Portfolio Current Value
            position_value = position_shares * close_price
            current_equity = cash + position_value

            if current_equity > peak_equity:
                peak_equity = current_equity

            drawdown = (current_equity - peak_equity) / peak_equity * 100
            if drawdown < max_drawdown:
                max_drawdown = drawdown

            equity_records.append({
                "time": current_date,
                "value": round(current_equity, 2),
                "drawdown": round(drawdown, 2),
            })

        # Calculate Summary Metrics
        final_equity = equity_records[-1]["value"] if equity_records else initial_capital
        total_return_pct = ((final_equity - initial_capital) / initial_capital) * 100

        # Calculate CAGR
        total_days = (dates[-1] - dates[0]).days if len(dates) > 1 else 1
        years = max(total_days / 365.25, 0.1)
        cagr_pct = (((final_equity / initial_capital) ** (1 / years)) - 1) * 100 if final_equity > 0 else -100.0

        # Daily returns for Sharpe and Sortino
        eq_series = pd.Series([r["value"] for r in equity_records])
        daily_returns = eq_series.pct_change().dropna()

        # Risk-free rate (approx 6% annually -> 6%/252 daily)
        rf_daily = 0.06 / 252
        excess_returns = daily_returns - rf_daily

        std_dev = daily_returns.std()
        sharpe = (excess_returns.mean() / std_dev * np.sqrt(252)) if std_dev > 0 else 0.0

        downside_returns = daily_returns[daily_returns < 0]
        downside_std = downside_returns.std()
        sortino = (excess_returns.mean() / downside_std * np.sqrt(252)) if downside_std > 0 else 0.0

        # Trade metrics
        total_trades = len(trades_list)
        winning_trades = len([t for t in trades_list if t.net_pnl > 0])
        losing_trades = len([t for t in trades_list if t.net_pnl <= 0])
        win_rate = (winning_trades / total_trades * 100) if total_trades > 0 else 0.0

        gross_profits = sum(t.net_pnl for t in trades_list if t.net_pnl > 0)
        gross_losses = abs(sum(t.net_pnl for t in trades_list if t.net_pnl < 0))
        profit_factor = (gross_profits / gross_losses) if gross_losses > 0 else (99.0 if gross_profits > 0 else 0.0)

        # Duration and Target metrics
        target_trades = [t for t in trades_list if t.exit_reason == "Take Profit"]
        avg_days_to_target = (
            round(sum(t.duration_days for t in target_trades) / len(target_trades), 1)
            if target_trades
            else 0.0
        )
        avg_holding_days = (
            round(sum(t.duration_days for t in trades_list) / len(trades_list), 1)
            if trades_list
            else 0.0
        )
        target_hit_count = len(target_trades)
        target_hit_rate_pct = (
            round(len(target_trades) / len(trades_list) * 100, 1)
            if trades_list
            else 0.0
        )

        return BacktestResult(
            symbol=symbol,
            strategy_name=strategy_name,
            initial_capital=initial_capital,
            final_equity=round(final_equity, 2),
            total_return_pct=round(total_return_pct, 2),
            cagr_pct=round(cagr_pct, 2),
            sharpe_ratio=round(float(sharpe), 2),
            sortino_ratio=round(float(sortino), 2),
            max_drawdown_pct=round(abs(max_drawdown), 2),
            total_trades=total_trades,
            winning_trades=winning_trades,
            losing_trades=losing_trades,
            win_rate_pct=round(win_rate, 2),
            profit_factor=round(float(profit_factor), 2),
            total_fees_paid=round(total_fees, 2),
            avg_holding_days=avg_holding_days,
            avg_days_to_target=avg_days_to_target,
            target_hit_count=target_hit_count,
            target_hit_rate_pct=target_hit_rate_pct,
            equity_curve=equity_records,
            trades=[asdict(t) for t in trades_list],
        )

    def _empty_result(self, symbol: str, strategy_name: str, initial_capital: float) -> BacktestResult:
        return BacktestResult(
            symbol=symbol,
            strategy_name=strategy_name,
            initial_capital=initial_capital,
            final_equity=initial_capital,
            total_return_pct=0.0,
            cagr_pct=0.0,
            sharpe_ratio=0.0,
            sortino_ratio=0.0,
            max_drawdown_pct=0.0,
            total_trades=0,
            winning_trades=0,
            losing_trades=0,
            win_rate_pct=0.0,
            profit_factor=0.0,
            total_fees_paid=0.0,
            avg_holding_days=0.0,
            avg_days_to_target=0.0,
            target_hit_count=0,
            target_hit_rate_pct=0.0,
            equity_curve=[],
            trades=[],
        )
