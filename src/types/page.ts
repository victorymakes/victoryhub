export interface Category {
  id: string;
  name: string;
}

export interface Tag {
  id: string;
  name: string;
}

export interface Page {
  slug: string;
  title: string;
  description: string;
  date: string;
  author: string;
  featured: boolean;
  draft: boolean;
  locale: string;
  tags: Tag[];
  category: Category;
  readingTime: number;
  cover?: string;
  type: "blog" | "page";
}
