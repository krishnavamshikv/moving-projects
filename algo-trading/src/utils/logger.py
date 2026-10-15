"""Centralized logging configuration using Rich formatting."""

import logging
import sys
from rich.logging import RichHandler


def setup_logger(name: str = "algo_trading", level: int = logging.INFO) -> logging.Logger:
    """Configures and returns a styled logger instance."""
    logger = logging.getLogger(name)
    if not logger.handlers:
        handler = RichHandler(
            rich_tracebacks=True,
            show_time=True,
            show_level=True,
            show_path=False,
        )
        formatter = logging.Formatter("%(message)s")
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(level)
        logger.propagate = False
    return logger
