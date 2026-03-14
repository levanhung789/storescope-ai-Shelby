# Price Monitoring Workflow

This document explains how to capture weekly price snapshots for the oil / sauce / seasoning SKUs that live in `data/product-manifest.json`.

## 1. Build the watch list

1. Open `data/price-watch.json` and add one entry per retailer + SKU.
2. Required fields per entry:
   - `id`: unique slug (e.g. `bhx-ajinomoto-100g`).
   - `skuKey` + `productName`: copy from the manifest so we can link prices back to rankings.
   - `retailer`: use one of `BachHoaXanh`, `WinMart`, `CoopOnline`, `AeonEshop` (or add new values as needed).
   - `url`: direct product URL on the retailer site.
   - `priceSelector`: CSS selector that isolates the price element (inspect the page once in a real browser and copy the selector).
   - `notes`: optional hints (promo info, packaging, etc.).

Tips:
- Many retailers expose an AMP page (add `/amp` to the URL) – those versions load faster and have simpler markup for parsing.
- If the same SKU appears in multiple pack sizes, create separate entries so we can compare like-for-like.

## 2. Run the collector

1. Install Playwright browsers (already done once via `npx playwright install chromium`).
2. Execute `npm run collect:prices`.
3. The script will:
   - Launch headless Chromium.
   - Visit each URL in `data/price-watch.json` that has both `url` and `priceSelector` filled in.
   - Grab the text content of the first element matching the selector.
   - Write the outputs to `data/prices/<ISO-timestamp>.json` with raw price text and timestamp.

If an entry fails (timeout, selector not found, captcha), the JSON snapshot will store the error message so we can debug.

## 3. Schedule weekly runs

- Once the watch list is populated, we can add an OpenClaw cron job or a GitHub Action that runs `npm run collect:prices` every week and uploads the resulting JSON to Shelby/DB.
- For now, you can trigger it manually whenever new prices are needed.

## 4. Import into the dashboard (next steps)

- We can create a parser that normalises the raw `priceText` (strip currency, parse numeric value) and joins it with the dashboard ranking data.
- Historical files under `data/prices/` can feed charts (price trend per SKU, retailer comparison, promotion alerts, etc.).

Let me know when the watch list has real URLs/selectors – I can help verify selectors, normalise the captured price, and wire everything into the dashboard.
