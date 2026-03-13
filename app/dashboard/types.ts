import type { Company, RankingGroup } from "./groups-data";

export type ProductRecord = {
  productFolder: string;
  name: string;
  images: string[];
  sku: string;
  category: string;
  packSpec?: string;
  aiStatus: "Matched" | "Review" | "Missing";
};

export type CompanyWithProducts = Company & {
  products: ProductRecord[];
};

export type GroupWithProducts = Omit<RankingGroup, "companies"> & {
  companies: CompanyWithProducts[];
};
