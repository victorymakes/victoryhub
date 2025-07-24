import { Metadata } from "next";
import {
    CategoryPage,
    generateCategoryPageMetadata,
} from "@/components/blog/category-page";

interface CategoryPageProps {
    params: Promise<{
        locale: string;
        category: string;
        page: string;
    }>;
}

// SEO metadata for category page
export async function generateMetadata({
    params,
}: CategoryPageProps): Promise<Metadata> {
    const { locale, category, page } = await params;
    return generateCategoryPageMetadata({ locale, category, page });
}

export default async function Page({ params }: CategoryPageProps) {
    const { locale, category, page } = await params;
    return CategoryPage({ locale, category, page });
}
