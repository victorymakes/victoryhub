export interface RawTool {
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

export interface Tool {
  slug: string;
  name: string;
  description: string;
  category: Category;
  keywords: string[];
  faq: Array<{
    question: string;
    answer: string;
  }>;
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  icon?: string;
}
