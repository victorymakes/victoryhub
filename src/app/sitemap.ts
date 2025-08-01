import { MetadataRoute } from "next";
import { getTools } from "@/service/tool-service";
import { getBlogs } from "@/service/blog-service";
import { getPages } from "@/service/page-service";
import { config } from "@/lib/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = config.baseUrl;
    const locales = config.locales;
    const sitemapEntries: MetadataRoute.Sitemap = [];

    // Add tools pages
    for (const locale of locales) {
        // Add home page
        sitemapEntries.push({
            url: `${baseUrl}/${locale}`,
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 1,
        });

        // Tools index page
        sitemapEntries.push({
            url: `${baseUrl}/${locale}/tools`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.9,
        });

        // Individual tool pages
        const tools = await getTools(locale);
        tools.forEach((tool) => {
            sitemapEntries.push({
                url: `${baseUrl}/${locale}/tool/${tool.slug}`,
                lastModified: new Date(),
                changeFrequency: "monthly",
                priority: 0.8,
            });
        });

        // Blog index page
        sitemapEntries.push({
            url: `${baseUrl}/${locale}/blog`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.9,
        });

        // Individual blog pages
        const blogs = await getBlogs(locale);
        blogs.forEach((blog) => {
            sitemapEntries.push({
                url: `${baseUrl}/${locale}/blog/${blog.slug}`,
                lastModified: new Date(blog.date),
                changeFrequency: "monthly",
                priority: 0.7,
            });
        });

        // Add static pages
        const pages = await getPages(locale);
        pages.forEach((page) => {
            sitemapEntries.push({
                url: `${baseUrl}/${locale}/${page.slug}`,
                lastModified: new Date(page.date),
                changeFrequency: "monthly",
                priority: 0.6,
            });
        });
    }

    return sitemapEntries;
}
