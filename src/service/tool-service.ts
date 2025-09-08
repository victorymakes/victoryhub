import { Category, RawTool, Tool } from "@/types/tool";
import { cache } from "../lib/cache";

export const initToolDB = async (locale: string) => {
    // In-memory cache for tool category
    // Structure: TOOLS_CACHE[locale][categorySlug]= toolSlug[]
    const TOOL_CATEGORY_CACHE: Record<string, Record<string, string[]>> = {};

    // In-memory cache for tools
    // Structure: TOOLS_CACHE[locale][toolSlug] = Tool
    const TOOL_CACHE: Record<string, Record<string, Tool>> = {};

    // In-memory cache for categories
    // Structure: CATEGORY_CACHE[locale][categorySlug] = Category
    const CATEGORY_CACHE: Record<string, Record<string, Category>> = {};

    // init category cache
    const categories = await loadCategories(locale);
    CATEGORY_CACHE[locale] = {};
    for (const category of categories) {
        CATEGORY_CACHE[locale][category.slug] = category;
    }

    // init tool cache
    const tools = await loadTools(locale);
    TOOL_CACHE[locale] = {};
    TOOL_CATEGORY_CACHE[locale] = {};
    for (const tool of tools) {
        TOOL_CACHE[locale][tool.slug] = {
            ...tool,
            category: CATEGORY_CACHE[locale][tool.category]
        };
        if (!TOOL_CATEGORY_CACHE[locale][tool.category]) {
            TOOL_CATEGORY_CACHE[locale][tool.category] = [];
        }
        TOOL_CATEGORY_CACHE[locale][tool.category].push(tool.slug);
    }

    return { CATEGORY_CACHE, TOOL_CACHE, TOOL_CATEGORY_CACHE };
};

export function getToolDB(locale: string) {
    return cache(() => initToolDB(locale), ["tooldb", locale])();
}

export const loadCategories = async (
    locale: string = "en"
): Promise<Category[]> => {
    try {
        // Try to import the locale-specific file
        const categories = await import(
            `../../data/db/tool-category/${locale}.json`
            );
        return categories.default;
    } catch {
        // Fallback to English if locale file doesn't exist
        const categories = await import(`../../data/db/tool-category/en.json`);
        return categories.default;
    }
};

export const loadTools = async (locale: string = "en"): Promise<RawTool[]> => {
    try {
        // Try to import the locale-specific file
        const tools = await import(`../../data/db/tool/${locale}.json`);
        return tools.default;
    } catch {
        // Fallback to English if locale file doesn't exist
        const tools = await import(`../../data/db/tool/en.json`);
        return tools.default;
    }
};

export const getCategories = async (
    locale: string = "en"
): Promise<Category[]> => {
    const { CATEGORY_CACHE } = await getToolDB(locale);
    return Object.values(CATEGORY_CACHE[locale]);
};

export const getTools = async (locale: string = "en"): Promise<Tool[]> => {
    const { TOOL_CACHE } = await getToolDB(locale);
    return Object.values(TOOL_CACHE[locale]);
};

export const getPopularTools = async (
    count: number = 6,
    locale: string = "en"
): Promise<Tool[]> => {
    const popularTools = [
        "password-generator",
        "whats-my-ip",
        "timestamp-converter",
        "url-encoder-decoder",
        "image-compressor",
        "image-converter"
    ];
    const { TOOL_CACHE } = await getToolDB(locale);
    return popularTools
        .map((slug) => TOOL_CACHE[locale][slug])
        .slice(0, Math.min(popularTools.length, count));
};

export const getTool = async (
    slug: string,
    locale: string = "en"
): Promise<Tool | null> => {
    const { TOOL_CACHE } = await getToolDB(locale);
    return TOOL_CACHE[locale][slug];
};

const getToolsByCategory = async (
    categorySlug: string,
    locale: string = "en"
): Promise<Tool[]> => {
    const { TOOL_CATEGORY_CACHE, TOOL_CACHE } = await getToolDB(locale);
    return (
        TOOL_CATEGORY_CACHE[locale][categorySlug]?.map(
            (slug) => TOOL_CACHE[locale][slug]
        ) || []
    );
};

export const getRelatedTools = async (
    tool: Tool,
    locale: string = "en"
): Promise<Tool[]> => {
    let tools = await getToolsByCategory(tool.category.slug, locale);
    // exclude the current tool
    tools = tools.filter((t) => t.slug !== tool.slug);
    if (tools.length === 0) {
        return [];
    }

    // randomly select up to 3 tools from the same category
    const m = tools.length;
    const k = Math.min(3, m);
    for (let i = 0; i < k; i++) {
        const j = i + Math.floor(Math.random() * (m - i));
        const tmp = tools[i];
        tools[i] = tools[j];
        tools[j] = tmp;
    }
    return tools.slice(0, k);
};
