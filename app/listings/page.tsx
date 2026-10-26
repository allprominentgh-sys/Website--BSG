
import type { MetadataRoute } from "next";

export const revalidate = 3600;

type Listing = {
  id: number;
  created_at: string | null;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://bestsalesgh.com";

  const pages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/listings`,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Sitemap: Supabase public environment variables are missing.");
    return pages;
  }

  try {
    const endpoint = new URL("/rest/v1/listings", supabaseUrl);

    endpoint.searchParams.set("select", "id,created_at");
    endpoint.searchParams.set("status", "eq.active");
    endpoint.searchParams.set("order", "created_at.desc");
    endpoint.searchParams.set("limit", "5000");

    const response = await fetch(endpoint.toString(), {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error("Sitemap: Could not load public listings.");
      return pages;
    }

    const listings = (await response.json()) as Listing[];

    for (const listing of listings) {
      if (
        listing.id === null ||
        listing.id === undefined ||
        !Number.isFinite(Number(listing.id))
      ) {
        continue;
      }

      pages.push({
        url: `${baseUrl}/listings/${encodeURIComponent(String(listing.id))}`,
        ...(listing.created_at
          ? { lastModified: new Date(listing.created_at) }
          : {}),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  } catch (error) {
    console.error("Sitemap generation failed:", error);
  }

  return pages;
}
