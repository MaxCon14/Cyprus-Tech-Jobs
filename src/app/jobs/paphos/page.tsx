import { CityPage, type CitySearchParams } from "../_shared/CityPage";
import { cityMetadata } from "../_shared/city-seo";
import { CITY_GUIDES } from "@/lib/city-guides";

export const dynamic = "force-dynamic";
const CONFIG = CITY_GUIDES.paphos;
type Props = { searchParams: Promise<CitySearchParams> };

export async function generateMetadata({ searchParams }: Props) {
  return cityMetadata(CONFIG, await searchParams);
}

export default async function CityJobsPage({ searchParams }: Props) {
  return <CityPage config={CONFIG} searchParams={await searchParams} />;
}
