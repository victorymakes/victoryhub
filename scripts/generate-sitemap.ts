// scripts/generate-sitemap.mjs
import { writeFileSync, mkdirSync } from "fs";
import path from "path";

import { config } from "@/lib/config";
import { loadTools } from "@/service/tool-service";
import { getBlogs } from "@/service/blog-service";
import { getPages } from "@/service/cms-service";
import { MetadataRoute } from "next";

export const generateSitemap = async () => {
    const baseUrl = config.baseUrl;
    const locales = config.locales;
    const sitemapEntries: MetadataRoute.Sitemap = [];

    const iso = (date: Date): string => date.toISOString();

    // Add tools pages
    for (const locale of locales) {
        // Add home page
        sitemapEntries.push({
            url: `${baseUrl}/${locale}`,
            lastModified: iso(new Date()),
            changeFrequency: "monthly",
            priority: 1,
        });

        // Tools index page
        sitemapEntries.push({
            url: `${baseUrl}/${locale}/tools`,
            lastModified: iso(new Date()),
            changeFrequency: "weekly",
            priority: 0.9,
        });

        // Individual tool pages
        const tools = await loadTools(locale);
        tools.forEach((tool) => {
            sitemapEntries.push({
                url: `${baseUrl}/${locale}/tools/${tool.slug}`,
                lastModified: iso(new Date()),
                changeFrequency: "monthly",
                priority: 0.8,
            });
        });

        // Blog index page
        sitemapEntries.push({
            url: `${baseUrl}/${locale}/blog`,
            lastModified: iso(new Date()),
            changeFrequency: "weekly",
            priority: 0.9,
        });

        // Individual blog pages
        const blogs = await getBlogs(locale);
        blogs.forEach((blog) => {
            sitemapEntries.push({
                url: `${baseUrl}/${locale}/blog/${blog.slug}`,
                lastModified: iso(new Date(blog.date)),
                changeFrequency: "monthly",
                priority: 0.7,
            });
        });

        // Add static pages
        const pages = await getPages(locale);
        pages.forEach((page) => {
            sitemapEntries.push({
                url: `${baseUrl}/${locale}/${page.slug}`,
                lastModified: iso(new Date(page.date)),
                changeFrequency: "monthly",
                priority: 0.6,
            });
        });
    }

    const xml =
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        sitemapEntries
            .map(
                (u) => `  <url>
    <loc>${u.url}</loc>
    <lastmod>${u.lastModified}</lastmod>
    <changefreq>${u.changeFrequency}</changefreq>
    <priority>${u.priority}</priority>
  </url>`,
            )
            .join("\n") +
        `\n</urlset>\n`;

    mkdirSync(path.join("public"), { recursive: true });
    writeFileSync(path.join("public", "sitemap.xml"), xml);
    console.log(`Generated: sitemap.xml (${sitemapEntries.length} URLs)`);
};
