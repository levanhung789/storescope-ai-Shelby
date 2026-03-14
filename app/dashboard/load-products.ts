import manifest from "@/data/product-manifest.json";

import type { RankingGroup } from "./groups-data";
import type { GroupWithProducts } from "./types";

const productManifest = manifest as GroupWithProducts[];

export function buildProductManifest(groups: RankingGroup[]): GroupWithProducts[] {
  const manifestByGroup = new Map(productManifest.map((group) => [group.groupKey, group]));

  return groups.map((group) => {
    const manifestGroup = manifestByGroup.get(group.groupKey);

    return {
      ...group,
      companies: manifestGroup?.companies ?? [],
    } satisfies GroupWithProducts;
  });
}
