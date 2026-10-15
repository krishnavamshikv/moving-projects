import { useEffect, useRef } from 'react';
import {
  createChart,
  ColorType,
  AreaSeries,
  type IChartApi,
} from 'lightweight-charts';
import type { EquityPoint } from '../types';

interface EquityChartProps {
  equityCurve: EquityPoint[];
  height?: number;
}

export const EquityChart = ({ equityCurve, height = 300 }: EquityChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !equityCurve || equityCurve.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0f172a' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: 'rgba(51, 65, 85, 0.3)' },
        horzLines: { color: 'rgba(51, 65, 85, 0.3)' },
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

    // Equity Area Series
    const areaSeries = chart.addSeries(AreaSeries, {
      topColor: 'rgba(6, 182, 212, 0.5)',
      bottomColor: 'rgba(6, 182, 212, 0.02)',
      lineColor: '#06b6d4',
      lineWidth: 2,
    });

    const equityData = equityCurve.map((point) => ({
      time: point.time,
      value: point.value,
    }));
    areaSeries.setData(equityData as any);

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
  }, [equityCurve, height]);

  return (
    <div className="w-full relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl">
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
};
