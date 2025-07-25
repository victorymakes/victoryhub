// Page Metadata Generator Script
// This script generates metadata for pages in different locales.
// It reads all MDX files in each locale directory, extracts metadata from export statements,
// and generates locale-specific JSON files and a merged metadata file.
// Usage: node scripts/page-metadata-generator.mjs
// Directory structure: data/page/{slug}/{locale}.mdx

import fs from "fs";
import path from "path";

const pagePath = "./data/page";
const outputPath = "./data/page/metadata.json";

// Helper function to estimate reading time
const estimateReadingTime = (content) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
};

// Helper function to extract metadata from export statement
const extractMetadataFromExport = (content) => {
    try {
        // Look for export const metadata = { ... }
        const metadataRegex = /export\s+const\s+metadata\s*=\s*({[\s\S]*?});/;
        const match = content.match(metadataRegex);

        if (!match) {
            throw new Error("No metadata export found");
        }

        // Extract the object string and evaluate it safely
        const metadataString = match[1];

        // Create a safer evaluation by wrapping in parentheses and using Function constructor
        const metadataFunction = new Function(`return ${metadataString}`);
        const metadata = metadataFunction();

        return metadata;
    } catch (error) {
        console.error("Error extracting metadata:", error.message);
        return null;
    }
};

// Recursively find all .mdx files under a directory
const findAllMarkdownFiles = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(findAllMarkdownFiles(filePath));
        } else if (file.endsWith(".mdx") || file.endsWith(".md")) {
            results.push(filePath);
        }
    });
    return results;
};

// Extract slug and locale from file path: data/page/{slug}/{locale}.mdx (or deeper)
const extractSlugAndLocale = (filePath) => {
    const relPath = path.relative(pagePath, filePath);
    const parts = relPath.split(path.sep);
    // Find locale (last part before extension)
    const fileName = parts[parts.length - 1];
    const locale = fileName.split(".")[0];
    // Slug is everything before locale
    const slug = parts.slice(0, -1).join("/");
    return { slug, locale };
};

// Process all markdown files recursively
const processAllMarkdownFiles = () => {
    const files = findAllMarkdownFiles(pagePath);
    const allMetadata = {};
    files.forEach((filePath) => {
        const { slug, locale } = extractSlugAndLocale(filePath);
        const content = fs.readFileSync(filePath, "utf8");
        const exportedMetadata = extractMetadataFromExport(content);
        if (!exportedMetadata || !exportedMetadata.title) return;
        const metadata = {
            slug,
            title: exportedMetadata.title,
            description: exportedMetadata.description || "",
            date: exportedMetadata.date || new Date().toISOString(),
            author: exportedMetadata.author || "Victory",
            tags: exportedMetadata.tags || [],
            category: exportedMetadata.category || {
                id: "general",
                name: "General",
            },
            featured: exportedMetadata.featured || false,
            draft: exportedMetadata.draft || false,
            locale,
            readingTime: estimateReadingTime(content),
            cover: exportedMetadata.cover || "",
            type: slug.startsWith("blog/") ? "blog" : "page",
        };
        if (!allMetadata[locale]) allMetadata[locale] = [];
        allMetadata[locale].push(metadata);
    });
    // Sort by date (newest first)
    Object.keys(allMetadata).forEach((locale) => {
        allMetadata[locale].sort((a, b) => new Date(b.date) - new Date(a.date));
    });
    return allMetadata;
};

// Helper function to save metadata to file
const saveMetadata = (metadata, outputPath) => {
    try {
        fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2));
        console.log(`Generated: ${outputPath}`);
    } catch (error) {
        console.error(`Error saving metadata to ${outputPath}:`, error.message);
    }
};

// Helper function to generate statistics
const generateStats = (allMetadata) => {
    return {
        totalPosts: Object.values(allMetadata).flat().length,
        postsByLocale: Object.fromEntries(
            Object.entries(allMetadata).map(([locale, posts]) => [
                locale,
                posts.length,
            ]),
        ),
        lastUpdated: new Date().toISOString(),
    };
};

// Main function - now much shorter and focused
const generateMetadata = () => {
    const allMetadata = processAllMarkdownFiles();
    saveMetadata(allMetadata, outputPath);
    const stats = generateStats(allMetadata);
    saveMetadata(stats, path.join(pagePath, "metadata.stats.json"));
};

// Run the script
if (
    typeof process !== "undefined" &&
    process.argv[1] === import.meta.url.replace("file://", "")
) {
    generateMetadata();
}
