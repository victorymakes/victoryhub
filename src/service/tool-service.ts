import fs from 'fs';
import path from 'path';

interface ToolService {
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

export const getTools = (locale: string = 'en'): ToolService[] => {
    // Check if the locale file exists, fallback to English if not
    const localePath = path.join(process.cwd(), 'data', 'tool', `${locale}.json`);
    const fallbackPath = path.join(process.cwd(), 'data', 'tool', 'en.json');

    const filePath = fs.existsSync(localePath) ? localePath : fallbackPath;
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
};

export const getTool = (slug: string, locale: string = 'en'): ToolService | null => {
    const tools = getTools(locale);
    return tools.find(tool => tool.slug === slug) || null;
};
