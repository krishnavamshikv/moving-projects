#!/usr/bin/env python3
"""CLI script to synchronize historical market data for Nifty 100 universe."""

import argparse
import sys
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from src.data.universe import NiftyUniverse
from src.data.downloader import DataDownloader
from src.data.storage import DataStorage
from src.utils.logger import setup_logger

logger = setup_logger("sync_cli")


def main():
    parser = argparse.ArgumentParser(description="Synchronize Nifty 100 historical data to local Parquet cache.")
    parser.add_argument(
        "--start-date",
        type=str,
        default="2019-01-01",
        help="Start date in YYYY-MM-DD format (default: 2019-01-01)",
    )
    parser.add_argument(
        "--end-date",
        type=str,
        default=None,
        help="End date in YYYY-MM-DD format (default: latest)",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Limit number of symbols to download (useful for quick testing)",
    )
    parser.add_argument(
        "--symbols",
        type=str,
        default=None,
        help="Comma-separated specific symbols to sync (e.g. RELIANCE,TCS,INFY)",
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=0.3,
        help="Delay between requests in seconds to prevent rate-limiting (default: 0.3s)",
    )

    args = parser.parse_args()

    universe = NiftyUniverse()
    storage = DataStorage()
    downloader = DataDownloader(storage=storage)

    if args.symbols:
        requested = [s.strip().upper() for s in args.symbols.split(",") if s.strip()]
        tickers = [f"{s}.NS" for s in requested]
        logger.info(f"Targeting custom symbol list: {requested}")
    else:
        tickers = universe.get_tickers()
        if args.limit:
            tickers = tickers[: args.limit]
            logger.info(f"Limiting download to first {args.limit} symbols.")

    results = downloader.sync_universe(
        tickers=tickers,
        start_date=args.start_date,
        end_date=args.end_date,
        batch_delay=args.delay,
    )

    print("\n" + "=" * 50)
    print("SYNC SUMMARY")
    print("=" * 50)
    print(f"Total Symbols Processed: {results['total']}")
    print(f"Successfully Cached:     {results['successful']}")
    print(f"Failed:                  {results['failed_count']}")
    if results["failed_symbols"]:
        print(f"Failed Symbols:          {', '.join(results['failed_symbols'])}")
    print(f"Total OHLCV Bars Cached: {results['total_rows']:,}")
    print("=" * 50)


if __name__ == "__main__":
    main()
