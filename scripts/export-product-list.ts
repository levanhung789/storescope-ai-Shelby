import fs from "node:fs";
import path from "node:path";

import type { GroupWithProducts } from "../app/dashboard/types";

const MANIFEST_PATH = path.join(process.cwd(), "data", "product-manifest.json");
const OUTPUT_PATH = path.join(process.cwd(), "data", "product-catalog.csv");

function escapeCsv(value: string): string {
  const needsQuotes = /[",\n]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8")) as GroupWithProducts[];
  const rows: string[] = [
    "groupKey,groupName,companyKey,companyName,productFolder,productName,imageCount",
  ];

  for (const group of manifest) {
    for (const company of group.companies) {
      for (const product of company.products) {
        rows.push(
          [
            group.groupKey,
            group.groupName,
            company.companyKey,
            company.companyName,
            product.productFolder,
            product.name,
            String(product.images.length),
          ]
            .map(escapeCsv)
            .join(",")
        );
      }
    }
  }

  fs.writeFileSync(OUTPUT_PATH, rows.join("\n"), "utf8");
  console.log(`Saved ${rows.length - 1} products to ${OUTPUT_PATH}`);
}

main();
