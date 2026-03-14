import fs from "node:fs";
import path from "node:path";

import type { Company, RankingGroup } from "../app/dashboard/groups-data";
import { groups } from "../app/dashboard/groups-data";
import type { CompanyWithProducts, GroupWithProducts, ProductRecord } from "../app/dashboard/types";

const COMPANIES_ROOT = path.join(process.cwd(), "public", "companies");
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".jfif"]);
const OUTPUT_PATH = path.join(process.cwd(), "data", "product-manifest.json");

function main() {
  const manifest = buildProductManifest(groups);
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(manifest, null, 2), "utf8");

  const productCount = manifest.reduce(
    (total, group) => total + group.companies.reduce((acc, company) => acc + company.products.length, 0),
    0
  );

  console.log(
    `Saved ${manifest.length} groups, ${manifest.reduce((sum, group) => sum + group.companies.length, 0)} companies, and ${productCount} products to ${OUTPUT_PATH}`
  );
}

export function buildProductManifest(groupDefinitions: RankingGroup[]): GroupWithProducts[] {
  return groupDefinitions.map((group) => ({
    ...group,
    companies: loadCompaniesForGroup(group),
  }));
}

function loadCompaniesForGroup(group: RankingGroup): CompanyWithProducts[] {
  const groupPath = path.join(COMPANIES_ROOT, group.groupFolder);

  if (!fs.existsSync(groupPath)) {
    return [];
  }

  const directories = fs
    .readdirSync(groupPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .sort((a, b) => a.name.localeCompare(b.name, "vi"));

  return directories
    .map((entry) => {
      const matchedCompany =
        group.companies?.find(
          (company) =>
            company.companyFolder === entry.name || company.companyKey === toCompanyKey(entry.name)
        ) ?? null;

      const baseCompany: Company =
        matchedCompany ?? {
          companyKey: toCompanyKey(entry.name),
          companyName: prettifyCompanyName(entry.name),
          companyFolder: entry.name,
        };

      const products = loadProductsForCompany(group, baseCompany);

      return {
        ...baseCompany,
        products,
      } satisfies CompanyWithProducts;
    }) as CompanyWithProducts[];
}

function loadProductsForCompany(group: RankingGroup, company: Company): ProductRecord[] {
  const companyPath = path.join(COMPANIES_ROOT, group.groupFolder, company.companyFolder);

  if (!fs.existsSync(companyPath)) {
    return [];
  }

  const directories = fs
    .readdirSync(companyPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .sort((a, b) => a.name.localeCompare(b.name, "vi"));

  return directories
    .map((entry, index) => {
      const productPath = path.join(companyPath, entry.name);
      const images = fs
        .readdirSync(productPath, { withFileTypes: true })
        .filter((file) => file.isFile() && IMAGE_EXTENSIONS.has(path.extname(file.name).toLowerCase()))
        .map((file) => file.name)
        .sort((a, b) => a.localeCompare(b, "vi"));

      if (images.length === 0) {
        return null;
      }

      return {
        productFolder: entry.name,
        name: prettifyProductName(entry.name),
        images,
        sku: deriveSku(company.companyKey, entry.name, index),
        category: group.groupName,
        packSpec: derivePackSpec(entry.name),
        aiStatus: deriveStatus(images.length),
      } satisfies ProductRecord;
    })
    .filter(Boolean) as ProductRecord[];
}

function prettifyCompanyName(folderName: string): string {
  if (/[^\x00-\x7F]/.test(folderName)) {
    return folderName.replace(/\s+/g, " ").trim();
  }

  return folderName
    .split(/[-_]+/)
    .filter(Boolean)
    .map((token) => capitalise(token))
    .join(" ");
}

function toCompanyKey(folderName: string): string {
  const slug = folderName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return slug || folderName.toLowerCase();
}

function prettifyProductName(folderName: string): string {
  const trimmed = folderName.replace(/\s+/g, " ").trim();
  if (/[^\x00-\x7F]/.test(trimmed) || trimmed.includes(" ")) {
    return capitalise(trimmed);
  }

  const tokens = folderName
    .split(/[-_]+/)
    .filter(Boolean)
    .map((token) => capitalise(token));

  return tokens.join(" ");
}

function capitalise(input: string): string {
  if (!input) {
    return input;
  }

  return input.charAt(0).toUpperCase() + input.slice(1);
}

function deriveSku(companyKey: string, folderName: string, index: number): string {
  const companySegment = companyKey.replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 4) || "SKU";
  const folderSegment = folderName.replace(/[^a-z0-9]/gi, "").toUpperCase();
  const tail = folderSegment.slice(-4) || (index + 1).toString().padStart(4, "0");
  return `${companySegment}-${tail}`;
}

function derivePackSpec(folderName: string): string | undefined {
  const normalised = folderName.replace(/[-_]/g, " ").replace(/\s+/g, " ").trim();
  const unitRegex = /(\d+(?:[.,]\d+)?\s*(?:kg|g|gram|gr|ml|m[lL]|l|lit|chai|goi|gói|goi|lon|hu|hũ|hop|h?u))$/i;
  const match = normalised.match(unitRegex);

  if (match) {
    return match[0].replace(/\s+/g, " ").toUpperCase();
  }

  const secondaryRegex = /(?:chai|lon|goi|hop|hu)\s*\d+/i;
  const secondary = normalised.match(secondaryRegex);

  if (secondary) {
    return capitalise(secondary[0]);
  }

  return undefined;
}

function deriveStatus(imageCount: number): "Matched" | "Review" | "Missing" {
  if (imageCount >= 4) {
    return "Matched";
  }

  if (imageCount >= 2) {
    return "Review";
  }

  return "Missing";
}

main();
