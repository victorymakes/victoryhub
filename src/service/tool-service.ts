interface Tool {
    slug: string;
    name: string;
    description: string;
    category: string;
    keywords: string[];
    faq: Array<{
        question: string;
        answer: string;
    }>;
}

export const getTools = async (locale: string = 'en'): Promise<Tool[]> => {
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

export const getTool = async (slug: string, locale: string = 'en'): Promise<Tool | null> => {
    const tools = await getTools(locale);
    return tools.find(tool => tool.slug === slug) || null;
};
