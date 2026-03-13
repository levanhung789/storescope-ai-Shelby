import DashboardClient from "./client";
import { groups } from "./groups-data";
import { buildProductManifest } from "./load-products";

export default function DashboardPage() {
  const manifest = buildProductManifest(groups);

  return <DashboardClient manifest={manifest} />;
}
