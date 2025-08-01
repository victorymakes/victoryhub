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

    // Create CollectionPage JSON-LD data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': `${t("seoTitle")} - ${category}`,
        'description': t("seoDescription"),
        'url': `${config.baseUrl}${url}`,
        'publisher': {
            '@type': 'Organization',
            'name': config.siteName,
            'url': config.baseUrl
        },
        'inLanguage': locale || config.defaultLocale,
    };

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
        other: {
            "script:ld+json": JSON.stringify(jsonLd)
        }
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

    const postsPerPage = 3;

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
            </Container>
        </div>
    );
};
