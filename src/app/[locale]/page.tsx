import Container from "@/components/common/container";
import { Link } from "@/i18n/navigation";
import { getPopularTools } from "@/service/tool-service";
import { getRecentBlogs } from "@/service/blog-service";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import {
    config,
    getLocalizedUrls,
    getLocalizedUrl,
    generateTitle,
} from "@/lib/config";
import BlogGrid from "@/components/blog/blog-grid";
import ToolGrid from "@/components/tool/tool-grid";

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
        title: generateTitle(t("seoTitle")),
        description: t("seoDescription"),
        keywords: t("seoKeywords"),
        openGraph: {
            title: generateTitle(t("seoTitle")),
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
                <ToolGrid tools={popularTools} />
            </Container>

            {/* Recent Blog Posts */}
            {recentPosts.length > 0 && (
                <Container className="py-16">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-foreground mb-4">
                            {t("recentPosts")}
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            {t("recentPostsDesc")}
                        </p>
                    </div>
                    <BlogGrid blogs={recentPosts} />
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
                <div className="bg-muted rounded-lg py-16">
                    <div className="text-center max-w-3xl mx-auto">
                        <h2 className="text-3xl font-bold text-foreground mb-6">
                            {t("privacyFirst")}
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            {t("privacyDescription")}
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                            <div>
                                <h3 className="font-semibold text-foreground mb-2 text-2xl">
                                    <span className="text-2xl">🔒</span>{" "}
                                    {t("private")}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {t("privateDesc")}
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground mb-2 text-2xl">
                                    <span className="text-2xl">⚡</span>{" "}
                                    {t("fast")}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {t("fastDesc")}
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground mb-2 text-2xl">
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
