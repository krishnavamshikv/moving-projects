"""Integration tests for FastAPI endpoints."""

from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_get_universe():
    response = client.get("/api/universe")
    assert response.status_code == 200
    data = response.json()
    assert data["total_constituents"] >= 100
    assert data["cached_count"] >= 100


def test_get_candles():
    response = client.get("/api/candles/RELIANCE")
    assert response.status_code == 200
    data = response.json()
    assert data["symbol"] == "RELIANCE"
    assert data["count"] > 1000
    assert "candles" in data
    assert "volumes" in data
    assert "open" in data["candles"][0]


def test_run_backtest_api():
    payload = {
        "strategy": "EMA_CROSSOVER",
        "symbol": "RELIANCE",
        "initial_capital": 100000.0,
        "stop_loss_pct": 0.05,
        "take_profit_pct": 0.15,
        "params": {"fast_period": 20, "slow_period": 50},
    }
    response = client.post("/api/backtest", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["symbol"] == "RELIANCE"
    assert "total_return_pct" in data
    assert "equity_curve" in data
    assert "trades" in data
    assert "indicators" in data
    assert "avg_days_to_target" in data
    assert "avg_holding_days" in data


def test_compare_strategies_api():
    payload = {
        "symbol": "RELIANCE",
        "initial_capital": 100000.0,
        "strategies": [
            {
                "name": "Standard (20/50)",
                "strategy": "EMA_CROSSOVER",
                "stop_loss_pct": 0.05,
                "take_profit_pct": 0.15,
                "params": {"fast_period": 20, "slow_period": 50},
            },
            {
                "name": "Conservative (50/200)",
                "strategy": "EMA_CROSSOVER",
                "stop_loss_pct": 0.08,
                "take_profit_pct": 0.25,
                "params": {"fast_period": 50, "slow_period": 200},
            },
        ],
    }
    response = client.post("/api/backtest/compare", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["symbol"] == "RELIANCE"
    assert data["strategy_count"] == 2
    assert "winners" in data
    assert "highest_win_rate" in data["winners"]
    assert "rankings" in data
    assert len(data["rankings"]) == 2
    assert "avg_days_to_target" in data["rankings"][0]
    assert "equity_curves" in data
