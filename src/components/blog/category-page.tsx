import { getTranslations } from "next-intl/server";
import { getCategories, getPaginatedBlogs } from "@/service/blog-service";
import { notFound } from "next/navigation";
import Container from "@/components/common/container";
import CategoryFilters from "@/components/blog/blog-filters";
import BlogGrid from "@/components/blog/blog-grid";
import BlogPagination from "@/components/blog/blog-pagination";
import {
    config,
    getLocalizedUrl,
    getLocalizedUrls,
    generateTitle,
} from "@/lib/config";
import { BlogCategoryJsonLd } from "@/components/seo/page-json-ld";

interface CategoryPageProps {
    locale: string;
    category?: string;
    page?: string;
}

export const generateCategoryPageMetadata = async ({
    locale,
    category,
    page,
}: CategoryPageProps) => {
    const t = await getTranslations("Blog");
    category = category || "all";
    page = page || "1";
    const url = getLocalizedUrl(
        locale,
        `/blog/category/${category}/page/${page}`,
    );
    const pageTitle = `${t("seoTitle")} - ${category} - ${t("page")} ${page}`;

    return {
        title: generateTitle(pageTitle),
        description: t("seoDescription"),
        keywords: t("seoKeywords"),
        openGraph: {
            title: generateTitle(`${t("seoTitle")} - ${category}`),
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
};

export const CategoryPage = async ({
    locale,
    category,
    page,
}: CategoryPageProps) => {
    const t = await getTranslations("Blog");
    page = page || "1";
    category = category || "all";

    const currentPage = parseInt(page || "1", 10);

    // Validate page number
    if (isNaN(currentPage) || currentPage < 1) {
        notFound();
    }

    const postsPerPage = 6;

    // Get paginated blogs and categories
    const paginationData = await getPaginatedBlogs(
        currentPage,
        postsPerPage,
        category,
        locale,
    );
    // Check if page exists
    if (
        currentPage > paginationData.totalPages &&
        paginationData.totalPages > 0
    ) {
        notFound();
    }

    const categories = await getCategories(locale);

    // JSON-LD info
    const url = getLocalizedUrl(
        locale,
        `/blog/category/${category}/page/${page}`,
    );
    const categoryName =
        categories.find((cat) => cat.id === category)?.name || category;
    return (
        <>
            {/* JSON-LD structured data */}
            <BlogCategoryJsonLd
                url={url}
                title={`${t("seoTitle")} - ${category}`}
                description={t("seoDescription")}
                breadcrumbItems={[
                    { name: config.siteName, item: config.baseUrl },
                    {
                        name: t("seoTitle"),
                        item: getLocalizedUrl(locale, "/blog"),
                    },
                    { name: categoryName, item: url },
                ]}
                blogItems={paginationData.items.map((post, index) => ({
                    name: post.title,
                    url: getLocalizedUrl(locale, post.slug),
                    image: post.cover,
                    description: post.description,
                    position: index + 1,
                }))}
                inLanguage={locale}
            />

            {/* Page Content */}
            <div className="bg-background">
                <Container className="py-16 space-y-12">
                    {/* Hero Section */}
                    <div className="text-center">
                        <h1 className="text-4xl font-bold text-foreground sm:text-6xl">
                            {t("title")}
                        </h1>
                        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
                            {t("subtitle")}
                        </p>
                    </div>

                    {/* Blog Content */}
                    <div className="space-y-12">
                        {/* Category Filters */}
                        <CategoryFilters
                            categories={categories}
                            currentCategoryId={category}
                        />

                        {/* Blog Grid */}
                        <BlogGrid blogs={paginationData.items} />

                        {/* Pagination */}
                        <BlogPagination
                            currentLocale={locale}
                            currentCategoryId={category}
                            currentPage={paginationData.currentPage}
                            totalPages={paginationData.totalPages}
                        />
                    </div>
                </Container>
            </div>
        </>
    );
};
