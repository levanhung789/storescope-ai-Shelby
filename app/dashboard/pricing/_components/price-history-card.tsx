"use client";

import { useMemo, useState } from "react";

import {
  RETAILERS,
  formatCurrency,
  formatDateLabel,
  type PriceHistoryPoint,
} from "@/app/dashboard/pricing-helpers";

const RANGE_OPTIONS = {
  "3d": { label: "3 ng?y", points: 3 },
  "1w": { label: "1 tu廕吵", points: 7 },
  "1m": { label: "1 th獺ng", points: 30 },
} as const;

type RangeKey = keyof typeof RANGE_OPTIONS;

type PriceHistoryCardProps = {
  history: PriceHistoryPoint[];
  gridLines: number[];
  referencePrice: number;
  disabledRetailers?: RetailerKey[];
};

export default function PriceHistoryCard({ history, gridLines, referencePrice, disabledRetailers = [] }: PriceHistoryCardProps) {
  const [range, setRange] = useState<RangeKey>("1m");

  const filteredHistory = useMemo(() => {
    const limit = RANGE_OPTIONS[range].points;
    if (history.length <= limit) {
      return history;
    }
    return history.slice(history.length - limit);
  }, [history, range]);

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-600">Bi廙 ?廙?gi獺</p>
          <h2 className="text-xl font-bold text-slate-900">Ch廙 ph廕《 vi quan s獺t</h2>
          <p className="text-sm text-slate-500">
            So s獺nh bi廕積 ?廙g gi獺 gi廙畝 c獺c nh? b獺n l廕?theo t廙南g m廙 th廙 gian.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-100 p-1 text-sm font-semibold text-slate-600">
          {(Object.keys(RANGE_OPTIONS) as RangeKey[]).map((key) => {
            const option = RANGE_OPTIONS[key];
            const isActive = range === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setRange(key)}
                className={`rounded-xl px-3 py-2 transition ${
                  isActive ? "bg-slate-900 text-white shadow" : "hover:bg-white"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-slate-50 p-4 shadow-inner">
        <div className="mx-auto w-full max-w-3xl">
          <PriceChart
            history={filteredHistory}
            gridLines={gridLines}
            referencePrice={referencePrice}
            disabledRetailers={disabledRetailers}
          />
        </div>
      </div>
    </section>
  );
}

function PriceChart({
  history,
  gridLines,
  referencePrice,
  disabledRetailers = [],
}: {
  history: PriceHistoryPoint[];
  gridLines: number[];
  referencePrice: number;
  disabledRetailers?: RetailerKey[];
}) {
  const disabledSet = new Set(disabledRetailers);
  const activeRetailers = RETAILERS.filter((retailer) => !disabledSet.has(retailer.key));

  if (history.length === 0 || activeRetailers.length === 0) {
    return (
      <div className="py-20 text-center text-sm text-slate-500">Chưa có dữ liệu vì thiếu URL theo dõi.</div>
    );
  }

  const width = 720;
  const height = 280;
  const paddingX = 60;
  const paddingY = 32;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const allValues = history.flatMap((point) =>
    activeRetailers.map((retailer) => point.values[retailer.key])
  );
  const actualMin = Math.min(...allValues);
  const actualMax = Math.max(...allValues);
  const base = referencePrice || (actualMax + actualMin) / 2;
  const halfRange = Math.max(base * 0.15, actualMax - base, base - actualMin);
  const minValue = Math.max(0, base - halfRange - base * 0.05);
  const maxValue = base + halfRange + base * 0.05;
  const valueRange = maxValue - minValue || 1;
  const gridValues = gridLines.filter((value) => value >= minValue && value <= maxValue);
  const visibleGridLines = gridValues.length ? gridValues : [base];

  const pointsFor = (key: typeof RETAILERS[number]["key"]) => {
    if (history.length === 1) {
      const singleX = paddingX + chartWidth / 2;
      const singleY =
        paddingY + chartHeight - ((history[0].values[key] - minValue) / valueRange) * chartHeight;
      return `${singleX},${singleY}`;
    }

    return history
      .map((point, index) => {
        const ratio = history.length === 1 ? 0 : index / (history.length - 1);
        const x = paddingX + ratio * chartWidth;
        const y =
          paddingY + chartHeight - ((point.values[key] - minValue) / valueRange) * chartHeight;
        return `${x},${y}`;
      })
      .join(" ");
  };

  const xLabels = history.filter((_, index) => index % 2 === 0 || index === history.length - 1);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      <rect x={paddingX} y={paddingY} width={chartWidth} height={chartHeight} fill="url(#grid-bg)" rx={8} />

      <defs>
        <pattern id="grid-bg" width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill="#f8fafc" />
          <path d="M 0 12 L 12 12" stroke="#e2e8f0" strokeWidth="1" />
        </pattern>
      </defs>

      {visibleGridLines.map((value) => {
        const y = paddingY + chartHeight - ((value - minValue) / valueRange) * chartHeight;
        return (
          <g key={value}>
            <line x1={paddingX} x2={paddingX + chartWidth} y1={y} y2={y} stroke="#e2e8f0" strokeDasharray="4 6" />
            <text x={paddingX - 12} y={y + 4} textAnchor="end" className="fill-slate-500 text-[10px]">
              {formatCurrency(value)}
            </text>
          </g>
        );
      })}

      {activeRetailers.map((retailer) => (
        <polyline
          key={retailer.key}
          fill="none"
          stroke={retailer.color}
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
          points={pointsFor(retailer.key)}
        />
      ))}

      {xLabels.map((point) => {
        const index = history.indexOf(point);
        const ratio = history.length === 1 ? 0 : index / (history.length - 1);
        const x = paddingX + ratio * chartWidth;
        const label = formatDateLabel(point.date);
        return (
          <text key={point.date} x={x} y={height - 4} textAnchor="middle" className="fill-slate-500 text-[10px]">
            {label}
          </text>
        );
      })}
    </svg>
  );
}

