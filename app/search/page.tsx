import { redirect } from "next/navigation";

type SearchPageProps = {
  searchParams: Promise<{
    query?: string;
    search?: string;
    category?: string;
    subcategory?: string;
    location?: string;
  }>;
};

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;

  const query = params.query || params.search || "";
  const category = params.category || "";
  const subcategory = params.subcategory || "";
  const location = params.location || "";

  const listingsParams = new URLSearchParams();

  if (query) {
    listingsParams.set("search", query);
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

  const destination = listingsParams.toString()
    ? `/listings?${listingsParams.toString()}`
    : "/listings";

  redirect(destination);
}
