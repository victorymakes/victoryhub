import { redirect } from "next/navigation";

interface BlogPageProps {
    params: Promise<{
        locale: string;
    }>;
}

export default async function BlogPage({ params }: BlogPageProps) {
    const { locale } = await params;

    // Redirect to all category, page 1 by default
    redirect(`/${locale}/blog/category/all/page/1`);
}
