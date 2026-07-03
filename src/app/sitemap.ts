import type { MetadataRoute } from "next";
import { candidates } from "@/lib/candidates";

const BASE_URL = "https://hireworkers.work";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/hire`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/work`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/talent`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/jobs`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/dashboard`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const candidateRoutes: MetadataRoute.Sitemap = candidates.map((candidate) => ({
    url: `${BASE_URL}/talent/${candidate.id}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...candidateRoutes];
}
