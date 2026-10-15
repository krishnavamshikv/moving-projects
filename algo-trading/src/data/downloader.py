"""Historical data downloader using yfinance with retry and data hygiene checks."""

import time
from typing import Dict, List, Optional, Tuple
import pandas as pd
import yfinance as yf

from src.data.storage import DataStorage
from src.utils.logger import setup_logger

logger = setup_logger("downloader")


class DataDownloader:
    """Fetches and cleans historical daily market data from Yahoo Finance."""

    REQUIRED_COLS = ["Open", "High", "Low", "Close", "Volume"]

    def __init__(self, storage: Optional[DataStorage] = None):
        self.storage = storage or DataStorage()

    def fetch_ticker_data(
        self,
        ticker: str,
        start_date: str = "2018-01-01",
        end_date: Optional[str] = None,
        max_retries: int = 3,
        delay_seconds: float = 1.0,
    ) -> pd.DataFrame:
        """Downloads historical OHLCV data for a single ticker with retries."""
        formatted_ticker = ticker if ticker.endswith(".NS") else f"{ticker}.NS"
        clean_symbol = formatted_ticker.replace(".NS", "")

        for attempt in range(1, max_retries + 1):
            try:
                t = yf.Ticker(formatted_ticker)
                df = t.history(
                    start=start_date,
                    end=end_date,
                    interval="1d",
                    auto_adjust=False,
                    actions=True,
                )

                if df.empty:
                    logger.warning(f"[{clean_symbol}] Received empty dataset (Attempt {attempt}/{max_retries})")
                    if attempt < max_retries:
                        time.sleep(delay_seconds * attempt)
                        continue
                    return pd.DataFrame()

                # Clean column headers
                df = self._clean_and_validate(df, clean_symbol)
                return df

            except Exception as e:
                logger.error(f"[{clean_symbol}] Download error (Attempt {attempt}/{max_retries}): {e}")
                if attempt < max_retries:
                    time.sleep(delay_seconds * attempt)

        return pd.DataFrame()

    def _clean_and_validate(self, df: pd.DataFrame, symbol: str) -> pd.DataFrame:
        """Sanitizes raw downloaded OHLCV data."""
        # Handle potential MultiIndex columns
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = [col[0] for col in df.columns]

        # Ensure index is datetime and localized/timezone stripped
        if df.index.tz is not None:
            df.index = df.index.tz_localize(None)

        df.index.name = "Date"

        # Check required columns
        for col in self.REQUIRED_COLS:
            if col not in df.columns:
                logger.warning(f"[{symbol}] Missing required column: {col}")

        # Drop rows where all price columns are NaN
        price_cols = [c for c in ["Open", "High", "Low", "Close"] if c in df.columns]
        df.dropna(subset=price_cols, how="all", inplace=True)

        # Ensure numeric types
        for col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

        # Forward fill occasional price holes then backfill
        df[price_cols] = df[price_cols].ffill().bfill()

        # Volume cleanup: fill NaN volume with 0
        if "Volume" in df.columns:
            df["Volume"] = df["Volume"].fillna(0).astype("int64")

        return df

    def sync_ticker(
        self,
        ticker: str,
        start_date: str = "2018-01-01",
        end_date: Optional[str] = None,
    ) -> Tuple[str, bool, int]:
        """Downloads and saves data for a single ticker to local storage."""
        clean_symbol = ticker.replace(".NS", "").upper()
        df = self.fetch_ticker_data(ticker, start_date=start_date, end_date=end_date)
        if not df.empty:
            self.storage.save_symbol(clean_symbol, df)
            return clean_symbol, True, len(df)
        return clean_symbol, False, 0

    def sync_universe(
        self,
        tickers: List[str],
        start_date: str = "2018-01-01",
        end_date: Optional[str] = None,
        batch_delay: float = 0.5,
    ) -> Dict[str, Any]:
        """Downloads and saves data for a list of tickers sequentially."""
        total = len(tickers)
        successful = 0
        failed = []
        total_rows = 0

        logger.info(f"Starting historical data sync for {total} symbols (Start: {start_date})...")

        for idx, ticker in enumerate(tickers, 1):
            sym, success, rows = self.sync_ticker(ticker, start_date=start_date, end_date=end_date)
            if success:
                successful += 1
                total_rows += rows
                logger.info(f"[{idx}/{total}] Successfully synced {sym} ({rows} bars)")
            else:
                failed.append(sym)
                logger.error(f"[{idx}/{total}] Failed to sync {sym}")

            if batch_delay > 0:
                time.sleep(batch_delay)

        return {
            "total": total,
            "successful": successful,
            "failed_count": len(failed),
            "failed_symbols": failed,
            "total_rows": total_rows,
        }
