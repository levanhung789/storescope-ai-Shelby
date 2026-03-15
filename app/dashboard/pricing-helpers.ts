export type RetailerKey = "bhx" | "winmart" | "coopmart" | "mega" | "satra";

export const RETAILERS: {
  key: RetailerKey;
  label: string;
  shortLabel: string;
  color: string;
  logoText: string;
}[] = [
  {
    key: "bhx",
    label: "Giá Bách hoá Xanh",
    shortLabel: "Bách hoá Xanh",
    color: "#16a34a",
    logoText: "BHX",
  },
  { key: "winmart", label: "Giá WinMart", shortLabel: "WinMart", color: "#dc2626", logoText: "WM" },
  { key: "coopmart", label: "Giá Co.opmart", shortLabel: "Co.opmart", color: "#2563eb", logoText: "CO" },
  { key: "mega", label: "Giá MEGA", shortLabel: "MEGA", color: "#fbbf24", logoText: "MG" },
  { key: "satra", label: "Giá SatraFood", shortLabel: "SatraFood", color: "#f97316", logoText: "SF" },
];

export type PriceHistoryPoint = {
  date: string;
  values: Record<RetailerKey, number>;
};

const VI_CURRENCY = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number): string {
  return VI_CURRENCY.format(value);
}

export function createProductKey(groupKey: string, companyKey: string, productFolder: string) {
  return `${groupKey}::${companyKey}::${productFolder}`;
}

export function getBasePrice(productKey: string): number {
  const rand = createRandom(productKey);
  const base = 6000 + rand() * 60000;
  return Math.max(4000, Math.round(base / 100) * 100);
}

export function getImpactDescriptor(productKey: string): string {
  const options = ["Ổn định", "Tăng nhẹ", "Giảm nhẹ", "Biến động mạnh", "Cần theo dõi"];
  const rand = createRandom(`${productKey}-impact`);
  const index = Math.floor(rand() * options.length);
  return options[index];
}

export function buildPriceHistory(productKey: string, basePrice: number): PriceHistoryPoint[] {
  const rand = createRandom(`${productKey}-history`);
  const points: PriceHistoryPoint[] = [];
  const totalPoints = 10; // khoảng 1 tháng với bước 3 ngày
  const now = Date.now();

  for (let i = 0; i < totalPoints; i += 1) {
    const daysAgo = (totalPoints - 1 - i) * 3;
    const date = new Date(now - daysAgo * 24 * 60 * 60 * 1000);

    const values = RETAILERS.reduce((acc, retailer, idx) => {
      const volatility = 0.08 + idx * 0.01;
      const drift = (rand() - 0.5) * volatility;
      const bias = 1 + (idx - 2) * 0.03;
      const price = Math.max(2000, basePrice * (1 + drift) * bias * (0.96 + rand() * 0.08));
      acc[retailer.key] = Math.round(price / 100) * 100;
      return acc;
    }, {} as Record<RetailerKey, number>);

    points.push({ date: date.toISOString(), values });
  }

  return points;
}

export function getLatestRetailerPrices(history: PriceHistoryPoint[]): Record<RetailerKey, number> {
  const last = history[history.length - 1];
  if (!last) {
    return RETAILERS.reduce((acc, retailer) => {
      acc[retailer.key] = 0;
      return acc;
    }, {} as Record<RetailerKey, number>);
  }
  return last.values;
}

export function buildGridLines(referencePrice: number): number[] {
  const step = referencePrice / 5;
  return Array.from({ length: 5 }, (_, index) => Math.round(step * (index + 1) / 100) * 100);
}

export function formatDateLabel(dateString: string): string {
  const date = new Date(dateString);
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function createRandom(seedString: string) {
  let seed = hashString(seedString);
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };
}

function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0 || 1;
}
