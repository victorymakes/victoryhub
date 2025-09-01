import { mkdirSync, writeFileSync } from "fs";
import { config } from "@/lib/config";
import path from "path";

export const generateRobotsTxt = () => {
    const robots = [
        "User-agent: *",
        "Allow: /",
        "Disallow: /api/",
        "Disallow: /admin/",
        `Sitemap: ${config.baseUrl}/sitemap.xml`,
        "",
    ].join("\n");

    mkdirSync(path.join("public"), { recursive: true });
    writeFileSync(path.join("public", "robots.txt"), robots);
    console.log("Generated: robots.txt.");
};
