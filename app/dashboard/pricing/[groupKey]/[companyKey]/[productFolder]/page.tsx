import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import PriceHistoryCard from "@/app/dashboard/pricing/_components/price-history-card";
import { groups } from "@/app/dashboard/groups-data";
import { buildProductManifest } from "@/app/dashboard/load-products";
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

  const promotions = buildPromotions(productKey);
  const competitorProducts = buildCompetitorProducts(product.name, product.sku, latestPrices);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto max-w-6xl space-y-6 px-6 py-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-700 hover:text-cyan-900"
        >
          <span aria-hidden>←</span> Quay lại Dashboard
        </Link>

        <ProductSnapshot
          productName={product.name}
          sku={product.sku}
          companyName={company.companyName}
          groupName={group.groupName}
          basePrice={basePrice}
          impactDescriptor={impactDescriptor}
          latestPrices={latestPrices}
          heroImageSrc={heroImageSrc}
        />

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
          <div className="space-y-6">
            <PriceHistoryCard
              history={history}
              gridLines={gridLines}
              referencePrice={referencePrice}
            />

            <ImpactTrendCard
              history={history}
              referencePrice={referencePrice}
              impactDescriptor={impactDescriptor}
              latestPrices={latestPrices}
            />
          </div>

          <PromoBoard promotions={promotions} />
        </div>

        <CompetitorShelf competitors={competitorProducts} />
      </div>
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
}: {
  productName: string;
  sku: string;
  companyName: string;
  groupName: string;
  basePrice: number;
  impactDescriptor: string;
  latestPrices: Record<RetailerKey, number>;
  heroImageSrc: string | null;
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
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Giá tham chiếu</dt>
              <dd className="text-2xl font-bold text-slate-900">{formatCurrency(basePrice)}</dd>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">Mức độ ảnh hưởng</dt>
              <dd className="text-2xl font-bold text-amber-800">{impactDescriptor}</dd>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Công ty</dt>
              <dd className="text-lg font-semibold text-slate-900">{companyName}</dd>
              <p className="text-xs text-slate-400">Nhà sản xuất</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm">
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Nhóm ngành</dt>
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
                    <p className="text-xl font-bold text-slate-900">
                      {formatCurrency(latestPrices[retailer.key])}
                    </p>
                    <p className="text-[11px] text-slate-400">Bản cập nhật mới nhất</p>
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
              Chưa có hình sản phẩm
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
};

function ImpactTrendCard({ history, referencePrice, impactDescriptor, latestPrices }: ImpactTrendCardProps) {
  if (history.length === 0) {
    return null;
  }

  const safeReference = referencePrice || 1;
  const series = history.map((point) => {
    const values = Object.values(point.values);
    const spread = Math.max(...values) - Math.min(...values);
    const score = Math.max(1, Math.round((spread / safeReference) * 100));
    return { date: point.date, score };
  });

  const scores = series.map((item) => item.score);
  const maxScore = Math.max(...scores, 1);
  const avgScore = Math.round(scores.reduce((sum, value) => sum + value, 0) / scores.length);
  const latestScore = scores[scores.length - 1] || 0;

  const volatileRetailerEntry = Object.entries(latestPrices).reduce(
    (acc, [key, price]) => {
      const delta = Math.abs(price - safeReference);
      if (delta > acc.delta) {
        return { key: key as RetailerKey, delta, price };
      }
      return acc;
    },
    { key: "bhx" as RetailerKey, delta: -1, price: latestPrices.bhx }
  );
  const volatileRetailer = RETAILERS.find((retailer) => retailer.key === volatileRetailerEntry.key);

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
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">Mức độ ảnh hưởng</p>
          <h2 className="text-xl font-bold text-slate-900">Chỉ số biến động giữa nhà bán lẻ</h2>
          <p className="text-sm text-slate-500">Dựa trên chênh lệch giá cao nhất và thấp nhất tại mỗi mốc thời gian.</p>
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
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">ĐIỂM TRUNG BÌNH</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{avgScore}%</p>
          <p>Biên độ dao động trung bình toàn thị trường.</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">CHỈ SỐ HIỆN TẠI</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{latestScore}%</p>
          <p>Mức ảnh hưởng ở mốc cập nhật mới nhất.</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">NHÀ BÁN LẺ CẦN LƯU Ý</p>
          <p className="mt-1 text-xl font-bold text-slate-900">{volatileRetailer?.shortLabel}</p>
          <p>
            {formatCurrency(volatileRetailerEntry.price)} · lệch {formatCurrency(
              Math.abs(volatileRetailerEntry.price - safeReference)
            )}
          </p>
        </div>
      </div>
    </section>
  );
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
