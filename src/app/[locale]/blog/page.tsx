import Container from "@/components/layout/container";
import { Link } from "@/i18n/navigation";
import { getRecentBlogs } from "@/service/blog-service";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { config, getLocalizedUrls, getLocalizedUrl } from "@/lib/config";

interface BlogPageProps {
    params: Promise<{
        locale: string;
    }>;
}

// SEO metadata for blog listing page
export async function generateMetadata({
    params,
}: BlogPageProps): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations("Blog");
    const url = getLocalizedUrl(locale, "/blog");

    return {
        title: t("seoTitle"),
        description: t("seoDescription"),
        keywords: t("seoKeywords"),
        openGraph: {
            title: t("seoTitle"),
            description: t("seoDescription"),
            url,
            siteName: config.siteName,
            locale: locale,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: t("seoTitle"),
            description: t("seoDescription"),
        },
        alternates: {
            canonical: url,
            languages: getLocalizedUrls("/blog"),
        },
    };
}

export default async function BlogPage({ params }: BlogPageProps) {
    const { locale } = await params;
    const t = await getTranslations("Blog");
    const recentPosts = await getRecentBlogs(6, locale);

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

            {/* Recent Articles */}
            <Container className="py-16">
                <h2 className="text-3xl font-bold text-foreground text-center mb-12">
                    {t("recentArticles")}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {recentPosts.map((post) => (
                        <article key={post.slug} className="group">
                            <Link
                                href={`/blog/${post.slug}`}
                                className="block bg-card text-card-foreground rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="p-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="bg-muted text-muted-foreground px-2 py-1 text-xs rounded">
                                            {post.category}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {post.readingTime} min read
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                                        {post.description}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>
                                            {t("by")} {post.author}
                                        </span>
                                        <time dateTime={post.date}>
                                            {new Date(
                                                post.date,
                                            ).toLocaleDateString(locale)}
                                        </time>
                                    </div>
                                    {post.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-3">
                                            {post.tags
                                                .slice(0, 3)
                                                .map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="bg-muted text-muted-foreground px-2 py-1 text-xs rounded"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        </article>
                    ))}
                </div>
            </Container>

            {/* Newsletter Section */}
            <Container className="py-16 bg-muted/30">
                <div className="text-center max-w-2xl mx-auto">
                    <h2 className="text-3xl font-bold text-foreground mb-4">
                        {t("stayUpdated")}
                    </h2>
                    <p className="text-muted-foreground mb-8">
                        {t("newsletterDesc")}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                        <input
                            type="email"
                            placeholder={t("emailPlaceholder")}
                            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button className="bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors">
                            {t("subscribe")}
                        </button>
                    </div>
                </div>
            </Container>
        </div>
    );
}
