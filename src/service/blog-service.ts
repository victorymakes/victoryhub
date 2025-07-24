import * as blogData from "../../data/blog/metadata.json";
import React from "react";
import { Blog, Category } from "@/types/blog";
import { Pagination } from "@/types/page";

// Type assertion for the imported JSON data
const allBlogs = blogData as unknown as Record<string, Blog[]>;

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
        (post: Blog) => post.category.id === category && !post.draft,
    );
};

// Get unique categories from all blogs
export const getCategories = async (
    locale: string = "en",
): Promise<Category[]> => {
    const blogs = await getBlogs(locale);
    const categoryMap = new Map<string, Category>();
    blogs.forEach((blog) => {
        categoryMap.set(blog.category.id, blog.category);
    });
    // return sorted categories by id
    return Array.from(categoryMap.values()).sort((a, b) =>
        a.id.localeCompare(b.id),
    );
};

// Get paginated blogs with optional category filter
export const getPaginatedBlogs = async (
    page: number = 1,
    limit: number = 6,
    category?: string,
    locale: string = "en",
): Promise<Pagination<Blog>> => {
    let blogs = await getBlogs(locale);

    // Filter by category if provided
    if (category && category !== "all") {
        blogs = blogs.filter((blog) => blog.category.id === category);
    }

    const totalItems = blogs.length;
    const totalPages = Math.ceil(totalItems / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBlogs = blogs.slice(startIndex, endIndex);

    return {
        items: paginatedBlogs,
        totalItems,
        totalPages,
        currentPage: page,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };
};

export const getRelatedBlogs = async (blog: Blog, locale: string = "en") => {
    const posts = await getBlogsByCategory(blog.category.id, locale);
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
            `../../data/blog/${locale}/${blog.slug}.mdx`
        );
        return content.default;
    } catch (error) {
        console.warn(
            `Failed to load blog content for locale ${locale}, slug ${blog.slug}:`,
            error,
        );
        try {
            // Fallback to English if locale-specific file doesn't exist
            const content = await import(`../../data/blog/en/${blog.slug}.mdx`);
            return content.default;
        } catch (fallbackError) {
            console.error(
                `Failed to load fallback blog content for slug ${blog.slug}:`,
                fallbackError,
            );
            return null;
        }
    }
};
