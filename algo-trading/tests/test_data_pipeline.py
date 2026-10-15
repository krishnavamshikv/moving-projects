"""Unit tests for Phase 1 Data Pipeline components."""

import shutil
from pathlib import Path
import pandas as pd
import pytest

from src.data.universe import NiftyUniverse
from src.data.storage import DataStorage


def test_universe_initialization():
    universe = NiftyUniverse()
    assert universe.count() >= 100, f"Expected at least 100 constituents, got {universe.count()}"

    symbols = universe.get_symbols()
    assert "RELIANCE" in symbols
    assert "TCS" in symbols
    assert "HDFCBANK" in symbols

    tickers = universe.get_tickers()
    assert all(t.endswith(".NS") for t in tickers)

    # Test sector filter
    it_stocks = universe.get_by_sector("Information Technology")
    assert len(it_stocks) >= 5
    it_symbols = [s["symbol"] for s in it_stocks]
    assert "TCS" in it_symbols
    assert "INFY" in it_symbols


def test_storage_save_and_load(tmp_path: Path):
    storage = DataStorage(data_dir=tmp_path)

    # Generate sample OHLCV data
    dates = pd.date_range("2024-01-01", periods=10, freq="B")
    mock_df = pd.DataFrame(
        {
            "Open": [100.0 + i for i in range(10)],
            "High": [105.0 + i for i in range(10)],
            "Low": [98.0 + i for i in range(10)],
            "Close": [102.0 + i for i in range(10)],
            "Volume": [1000000 + i * 1000 for i in range(10)],
        },
        index=dates,
    )

    file_path = storage.save_symbol("TESTSTOCK", mock_df)
    assert file_path.exists()
    assert file_path.name == "TESTSTOCK.parquet"

    # Load back
    loaded_df = storage.load_symbol("TESTSTOCK")
    assert not loaded_df.empty
    assert len(loaded_df) == 10
    assert "Symbol" in loaded_df.columns
    assert loaded_df["Symbol"].iloc[0] == "TESTSTOCK"
    assert loaded_df["Close"].iloc[0] == 102.0

    # Date filter test
    filtered_df = storage.load_symbol("TESTSTOCK", start_date="2024-01-05")
    assert len(filtered_df) < 10

    # Summary test
    summary = storage.get_storage_summary()
    assert len(summary) == 1
    assert summary[0]["symbol"] == "TESTSTOCK"
    assert summary[0]["rows"] == 10
