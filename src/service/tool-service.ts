import { Category, Tool, RawTool } from "@/types/tool";

const loadCategories = async (locale: string = "en"): Promise<Category[]> => {
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

const loadTools = async (locale: string = "en"): Promise<RawTool[]> => {
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
    locale: string = "en",
): Promise<Category[]> => {
    return loadCategories(locale);
};

export const getTools = async (locale: string = "en"): Promise<Tool[]> => {
    const categories = await getCategories(locale);
    const categoryMap = new Map(categories.map((cat) => [cat.slug, cat]));
    const tools = await loadTools(locale);

    const validTools: Tool[] = [];
    const notPublishedTools = ["image-resizer"];

    for (const tool of tools) {
        if (notPublishedTools.includes(tool.slug)) {
            continue;
        }

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
    const popularTools = [
        "password-generator",
        "whats-my-ip",
        "timestamp-converter",
        "url-encoder-decoder",
        "image-compressor",
        "image-converter",
    ];
    const tools = await getTools(locale);
    const sortedPopular = popularTools
        .map((slug) => tools.find((tool) => tool.slug === slug))
        .filter(Boolean) as Tool[];
    return sortedPopular.slice(0, Math.min(count, sortedPopular.length));
};

export const getTool = async (
    slug: string,
    locale: string = "en",
): Promise<Tool | null> => {
    const tools = await getTools(locale);
    return tools.find((tool) => tool.slug === slug) || null;
};

export const getRelatedTools = async (
    tool: Tool,
    locale: string = "en",
): Promise<Tool[]> => {
    let tools = await getTools(locale);
    tools = tools.filter(
        (t) => t.category.slug === tool.category.slug && t.slug !== tool.slug,
    );
    return tools.sort(() => Math.random() - 0.5).slice(0, 3);
};
