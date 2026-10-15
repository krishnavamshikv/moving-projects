import { useEffect, useRef } from 'react';
import {
  createChart,
  ColorType,
  LineSeries,
  type IChartApi,
} from 'lightweight-charts';
import type { EquityPoint } from '../types';

interface MultiEquityChartProps {
  equityCurves: Record<string, EquityPoint[]>;
  height?: number;
}

const STRATEGY_COLORS = ['#06b6d4', '#f59e0b', '#a855f7', '#10b981', '#ec4899'];

export const MultiEquityChart = ({ equityCurves, height = 340 }: MultiEquityChartProps) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const strategyNames = Object.keys(equityCurves);

  useEffect(() => {
    if (!chartContainerRef.current || strategyNames.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0f172a' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: 'rgba(51, 65, 85, 0.3)' },
        horzLines: { color: 'rgba(51, 65, 85, 0.3)' },
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

    strategyNames.forEach((name, idx) => {
      const data = equityCurves[name];
      if (data && data.length > 0) {
        const lineSeries = chart.addSeries(LineSeries, {
          color: STRATEGY_COLORS[idx % STRATEGY_COLORS.length],
          lineWidth: 2,
          title: name,
        });

        const lineData = data.map((pt) => ({
          time: pt.time,
          value: pt.value,
        }));
        lineSeries.setData(lineData as any);
      }
    });

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
  }, [equityCurves, height]);

  return (
    <div className="w-full relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-xl p-4 space-y-3">
      {/* Chart Legend */}
      <div className="flex flex-wrap items-center gap-4 px-2">
        <span className="text-xs font-semibold uppercase text-slate-400">Strategies:</span>
        {strategyNames.map((name, idx) => (
          <div key={name} className="flex items-center gap-1.5 text-xs font-medium">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: STRATEGY_COLORS[idx % STRATEGY_COLORS.length] }}
            />
            <span className="text-slate-200">{name}</span>
          </div>
        ))}
      </div>

      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
};
