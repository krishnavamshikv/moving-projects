"""Parquet-based high-performance local storage for historical market data."""

from pathlib import Path
from typing import Any, Dict, List, Optional
import pandas as pd

from src.utils.logger import setup_logger

logger = setup_logger("data_storage")


class DataStorage:
    """Manages reading and writing OHLCV data to disk using Apache Parquet."""

    DEFAULT_DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "daily"

    def __init__(self, data_dir: Optional[Path] = None):
        self.data_dir = data_dir or self.DEFAULT_DATA_DIR
        self.data_dir.mkdir(parents=True, exist_ok=True)

    def _get_file_path(self, symbol: str) -> Path:
        clean_sym = symbol.replace(".NS", "").upper()
        return self.data_dir / f"{clean_sym}.parquet"

    def save_symbol(self, symbol: str, df: pd.DataFrame) -> Path:
        """Saves a single symbol's OHLCV dataframe to Parquet."""
        if df.empty:
            logger.warning(f"Attempted to save empty DataFrame for symbol {symbol}")
            return self._get_file_path(symbol)

        clean_sym = symbol.replace(".NS", "").upper()
        file_path = self._get_file_path(clean_sym)

        # Standardize index and columns
        df_to_save = df.copy()
        if not isinstance(df_to_save.index, pd.DatetimeIndex):
            if "Date" in df_to_save.columns:
                df_to_save["Date"] = pd.to_datetime(df_to_save["Date"])
                df_to_save.set_index("Date", inplace=True)
            elif "datetime" in df_to_save.columns:
                df_to_save["datetime"] = pd.to_datetime(df_to_save["datetime"])
                df_to_save.set_index("datetime", inplace=True)

        # Ensure index name is Date
        df_to_save.index.name = "Date"
        # Strip timezone if present to avoid Parquet tz mismatches
        if df_to_save.index.tz is not None:
            df_to_save.index = df_to_save.index.tz_localize(None)

        df_to_save["Symbol"] = clean_sym
        df_to_save.sort_index(inplace=True)

        # Remove duplicate dates keeping the last entry
        df_to_save = df_to_save[~df_to_save.index.duplicated(keep="last")]

        df_to_save.to_parquet(file_path, compression="snappy", engine="pyarrow")
        return file_path

    def load_symbol(
        self,
        symbol: str,
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ) -> pd.DataFrame:
        """Loads OHLCV dataframe for a given symbol, with optional date filtering."""
        file_path = self._get_file_path(symbol)
        if not file_path.exists():
            logger.warning(f"No cached parquet file found for {symbol} at {file_path}")
            return pd.DataFrame()

        df = pd.read_parquet(file_path, engine="pyarrow")
        if start_date:
            df = df[df.index >= pd.to_datetime(start_date)]
        if end_date:
            df = df[df.index <= pd.to_datetime(end_date)]
        return df

    def get_available_symbols(self) -> List[str]:
        """Returns list of all symbols currently present in the cache."""
        return sorted([p.stem for p in self.data_dir.glob("*.parquet")])

    def get_storage_summary(self) -> List[Dict[str, Any]]:
        """Returns summary statistics of cached datasets."""
        summary = []
        for file in sorted(self.data_dir.glob("*.parquet")):
            try:
                df = pd.read_parquet(file, columns=["Close"])
                file_size_kb = file.stat().st_size / 1024
                start_date = df.index.min().strftime("%Y-%m-%d") if not df.empty else "N/A"
                end_date = df.index.max().strftime("%Y-%m-%d") if not df.empty else "N/A"
                summary.append({
                    "symbol": file.stem,
                    "rows": len(df),
                    "start_date": start_date,
                    "end_date": end_date,
                    "size_kb": round(file_size_kb, 1),
                })
            except Exception as e:
                logger.error(f"Error reading {file.name}: {e}")
        return summary
