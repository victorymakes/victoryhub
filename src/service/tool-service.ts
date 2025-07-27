import { Category, Tool, RawTool } from "@/types/tool";

const loadCategories = async (locale: string = "en"): Promise<Category[]> => {
    try {
        // Try to import the locale-specific file
        const categories = await import(
            `../../data/tool-category/${locale}.json`
        );
        return categories.default;
    } catch {
        // Fallback to English if locale file doesn't exist
        const categories = await import(`../../data/tool-category/en.json`);
        return categories.default;
    }
};

const loadTools = async (locale: string = "en"): Promise<RawTool[]> => {
    try {
        // Try to import the locale-specific file
        const tools = await import(`../../data/tool/${locale}.json`);
        return tools.default;
    } catch {
        // Fallback to English if locale file doesn't exist
        const tools = await import(`../../data/tool/en.json`);
        return tools.default;
    }
};

export const getCategories = async (
    locale: string = "en",
): Promise<Category[]> => {
    return loadCategories(locale);
};

export const getTools = async (locale: string = "en"): Promise<Tool[]> => {
    const categories = await getCategories(locale);
    const categoryMap = new Map(categories.map((cat) => [cat.slug, cat]));
    const tools = await loadTools(locale);

    const validTools: Tool[] = [];

    for (const tool of tools) {
        if (categoryMap.has(tool.category)) {
            validTools.push({
                ...tool,
                category: categoryMap.get(tool.category)!,
            });
        } else {
            console.error(
                `Tool "${tool.slug}" has invalid category "${tool.category}" - no mapping found in locale "${locale}"`,
            );
        }
    }
    return validTools;
};

export const getPopularTools = async (
    count: number = 6,
    locale: string = "en",
): Promise<Tool[]> => {
    const tools = await getTools(locale);
    return tools.slice(0, Math.min(count, tools.length));
};

export const getTool = async (
    slug: string,
    locale: string = "en",
): Promise<Tool | null> => {
    const tools = await getTools(locale);
    return tools.find((tool) => tool.slug === slug) || null;
};
