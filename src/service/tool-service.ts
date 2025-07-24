import { Category, Tool } from "@/types/tool";

export const getCategories = async (
    locale: string = "en",
): Promise<Category[]> => {
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

export const getTools = async (locale: string = "en"): Promise<Tool[]> => {
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

export const getPopularTools = async (
    count: number = 6,
    locale: string = "en",
): Promise<Tool[]> => {
    const tools = await getTools(locale);
    return tools.slice(0, Math.max(count, tools.length));
};

export const getTool = async (
    slug: string,
    locale: string = "en",
): Promise<Tool | null> => {
    const tools = await getTools(locale);
    return tools.find((tool) => tool.slug === slug) || null;
};
