import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { groups } from "@/app/dashboard/groups-data";
import { buildProductManifest } from "@/app/dashboard/load-products";
import {
  RETAILERS,
  type PriceHistoryPoint,
  buildGridLines,
  buildPriceHistory,
  createProductKey,
  formatCurrency,
  formatDateLabel,
  getBasePrice,
  getImpactDescriptor,
  getLatestRetailerPrices,
} from "@/app/dashboard/pricing-helpers";

interface PricingPageParams {
  groupKey: string;
  companyKey: string;
  productFolder: string;
}

interface PricingPageProps {
  params: Promise<PricingPageParams>;
}

export default async function PricingPage({ params }: PricingPageProps) {
  const manifest = buildProductManifest(groups);
  const resolvedParams = await params;
  const groupKey = decodeURIComponent(resolvedParams.groupKey);
  const companyKey = decodeURIComponent(resolvedParams.companyKey);
  const productFolder = decodeURIComponent(resolvedParams.productFolder);

  const group = manifest.find((item) => item.groupKey === groupKey);
  if (!group) {
    notFound();
  }

  const company = group.companies.find((item) => item.companyKey === companyKey);
  if (!company) {
    notFound();
  }

  const product = company.products.find((item) => item.productFolder === productFolder);
  if (!product) {
    notFound();
  }

  const productKey = createProductKey(groupKey, companyKey, productFolder);
  const basePrice = getBasePrice(productKey);
  const impactDescriptor = getImpactDescriptor(productKey);
  const history = buildPriceHistory(productKey, basePrice);
  const latestPrices = getLatestRetailerPrices(history);
  const referencePrice = latestPrices.bhx || basePrice;
  const gridLines = buildGridLines(referencePrice);
  const heroImageFile = product.images[0];
  const heroImageSrc = heroImageFile
    ? buildProductImagePath(
        group.groupFolder,
        company.companyFolder,
        product.productFolder,
        heroImageFile
      )
    : null;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:text-cyan-900"
        >
          <span aria-hidden>←</span> Quay lại Dashboard
        </Link>

        <section className="rounded-3xl bg-gradient-to-br from-white via-slate-50 to-slate-100 p-8 shadow-lg ring-1 ring-slate-100">
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">
                Giá sản phẩm
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">{product.name}</h1>
              <p className="mt-1 text-sm text-slate-500">
                {company.companyName} · {group.groupName}
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {RETAILERS.map((retailer) => (
                  <div
                    key={retailer.key}
                    className="rounded-3xl border border-slate-100 bg-white/70 px-4 py-4 shadow-sm ring-1 ring-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-11 w-11 items-center justify-center rounded-2xl text-xs font-bold uppercase tracking-wide text-white"
                        style={{ backgroundColor: retailer.color }}
                      >
                        {retailer.logoText}
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          {retailer.shortLabel}
                        </p>
                        <p className="text-xl font-bold text-slate-900">
                          {formatCurrency(latestPrices[retailer.key])}
                        </p>
                        <p className="text-[11px] text-slate-400">Giá tham khảo realtime</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-wrap gap-6 text-sm text-slate-600">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Giá tham chiếu</p>
                  <p className="text-lg font-semibold text-slate-900">{formatCurrency(basePrice)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">Ảnh hưởng</p>
                  <p className="text-lg font-semibold text-slate-900">{impactDescriptor}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">SKU</p>
                  <p className="text-lg font-semibold text-slate-900">{product.sku}</p>
                </div>
              </div>
            </div>

            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-slate-50">
              {heroImageSrc ? (
                <Image
                  src={heroImageSrc}
                  alt={product.name}
                  fill
                  sizes="(min-width: 1024px) 380px, 100vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                  Chưa có hình sản phẩm
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-10">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:col-span-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Biểu đồ giá 2 tháng gần nhất</h2>
                <p className="text-sm text-slate-500">Mỗi cột hoành tương ứng 3 ngày, dữ liệu tối đa 2 tháng.</p>
              </div>
              <div className="text-xs text-slate-500">Đơn vị: đồng</div>
            </div>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4 shadow-inner">
              <div className="mx-auto w-full max-w-3xl">
                <PriceChart
                  history={history}
                  gridLines={gridLines}
                  referencePrice={referencePrice}
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-6 text-center text-slate-400 lg:col-span-4">
            Ô thứ 2 (đang để trống)
          </section>

          <section className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-6 text-center text-slate-400 lg:col-span-2">
            Ô thứ 3 (đang để trống)
          </section>
        </div>
      </div>
    </div>
  );
}

function buildProductImagePath(
  groupFolder: string,
  companyFolder: string,
  productFolder: string,
  fileName: string
) {
  return encodeURI(`/companies/${groupFolder}/${companyFolder}/${productFolder}/${fileName}`);
}

function PriceChart({
  history,
  gridLines,
  referencePrice,
}: {
  history: PriceHistoryPoint[];
  gridLines: number[];
  referencePrice: number;
}) {
  if (history.length === 0) {
    return <div className="py-20 text-center text-sm text-slate-500">Chưa có dữ liệu giá.</div>;
  }

  const width = 720;
  const height = 280;
  const paddingX = 60;
  const paddingY = 32;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const allValues = history.flatMap((point) => Object.values(point.values));
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

  const xLabels = history.filter((_, index) => index % 3 === 0 || index === history.length - 1);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
      <rect
        x={paddingX}
        y={paddingY}
        width={chartWidth}
        height={chartHeight}
        fill="url(#grid-bg)"
        rx={8}
      />

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

      {RETAILERS.map((retailer) => (
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
