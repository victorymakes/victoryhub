import { redirect } from "next/navigation";

interface CategoryPageProps {
    params: Promise<{
        locale: string;
        category: string;
    }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const { locale, category } = await params;

    // Redirect to page 1 by default
    redirect(`/${locale}/blog/category/${category}/page/1`);
}
