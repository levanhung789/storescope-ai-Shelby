import fs from "node:fs";
import path from "node:path";

import { chromium, Page } from "@playwright/test";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";

interface CatalogRow {
  groupKey: string;
  groupName: string;
  companyKey: string;
  companyName: string;
  productFolder: string;
  productName: string;
  imageCount: string;
  BHX?: string;
  bhxPrice?: string;
  bhxPriceStatus?: string;
  bhxPriceFetchedAt?: string;
}

const CATALOG_PATH = path.join(process.cwd(), "data", "product-catalog.csv");
const BACKUP_PATH = `${CATALOG_PATH}.bak`;
const FETCH_TIMEOUT = 45_000;

async function main() {
  if (!fs.existsSync(CATALOG_PATH)) {
    throw new Error(`Missing catalog at ${CATALOG_PATH}`);
  }

  const csvRaw = fs.readFileSync(CATALOG_PATH, "utf8");
  const records = parse(csvRaw, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as CatalogRow[];

  console.log(`Loaded ${records.length} catalog rows`);

  fs.copyFileSync(CATALOG_PATH, BACKUP_PATH);
  console.log(`Backup saved to ${BACKUP_PATH}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0 Safari/537.36",
  });

  try {
    for (let index = 0; index < records.length; index += 1) {
      const row = records[index];
      const url = (row.BHX ?? "").trim();
      const prefix = `[${index + 1}/${records.length}] ${row.productName}`;

      if (!url) {
        console.log(`${prefix} – skipped (missing BHX URL)`);
        row.bhxPrice = "";
        row.bhxPriceStatus = "missing-url";
        row.bhxPriceFetchedAt = new Date().toISOString();
        continue;
      }

      const page = await context.newPage();

      try {
        console.log(`${prefix} – fetching price…`);
        const result = await extractPrice(page, url);

        if (result.priceText) {
          row.bhxPrice = result.priceText;
          row.bhxPriceStatus = `ok(${result.source}${
            typeof result.variantCount === "number" ? `,variants=${result.variantCount}` : ""
          })`;
          console.log(`${prefix} – ${row.bhxPrice}`);
        } else {
          row.bhxPrice = "";
          row.bhxPriceStatus = `not-found(${result.source})`;
          console.warn(`${prefix} – price element not found`);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        row.bhxPrice = "";
        row.bhxPriceStatus = `error(${message.slice(0, 80)})`;
        console.error(`${prefix} – ERROR: ${message}`);
      } finally {
        row.bhxPriceFetchedAt = new Date().toISOString();
        await page.close();
      }
    }
  } finally {
    await context.close();
    await browser.close();
  }

  const columns = [
    "groupKey",
    "groupName",
    "companyKey",
    "companyName",
    "productFolder",
    "productName",
    "imageCount",
    "BHX",
    "bhxPrice",
    "bhxPriceStatus",
    "bhxPriceFetchedAt",
  ];

  const csvOutput = stringify(records, { header: true, columns });
  fs.writeFileSync(CATALOG_PATH, csvOutput, "utf8");

  console.log(`Updated catalog with prices → ${CATALOG_PATH}`);
}

async function extractPrice(page: Page, url: string) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: FETCH_TIMEOUT });
  await dismissOverlays(page);

  const result = await page.evaluate(() => {
    const cleanupOverlays = () => {
      document
        .querySelectorAll('[class*="bg-black-100"][class*="size-screen"], [class*="crm-survey-render"]')
        .forEach((node) => node.remove());
    };

    cleanupOverlays();

    const normalize = (input: string | null | undefined) => {
      if (!input) return null;
      let text = input.replace(/\s+/g, " ").replace(/\u00A0/g, " ").trim();
      if (!text) return null;
      const slashIndex = text.indexOf("/");
      if (slashIndex > 0) {
        text = text.slice(0, slashIndex).trim();
      }
      const match = text.match(/[0-9][0-9.,\s]*\s*(?:₫|đ)?/i);
      return match ? match[0].replace(/\s+/g, " ").trim() : text;
    };

    const variantRoot = document.querySelector(".swiper-list-cate-search");
    if (variantRoot) {
      const slides = Array.from(variantRoot.querySelectorAll(".swiper-slide"));
      const firstPrice = slides
        .map((slide) => {
          const priceNode = slide.querySelector('[class*="font-bold"]');
          return normalize(priceNode?.textContent ?? "");
        })
        .find((value) => !!value);
      if (firstPrice) {
        return { priceText: firstPrice, source: "variant", variantCount: slides.length };
      }
    }

    const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
    for (const script of scripts) {
      try {
        const payload = JSON.parse(script.textContent ?? "{}");
        const nodes = Array.isArray(payload) ? payload : [payload];
        for (const node of nodes) {
          if (node && node["@type"] === "Product") {
            const priceText = normalize(node?.offers?.price ?? node?.offers?.lowPrice ?? null);
            if (priceText) {
              return { priceText, source: "schema", variantCount: null };
            }
          }
        }
      } catch {
        // ignore parse errors
      }
    }

    const fallbackNode = document.querySelector('[class*="font-bold"]');
    const fallbackPrice = normalize(fallbackNode?.textContent ?? "");
    if (fallbackPrice) {
      return { priceText: fallbackPrice, source: "fallback", variantCount: null };
    }

    return { priceText: null, source: "missing", variantCount: null };
  });

  return result as { priceText: string | null; source: string; variantCount: number | null };
}

async function dismissOverlays(page: Page) {
  await page.evaluate(() => {
    document
      .querySelectorAll('[class*="bg-black-100"][class*="size-screen"], [data-type="POPUP_FORM"], #crm-survey-clone')
      .forEach((node) => node.remove());
  });
  await page.waitForTimeout(500);
}

main().catch((error) => {
  console.error("Price fetcher failed:", error);
  process.exitCode = 1;
});
