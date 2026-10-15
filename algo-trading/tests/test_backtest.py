"""Unit tests for the Backtest Engine and Strategies."""

import pandas as pd
import pytest

from src.backtest.engine import BacktestEngine, TransactionCostModel
from src.backtest.strategies import EMACrossoverStrategy, RSIMeanReversionStrategy


@pytest.fixture
def sample_trend_data():
    """Generates synthetic price data with an upward trend followed by a pullback."""
    dates = pd.date_range("2024-01-01", periods=100, freq="B")
    prices = []
    current = 100.0
    for i in range(100):
        # 0 to 60 uptrend, 60 to 100 downtrend
        change = 1.0 if i < 60 else -1.0
        current += change
        prices.append(current)

    df = pd.DataFrame(
        {
            "Open": prices,
            "High": [p + 1.0 for p in prices],
            "Low": [p - 1.0 for p in prices],
            "Close": prices,
            "Volume": [500000] * 100,
        },
        index=dates,
    )
    return df


def test_transaction_cost_model():
    model = TransactionCostModel()
    turnover = 100000.0  # 1 Lakh

    buy_cost = model.calculate_buy_cost(turnover)
    # Brokerage: min(20, 30) = 20
    # STT: 100
    # Stamp: 15
    # Total should be around ~180-200 with GST and slippage
    assert 150.0 < buy_cost < 250.0

    sell_cost = model.calculate_sell_cost(turnover)
    assert 130.0 < sell_cost < 230.0


def test_ema_crossover_strategy(sample_trend_data):
    signals, indicators = EMACrossoverStrategy.generate_signals(
        sample_trend_data, fast_period=5, slow_period=15
    )
    assert not signals.empty
    assert "EMA_5" in indicators
    assert "EMA_15" in indicators
    assert 1 in signals.values  # Should have triggered at least one buy signal


def test_backtest_execution(sample_trend_data):
    signals, _ = EMACrossoverStrategy.generate_signals(
        sample_trend_data, fast_period=5, slow_period=15
    )
    engine = BacktestEngine()
    result = engine.run(
        sample_trend_data,
        signals,
        symbol="TEST",
        initial_capital=100000.0,
        stop_loss_pct=0.05,
        take_profit_pct=0.20,
    )

    assert result.symbol == "TEST"
    assert result.initial_capital == 100000.0
    assert result.total_trades > 0
    assert len(result.equity_curve) == len(sample_trend_data)
    assert result.win_rate_pct >= 0.0


def test_rsi_mean_reversion_strategy(sample_trend_data):
    signals, indicators = RSIMeanReversionStrategy.generate_signals(
        sample_trend_data,
        rsi_period=7,
        oversold=30.0,
        overbought=70.0,
        trend_period=20,
    )
    assert not signals.empty
    assert "RSI" in indicators
    assert "EMA_20" in indicators
