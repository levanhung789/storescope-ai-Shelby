"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Download, Globe2, ImagePlus, Languages, ScanSearch, ShieldCheck, Sparkles, TableProperties } from "lucide-react";
import * as XLSX from "xlsx";

type Language = "en" | "vi" | "zh";

type AnalysisRow = {
  label: string;
  value: string | number;
  group: string;
};

type AnalysisResult = {
  fileName: string;
  width: number;
  height: number;
  aspectRatio: string;
  sizeKb: number;
  estimatedQuality: string;
  sceneType: string;
  lighting: string;
  sharpness: string;
  compliance: string;
  recommendations: string[];
  rows: AnalysisRow[];
};

type UploadInfo = {
  txHash: string | null;
  blobUrl: string | null;
  explorerUrl: string | null;
  blobName: string | null;
};

const content = {
  en: {
    title: "Professional Image Analysis",
    subtitle: "Upload retail images, inspect quality, extract structured observations, and export results to Excel.",
    back: "Back to dashboard",
    lang: "Language",
    heroBadge: "AI-ready analysis workspace",
    uploadTitle: "Upload image",
    uploadDesc: "Supports shelf photos, invoices, merchandising captures, and store execution evidence.",
    dropzone: "Click or drop an image here",
    fileHint: "Best results with clear JPG, PNG, or WEBP images.",
    analyze: "Analyze image",
    analyzing: "Analyzing...",
    export: "Export Excel",
    preview: "Preview",
    summary: "Analysis summary",
    recommendations: "Recommendations",
    table: "Structured result table",
    uploadShelby: "Upload to Shelby",
    uploadingShelby: "Uploading to Shelby...",
    walletRequired: "Please connect Petra wallet before uploading to Shelby.",
    uploadSuccess: "Image uploaded to Shelby successfully.",
    uploadFailed: "Shelby upload failed.",
    viewAptos: "View on Aptos Explorer",
    viewBlob: "View Blob on Shelby",
    viewShelby: "View Blobs on Shelby",
    empty: "No analysis yet. Upload an image to begin.",
    metaImage: "Image",
    metaQuality: "Quality",
    metaScene: "Scene",
    metaCompliance: "Compliance",
    qualityHigh: "High",
    qualityMedium: "Medium",
    qualityLow: "Low",
    sceneShelf: "Shelf display",
    sceneDocument: "Document / invoice",
    sceneGeneral: "General retail capture",
    lightGood: "Balanced lighting",
    lightMedium: "Moderate lighting",
    lightLow: "Low lighting",
    sharpGood: "Sharp",
    sharpMedium: "Moderate",
    sharpLow: "Needs retake",
    complianceGood: "Ready for reporting",
    complianceWarn: "Needs manual review",
    recommendation1: "Ensure the hero product is centered and unobstructed.",
    recommendation2: "Capture from a slightly wider angle for shelf context.",
    recommendation3: "Improve lighting consistency to reduce shadows.",
    groupFile: "File",
    groupTech: "Technical",
    groupVision: "Visual assessment",
    groupOps: "Operational output",
    colMetric: "Metric",
    colValue: "Value",
    colGroup: "Group",
  },
  vi: {
    title: "Phân tích hình ảnh chuyên nghiệp",
    subtitle: "Tải ảnh bán lẻ lên, kiểm tra chất lượng, trích xuất nhận định có cấu trúc và xuất kết quả ra Excel.",
    back: "Quay lại dashboard",
    lang: "Ngôn ngữ",
    heroBadge: "Không gian phân tích sẵn sàng cho AI",
    uploadTitle: "Tải hình ảnh lên",
    uploadDesc: "Hỗ trợ ảnh quầy kệ, hóa đơn, ảnh trưng bày và bằng chứng kiểm tra tại điểm bán.",
    dropzone: "Nhấp hoặc thả hình ảnh vào đây",
    fileHint: "Kết quả tốt nhất với ảnh JPG, PNG hoặc WEBP rõ nét.",
    analyze: "Phân tích hình ảnh",
    analyzing: "Đang phân tích...",
    export: "Xuất Excel",
    preview: "Xem trước",
    summary: "Tóm tắt phân tích",
    recommendations: "Khuyến nghị",
    table: "Bảng kết quả có cấu trúc",
    uploadShelby: "Tải lên Shelby",
    uploadingShelby: "Đang tải lên Shelby...",
    walletRequired: "Vui lòng kết nối ví Petra trước khi tải lên Shelby.",
    uploadSuccess: "Đã tải hình lên Shelby thành công.",
    uploadFailed: "Tải lên Shelby thất bại.",
    viewAptos: "Xem trên Aptos Explorer",
    viewBlob: "Xem blob trên Shelby",
    viewShelby: "Xem blobs trên Shelby",
    empty: "Chưa có kết quả phân tích. Hãy tải ảnh lên để bắt đầu.",
    metaImage: "Hình ảnh",
    metaQuality: "Chất lượng",
    metaScene: "Ngữ cảnh",
    metaCompliance: "Mức sẵn sàng",
    qualityHigh: "Cao",
    qualityMedium: "Trung bình",
    qualityLow: "Thấp",
    sceneShelf: "Quầy kệ trưng bày",
    sceneDocument: "Tài liệu / hóa đơn",
    sceneGeneral: "Ảnh bán lẻ tổng quát",
    lightGood: "Ánh sáng cân bằng",
    lightMedium: "Ánh sáng trung bình",
    lightLow: "Thiếu sáng",
    sharpGood: "Sắc nét",
    sharpMedium: "Tạm ổn",
    sharpLow: "Nên chụp lại",
    complianceGood: "Sẵn sàng đưa vào báo cáo",
    complianceWarn: "Cần kiểm tra thủ công",
    recommendation1: "Đảm bảo sản phẩm chính nằm giữa ảnh và không bị che khuất.",
    recommendation2: "Chụp rộng hơn một chút để có thêm bối cảnh quầy kệ.",
    recommendation3: "Cải thiện độ đồng đều ánh sáng để giảm bóng đổ.",
    groupFile: "Tệp",
    groupTech: "Kỹ thuật",
    groupVision: "Đánh giá hình ảnh",
    groupOps: "Đầu ra nghiệp vụ",
    colMetric: "Chỉ số",
    colValue: "Giá trị",
    colGroup: "Nhóm",
  },
  zh: {
    title: "专业图像分析",
    subtitle: "上传零售图像，检查质量，提取结构化结论，并将结果导出为 Excel。",
    back: "返回仪表板",
    lang: "语言",
    heroBadge: "面向 AI 的分析工作台",
    uploadTitle: "上传图像",
    uploadDesc: "支持货架照片、发票、陈列照片以及门店执行证明。",
    dropzone: "点击或拖拽图像到这里",
    fileHint: "建议使用清晰的 JPG、PNG 或 WEBP 图像。",
    analyze: "分析图像",
    analyzing: "分析中...",
    export: "导出 Excel",
    preview: "预览",
    summary: "分析摘要",
    recommendations: "建议",
    table: "结构化结果表",
    uploadShelby: "上传到 Shelby",
    uploadingShelby: "正在上传到 Shelby...",
    walletRequired: "上传到 Shelby 前请先连接 Petra 钱包。",
    uploadSuccess: "图像已成功上传到 Shelby。",
    uploadFailed: "上传到 Shelby 失败。",
    viewAptos: "在 Aptos Explorer 中查看",
    viewBlob: "查看 Shelby Blob",
    viewShelby: "查看 Shelby Blobs",
    empty: "暂无分析结果。请先上传图像。",
    metaImage: "图像",
    metaQuality: "质量",
    metaScene: "场景",
    metaCompliance: "可报告性",
    qualityHigh: "高",
    qualityMedium: "中",
    qualityLow: "低",
    sceneShelf: "货架陈列",
    sceneDocument: "文档 / 发票",
    sceneGeneral: "零售场景图像",
    lightGood: "光线均衡",
    lightMedium: "光线一般",
    lightLow: "光线不足",
    sharpGood: "清晰",
    sharpMedium: "一般",
    sharpLow: "建议重拍",
    complianceGood: "可直接进入报告",
    complianceWarn: "需要人工复核",
    recommendation1: "确保主商品位于画面中央且无遮挡。",
    recommendation2: "适当扩大拍摄范围以保留货架上下文。",
    recommendation3: "改善光照一致性以减少阴影。",
    groupFile: "文件",
    groupTech: "技术",
    groupVision: "视觉评估",
    groupOps: "业务输出",
    colMetric: "指标",
    colValue: "值",
    colGroup: "分组",
  },
} as const;

function inferScene(fileName: string, t: (typeof content)[Language]) {
  const lower = fileName.toLowerCase();
  if (lower.includes("invoice") || lower.includes("receipt") || lower.includes("bill")) {
    return t.sceneDocument;
  }
  if (lower.includes("shelf") || lower.includes("store") || lower.includes("display")) {
    return t.sceneShelf;
  }
  return t.sceneGeneral;
}

export default function ImageAnalysisPage() {
  const { connected, connect, account, disconnect } = useWallet();
  const [language, setLanguage] = useState<Language>("en");
  const t = useMemo(() => content[language], [language]);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [uploadInfo, setUploadInfo] = useState<UploadInfo>({ txHash: null, blobUrl: null, explorerUrl: null, blobName: null });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploadingShelby, setIsUploadingShelby] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setFile(selected);
    setResult(null);
    setUploadInfo({ txHash: null, blobUrl: null, explorerUrl: null, blobName: null });

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    if (selected) {
      setPreviewUrl(URL.createObjectURL(selected));
    } else {
      setPreviewUrl(null);
    }
  };

  const analyzeImage = async () => {
    if (!file) return;
    setIsAnalyzing(true);

    try {
      const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = reject;
        img.src = previewUrl ?? URL.createObjectURL(file);
      });

      const sizeKb = Math.round(file.size / 1024);
      const aspectRatio = `${dimensions.width}:${dimensions.height}`;
      const largerSide = Math.max(dimensions.width, dimensions.height);
      const estimatedQuality = largerSide >= 1800 ? t.qualityHigh : largerSide >= 900 ? t.qualityMedium : t.qualityLow;
      const lighting = largerSide >= 1400 ? t.lightGood : largerSide >= 800 ? t.lightMedium : t.lightLow;
      const sharpness = largerSide >= 1600 ? t.sharpGood : largerSide >= 1000 ? t.sharpMedium : t.sharpLow;
      const sceneType = inferScene(file.name, t);
      const compliance = estimatedQuality === t.qualityLow ? t.complianceWarn : t.complianceGood;
      const recommendations = [t.recommendation1, t.recommendation2, t.recommendation3];

      const rows: AnalysisRow[] = [
        { label: "File name", value: file.name, group: t.groupFile },
        { label: "File size (KB)", value: sizeKb, group: t.groupFile },
        { label: "Width", value: dimensions.width, group: t.groupTech },
        { label: "Height", value: dimensions.height, group: t.groupTech },
        { label: "Aspect ratio", value: aspectRatio, group: t.groupTech },
        { label: "Estimated quality", value: estimatedQuality, group: t.groupVision },
        { label: "Lighting", value: lighting, group: t.groupVision },
        { label: "Sharpness", value: sharpness, group: t.groupVision },
        { label: "Scene type", value: sceneType, group: t.groupVision },
        { label: "Reporting readiness", value: compliance, group: t.groupOps },
      ];

      setResult({
        fileName: file.name,
        width: dimensions.width,
        height: dimensions.height,
        aspectRatio,
        sizeKb,
        estimatedQuality,
        sceneType,
        lighting,
        sharpness,
        compliance,
        recommendations,
        rows,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportExcel = () => {
    if (!result) return;
    const worksheet = XLSX.utils.json_to_sheet(result.rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Analysis");
    const safeName = result.fileName.replace(/\.[^/.]+$/, "");
    XLSX.writeFile(workbook, `${safeName}-analysis.xlsx`);
  };

  const handleConnectWallet = async () => {
    try {
      await connect("Petra" as any);
      window.open("https://explorer.shelby.xyz/shelbynet", "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Wallet connection rejected or failed:", error);
    }
  };

  const uploadToShelby = async () => {
    if (!file) return;
    if (!connected || !account) {
      alert(t.walletRequired);
      return;
    }

    setIsUploadingShelby(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("metadata", JSON.stringify({ source: "image-analysis", uploader: account.address.toString() }));

      const res = await fetch("/api/blockchain-upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t.uploadFailed);
      }

      const originalNameNoExt = file.name.replace(/\.[^/.]+$/, "");
      const blobName = data?.data?.blobName ?? `${originalNameNoExt}.webp`;
      const blobUrl = data?.data?.url ?? `https://api.shelbynet.shelby.xyz/shelby/v1/blobs/${account.address}/${originalNameNoExt}.webp`;
      const explorerUrl = data?.data?.explorerUrl ?? `https://explorer.shelby.xyz/shelbynet/account/${account.address}/blobs?name=${originalNameNoExt}.webp`;

      setUploadInfo({
        txHash: data?.data?.transactionHash ?? null,
        blobUrl,
        explorerUrl,
        blobName,
      });

      alert(t.uploadSuccess);
    } catch (error) {
      console.error(error);
      alert(t.uploadFailed);
    } finally {
      setIsUploadingShelby(false);
    }
  };

  const statCards = result
    ? [
        { icon: ImagePlus, label: t.metaImage, value: result.fileName },
        { icon: Sparkles, label: t.metaQuality, value: result.estimatedQuality },
        { icon: ScanSearch, label: t.metaScene, value: result.sceneType },
        { icon: ShieldCheck, label: t.metaCompliance, value: result.compliance },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-cyan-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
              <Sparkles className="h-4 w-4" />
              {t.heroBadge}
            </div>
            <h1 className="text-4xl font-black tracking-tight">{t.title}</h1>
            <p className="mt-3 max-w-3xl text-slate-600">{t.subtitle}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href="/dashboard" className="rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              {t.back}
            </Link>
            <div className="flex items-center gap-2 rounded-2xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
              <div className="px-3 text-slate-500"><Languages className="h-4 w-4" /></div>
              {(["en", "vi", "zh"] as Language[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${language === lang ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  {lang === "zh" ? "中文" : lang.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 z-[100]">
              {!connected ? (
                <button
                  type="button"
                  onClick={handleConnectWallet}
                  className="rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 flex items-center gap-2 shadow-sm"
                >
                  Connect Petra Wallet
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => disconnect()}
                  className="rounded-2xl border border-cyan-600 bg-cyan-50 px-5 py-3 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100 flex items-center gap-2 group relative shadow-sm"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
                  {account?.address?.toString().slice(0, 4)}...{account?.address?.toString().slice(-4)}
                  <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 rounded bg-slate-800 px-2 py-1 text-[10px] text-white opacity-0 transition group-hover:opacity-100 whitespace-nowrap z-[100]">Disconnect wallet</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-cyan-100 p-3 text-cyan-700"><Globe2 className="h-5 w-5" /></div>
              <div>
                <h2 className="text-xl font-bold">{t.uploadTitle}</h2>
                <p className="text-sm text-slate-500">{t.uploadDesc}</p>
              </div>
            </div>

            <label className="flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 text-center transition hover:border-cyan-400 hover:bg-cyan-50/50">
              <ImagePlus className="mb-4 h-10 w-10 text-slate-400" />
              <span className="text-lg font-semibold">{t.dropzone}</span>
              <span className="mt-2 text-sm text-slate-500">{t.fileHint}</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={analyzeImage}
                disabled={!file || isAnalyzing}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {isAnalyzing ? t.analyzing : t.analyze}
              </button>
              <button
                type="button"
                onClick={uploadToShelby}
                disabled={!file || isUploadingShelby}
                className="rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:bg-cyan-300"
              >
                {isUploadingShelby ? t.uploadingShelby : t.uploadShelby}
              </button>
              <button
                type="button"
                onClick={exportExcel}
                disabled={!result}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {t.export}
              </button>
            </div>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-4 text-xl font-bold">{t.preview}</h2>
            <div className="relative min-h-72 overflow-hidden rounded-3xl bg-slate-100">
              {previewUrl ? (
                <Image src={previewUrl} alt="Preview" fill className="object-contain" unoptimized />
              ) : (
                <div className="flex min-h-72 items-center justify-center text-slate-400">{t.empty}</div>
              )}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-5 text-xl font-bold">{t.summary}</h2>
          {uploadInfo.blobUrl && (
            <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <div className="font-semibold">{t.uploadSuccess}</div>
              <div className="mt-3 flex flex-wrap gap-3">
                {uploadInfo.txHash && (
                  <a href={`https://explorer.aptoslabs.com/txn/${uploadInfo.txHash}?network=shelbynet`} target="_blank" rel="noopener noreferrer" className="underline">
                    {t.viewAptos}
                  </a>
                )}
                <a href={uploadInfo.blobUrl} target="_blank" rel="noopener noreferrer" className="underline">
                  {t.viewBlob}
                </a>
                {uploadInfo.explorerUrl && (
                  <a href={uploadInfo.explorerUrl} target="_blank" rel="noopener noreferrer" className="underline">
                    {t.viewShelby}
                  </a>
                )}
              </div>
            </div>
          )}
          {result ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {statCards.map((card) => (
                <div key={card.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 inline-flex rounded-xl bg-white p-2 text-cyan-700 shadow-sm ring-1 ring-slate-200">
                    <card.icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
                  <p className="mt-2 line-clamp-2 text-sm font-bold text-slate-900">{card.value}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">{t.empty}</div>
          )}
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="mb-4 text-xl font-bold">{t.recommendations}</h2>
            {result ? (
              <ul className="space-y-3">
                {result.recommendations.map((item, index) => (
                  <li key={index} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200">
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">{t.empty}</div>
            )}
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700"><TableProperties className="h-5 w-5" /></div>
              <h2 className="text-xl font-bold">{t.table}</h2>
            </div>
            {result ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="px-3 py-3 font-semibold">{t.colMetric}</th>
                      <th className="px-3 py-3 font-semibold">{t.colValue}</th>
                      <th className="px-3 py-3 font-semibold">{t.colGroup}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row) => (
                      <tr key={`${row.group}-${row.label}`} className="border-b border-slate-100 last:border-0">
                        <td className="px-3 py-3 font-medium text-slate-900">{row.label}</td>
                        <td className="px-3 py-3 text-slate-700">{row.value}</td>
                        <td className="px-3 py-3 text-slate-500">{row.group}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">{t.empty}</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
