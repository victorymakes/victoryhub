import Container from "@/components/layout/container";
import CategoryFilters from "@/components/blog/blog-filters";
import BlogGrid from "@/components/blog/blog-grid";
import BlogPagination from "@/components/blog/blog-pagination";
import { getPaginatedBlogs, getCategories } from "@/service/blog-service";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { config, getLocalizedUrls, getLocalizedUrl } from "@/lib/config";
import { notFound } from "next/navigation";

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
    const t = await getTranslations("Blog");
    const url = getLocalizedUrl(
        locale,
        `/blog/category/${category}/page/${page}`,
    );

    return {
        title: `${t("seoTitle")} - ${category} - ${t("page")} ${page}`,
        description: t("seoDescription"),
        keywords: t("seoKeywords"),
        openGraph: {
            title: `${t("seoTitle")} - ${category}`,
            description: t("seoDescription"),
            url,
            siteName: config.siteName,
            locale: locale,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: `${t("seoTitle")} - ${category}`,
            description: t("seoDescription"),
        },
        alternates: {
            canonical: url,
            languages: getLocalizedUrls(
                `/blog/category/${category}/page/${page}`,
            ),
        },
    };
}

export default async function CategoryPageWithPagination({
    params,
}: CategoryPageProps) {
    const { locale, category, page } = await params;
    const t = await getTranslations("Blog");

    const currentPage = parseInt(page, 10);

    // Validate page number
    if (isNaN(currentPage) || currentPage < 1) {
        notFound();
    }

    const postsPerPage = 6;

    // Get paginated blogs and categories
    const paginationData = await getPaginatedBlogs(
        currentPage,
        postsPerPage,
        category === "all" ? undefined : category,
        locale,
    );

    const categories = await getCategories(locale);

    // Check if page exists
    if (
        currentPage > paginationData.totalPages &&
        paginationData.totalPages > 0
    ) {
        notFound();
    }

    return (
        <div className="bg-background">
            {/* Hero Section */}
            <Container className="py-16">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-foreground sm:text-6xl">
                        {t("title")}
                    </h1>
                    <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
                        {t("subtitle")}
                    </p>
                </div>
            </Container>

            {/* Blog Content */}
            <Container className="py-16 space-y-12">
                {/* Category Filters */}
                <CategoryFilters
                    categories={categories}
                    currentCategory={category}
                />

                {/* Blog Grid */}
                <BlogGrid blogs={paginationData.blogs} />

                {/* Pagination */}
                <BlogPagination
                    currentPage={paginationData.currentPage}
                    totalPages={paginationData.totalPages}
                    category={category}
                />
            </Container>
        </div>
    );
}
