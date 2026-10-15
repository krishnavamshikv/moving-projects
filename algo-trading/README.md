# Nifty 100 Algo Trading App

A modular algorithmic trading platform engineered for Indian equities (Nifty 100 universe). Supports historical data ingestion, swing and intraday strategy backtesting, transaction cost modeling (STT, GST, Brokerage), and live execution with Zerodha Kite Connect.

---

## Features
- **Curated Universe**: Authoritative Nifty 100 constituent tracking with sector breakdowns.
- **Fast Parquet Storage**: Multi-year OHLCV caching in compressed Apache Parquet format.
- **Data Hygiene**: Automatic detection and handling of missing dates, timezone offsets, and null price values.
- **Diagnostics CLI**: Real-time cache status and detailed inspection of individual symbols.

---

## Directory Structure
```
algo-trading/
├── config/
│   └── nifty100.json          # Nifty 100 constituents, tickers, sectors
├── data/
│   └── daily/                 # Parquet cached historical OHLCV data
├── src/
│   ├── data/
│   │   ├── universe.py        # Universe management & sector filtering
│   │   ├── downloader.py      # Resilient yfinance downloader
│   │   └── storage.py         # Fast Parquet read/write manager
│   └── utils/
│       └── logger.py          # Rich-formatted logging
├── scripts/
│   ├── sync_data.py           # Sync Nifty 100 historical data
│   └── inspect_data.py        # Inspect data quality & coverage
├── tests/
│   └── test_data_pipeline.py  # Pipeline test suite
└── pyproject.toml             # Configuration & pytest settings
```

---

## Getting Started

### 1. Environment Activation
```bash
source .venv/bin/activate
```

### 2. Synchronize Historical Data
To download/update the historical data for all constituents:
```bash
python scripts/sync_data.py --start-date 2019-01-01
```

To sync a specific subset of symbols:
```bash
python scripts/sync_data.py --symbols RELIANCE,TCS,INFY,HDFCBANK
```

### 3. Inspect Cached Data
Check cache status across all 100 constituents:
```bash
python scripts/inspect_data.py
```

Inspect detailed price action and null checks for an individual stock:
```bash
python scripts/inspect_data.py --symbol RELIANCE
```

### 4. Running Tests
```bash
pytest
```
