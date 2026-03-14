import fs from "node:fs";
import path from "node:path";

import { chromium } from "@playwright/test";

interface PriceWatchEntry {
  id: string;
  skuKey: string;
  productName: string;
  retailer: string;
  url: string;
  priceSelector: string;
  notes?: string;
}

interface PriceSnapshot {
  id: string;
  skuKey: string;
  productName: string;
  retailer: string;
  url: string;
  fetchedAt: string;
  priceText?: string;
  error?: string;
}

const WATCH_FILE = path.join(process.cwd(), "data", "price-watch.json");
const OUTPUT_DIR = path.join(process.cwd(), "data", "prices");

async function main(): Promise<void> {
  if (!fs.existsSync(WATCH_FILE)) {
    throw new Error(`Missing price watch list at ${WATCH_FILE}`);
  }

  const entries = JSON.parse(fs.readFileSync(WATCH_FILE, "utf8")) as PriceWatchEntry[];
  const targets = entries.filter((entry) => entry.url && entry.priceSelector);

  if (targets.length === 0) {
    console.log("No price targets with both URL and selector defined. Update data/price-watch.json first.");
    return;
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const results: PriceSnapshot[] = [];

  for (const target of targets) {
    const page = await context.newPage();

    try {
      await page.goto(target.url, { waitUntil: "domcontentloaded", timeout: 45_000 });
      await page.waitForSelector(target.priceSelector, { timeout: 15_000 });
      const locator = page.locator(target.priceSelector).first();
      const rawText = (await locator.textContent())?.trim() ?? "";

      results.push({
        id: target.id,
        skuKey: target.skuKey,
        productName: target.productName,
        retailer: target.retailer,
        url: target.url,
        fetchedAt: new Date().toISOString(),
        priceText: rawText,
      });

      console.log(`✔ ${target.retailer} – ${target.productName}: ${rawText}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      results.push({
        id: target.id,
        skuKey: target.skuKey,
        productName: target.productName,
        retailer: target.retailer,
        url: target.url,
        fetchedAt: new Date().toISOString(),
        error: message,
      });

      console.error(`✖ ${target.retailer} – ${target.productName}: ${message}`);
    } finally {
      await page.close();
    }
  }

  await context.close();
  await browser.close();

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outputPath = path.join(OUTPUT_DIR, `${timestamp}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf8");

  console.log(`Saved ${results.length} price snapshot(s) to ${outputPath}`);
}

main().catch((error) => {
  console.error("Price collection failed:", error);
  process.exitCode = 1;
});
