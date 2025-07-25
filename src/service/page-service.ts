import * as pageData from "../../data/page/metadata.json";
import React from "react";
import { Page } from "@/types/page";

// Type assertion for the imported JSON data
const allPages = pageData as unknown as Record<string, Page[]>;

export const getPage = async (
    slug: string,
    locale: string = "en",
): Promise<Page | null> => {
    const pages = (await getPages(locale)).filter((item) => item.slug === slug);
    return pages ? pages[0] : null;
};

export const getPages = async (locale: string = "en"): Promise<Page[]> => {
    return allPages[locale]?.filter((post: Page) => !post.draft) || [];
};

export const getPagesByType = async (
    type: string,
    locale: string = "en",
): Promise<Page[]> => {
    const pages = await getPages(locale);
    return pages.filter((page: Page) => page.type === type);
};

export const getPageContent = async (
    slug: string,
    locale: string = "en",
): Promise<React.ComponentType | null> => {
    try {
        // Try to import MDX file for the specified locale
        const content = await import(`../../data/page/${slug}/${locale}.mdx`);
        return content.default;
    } catch (error) {
        console.warn(
            `Failed to load blog content for locale ${locale}, slug ${slug}:`,
            error,
        );
        try {
            // Fallback to English if locale-specific file doesn't exist
            const content = await import(`../../data/${slug}/en.mdx`);
            return content.default;
        } catch (fallbackError) {
            console.error(
                `Failed to load fallback blog content for slug ${slug}:`,
                fallbackError,
            );
            return null;
        }
    }
};
