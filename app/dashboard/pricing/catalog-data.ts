import fs from "node:fs";
import path from "node:path";

import { parse } from "csv-parse/sync";

export type ProductCatalogRecord = {
  groupKey: string;
  companyKey: string;
  companyName: string;
  productFolder: string;
  productName: string;
} & Record<string, string>;

let catalogCache: ProductCatalogRecord[] | null = null;

function loadCatalog(): ProductCatalogRecord[] {
  if (catalogCache) {
    return catalogCache;
  }

  const filePath = path.join(process.cwd(), "data", "product-catalog.csv");
  const csvContent = fs.readFileSync(filePath, "utf8");
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as ProductCatalogRecord[];

  catalogCache = records;
  return records;
}

export function findCatalogRecord(
  groupKey: string,
  companyKey: string,
  productFolder: string
): ProductCatalogRecord | undefined {
  const catalog = loadCatalog();
  return catalog.find(
    (record) =>
      record.groupKey === groupKey &&
      record.companyKey === companyKey &&
      record.productFolder === productFolder
  );
}
