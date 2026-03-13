const fs = require("node:fs");
const path = require("node:path");

const GROUP_LABELS = {
  "dau-an-nuoc-cham-gia-vi": "Dầu ăn, nước chấm, gia vị",
};

const ROOT = path.join(process.cwd(), "public", "companies");

function prettifyName(folderName) {
  return folderName
    .split(/[-_]+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

function toCompanyKey(folderName) {
  return folderName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

const products = [];

const groupEntries = fs.readdirSync(ROOT, { withFileTypes: true }).filter((entry) => entry.isDirectory());

for (const groupEntry of groupEntries) {
  const groupKey = groupEntry.name;
  const groupName = GROUP_LABELS[groupKey] ?? prettifyName(groupKey);
  const groupPath = path.join(ROOT, groupEntry.name);

  const companyEntries = fs.readdirSync(groupPath, { withFileTypes: true }).filter((entry) => entry.isDirectory());

  for (const companyEntry of companyEntries) {
    const companyFolder = companyEntry.name;
    const companyPath = path.join(groupPath, companyEntry.name);
    const companyKey = toCompanyKey(companyFolder);
    const companyName = prettifyName(companyFolder);

    const productEntries = fs.readdirSync(companyPath, { withFileTypes: true }).filter((entry) => entry.isDirectory());

    for (const productEntry of productEntries) {
      const productFolder = productEntry.name;
      const productName = prettifyName(productFolder);

      products.push({
        groupKey,
        groupName,
        companyKey,
        companyName,
        productFolder,
        productName,
      });
    }
  }
}

fs.mkdirSync(path.join(process.cwd(), "data"), { recursive: true });
const outputPath = path.join(process.cwd(), "data", "products.json");
fs.writeFileSync(outputPath, JSON.stringify(products, null, 2), "utf8");

console.log(`Saved ${products.length} products to ${outputPath}`);
