import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { config } from "@/lib/config";

export const generateRobotsTxt = () => {
  const robots = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /api/",
    "Disallow: /admin/",
    "Disallow: /_next/",
    "Disallow: /_vercel/",
    "Disallow: /cdn-cgi/",
    `Sitemap: ${config.baseUrl}/sitemap.xml`,
    "",
  ].join("\n");

  mkdirSync(path.join("public"), { recursive: true });
  writeFileSync(path.join("public", "robots.txt"), robots);
  console.log("Generated: robots.txt.");
};
