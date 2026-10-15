import { useEffect, useRef } from 'react';
import {
  createChart,
  ColorType,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  createSeriesMarkers,
  type IChartApi,
} from 'lightweight-charts';
import type { CandleData, VolumeData } from '../types';

interface Marker {
  time: string;
  position: 'aboveBar' | 'belowBar' | 'inBar';
  color: string;
  shape: 'arrowUp' | 'arrowDown' | 'circle';
  text: string;
}

interface CandleChartProps {
  candles: CandleData[];
  volumes?: VolumeData[];
  indicators?: Record<string, { time: string; value: number }[]>;
  markers?: Marker[];
  height?: number;
}

export const CandleChart = ({
  candles,
  volumes,
  indicators,
  markers,
  height = 480,
}: CandleChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0f172a' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: 'rgba(51, 65, 85, 0.4)' },
        horzLines: { color: 'rgba(51, 65, 85, 0.4)' },
      },
      crosshair: {
        vertLine: { color: '#64748b', width: 1, style: 2 },
        horzLine: { color: '#64748b', width: 1, style: 2 },
      },
      rightPriceScale: {
        borderColor: '#334155',
      },
      timeScale: {
        borderColor: '#334155',
        timeVisible: true,
      },
      height,
    });

    chartRef.current = chart;

    // Candlestick Series
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });
    candleSeries.setData(candles as any);

    // Volume Series
    if (volumes && volumes.length > 0) {
      const volumeSeries = chart.addSeries(HistogramSeries, {
        priceFormat: { type: 'volume' },
        priceScaleId: '', // overlay
      });
      volumeSeries.priceScale().applyOptions({
        scaleMargins: { top: 0.8, bottom: 0 },
      });
      volumeSeries.setData(volumes as any);
    }

    // Indicator Lines (EMAs, etc.)
    const indicatorColors = ['#06b6d4', '#f59e0b', '#a855f7', '#ec4899', '#3b82f6'];
    if (indicators) {
      let colorIdx = 0;
      Object.entries(indicators).forEach(([_, data]) => {
        if (data && data.length > 0) {
          const lineSeries = chart.addSeries(LineSeries, {
            color: indicatorColors[colorIdx % indicatorColors.length],
            lineWidth: 2,
          });
          lineSeries.setData(data as any);
          colorIdx++;
        }
      });
    }

    // Trade Markers
    if (markers && markers.length > 0) {
      createSeriesMarkers(candleSeries, markers as any);
    }

    chart.timeScale().fitContent();

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [candles, volumes, indicators, markers, height]);

  return (
    <div className="w-full relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
};
