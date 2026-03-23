import { NextResponse } from "next/server";
import { uploadAssetToShelby } from "@/lib/shelby-client";

function tokenizeText(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 50);
}

function inferBrandCandidates(filename: string, rawText: string) {
  const source = `${filename} ${rawText}`.toLowerCase();
  const brands = [
    "Ajinomoto",
    "Masan",
    "Knorr",
    "Omo",
    "P/S",
    "Nestle",
    "TH True Milk",
    "Vinamilk",
  ];

  return brands.filter((brand) => source.includes(brand.toLowerCase()));
}

function inferCategory(filename: string, rawText: string) {
  const source = `${filename} ${rawText}`.toLowerCase();

  if (source.includes("bot ngot") || source.includes("aji-no-moto") || source.includes("seasoning")) {
    return "seasoning";
  }
  if (source.includes("milk") || source.includes("sua")) {
    return "dairy";
  }
  if (source.includes("shampoo")) {
    return "personal-care";
  }
  if (source.includes("detergent") || source.includes("omo")) {
    return "home-care";
  }

  return "unknown";
}

function inferSizeCandidates(filename: string, rawText: string) {
  const source = `${filename} ${rawText}`;
  const matches = [...source.matchAll(/(\d+(?:[.,]\d+)?)\s?(g|kg|ml|l)/gi)];

  return matches.slice(0, 5).map((match) => ({
    value: Number(String(match[1]).replace(",", ".")),
    unit: match[2].toLowerCase(),
    raw: match[0],
  }));
}

function buildMockCatalogMatches(params: {
  brandCandidates: string[];
  sizeCandidates: { value: number; unit: string; raw: string }[];
  category: string;
  filename: string;
}) {
  const brand = params.brandCandidates[0] ?? null;
  const size = params.sizeCandidates[0] ?? null;
  const baseName = params.filename.replace(/\.[^/.]+$/, "");

  const topMatches = [
    {
      skuId: `SKU_${(brand ?? "GENERIC").replace(/\s+/g, "_").toUpperCase()}_${size ? `${size.value}${size.unit}`.toUpperCase() : "UNKNOWN"}`,
      name: `${brand ?? "Unknown brand"} ${baseName}`.trim(),
      score: brand ? 0.82 : 0.58,
      reasons: [
        ...(brand ? ["brand_match"] : ["brand_uncertain"]),
        ...(size ? ["size_match"] : ["size_missing"]),
        params.category !== "unknown" ? "category_match" : "category_uncertain",
      ],
    },
    {
      skuId: `SKU_ALT_${baseName.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}`,
      name: `${baseName} alternative`,
      score: 0.47,
      reasons: ["name_similarity_partial"],
    },
  ];

  return {
    bestMatch: topMatches[0] ?? null,
    topMatches,
  };
}

function deriveDecision(score: number) {
  if (score >= 0.85) {
    return {
      status: "matched",
      confidenceLevel: "high",
      confidenceScore: score,
      needsHumanReview: false,
    };
  }

  if (score >= 0.6) {
    return {
      status: "candidate_list",
      confidenceLevel: "medium",
      confidenceScore: score,
      needsHumanReview: true,
    };
  }

  return {
    status: "unresolved",
    confidenceLevel: "low",
    confidenceScore: score,
    needsHumanReview: true,
  };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const optionsStr = formData.get("options") as string | null;
    const contextStr = formData.get("context") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed." },
        { status: 400 }
      );
    }

    let options: Record<string, unknown> = {};
    let context: Record<string, unknown> = {};

    if (optionsStr) {
      try {
        options = JSON.parse(optionsStr);
      } catch {
        options = {};
      }
    }

    if (contextStr) {
      try {
        context = JSON.parse(contextStr);
      } catch {
        context = {};
      }
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const shelbyAsset = await uploadAssetToShelby(buffer, file.name, file.type, {
      source: "analyze-product",
      options,
      context,
    });

    const mockRawText = file.name.replace(/[_-]+/g, " ");
    const tokens = tokenizeText(mockRawText);
    const brandCandidates = inferBrandCandidates(file.name, mockRawText);
    const sizeCandidates = inferSizeCandidates(file.name, mockRawText);
    const category = inferCategory(file.name, mockRawText);

    const catalogMatch = buildMockCatalogMatches({
      brandCandidates,
      sizeCandidates,
      category,
      filename: file.name,
    });

    const decision = deriveDecision(catalogMatch.bestMatch?.score ?? 0.2);

    return NextResponse.json({
      success: true,
      analysisId: `analysis_${Date.now()}`,
      image: {
        originalFilename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        width: null,
        height: null,
        shelby: {
          url: shelbyAsset.url,
          explorerUrl: shelbyAsset.explorerUrl,
          accountAddress: shelbyAsset.accountAddress,
          blobName: shelbyAsset.blobName,
        },
      },
      ocr: {
        rawText: mockRawText,
        language: [String((context as { languageHint?: string }).languageHint ?? "vi")],
        tokens,
        brandCandidates,
        sizeCandidates,
      },
      vision: {
        category,
        brand: brandCandidates[0] ?? null,
        productNameGuess: file.name.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " "),
        packagingType: "pouch",
        dominantColors: [],
        confidence: catalogMatch.bestMatch?.score ?? 0.2,
      },
      normalized: {
        brand: brandCandidates[0] ?? null,
        productName: file.name.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " "),
        variant: null,
        size: sizeCandidates[0] ?? null,
        category,
        packagingType: "pouch",
      },
      catalogMatch,
      decision,
      debug: {
        options,
        context,
        mode: "skeleton",
      },
    });
  } catch (error) {
    console.error("Error analyzing product:", error);
    return NextResponse.json(
      { error: "Internal server error during product analysis" },
      { status: 500 }
    );
  }
}
