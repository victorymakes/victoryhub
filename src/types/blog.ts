export interface Category {
    id: string;
    name: string;
}

export interface Tag {
    id: string;
    name: string;
}

export interface Blog {
    slug: string;
    title: string;
    description: string;
    date: string;
    author: string;
    tags: Tag[];
    category: Category;
    featured: boolean;
    draft: boolean;
    locale: string;
    readingTime: number;
    cover?: string;
}
