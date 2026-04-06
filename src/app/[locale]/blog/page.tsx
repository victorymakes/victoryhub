import type { Metadata } from "next";
import {
  CategoryPage,
  generateCategoryPageMetadata,
} from "@/components/blog/category-page";

interface CategoryPageProps {
  params: Promise<{
    locale: string;
  }>;
}

// SEO metadata for category page
export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { locale } = await params;
  return generateCategoryPageMetadata({ locale });
}

export default async function Page({ params }: CategoryPageProps) {
  const { locale } = await params;
  return CategoryPage({ locale });
}
