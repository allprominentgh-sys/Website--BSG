
import { redirect } from "next/navigation";

type SearchPageProps = {
  searchParams: Promise<{
    query?: string;
    search?: string;
    q?: string;
    category?: string;
    subcategory?: string;
    location?: string;
    region?: string;
    city?: string;
    area?: string;
  }>;
};

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;

  const query =
    params.q || params.query || params.search || "";

  const category = params.category || "";
  const subcategory = params.subcategory || "";
  const location = params.location || "";
  const region = params.region || "";
  const city = params.city || "";
  const area = params.area || "";

  const listingsParams = new URLSearchParams();

  if (query) {
    listingsParams.set("q", query);
  }

  if (category) {
    listingsParams.set("category", category);
  }

  if (subcategory) {
    listingsParams.set("subcategory", subcategory);
  }

  if (location) {
    listingsParams.set("location", location);
  }

  if (region) {
    listingsParams.set("region", region);
  }

  if (city) {
    listingsParams.set("city", city);
  }

  if (area) {
    listingsParams.set("area", area);
  }

  const queryString = listingsParams.toString();

  redirect(
    queryString
      ? `/listings?${queryString}`
      : "/listings"
  );
}
