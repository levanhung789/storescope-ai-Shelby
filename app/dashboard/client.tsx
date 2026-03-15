"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ChangeEvent } from "react";

import type { CompanyWithProducts, GroupWithProducts, ProductRecord } from "./types";
import {
  createProductKey,
  formatCurrency,
  getBasePrice,
  getImpactDescriptor,
} from "./pricing-helpers";

type Language = "en" | "vi" | "zh";

type ProductCard = ProductRecord;

const content = {
  en: {
    brandSub: "Retail Intelligence Platform",
    overview: "Admin Dashboard",
    overviewDesc:
      "Manage food and beverage companies by sector and verify local product image mapping.",
    navDashboard: "Dashboard",
    navStores: "Companies",
    navZones: "Sectors",
    navInventory: "Products",
    navReports: "Reports",
    navSettings: "Settings",
    welcome: "Welcome back, Admin",
    search: "Search sector, company, product...",
    export: "Export Report",
    logout: "Log out",
    groupsTitle: "Industry Groups",
    groupsDesc: "Choose a sector, then choose a company in that sector.",
    sectorName: "Sector",
    companyName: "Company",
    companyCount: "Number of companies",
    selectedCompany: "Selected company",
    aiTitle: "AI Suggested Product Display",
    aiDesc:
      "This version reads local product images from your saved folder structure. Ajinomoto is configured first for validation.",
    productTitle: "AI Suggested Product Display",
    productDesc:
      "Products below are loaded from your local folder structure for the selected company.",
    priceLabel: "Product price",
    impactLabel: "Impact",
    matched: "Matched",
    review: "Review",
    missing: "Missing",
    packSpec: "Pack Spec",
    sku: "SKU",
    category: "Category",
    companyList: "Company List",
    companyListDesc: "The full list shown for the selected sector.",
    rank: "No.",
    action: "Action",
    open: "Open",
    noProducts: "No product data for this company yet.",
    imageCount: "images",
    noImage: "No image",
  },
  vi: {
    brandSub: "Nền tảng trí tuệ bán lẻ",
    overview: "Dashboard Quản Trị",
    overviewDesc:
      "Quản lý các công ty thực phẩm - đồ uống theo nhóm ngành và kiểm tra ánh xạ hình ảnh sản phẩm local.",
    navDashboard: "Dashboard",
    navStores: "Công ty",
    navZones: "Nhóm ngành",
    navInventory: "Sản phẩm",
    navReports: "Báo cáo",
    navSettings: "Cài đặt",
    welcome: "Chào mừng trở lại, Admin",
    search: "Tìm nhóm ngành, công ty, sản phẩm...",
    export: "Xuất báo cáo",
    logout: "Đăng xuất",
    groupsTitle: "Nhóm ngành",
    groupsDesc: "Chọn nhóm ngành trước, sau đó chọn công ty thuộc nhóm đó.",
    sectorName: "Nhóm ngành",
    companyName: "Tên công ty",
    companyCount: "Số lượng công ty",
    selectedCompany: "Công ty đang chọn",
    aiTitle: "Sản phẩm AI gợi ý hiển thị",
    aiDesc:
      "Phiên bản này đọc ảnh local từ đúng cấu trúc thư mục bạn đã lưu. Ajinomoto được cấu hình trước để kiểm tra độ chính xác.",
    productTitle: "Sản phẩm AI gợi ý hiển thị",
    productDesc:
      "Các sản phẩm bên dưới được lấy từ cấu trúc thư mục local của công ty đang chọn.",
    priceLabel: "Giá sản phẩm",
    impactLabel: "Ảnh hưởng",
    matched: "Khớp",
    review: "Cần kiểm tra",
    missing: "Thiếu dữ liệu",
    packSpec: "Quy cách",
    sku: "SKU",
    category: "Danh mục",
    companyList: "Danh sách công ty",
    companyListDesc: "Hiển thị đầy đủ danh sách công ty của nhóm ngành đang chọn.",
    rank: "STT",
    action: "Thao tác",
    open: "Mở",
    noProducts: "Chưa có dữ liệu sản phẩm cho công ty này.",
    imageCount: "ảnh",
    noImage: "Không có ảnh",
  },
  zh: {
    brandSub: "零售智能平台",
    overview: "管理仪表板",
    overviewDesc:
      "按行业管理食品饮料公司，并检查本地商品图片映射。",
    navDashboard: "仪表板",
    navStores: "公司",
    navZones: "行业组",
    navInventory: "商品",
    navReports: "报告",
    navSettings: "设置",
    welcome: "欢迎回来，管理员",
    search: "搜索行业、公司、商品...",
    export: "导出报告",
    logout: "退出登录",
    groupsTitle: "行业组",
    groupsDesc: "先选择行业组，再选择该行业中的公司。",
    sectorName: "行业组",
    companyName: "公司名称",
    companyCount: "公司数量",
    selectedCompany: "当前公司",
    aiTitle: "AI 建议商品展示",
    aiDesc:
      "此版本从你保存的本地文件夹结构读取图片，目前先准确配置 Ajinomoto 用于验证。",
    productTitle: "AI 建议商品展示",
    productDesc: "下方商品根据当前公司从本地文件夹结构中读取。",
    priceLabel: "商品价格",
    impactLabel: "影响",
    matched: "已匹配",
    review: "需检查",
    missing: "缺少数据",
    packSpec: "规格",
    sku: "SKU",
    category: "分类",
    companyList: "公司列表",
    companyListDesc: "显示当前行业组的完整公司列表。",
    rank: "序号",
    action: "操作",
    open: "打开",
    noProducts: "该公司暂无商品数据。",
    imageCount: "张",
    noImage: "无图片",
  },
};

function productImagePath(
  groupFolder: string,
  companyFolder: string,
  productFolder: string,
  fileName: string
) {
  return encodeURI(
    `/companies/${groupFolder}/${companyFolder}/${productFolder}/${fileName}`
  );
}

function ProductImageViewer({
  images,
  alt,
  badgeText,
  emptyText,
}: {
  images: string[];
  alt: string;
  badgeText: string;
  emptyText: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const safeImages = images ?? [];

  if (safeImages.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center bg-slate-100 text-sm text-slate-400">
        {emptyText}
      </div>
    );
  }

  const maxIndex = Math.max(safeImages.length - 1, 0);
  const currentIndex = Math.min(activeIndex, maxIndex);
  const currentImage = safeImages[currentIndex];

  const prevImage = () => {
    setActiveIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  };

  const nextImage = () => {
    setActiveIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <Image
          src={currentImage}
          alt={alt}
          fill
          sizes="(min-width: 1280px) 320px, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      <div className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold text-white">
        {badgeText}
      </div>

      {safeImages.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevImage}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-3 py-2 text-sm font-bold text-white transition hover:bg-black/75"
          >
            ‹
          </button>

          <button
            type="button"
            onClick={nextImage}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 px-3 py-2 text-sm font-bold text-white transition hover:bg-black/75"
          >
            ›
          </button>

          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-black/50 px-2 py-1">
            {safeImages.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 w-2.5 rounded-full ${
                  index === currentIndex ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function statusClass(status: ProductCard["aiStatus"]) {
  if (status === "Matched") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (status === "Review") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  return "border-red-200 bg-red-50 text-red-700";
}

type DashboardClientProps = {
  manifest: GroupWithProducts[];
};

export default function DashboardClient({ manifest }: DashboardClientProps) {
  const [language, setLanguage] = useState<Language>("vi");

  const initialGroupKey = manifest[0]?.groupKey ?? "";
  const initialCompanyKey = manifest[0]?.companies[0]?.companyKey ?? "";

  const [selectedGroupKey, setSelectedGroupKey] = useState(initialGroupKey);
  const [selectedCompanyKey, setSelectedCompanyKey] = useState(initialCompanyKey);

  const t = useMemo(() => content[language], [language]);

  const currentGroup = useMemo<GroupWithProducts | undefined>(() => {
    if (!manifest.length) {
      return undefined;
    }

    return manifest.find((item) => item.groupKey === selectedGroupKey) ?? manifest[0];
  }, [manifest, selectedGroupKey]);

  const currentCompany = useMemo<CompanyWithProducts | undefined>(() => {
    if (!currentGroup) {
      return undefined;
    }

    return (
      currentGroup.companies.find((item) => item.companyKey === selectedCompanyKey) ??
      currentGroup.companies[0]
    );
  }, [currentGroup, selectedCompanyKey]);

  const handleGroupChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const newGroupKey = event.target.value;
    setSelectedGroupKey(newGroupKey);

    const fallbackCompanyKey =
      manifest.find((item) => item.groupKey === newGroupKey)?.companies[0]?.companyKey ?? "";

    setSelectedCompanyKey(fallbackCompanyKey);
  };

  const productCards = useMemo(() => {
    if (!currentGroup || !currentCompany) {
      return [];
    }

    return currentCompany.products.map((product) => ({
      ...product,
      images: product.images.map((fileName) =>
        productImagePath(
          currentGroup.groupFolder,
          currentCompany.companyFolder,
          product.productFolder,
          fileName
        )
      ),
    }));
  }, [currentCompany, currentGroup]);

  const localizedStatus = (status: ProductCard["aiStatus"]) => {
    if (status === "Matched") return t.matched;
    if (status === "Review") return t.review;
    return t.missing;
  };

  if (!manifest.length || !currentGroup || !currentCompany) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
        <p>Không tìm thấy dữ liệu công ty trong thư mục public/companies.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 flex-col border-r border-slate-200 bg-slate-950 text-white lg:flex">
          <div className="border-b border-white/10 p-6">
            <div className="flex items-center gap-4">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 via-blue-500 to-slate-900 shadow-xl shadow-cyan-500/30 ring-1 ring-white/20">
                <div className="absolute inset-1 rounded-[20px] border border-white/20" />
                <div className="relative text-xl font-black text-white">S</div>
                <div className="absolute -right-1 -top-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-bold tracking-widest text-slate-900">
                  AI
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-extrabold tracking-tight">
                  Shelf<span className="text-cyan-300">Sight</span> AI
                </h1>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                  {t.brandSub}
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6">
            <div className="space-y-2">
              <div className="rounded-2xl bg-white/10 px-4 py-3 font-semibold text-cyan-200">
                {t.navDashboard}
              </div>
              <div className="rounded-2xl px-4 py-3 text-slate-300 transition hover:bg-white/5">
                {t.navStores}
              </div>
              <div className="rounded-2xl px-4 py-3 text-slate-300 transition hover:bg-white/5">
                {t.navZones}
              </div>
              <div className="rounded-2xl px-4 py-3 text-slate-300 transition hover:bg-white/5">
                {t.navInventory}
              </div>
              <div className="rounded-2xl px-4 py-3 text-slate-300 transition hover:bg-white/5">
                {t.navReports}
              </div>
              <div className="rounded-2xl px-4 py-3 text-slate-300 transition hover:bg-white/5">
                {t.navSettings}
              </div>
            </div>
          </nav>

          <div className="border-t border-white/10 p-4">
            <Link
              href="/"
              className="block rounded-2xl bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
            >
              {t.logout}
            </Link>
          </div>
        </aside>

        <main className="flex-1">
          <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="flex flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">
                  {t.overview}
                </p>
                <h2 className="mt-1 text-3xl font-bold text-slate-900">{t.welcome}</h2>
                <p className="mt-2 max-w-3xl text-sm text-slate-500">{t.overviewDesc}</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="text"
                  placeholder={t.search}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 sm:w-80"
                />

                <div className="grid grid-cols-3 rounded-2xl bg-slate-100 p-1">
                  <button
                    type="button"
                    onClick={() => setLanguage("en")}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      language === "en" ? "bg-slate-900 text-white shadow" : "text-slate-600 hover:bg-white"
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("vi")}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      language === "vi" ? "bg-slate-900 text-white shadow" : "text-slate-600 hover:bg-white"
                    }`}
                  >
                    VI
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage("zh")}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      language === "zh" ? "bg-slate-900 text-white shadow" : "text-slate-600 hover:bg-white"
                    }`}
                  >
                    中文
                  </button>
                </div>

                <button
                  type="button"
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  {t.export}
                </button>
              </div>
            </div>
          </header>

          <div className="p-6 lg:p-8">
            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h3 className="text-xl font-bold text-slate-900">{t.groupsTitle}</h3>
                <p className="mt-1 text-sm text-slate-500">{t.groupsDesc}</p>

                <div className="mt-6 space-y-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      {t.sectorName}
                    </label>
                    <select
                      value={selectedGroupKey}
                      onChange={handleGroupChange}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                    >
                      {manifest.map((group) => (
                        <option key={group.groupKey} value={group.groupKey}>
                          {group.groupName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      {t.companyName}
                    </label>
                    <select
                      value={selectedCompanyKey}
                      onChange={(e) => setSelectedCompanyKey(e.target.value)}
                      className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                    >
                      {currentGroup.companies.map((company) => (
                        <option key={company.companyKey} value={company.companyKey}>
                          {company.companyName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      {t.companyCount}
                    </label>
                    <input
                      type="text"
                      value={`${currentGroup.companies.length}`}
                      readOnly
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none"
                    />
                  </div>

                  <div className="rounded-3xl border border-cyan-100 bg-cyan-50 p-5">
                    <p className="text-sm font-semibold text-cyan-700">{t.aiTitle}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{t.aiDesc}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{t.productTitle}</h3>
                    <p className="mt-1 text-sm text-slate-500">{t.productDesc}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                    {t.selectedCompany}: {currentCompany.companyName}
                  </div>
                </div>

                <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {productCards.length > 0 ? (
                    productCards.map((product) => {
                      const productKey = createProductKey(
                        currentGroup.groupKey,
                        currentCompany.companyKey,
                        product.productFolder
                      );
                      const estimatedPrice = getBasePrice(productKey);
                      const priceDisplay = formatCurrency(estimatedPrice);
                      const impactDescriptor = getImpactDescriptor(productKey);
                      const priceHref = `/dashboard/pricing/${encodeURIComponent(
                        currentGroup.groupKey
                      )}/${encodeURIComponent(currentCompany.companyKey)}/${encodeURIComponent(
                        product.productFolder
                      )}`;

                      return (
                        <div
                          key={`${currentCompany.companyKey}-${product.productFolder}`}
                          data-testid="product-card"
                          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                        >
                          <ProductImageViewer
                            images={product.images}
                            alt={product.name}
                            badgeText={`${product.images.length} ${t.imageCount}`}
                            emptyText={t.noImage}
                          />

                          <div className="p-5">
                            <div className="mb-3 flex items-start justify-between gap-3">
                              <h4
                                data-testid="product-title"
                                className="line-clamp-2 text-base font-bold text-slate-900"
                              >
                                {product.name}
                              </h4>
                              <span
                                className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusClass(
                                  product.aiStatus
                                )}`}
                              >
                                {localizedStatus(product.aiStatus)}
                              </span>
                            </div>

                            <div className="space-y-2 text-sm text-slate-600">
                              <p>
                                <span className="font-semibold text-slate-800">{t.priceLabel}:</span>{" "}
                                <Link
                                  href={priceHref}
                                  className="font-semibold text-cyan-600 underline-offset-2 hover:text-cyan-700 hover:underline"
                                >
                                  {priceDisplay}
                                </Link>
                              </p>
                              <p>
                                <span className="font-semibold text-slate-800">{t.impactLabel}:</span>{" "}
                                {impactDescriptor}
                              </p>
                              <p>
                                <span className="font-semibold text-slate-800">{t.sku}:</span>{" "}
                                {product.sku}
                              </p>
                            </div>

                            <Link
                              href={priceHref}
                              className="mt-3 block w-full rounded-2xl bg-slate-900 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
                            >
                              {t.open}
                            </Link>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
                      {t.noProducts}
                    </div>
                  )}
                </div>
              </section>
            </div>

            <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{t.companyList}</h3>
                  <p className="mt-1 text-sm text-slate-500">{t.companyListDesc}</p>
                </div>
                <div className="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                  {currentGroup.companies.length} công ty
                </div>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-sm text-slate-500">
                      <th className="px-3 py-3 font-semibold">{t.rank}</th>
                      <th className="px-3 py-3 font-semibold">{t.companyName}</th>
                      <th className="px-3 py-3 font-semibold">{t.sectorName}</th>
                      <th className="px-3 py-3 font-semibold">{t.action}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentGroup.companies.map((company, index) => (
                      <tr key={company.companyKey} className="border-b border-slate-100 last:border-0">
                        <td className="px-3 py-4 font-semibold text-slate-900">{index + 1}</td>
                        <td className="px-3 py-4 font-semibold text-slate-900">
                          {company.companyName}
                        </td>
                        <td className="px-3 py-4 text-slate-600">{currentGroup.groupName}</td>
                        <td className="px-3 py-4">
                          <button
                            type="button"
                            onClick={() => setSelectedCompanyKey(company.companyKey)}
                            className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                          >
                            {t.open}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}