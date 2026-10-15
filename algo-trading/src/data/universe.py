"""Nifty 100 Universe Manager."""

import json
from pathlib import Path
from typing import Any, Dict, List, Optional
import pandas as pd


class NiftyUniverse:
    """Manages constituents and metadata of the Nifty 100 universe."""

    DEFAULT_CONFIG_PATH = Path(__file__).resolve().parent.parent.parent / "config" / "nifty100.json"

    def __init__(self, config_path: Optional[Path] = None):
        self.config_path = config_path or self.DEFAULT_CONFIG_PATH
        self._constituents: List[Dict[str, Any]] = self._load()

    def _load(self) -> List[Dict[str, Any]]:
        if not self.config_path.exists():
            raise FileNotFoundError(f"Universe configuration file not found at: {self.config_path}")
        with open(self.config_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def count(self) -> int:
        """Total number of constituents."""
        return len(self._constituents)

    def get_symbols(self) -> List[str]:
        """Returns list of NSE clean symbols (e.g. ['RELIANCE', 'TCS'])."""
        return [c["symbol"] for c in self._constituents]

    def get_tickers(self) -> List[str]:
        """Returns list of Yahoo Finance tickers with .NS suffix."""
        return [c["ticker"] for c in self._constituents]

    def get_stock(self, symbol: str) -> Optional[Dict[str, Any]]:
        """Get metadata for a specific stock by symbol or ticker."""
        sym_clean = symbol.replace(".NS", "").upper()
        for item in self._constituents:
            if item["symbol"].upper() == sym_clean:
                return item
        return None

    def get_by_sector(self, sector: str) -> List[Dict[str, Any]]:
        """Filter constituents by sector."""
        sector_lower = sector.lower()
        return [c for c in self._constituents if sector_lower in c.get("sector", "").lower()]

    def get_all_sectors(self) -> List[str]:
        """Returns a sorted list of unique sectors represented in Nifty 100."""
        sectors = {c.get("sector", "Unknown") for c in self._constituents}
        return sorted(list(sectors))

    def to_dataframe(self) -> pd.DataFrame:
        """Returns constituents as a pandas DataFrame."""
        return pd.DataFrame(self._constituents)
