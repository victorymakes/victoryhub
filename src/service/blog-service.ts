import type React from "react";
import { getPageContent, getPagesByType } from "@/service/cms-service";
import type { Category, Page } from "@/types/page";
import type { Pagination } from "@/types/pagination";

const getSlug = (slug: string) => {
  return slug.startsWith("blog/") ? slug : `blog/${slug}`;
};

export const getBlogs = async (locale: string = "en"): Promise<Page[]> => {
  return await getPagesByType("blog", locale);
};

export const getRecentBlogs = async (
  count: number,
  locale: string = "en",
): Promise<Page[]> => {
  const blogs = await getBlogs(locale);
  return blogs.slice(0, Math.min(count, blogs.length));
};

export const getBlogsByCategory = async (
  category: string,
  locale: string = "en",
): Promise<Page[]> => {
  const posts = await getBlogs(locale);
  return posts.filter(
    (post: Page) => post.category.id === category && !post.draft,
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
): Promise<Pagination<Page>> => {
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

export const getRelatedBlogs = async (blog: Page, locale: string = "en") => {
  const posts = await getBlogsByCategory(blog.category.id, locale);
  return posts
    .filter((post: Page) => post.slug !== blog.slug && !post.draft)
    .slice(0, 3);
};

export const getBlog = async (
  slug: string,
  locale: string = "en",
): Promise<Page | null> => {
  slug = getSlug(slug);
  const posts =
    (await getBlogs(locale)).filter(
      (post: Page) => !post.draft && post.slug === slug,
    ) || [];
  return posts.length > 0 ? posts[0] : null;
};

export const getBlogContent = async (
  page: Page,
  locale: string = "en",
): Promise<React.ComponentType | null> => {
  if (page.type !== "blog") {
    return null;
  }
  return await getPageContent(page.slug, locale);
};
