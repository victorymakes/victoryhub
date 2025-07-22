import * as blogData from "../../data/blog/metadata.json";
import React from "react";

interface Blog {
    slug: string;
    title: string;
    description: string;
    date: string;
    author: string;
    tags: string[];
    category: string;
    featured: boolean;
    draft: boolean;
    locale: string;
    readingTime: number;
    type: "mdx" | "md";
}

// Type assertion for the imported JSON data
const allBlogs = blogData as Record<string, Blog[]>;

export const getBlogs = async (locale: string = "en"): Promise<Blog[]> => {
    return allBlogs[locale]?.filter((post: Blog) => !post.draft) || [];
};

export const getRecentBlogs = async (
    count: number,
    locale: string = "en",
): Promise<Blog[]> => {
    const blogs = await getBlogs(locale);
    return blogs.slice(0, Math.max(count, blogs.length));
};

export const getBlogsByCategory = async (
    category: string,
    locale: string = "en",
): Promise<Blog[]> => {
    const posts = await getBlogs(locale);
    return posts.filter(
        (post: Blog) => post.category === category && !post.draft,
    );
};

export const getRelatedBlogs = async (blog: Blog, locale: string = "en") => {
    const posts = await getBlogsByCategory(locale, blog.category);
    return posts
        .filter((post: Blog) => post.slug !== blog.slug && !post.draft)
        .slice(0, 3);
};

export const getBlog = async (
    slug: string,
    locale: string = "en",
): Promise<Blog | null> => {
    const posts =
        allBlogs[locale]?.filter(
            (post: Blog) => !post.draft && post.slug === slug,
        ) || [];
    return posts.length > 0 ? posts[0] : null;
};

export const getBlogContent = async (
    blog: Blog,
    locale: string = "en",
): Promise<React.ComponentType | null> => {
    try {
        // Try to import MDX file for the specified locale
        const content = await import(
            `../../data/blog/${locale}/${blog.slug}.${blog.type}`
        );

        const MDXContent = content.default;
        if (!MDXContent) {
            throw new Error(
                `No default export found in ${locale}/${blog.slug}.${blog.type}`,
            );
        }

        // With the new export format, we can return the MDX content directly
        // The mdx-components.tsx will be automatically applied by Next.js
        return MDXContent;
    } catch (error) {
        console.warn(
            `Failed to load blog content for locale ${locale}, slug ${blog.slug}:`,
            error,
        );
        try {
            // Fallback to English if locale-specific file doesn't exist
            const content = await import(
                `../../data/blog/en/${blog.slug}.${blog.type}`
            );

            const MDXContent = content.default;
            if (!MDXContent) {
                throw new Error(
                    `No default export found in en/${blog.slug}.${blog.type}`,
                );
            }

            return MDXContent;
        } catch (fallbackError) {
            console.error(
                `Failed to load fallback blog content for slug ${blog.slug}:`,
                fallbackError,
            );
            return null;
        }
    }
};
