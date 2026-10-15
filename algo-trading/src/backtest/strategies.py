"""Standard quantitative strategies for Nifty 100 stocks."""

from typing import Dict, Tuple
import pandas as pd


class EMACrossoverStrategy:
    """Trend-following strategy based on Fast/Slow Exponential Moving Average crossover."""

    @staticmethod
    def generate_signals(
        df: pd.DataFrame,
        fast_period: int = 20,
        slow_period: int = 50,
    ) -> Tuple[pd.Series, Dict[str, pd.Series]]:
        """Generates buy/sell signals and indicator lines for charting."""
        close = df["Close"]
        fast_ema = close.ewm(span=fast_period, adjust=False).mean()
        slow_ema = close.ewm(span=slow_period, adjust=False).mean()

        signals = pd.Series(0, index=df.index)

        # Bullish Crossover (Golden Cross)
        buy_cond = (fast_ema > slow_ema) & (fast_ema.shift(1) <= slow_ema.shift(1))
        # Bearish Crossover (Death Cross)
        sell_cond = (fast_ema < slow_ema) & (fast_ema.shift(1) >= slow_ema.shift(1))

        signals[buy_cond] = 1
        signals[sell_cond] = -1

        indicators = {
            f"EMA_{fast_period}": fast_ema,
            f"EMA_{slow_period}": slow_ema,
        }
        return signals, indicators


class RSIMeanReversionStrategy:
    """Mean-reversion dip buyer with a 200-day trend confirmation filter."""

    @staticmethod
    def _compute_rsi(series: pd.Series, period: int = 14) -> pd.Series:
        delta = series.diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
        rs = gain / loss.replace(0, 1e-9)
        rsi = 100 - (100 / (1 + rs))
        return rsi

    @staticmethod
    def generate_signals(
        df: pd.DataFrame,
        rsi_period: int = 14,
        oversold: float = 30.0,
        overbought: float = 70.0,
        trend_period: int = 200,
    ) -> Tuple[pd.Series, Dict[str, pd.Series]]:
        """Generates mean-reversion signals and indicator lines."""
        close = df["Close"]
        rsi = RSIMeanReversionStrategy._compute_rsi(close, period=rsi_period)
        trend_ema = close.ewm(span=trend_period, adjust=False).mean()

        signals = pd.Series(0, index=df.index)

        # Buy: In uptrend (Close > Trend EMA) and RSI pulls back and recovers from oversold
        buy_cond = (close > trend_ema) & (rsi > oversold) & (rsi.shift(1) <= oversold)
        # Sell: Overbought reached or broke macro trend
        sell_cond = (rsi >= overbought) | (close < trend_ema * 0.98)

        signals[buy_cond] = 1
        signals[sell_cond] = -1

        indicators = {
            "RSI": rsi,
            f"EMA_{trend_period}": trend_ema,
        }
        return signals, indicators
