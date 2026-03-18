import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import PriceHistoryCard from "@/app/dashboard/pricing/_components/price-history-card";
import { groups } from "@/app/dashboard/groups-data";
import { buildProductManifest } from "@/app/dashboard/load-products";
import { findCatalogRecord, type ProductCatalogRecord } from "@/app/dashboard/pricing/catalog-data";
import {
  RETAILERS,
  type RetailerKey,
  type PriceHistoryPoint,
  buildGridLines,
  buildPriceHistory,
  createProductKey,
  formatCurrency,
  getBasePrice,
  getImpactDescriptor,
  getLatestRetailerPrices,
} from "@/app/dashboard/pricing-helpers";

const PRODUCT_LANGUAGES = ["vi", "en", "zh"] as const;
type Language = (typeof PRODUCT_LANGUAGES)[number];
type RangeLabelMap = Record<"3d" | "1w" | "1m", string>;
type SnapshotCopy = {
  referencePrice: string;
  impact: string;
  company: string;
  group: string;
  retailerUpdated: string;
  retailerMissingUrl: string;
  retailerMissingPrice: string;
  heroNoImage: string;
};
type ChartCopy = {
  title: string;
  description: string;
  rangeLabels: RangeLabelMap;
  noData: string;
};
type ImpactCopy = {
  title: string;
  subtitle: string;
  description: string;
  avgLabel: string;
  avgDescription: string;
  currentLabel: string;
  currentDescription: string;
  focusLabel: string;
  focusDescription: string;
  focusNoData: string;
};
type ProductCopy = {
  backLink: string;
  snapshot: SnapshotCopy;
  chart: ChartCopy;
  impact: ImpactCopy;
};

const PRODUCT_COPY: Record<Language, ProductCopy> = {
  vi: {
    backLink: "Quay lại Dashboard",
    snapshot: {
      referencePrice: "Giá tham chiếu",
      impact: "Mức độ ảnh hưởng",
      company: "Công ty",
      group: "Nhóm ngành",
      retailerUpdated: "Bản cập nhật mới nhất",
      retailerMissingUrl: "Chưa có URL để theo dõi",
      retailerMissingPrice: "Chưa cập nhật",
      heroNoImage: "Chưa có hình sản phẩm",
    },
    chart: {
      title: "Biểu đồ giá",
      description: "So sánh biến động giá giữa các nhà bán lẻ theo từng mốc thời gian.",
      rangeLabels: { "3d": "3 ngày", "1w": "1 tuần", "1m": "1 tháng" },
      noData: "Chưa có dữ liệu vì thiếu URL theo dõi.",
    },
    impact: {
      title: "Mức độ ảnh hưởng",
      subtitle: "Chỉ số biến động giữa nhà bán lẻ",
      description: "Dựa trên chênh lệch giá cao nhất và thấp nhất tại mỗi mốc thời gian.",
      avgLabel: "ĐIỂM TRUNG BÌNH",
      avgDescription: "Biên độ dao động trung bình toàn thị trường.",
      currentLabel: "CHỈ SỐ HIỆN TẠI",
      currentDescription: "Mức ảnh hưởng ở mốc cập nhật mới nhất.",
      focusLabel: "NHÀ BÁN LẺ CẦN LƯU Ý",
      focusDescription: "Hiển thị nhà bán có mức chênh lệch lớn nhất so với giá tham chiếu.",
      focusNoData: "Chưa có dữ liệu.",
    },
  },
  en: {
    backLink: "Back to Dashboard",
    snapshot: {
      referencePrice: "Reference price",
      impact: "Impact level",
      company: "Company",
      group: "Sector",
      retailerUpdated: "Latest update",
      retailerMissingUrl: "URL not configured yet",
      retailerMissingPrice: "Not updated",
      heroNoImage: "No product image",
    },
    chart: {
      title: "Price chart",
      description: "Compare price movement across retailers over time.",
      rangeLabels: { "3d": "3 days", "1w": "1 week", "1m": "1 month" },
      noData: "No price data yet because the retailer URL is missing.",
    },
    impact: {
      title: "Impact index",
      subtitle: "Inter-retailer variability",
      description: "Based on the highest and lowest price spread at each timestamp.",
      avgLabel: "AVERAGE",
      avgDescription: "Market-wide average spread.",
      currentLabel: "CURRENT INDEX",
      currentDescription: "Latest recorded impact level.",
      focusLabel: "RETAILER TO WATCH",
      focusDescription: "Shows the retailer furthest away from the reference price.",
      focusNoData: "No data yet.",
    },
  },
  zh: {
    backLink: "返回仪表板",
    snapshot: {
      referencePrice: "参考价格",
      impact: "影响程度",
      company: "公司",
      group: "品类",
      retailerUpdated: "最近更新",
      retailerMissingUrl: "暂未配置链接",
      retailerMissingPrice: "尚未更新",
      heroNoImage: "暂无产品图片",
    },
    chart: {
      title: "价格走势",
      description: "比较各零售渠道在不同时间点的价格波动。",
      rangeLabels: { "3d": "3 天", "1w": "1 周", "1m": "1 个月" },
      noData: "因为缺少零售链接，暂时没有价格数据。",
    },
    impact: {
      title: "影响指数",
      subtitle: "渠道波动指数",
      description: "基于每个时间点最高价与最低价的差值。",
      avgLabel: "平均值",
      avgDescription: "全渠道平均波动幅度。",
      currentLabel: "当前指数",
      currentDescription: "最新时间点的影响程度。",
      focusLabel: "需关注的渠道",
      focusDescription: "显示偏离参考价最多的渠道。",
      focusNoData: "暂无数据。",
    },
  },
};

interface PricingPageParams {
  groupKey: string;
  companyKey: string;
  productFolder: string;
}

interface PricingPageProps {
  params: Promise<PricingPageParams>;
  searchParams?: { lang?: string };
}

type RetailerDisplayMap = Record<
  RetailerKey,
  {
    hasUrl: boolean;
    url?: string;
    label?: string;
  }
>;


export default async function PricingPage({ params, searchParams }: PricingPageProps) {
  const manifest = buildProductManifest(groups);
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ?? {};
  const requestedLanguage = resolvedSearchParams.lang ?? "vi";
  const language: Language = PRODUCT_LANGUAGES.includes(requestedLanguage as Language)
    ? (requestedLanguage as Language)
    : "vi";
  const copy = PRODUCT_COPY[language];

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

  const catalogRecord = findCatalogRecord(groupKey, companyKey, productFolder);
  const retailerDisplay = buildRetailerDisplayMap(catalogRecord);

  const productKey = createProductKey(groupKey, companyKey, productFolder);
  const basePrice = getBasePrice(productKey);
  const impactDescriptor = getImpactDescriptor(productKey);
  const history = buildPriceHistory(productKey, basePrice);
  const latestPrices = getLatestRetailerPrices(history);
  const referencePrice = latestPrices.bhx || basePrice;
  const gridLines = buildGridLines(referencePrice);
  const disabledRetailers = RETAILERS.filter((retailer) => !retailerDisplay[retailer.key].hasUrl).map(
    (retailer) => retailer.key
  );
  const heroImageFile = product.images[0];
  const heroImageSrc = heroImageFile
    ? buildProductImagePath(
        group.groupFolder,
        company.companyFolder,
        product.productFolder,
        heroImageFile
      )
    : null;

  const promotions = buildPromotions(productKey);
  const competitorProducts = buildCompetitorProducts(product.name, product.sku, latestPrices);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:text-cyan-900"
        >
          <span aria-hidden>←</span> {copy.backLink}
        </Link>

        <LanguageSwitcher
          language={language}
          groupKey={groupKey}
          companyKey={companyKey}
          productFolder={productFolder}
        />

        <ProductSnapshot
          productName={product.name}
          sku={product.sku}
          companyName={company.companyName}
          groupName={group.groupName}
          basePrice={basePrice}
          impactDescriptor={impactDescriptor}
          latestPrices={latestPrices}
          retailerDisplay={retailerDisplay}
          heroImageSrc={heroImageSrc}
          copy={copy.snapshot}
        />

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-6">
            <PriceHistoryCard
              history={history}
              gridLines={gridLines}
              referencePrice={referencePrice}
              disabledRetailers={disabledRetailers}
              copy={copy.chart}
            />

            <ImpactTrendCard
              history={history}
              referencePrice={referencePrice}
              impactDescriptor={impactDescriptor}
              latestPrices={latestPrices}
              disabledRetailers={disabledRetailers}
              copy={copy.impact}
            />
          </div>

          <PromoBoard promotions={promotions} />
        </div>

        <CompetitorShelf competitors={competitorProducts} />
      </div>
    </div>
  );
}

const LANGUAGE_OPTIONS: { code: Language; label: string }[] = [
  { code: "vi", label: "VI" },
  { code: "en", label: "EN" },
  { code: "zh", label: "中文" },
];

function LanguageSwitcher({
  language,
  groupKey,
  companyKey,
  productFolder,
}: {
  language: Language;
  groupKey: string;
  companyKey: string;
  productFolder: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {LANGUAGE_OPTIONS.map((option) => {
        const href = `/dashboard/pricing/${encodeURIComponent(groupKey)}/${encodeURIComponent(companyKey)}/${encodeURIComponent(
          productFolder
        )}?lang=${option.code}`;
        const isActive = option.code === language;

        return (
          <Link
            key={option.code}
            href={href}
            className={`rounded-xl px-3 py-1 text-sm font-semibold transition ${
              isActive ? "bg-slate-900 text-white shadow" : "text-slate-600 hover:bg-white"
            }`}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}

function ProductSnapshot({
  productName,
  sku,
  companyName,
  groupName,
  basePrice,
  impactDescriptor,
  latestPrices,
  heroImageSrc,
  retailerDisplay,
  copy,
}: {
  productName: string;
  sku: string;
  companyName: string;
  groupName: string;
  basePrice: number;
  impactDescriptor: string;
  latestPrices: Record<RetailerKey, number>;
  heroImageSrc: string | null;
  retailerDisplay: RetailerDisplayMap;
  copy: SnapshotCopy;
}) {
  return (
    <section className="rounded-[32px] bg-gradient-to-br from-white via-slate-50 to-slate-100 p-8 shadow-lg ring-1 ring-slate-100">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-cyan-600">SKU {sku}</p>
            <h1 className="mt-3 text-4xl font-bold text-slate-900">{productName}</h1>
            <p className="mt-2 text-base text-slate-500">
              {companyName} · {groupName}
            </p>
          </div>

          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{copy.referencePrice}</dt>
              <dd className="text-2xl font-bold text-slate-900">{formatCurrency(basePrice)}</dd>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">{copy.impact}</dt>
              <dd className="text-2xl font-bold text-amber-800">{impactDescriptor}</dd>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{copy.company}</dt>
              <dd className="text-lg font-semibold text-slate-900">{companyName}</dd>
              <p className="text-xs text-slate-400">Nhà sản xuất</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{copy.group}</dt>
              <dd className="text-lg font-semibold text-slate-900">{groupName}</dd>
              <p className="text-xs text-slate-400">Danh mục quan trắc</p>
            </div>
          </dl>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
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
                    <p
                      className={
                        "text-xl font-bold " +
                        (retailerDisplay[retailer.key].hasUrl ? "text-slate-900" : "text-amber-600")
                      }
                    >
                      {retailerDisplay[retailer.key].hasUrl
                        ? retailerDisplay[retailer.key].label ?? formatCurrency(latestPrices[retailer.key])
                        : copy.retailerMissingPrice}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {retailerDisplay[retailer.key].hasUrl ? copy.retailerUpdated : copy.retailerMissingUrl}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[320px] overflow-hidden rounded-3xl bg-slate-50">
          {heroImageSrc ? (
            <Image
              src={heroImageSrc}
              alt={productName}
              fill
              sizes="(min-width: 1024px) 420px, 100vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              {copy.heroNoImage}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

type ImpactTrendCardProps = {
  history: PriceHistoryPoint[];
  referencePrice: number;
  impactDescriptor: string;
  latestPrices: Record<RetailerKey, number>;
  disabledRetailers?: RetailerKey[];
  copy: ImpactCopy;
};

function ImpactTrendCard({ history, referencePrice, impactDescriptor, latestPrices, disabledRetailers = [], copy }: ImpactTrendCardProps) {
  if (history.length === 0) {
    return null;
  }

  const disabledSet = new Set(disabledRetailers);
  const activeRetailers = RETAILERS.filter((retailer) => !disabledSet.has(retailer.key));

  if (activeRetailers.length === 0) {
    return (
      <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <p className="text-sm text-slate-500">{copy.focusNoData}</p>
      </section>
    );
  }

  const safeReference = referencePrice || 1;
  const series = history.map((point) => {
    const values = activeRetailers.map((retailer) => point.values[retailer.key]);
    const spread = Math.max(...values) - Math.min(...values);
    const score = Math.max(1, Math.round((spread / safeReference) * 100));
    return { date: point.date, score };
  });

  const scores = series.map((item) => item.score);
  const maxScore = Math.max(...scores, 1);
  const avgScore = Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);
  const latestScore = scores[scores.length - 1] || 0;

  const volatileRetailerEntry = activeRetailers.reduce(
    (acc, retailer) => {
      const price = latestPrices[retailer.key];
      const delta = Math.abs(price - safeReference);
      if (!acc || delta > acc.delta) {
        return { key: retailer.key, delta, price };
      }
      return acc;
    },
    null as null | { key: RetailerKey; delta: number; price: number }
  );
  const volatileRetailer = volatileRetailerEntry
    ? RETAILERS.find((retailer) => retailer.key === volatileRetailerEntry.key)
    : undefined;

  const width = 420;
  const height = 200;
  const paddingX = 20;
  const paddingY = 20;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;

  const pathPoints = series.map((point, index) => {
    const ratio = series.length === 1 ? 0 : index / (series.length - 1);
    const x = paddingX + ratio * chartWidth;
    const y = paddingY + chartHeight - (point.score / maxScore) * chartHeight;
    return { x, y };
  });

  const linePath = pathPoints.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const areaPath = `${linePath} L ${paddingX + chartWidth} ${paddingY + chartHeight} L ${paddingX} ${paddingY + chartHeight} Z`;

  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">{copy.title}</p>
          <h2 className="text-xl font-bold text-slate-900">{copy.subtitle}</h2>
          <p className="text-sm text-slate-500">{copy.description}</p>
        </div>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
          {impactDescriptor}
        </span>
      </div>

      <div className="mt-6">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
          <defs>
            <linearGradient id="impact-gradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#fef3c7" stopOpacity="0" />
            </linearGradient>
          </defs>

          <path d={areaPath} fill="url(#impact-gradient)" />
          <path d={linePath} fill="none" stroke="#f59e0b" strokeWidth={3} strokeLinecap="round" />

          {pathPoints.map((point, index) => (
            <circle key={index} cx={point.x} cy={point.y} r={4} fill="#f59e0b" />
          ))}
        </svg>
      </div>

      <div className="mt-6 grid gap-4 text-sm text-slate-600 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{copy.avgLabel}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{avgScore}%</p>
          <p>{copy.avgDescription}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{copy.currentLabel}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{latestScore}%</p>
          <p>{copy.currentDescription}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{copy.focusLabel}</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{volatileRetailer?.shortLabel ?? "—"}</p>
          {volatileRetailerEntry ? (
            <p>
              {formatCurrency(volatileRetailerEntry.price)} · lệch{" "}
              {formatCurrency(Math.abs(volatileRetailerEntry.price - safeReference))}
            </p>
          ) : (
            <p>{copy.focusNoData}</p>
          )}
        </div>
      </div>
    </section>
  );
}

function buildRetailerDisplayMap(record?: ProductCatalogRecord): RetailerDisplayMap {
  const base = RETAILERS.reduce((acc, retailer) => {
    acc[retailer.key] = { hasUrl: false };
    return acc;
  }, {} as RetailerDisplayMap);

  if (!record) {
    return base;
  }

  const fieldMap: Record<RetailerKey, { urlField: string; priceField?: string }> = {
    bhx: { urlField: "BHX", priceField: "bhxPrice" },
    winmart: { urlField: "Winmart" },
    coopmart: { urlField: "Coop Mart" },
    mega: { urlField: "MEgA" },
    satra: { urlField: "satrafood" },
  };

  (Object.keys(fieldMap) as RetailerKey[]).forEach((key) => {
    const map = fieldMap[key];
    const rawUrl = map.urlField ? record[map.urlField] : undefined;
    const cleanedUrl = rawUrl?.trim();
    if (!cleanedUrl) {
      return;
    }

    const priceLabel = map.priceField ? record[map.priceField]?.trim() : undefined;
    base[key] = {
      hasUrl: true,
      url: cleanedUrl,
      label: priceLabel && priceLabel.length > 0 ? priceLabel : undefined,
    };
  });

  return base;
}

function PromoBoard({ promotions }: { promotions: PromotionInfo[] }) {
  return (
    <section className="flex h-full flex-col rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-600">Khuyến mãi đối thủ</p>
        <h2 className="text-xl font-bold text-slate-900">Chương trình đang triển khai</h2>
        <p className="text-sm text-slate-500">Tổng hợp ưu đãi đáng chú ý tại cùng phân khúc.</p>
      </div>

      <div className="mt-6 flex-1 space-y-4 overflow-auto pr-2">
        {promotions.map((promo) => (
          <div
            key={promo.id}
            className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 shadow-inner"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-2xl text-xs font-bold uppercase text-white"
                  style={{ backgroundColor: promo.color }}
                >
                  {promo.retailerCode}
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{promo.title}</p>
                  <p className="text-xs text-slate-500">{promo.retailer}</p>
                </div>
              </div>
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                {promo.status}
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-600">{promo.detail}</p>
            <div className="mt-4 grid gap-3 text-xs text-slate-500 sm:grid-cols-2">
              <div>
                <p className="font-semibold text-slate-700">Thời gian</p>
                <p>{promo.timeframe}</p>
              </div>
              <div>
                <p className="font-semibold text-slate-700">Kênh triển khai</p>
                <p>{promo.channel}</p>
              </div>
            </div>
            <div className="mt-3 rounded-2xl border border-dashed border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900">
              {promo.highlight}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CompetitorShelf({ competitors }: { competitors: CompetitorProduct[] }) {
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Đối thủ trực tiếp</p>
          <h2 className="text-xl font-bold text-slate-900">Hình ảnh & giá bán sản phẩm cạnh tranh</h2>
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Cập nhật mỗi 6 giờ
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {competitors.map((item) => (
          <div key={item.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4 shadow-inner">
            <div className="relative h-40 w-full overflow-hidden rounded-2xl">
              <Image
                src={item.image}
                alt={item.retailer}
                fill
                sizes="(min-width: 1024px) 300px, 100vw"
                className="object-cover"
              />
              <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700">
                {item.retailer}
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold text-slate-500">SKU {item.sku}</p>
              <p className="text-2xl font-bold text-slate-900">{item.price}</p>
              <p className="text-sm text-slate-600">{item.note}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

type PromotionInfo = {
  id: string;
  retailer: string;
  retailerCode: string;
  title: string;
  detail: string;
  timeframe: string;
  channel: string;
  status: string;
  highlight: string;
  color: string;
};

type CompetitorProduct = {
  id: string;
  retailer: string;
  sku: string;
  price: string;
  note: string;
  image: string;
};

function buildPromotions(productKey: string): PromotionInfo[] {
  const baseDate = new Date();

  return RETAILERS.map((retailer, index) => {
    const start = shiftDate(baseDate, index * 2 - 2);
    const end = shiftDate(start, 4 + (index % 2) * 2);
    const status = index % 3 === 0 ? "Sắp diễn ra" : "Đang chạy";
    const highlight = `${10 + index * 3}% off toàn danh mục`;
    const channel = index % 2 === 0 ? "Omni-channel" : "Online + in-app";

    return {
      id: `${productKey}-promo-${retailer.key}`,
      retailer: retailer.shortLabel,
      retailerCode: retailer.logoText,
      title: `Flash sale ${retailer.shortLabel}`,
      detail:
        index % 2 === 0
          ? "Combo 2 sản phẩm - giảm thêm 15% so với niêm yết."
          : "Ưu đãi giờ vàng, áp dụng tối đa 3 SKU cùng nhóm.",
      timeframe: `${formatDate(start)} - ${formatDate(end)}`,
      channel,
      status,
      highlight,
      color: retailer.color,
    };
  });
}

function buildCompetitorProducts(
  productName: string,
  sku: string,
  latestPrices: Record<RetailerKey, number>
): CompetitorProduct[] {
  const imagePool = [
    "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1514996937319-344454492b37?auto=format&fit=crop&w=900&q=80",
  ];

  return RETAILERS.map((retailer, index) => {
    const price = latestPrices[retailer.key] || 0;
    const adjustedPrice = price ? price * (0.95 + index * 0.02) : 0;
    return {
      id: `${retailer.key}-${sku}`,
      retailer: retailer.shortLabel,
      sku: `${sku}-${index + 1}`,
      price: formatCurrency(Math.round(adjustedPrice / 100) * 100),
      note: `${productName} phiên bản dành cho ${retailer.shortLabel}`,
      image: imagePool[index % imagePool.length],
    };
  });
}

function buildProductImagePath(
  groupFolder: string,
  companyFolder: string,
  productFolder: string,
  fileName: string
) {
  return encodeURI(`/companies/${groupFolder}/${companyFolder}/${productFolder}/${fileName}`);
}

function shiftDate(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDate(date: Date) {
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
}
