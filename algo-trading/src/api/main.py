"""FastAPI REST & SSE server for the Algo Trading platform."""

import asyncio
import json
from pathlib import Path
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from sse_starlette.sse import EventSourceResponse

from src.data.universe import NiftyUniverse
from src.data.storage import DataStorage
from src.data.downloader import DataDownloader
from src.backtest.engine import BacktestEngine
from src.backtest.strategies import EMACrossoverStrategy, RSIMeanReversionStrategy
from src.utils.logger import setup_logger

logger = setup_logger("fastapi_app")

app = FastAPI(
    title="Nifty 100 Algo Trading API",
    description="REST & SSE API for Indian Equities Backtesting and Market Data",
    version="1.0.0",
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

universe = NiftyUniverse()
storage = DataStorage()
downloader = DataDownloader(storage=storage)
engine = BacktestEngine()


class BacktestRequest(BaseModel):
    strategy: str = Field(..., description="Strategy key: 'EMA_CROSSOVER' or 'RSI_MEAN_REVERSION'")
    symbol: str = Field(..., description="NSE clean symbol e.g. RELIANCE, TCS")
    initial_capital: float = Field(default=100000.0, ge=1000.0)
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    stop_loss_pct: Optional[float] = Field(default=0.05, ge=0.01, le=0.50)
    take_profit_pct: Optional[float] = Field(default=0.15, ge=0.01, le=1.0)
    params: Dict[str, Any] = Field(default_factory=dict)


class StrategyConfig(BaseModel):
    name: str = Field(..., description="Display label e.g. 'Standard EMA (20/50)'")
    strategy: str = Field(..., description="'EMA_CROSSOVER' or 'RSI_MEAN_REVERSION'")
    stop_loss_pct: Optional[float] = 0.05
    take_profit_pct: Optional[float] = 0.15
    params: Dict[str, Any] = Field(default_factory=dict)


class CompareBacktestRequest(BaseModel):
    symbol: str = Field(..., description="NSE clean symbol e.g. RELIANCE")
    initial_capital: float = Field(default=100000.0, ge=1000.0)
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    strategies: List[StrategyConfig] = Field(..., min_length=2, max_length=5)


@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": "Nifty 100 Algo Platform"}


def get_stock_behavior_tag(symbol: str, sector: str) -> str:
    """Categorizes a stock into an intuitive trading behavior profile."""
    sym = symbol.upper()
    sec = sector.lower()

    # Defensive staples
    if any(k in sec for k in ["fast moving consumer goods", "healthcare", "consumer durables"]):
        return "Defensive"
    if sym in ["HINDUNILVR", "ITC", "DABUR", "CIPLA", "SUNPHARMA", "NESTLEIND", "COLPAL", "BRITANNIA"]:
        return "Defensive"

    # High Volatility / Momentum
    if any(k in sec for k in ["metals & mining", "power", "realty"]):
        return "High Volatility"
    if sym in ["ADANIENT", "ADANIPOWER", "ADANIGREEN", "BEL", "HAL", "TATAMOTORS", "TATAPOWER", "VEDL", "JSWSTEEL", "TATASTEEL", "ZOMATO"]:
        return "High Volatility"

    # Steady Trend / Quality Compounders (default for large-cap banking, IT, infra)
    return "Steady Trend"


@app.get("/api/universe")
def get_universe():
    """Returns all Nifty 100 constituents along with cache status and behavior tags."""
    cached_symbols = set(storage.get_available_symbols())
    df_univ = universe.to_dataframe()
    result = []
    for _, row in df_univ.iterrows():
        sym = row["symbol"]
        sec = row.get("sector", "")
        result.append({
            "symbol": sym,
            "ticker": row["ticker"],
            "company_name": row["company_name"],
            "sector": sec,
            "behavior_tag": get_stock_behavior_tag(sym, sec),
            "is_cached": sym in cached_symbols,
        })
    return {
        "total_constituents": len(result),
        "cached_count": len(cached_symbols),
        "constituents": result,
    }


@app.get("/api/candles/{symbol}")
def get_candles(
    symbol: str,
    start_date: Optional[str] = Query(None, description="Start date YYYY-MM-DD"),
    end_date: Optional[str] = Query(None, description="End date YYYY-MM-DD"),
):
    """Fetches historical candles formatted for TradingView Lightweight Charts."""
    clean_sym = symbol.replace(".NS", "").upper()
    df = storage.load_symbol(clean_sym, start_date=start_date, end_date=end_date)
    if df.empty:
        raise HTTPException(status_code=404, detail=f"No cached data found for symbol: {clean_sym}")

    candles = []
    volumes = []
    for dt, row in df.iterrows():
        time_str = dt.strftime("%Y-%m-%d")
        candles.append({
            "time": time_str,
            "open": round(float(row["Open"]), 2),
            "high": round(float(row["High"]), 2),
            "low": round(float(row["Low"]), 2),
            "close": round(float(row["Close"]), 2),
        })
        is_up = row["Close"] >= row["Open"]
        volumes.append({
            "time": time_str,
            "value": int(row["Volume"]),
            "color": "rgba(34, 197, 94, 0.4)" if is_up else "rgba(239, 68, 68, 0.4)",
        })

    meta = universe.get_stock(clean_sym)
    return {
        "symbol": clean_sym,
        "metadata": meta,
        "count": len(candles),
        "candles": candles,
        "volumes": volumes,
    }


@app.post("/api/backtest")
def run_backtest(req: BacktestRequest):
    """Executes a backtest on the specified stock and returns metrics and trade details."""
    clean_sym = req.symbol.replace(".NS", "").upper()
    df = storage.load_symbol(clean_sym, start_date=req.start_date, end_date=req.end_date)
    if df.empty:
        raise HTTPException(status_code=404, detail=f"No historical data cached for {clean_sym}")

    strat_key = req.strategy.upper()
    indicators_formatted: Dict[str, List[Dict[str, Any]]] = {}

    if strat_key == "EMA_CROSSOVER":
        fast = int(req.params.get("fast_period", 20))
        slow = int(req.params.get("slow_period", 50))
        signals, ind_dict = EMACrossoverStrategy.generate_signals(df, fast_period=fast, slow_period=slow)
    elif strat_key == "RSI_MEAN_REVERSION":
        rsi_len = int(req.params.get("rsi_period", 14))
        oversold = float(req.params.get("oversold", 30.0))
        overbought = float(req.params.get("overbought", 70.0))
        trend = int(req.params.get("trend_period", 200))
        signals, ind_dict = RSIMeanReversionStrategy.generate_signals(
            df,
            rsi_period=rsi_len,
            oversold=oversold,
            overbought=overbought,
            trend_period=trend,
        )
    else:
        raise HTTPException(status_code=400, detail=f"Unsupported strategy: {req.strategy}")

    # Format indicators for Lightweight Charts
    for name, series in ind_dict.items():
        line_data = []
        for dt, val in series.dropna().items():
            line_data.append({"time": dt.strftime("%Y-%m-%d"), "value": round(float(val), 2)})
        indicators_formatted[name] = line_data

    # Execute simulation
    result = engine.run(
        df=df,
        signals=signals,
        symbol=clean_sym,
        initial_capital=req.initial_capital,
        stop_loss_pct=req.stop_loss_pct,
        take_profit_pct=req.take_profit_pct,
    )

    res_dict = result.to_dict()
    res_dict["indicators"] = indicators_formatted
    return res_dict


@app.post("/api/backtest/compare")
def compare_strategies(req: CompareBacktestRequest):
    """Runs multiple strategies simultaneously on a stock and ranks them by Win Rate, Days to Target, and Returns."""
    clean_sym = req.symbol.replace(".NS", "").upper()
    df = storage.load_symbol(clean_sym, start_date=req.start_date, end_date=req.end_date)
    if df.empty:
        raise HTTPException(status_code=404, detail=f"No historical data cached for {clean_sym}")

    results = []
    equity_curves = {}

    for strat_cfg in req.strategies:
        strat_key = strat_cfg.strategy.upper()
        if strat_key == "EMA_CROSSOVER":
            fast = int(strat_cfg.params.get("fast_period", 20))
            slow = int(strat_cfg.params.get("slow_period", 50))
            signals, _ = EMACrossoverStrategy.generate_signals(df, fast_period=fast, slow_period=slow)
        elif strat_key == "RSI_MEAN_REVERSION":
            rsi_len = int(strat_cfg.params.get("rsi_period", 14))
            oversold = float(strat_cfg.params.get("oversold", 30.0))
            overbought = float(strat_cfg.params.get("overbought", 70.0))
            trend = int(strat_cfg.params.get("trend_period", 200))
            signals, _ = RSIMeanReversionStrategy.generate_signals(
                df,
                rsi_period=rsi_len,
                oversold=oversold,
                overbought=overbought,
                trend_period=trend,
            )
        else:
            continue

        res = engine.run(
            df=df,
            signals=signals,
            symbol=clean_sym,
            strategy_name=strat_cfg.name,
            initial_capital=req.initial_capital,
            stop_loss_pct=strat_cfg.stop_loss_pct,
            take_profit_pct=strat_cfg.take_profit_pct,
        )
        res_dict = res.to_dict()
        results.append(res_dict)
        equity_curves[strat_cfg.name] = res_dict["equity_curve"]

    if not results:
        raise HTTPException(status_code=400, detail="No valid strategies were executed")

    # Determine Winners
    highest_win_rate_winner = max(results, key=lambda x: x["win_rate_pct"])

    # Fastest to Target (among strategies that actually hit target)
    target_hitting = [r for r in results if r["avg_days_to_target"] > 0]
    fastest_target_winner = min(target_hitting, key=lambda x: x["avg_days_to_target"]) if target_hitting else None

    highest_return_winner = max(results, key=lambda x: x["total_return_pct"])

    return {
        "symbol": clean_sym,
        "strategy_count": len(results),
        "winners": {
            "highest_win_rate": {
                "name": highest_win_rate_winner["strategy_name"],
                "win_rate_pct": highest_win_rate_winner["win_rate_pct"],
                "total_return_pct": highest_win_rate_winner["total_return_pct"],
            },
            "fastest_target": {
                "name": fastest_target_winner["strategy_name"] if fastest_target_winner else "N/A",
                "avg_days_to_target": fastest_target_winner["avg_days_to_target"] if fastest_target_winner else 0,
                "target_hit_rate_pct": fastest_target_winner["target_hit_rate_pct"] if fastest_target_winner else 0,
            } if fastest_target_winner else None,
            "highest_return": {
                "name": highest_return_winner["strategy_name"],
                "total_return_pct": highest_return_winner["total_return_pct"],
            },
        },
        "rankings": sorted(results, key=lambda x: x["win_rate_pct"], reverse=True),
        "equity_curves": equity_curves,
    }


@app.get("/api/summary")
def get_storage_summary():
    """Returns local storage metrics and disk size."""
    summary = storage.get_storage_summary()
    total_bars = sum(s["rows"] for s in summary)
    total_size_kb = sum(s["size_kb"] for s in summary)
    return {
        "cached_symbols_count": len(summary),
        "total_bars_cached": total_bars,
        "total_storage_mb": round(total_size_kb / 1024, 2),
        "summary": summary,
    }


@app.get("/api/sync/stream")
async def sync_data_stream(
    symbols: Optional[str] = Query(None, description="Comma separated symbols or empty for all missing"),
    limit: Optional[int] = Query(None, description="Limit count"),
):
    """Server-Sent Events (SSE) streaming real-time sync progress."""

    async def event_generator():
        if symbols:
            target_syms = [s.strip().upper() for s in symbols.split(",") if s.strip()]
            tickers = [f"{s}.NS" for s in target_syms]
        else:
            cached = set(storage.get_available_symbols())
            all_tickers = universe.get_tickers()
            tickers = [t for t in all_tickers if t.replace(".NS", "") not in cached]
            if not tickers:
                tickers = all_tickers[:10]  # default to first 10 for refresh

        if limit:
            tickers = tickers[:limit]

        total = len(tickers)
        yield {
            "event": "start",
            "data": json.dumps({"total": total, "message": f"Starting sync for {total} symbols"}),
        }

        for idx, ticker in enumerate(tickers, 1):
            sym = ticker.replace(".NS", "")
            try:
                # Run sync in threadpool to avoid blocking async event loop
                loop = asyncio.get_event_loop()
                sym, success, rows = await loop.run_in_executor(
                    None, downloader.sync_ticker, ticker, "2019-01-01", None
                )
                yield {
                    "event": "progress",
                    "data": json.dumps({
                        "index": idx,
                        "total": total,
                        "symbol": sym,
                        "success": success,
                        "rows": rows,
                        "pct": round((idx / total) * 100, 1),
                    }),
                }
            except Exception as e:
                yield {
                    "event": "error",
                    "data": json.dumps({"index": idx, "symbol": sym, "error": str(e)}),
                }
            await asyncio.sleep(0.1)

        yield {
            "event": "complete",
            "data": json.dumps({"message": "Synchronization completed successfully!"}),
        }

    return EventSourceResponse(event_generator())


# Mount Frontend React build if available
dist_dir = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if dist_dir.exists():
    app.mount("/", StaticFiles(directory=str(dist_dir), html=True), name="static")
