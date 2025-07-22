import Container from "@/components/layout/container";
import { Link } from "@/i18n/navigation";
import { getPopularTools } from "@/service/tool-service";
import { getRecentBlogs } from "@/service/blog-service";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { config, getLocalizedUrls, getLocalizedUrl } from "@/lib/config";

interface HomeProps {
    params: Promise<{
        locale: string;
    }>;
}

// SEO metadata for homepage
export async function generateMetadata({
    params,
}: HomeProps): Promise<Metadata> {
    const { locale } = await params;
    const t = await getTranslations("Homepage");
    const url = getLocalizedUrl(locale, "");

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
            languages: getLocalizedUrls(""),
        },
    };
}

export default async function Home({ params }: HomeProps) {
    const { locale } = await params;
    const t = await getTranslations("Homepage");
    const popularTools = await getPopularTools(6, locale);
    const recentPosts = await getRecentBlogs(3, locale);

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
                    <div className="mt-8 flex justify-center gap-4">
                        <Link
                            href="/tools"
                            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                            {t("browseTools")}
                        </Link>
                    </div>
                </div>
            </Container>

            {/* Popular Tools */}
            <Container className="py-16">
                <h2 className="text-3xl font-bold text-foreground text-center mb-12">
                    {t("popularTools")}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {popularTools.map((tool) => (
                        <Link
                            key={tool.slug}
                            href={`/tool/${tool.slug}`}
                            className="bg-card text-card-foreground p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border"
                        >
                            <h3 className="text-xl font-semibold text-foreground mb-2">
                                {tool.name}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                                {tool.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </Container>

            {/* Recent Blog Posts */}
            {recentPosts.length > 0 && (
                <Container className="py-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-foreground mb-4">
                            {t("recentPosts")}
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Stay updated with our latest insights, tutorials,
                            and tips about online tools and web development.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {recentPosts.map((post) => (
                            <article key={post.slug} className="group">
                                <Link
                                    href={`/blog/${post.slug}`}
                                    className="block bg-card text-card-foreground rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
                                >
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="bg-primary text-primary-foreground px-2 py-1 text-xs rounded">
                                                {post.category}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {post.readingTime} min read
                                            </span>
                                            {post.featured && (
                                                <span className="bg-accent text-accent-foreground px-2 py-1 text-xs rounded">
                                                    Featured
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                                            {post.description}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                                            <span>By {post.author}</span>
                                            <time dateTime={post.date}>
                                                {new Date(
                                                    post.date,
                                                ).toLocaleDateString(locale)}
                                            </time>
                                        </div>
                                    </div>
                                </Link>
                            </article>
                        ))}
                    </div>
                    <div className="text-center mt-12">
                        <Link
                            href="/blog"
                            className="inline-flex items-center px-6 py-3 border border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-lg font-medium transition-colors"
                        >
                            {t("viewAllPosts")}
                        </Link>
                    </div>
                </Container>
            )}

            {/* Why Use These Tools */}
            <Container className={"py-16"}>
                <div className="bg-muted/30 rounded-lg py-16">
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold text-foreground mb-6">
                            {t("privacyFirst")}
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            {t("privacyDescription")}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                            <div>
                                <h3 className="font-semibold text-foreground mb-2 text-xl">
                                    <span className="text-2xl">🔒</span>{" "}
                                    {t("private")}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {t("privateDesc")}
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground mb-2 text-xl">
                                    <span className="text-2xl">⚡</span>{" "}
                                    {t("fast")}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {t("fastDesc")}
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground mb-2 text-xl">
                                    <span className="text-2xl">🆓</span>{" "}
                                    {t("free")}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {t("freeDesc")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}
