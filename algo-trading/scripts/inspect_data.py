#!/usr/bin/env python3
"""Inspect cached market data and check integrity."""

import argparse
import sys
from pathlib import Path
from rich.console import Console
from rich.table import Table

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from src.data.universe import NiftyUniverse
from src.data.storage import DataStorage

console = Console()


def main():
    parser = argparse.ArgumentParser(description="Inspect cached historical data.")
    parser.add_argument(
        "--symbol",
        type=str,
        default=None,
        help="Inspect specific symbol in detail (e.g. RELIANCE)",
    )
    args = parser.parse_args()

    universe = NiftyUniverse()
    storage = DataStorage()

    if args.symbol:
        sym = args.symbol.replace(".NS", "").upper()
        df = storage.load_symbol(sym)
        if df.empty:
            console.print(f"[red]No data found for symbol: {sym}[/red]")
            return

        meta = universe.get_stock(sym)
        company_name = meta["company_name"] if meta else "N/A"
        sector = meta["sector"] if meta else "N/A"

        console.print(f"\n[bold cyan]Symbol Detail: {sym}[/bold cyan] ({company_name} - {sector})")
        console.print(f"Total Bars: [green]{len(df):,}[/green]")
        console.print(f"Date Range: [yellow]{df.index.min().strftime('%Y-%m-%d')}[/yellow] to [yellow]{df.index.max().strftime('%Y-%m-%d')}[/yellow]")
        console.print(f"Null Values Check: {df.isna().sum().to_dict()}\n")

        table = Table(title=f"Recent 10 Trading Days for {sym}")
        table.add_column("Date", style="cyan")
        table.add_column("Open", justify="right")
        table.add_column("High", justify="right")
        table.add_column("Low", justify="right")
        table.add_column("Close", justify="right", style="bold green")
        table.add_column("Volume", justify="right")

        for idx, row in df.tail(10).iterrows():
            date_str = idx.strftime("%Y-%m-%d")
            table.add_row(
                date_str,
                f"{row['Open']:.2f}",
                f"{row['High']:.2f}",
                f"{row['Low']:.2f}",
                f"{row['Close']:.2f}",
                f"{int(row['Volume']):,}",
            )
        console.print(table)
        return

    # Overview table of all cached data
    summary = storage.get_storage_summary()
    all_symbols = set(universe.get_symbols())
    cached_symbols = {s["symbol"] for s in summary}
    missing_symbols = sorted(list(all_symbols - cached_symbols))

    table = Table(title=f"Nifty 100 Cache Status ({len(cached_symbols)} / {len(all_symbols)} Cached)")
    table.add_column("Symbol", style="cyan", no_wrap=True)
    table.add_column("Bars", justify="right", style="green")
    table.add_column("Start Date", justify="center")
    table.add_column("End Date", justify="center")
    table.add_column("Size (KB)", justify="right")

    for item in summary[:25]:  # show first 25
        table.add_row(
            item["symbol"],
            f"{item['rows']:,}",
            item["start_date"],
            item["end_date"],
            str(item["size_kb"]),
        )

    if len(summary) > 25:
        table.add_row(f"... and {len(summary) - 25} more", "-", "-", "-", "-")

    console.print(table)

    if missing_symbols:
        console.print(f"\n[bold yellow]Symbols Not Yet Cached ({len(missing_symbols)}):[/bold yellow]")
        console.print(", ".join(missing_symbols[:15]) + ("..." if len(missing_symbols) > 15 else ""))
    else:
        console.print("\n[bold green]✓ All 100 Nifty constituents are fully cached![/bold green]")


if __name__ == "__main__":
    main()
