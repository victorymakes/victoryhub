// Blog Metadata Generator Script
// This script generates metadata for blog posts in different locales.
// It reads all MDX files in each locale directory, extracts metadata from export statements,
// and generates locale-specific JSON files and a merged metadata file.
// Usage: node scripts/blog-metadata-generator.mjs
// Directory structure: data/blog/{locale}/*.mdx

import fs from "fs";
import path from "path";

const blogPath = "./data/blog";
const outputPath = "./data/blog/metadata.json";

// Helper function to estimate reading time
const estimateReadingTime = (content) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
};

// Helper function to get all locale directories
const getLocaleDirectories = (blogDir) => {
    return fs.readdirSync(blogDir).filter((item) => {
        const itemPath = path.join(blogDir, item);
        return fs.statSync(itemPath).isDirectory();
    });
};

// Helper function to get markdown files in a directory
const getMarkdownFiles = (localeDir) => {
    return fs
        .readdirSync(localeDir)
        .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"));
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

// Helper function to process a single markdown file
const processMarkdownFile = (filePath, locale) => {
    try {
        const content = fs.readFileSync(filePath, "utf8");
        const exportedMetadata = extractMetadataFromExport(content);

        if (!exportedMetadata) {
            throw new Error("Failed to extract metadata from export statement");
        }

        const fileName = path.basename(filePath);
        if (!exportedMetadata.title) {
            throw new Error(`Missing title in metadata for ${fileName}`);
        }

        const slug = path.basename(filePath, path.extname(filePath));
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
        };

        console.log(`  - Processed: ${fileName}`);
        return metadata;
    } catch (error) {
        console.error(
            `Error processing ${path.basename(filePath)}:`,
            error.message,
        );
        return null;
    }
};

// Helper function to process all files in a locale directory
const processLocaleDirectory = (locale, localeDir) => {
    console.log(`Processing locale: ${locale}`);
    const files = getMarkdownFiles(localeDir);
    const localeMetadata = [];

    files.forEach((file) => {
        const filePath = path.join(localeDir, file);
        const metadata = processMarkdownFile(filePath, locale);

        if (metadata) {
            localeMetadata.push(metadata);
        }
    });

    // Sort by date (newest first)
    localeMetadata.sort((a, b) => new Date(b.date) - new Date(a.date));
    return localeMetadata;
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
    const allMetadata = {};

    const blogDir = path.resolve(blogPath);
    const locales = getLocaleDirectories(blogDir);
    console.log(`Found locales: ${locales.join(", ")}`);

    // Process each locale
    locales.forEach((locale) => {
        const localeDir = path.join(blogDir, locale);
        allMetadata[locale] = processLocaleDirectory(locale, localeDir);
    });

    // Save the merged metadata
    saveMetadata(allMetadata, outputPath);

    // Generate and display statistics
    const stats = generateStats(allMetadata);
    console.log("\n=== Blog Metadata Generation Complete ===");
    console.log(`Total posts: ${stats.totalPosts}`);
    Object.entries(stats.postsByLocale).forEach(([locale, count]) => {
        console.log(`${locale}: ${count} posts`);
    });
};

generateMetadata();
