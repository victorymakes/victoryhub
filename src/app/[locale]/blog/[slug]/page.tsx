import Container from "@/components/common/container";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import Share from "@/components/common/share";
import {
    getBlog,
    getBlogContent,
    getRelatedBlogs,
} from "@/service/blog-service";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import {
    config,
    getLocalizedUrls,
    getLocalizedUrl,
    generateTitle,
} from "@/lib/config";
import Image from "next/image";
import BlogGrid from "@/components/blog/blog-grid";
import { BlogPostJsonLd } from "@/components/seo/page-json-ld";

interface BlogPostPageProps {
    params: Promise<{
        locale: string;
        slug: string;
    }>;
}

// SEO metadata generation
export async function generateMetadata({
    params,
}: BlogPostPageProps): Promise<Metadata> {
    const { locale, slug } = await params;
    const post = await getBlog(slug, locale);

    if (!post) {
        const t = await getTranslations("Blog");
        return {
            title: generateTitle(t("notFoundTitle")),
            description: t("notFoundDescription"),
        };
    }

    const url = getLocalizedUrl(locale, post.slug);

    return {
        title: generateTitle(post.title),
        description: post.description,
        keywords: post.tags.join(", "),
        authors: [{ name: post.author }],
        openGraph: {
            title: post.title,
            description: post.description,
            url,
            siteName: config.siteName,
            locale: locale,
            type: "article",
            publishedTime: post.date,
            authors: [post.author],
            tags: post.tags.map((item) => item.name),
            ...(post.cover && {
                images: [{ url: post.cover, alt: post.title }],
            }),
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.description,
            creator: `@${post.author}`,
            ...(post.cover && { images: [post.cover] }),
        },
        alternates: {
            canonical: url,
            languages: getLocalizedUrls(post.slug),
        },
        other: {
            "article:author": post.author,
            "article:published_time": post.date,
            "article:section": post.category.name,
            "article:tag": post.tags.join(","),
        },
    };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { locale, slug } = await params;
    const post = await getBlog(slug, locale);
    if (!post) {
        notFound();
    }

    const Content = await getBlogContent(post, locale);
    if (!Content) {
        notFound();
    }

    const t = await getTranslations("Blog");
    const relatedPosts = await getRelatedBlogs(post, locale);

    // Generate the full URL for sharing
    const shareUrl = getLocalizedUrl(locale, `/blog/${slug}`);
    return (
        <>
            {/* JSON-LD structured data */}
            <BlogPostJsonLd
                inLanguage={locale}
                url={shareUrl}
                title={post.title}
                description={post.description}
                authorName={post.author}
                publishDate={post.date}
                imageUrl={post.cover}
                tags={post.tags.map((tag) => tag.name)}
                categoryName={post.category.name}
                breadcrumbItems={[
                    { name: config.siteName, item: config.baseUrl },
                    {
                        name: t("title"),
                        item: getLocalizedUrl("locale", "/blog"),
                    },
                    { name: post.title, item: shareUrl },
                ]}
            />
            <div className="bg-background">
                {/* Article Header */}
                <Container className="py-16">
                    {/* Article Meta */}
                    <div className="mb-8 space-y-6">
                        <div className="flex items-center gap-4">
                            <Link
                                href={`/blog/category/${post.category.id}/page/1`}
                            >
                                <Badge>{post.category.name}</Badge>
                            </Link>
                            <span className="text-sm text-muted-foreground">
                                {post.readingTime} {t("minRead")}
                            </span>
                            {post.featured && <Badge>{t("featured")}</Badge>}
                        </div>

                        <h1 className="text-4xl font-bold text-foreground lg:text-5xl">
                            {post.title}
                        </h1>
                        <div className="flex items-center justify-between border-b">
                            <div className="flex items-center gap-4">
                                <div>
                                    <p className="font-medium text-foreground">
                                        {post.author}
                                    </p>
                                    <time
                                        dateTime={post.date}
                                        className="text-sm text-muted-foreground"
                                    >
                                        {new Date(post.date).toLocaleDateString(
                                            locale,
                                            {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            },
                                        )}
                                    </time>
                                </div>
                            </div>

                            {/* Tags */}
                            {post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {post.tags.map((tag) => (
                                        <span
                                            key={tag.id}
                                            className="bg-muted text-muted-foreground px-3 py-1 text-sm rounded-full"
                                        >
                                            #{tag.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        {/* Cover Image */}
                        {post.cover && (
                            <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow-lg">
                                <Image
                                    fill
                                    src={post.cover}
                                    alt={post.title}
                                    className="object-cover"
                                />
                            </div>
                        )}
                    </div>

                    {/* Article Content */}
                    <article className="prose prose-neutral dark:prose-invert max-w-none">
                        <Content />
                    </article>

                    {/* Article Footer */}
                    <div className="border-t pt-8 mt-12">
                        <div className="flex items-center justify-between gap-4">
                            <Link
                                href="/blog"
                                className="text-primary hover:text-primary/80 transition-colors"
                            >
                                {t("backToBlog")}
                            </Link>

                            <Share
                                url={shareUrl}
                                title={post.title}
                                description={post.description}
                                hashtags={[
                                    config.siteName,
                                    "blog",
                                    ...post.tags.map((tag) => tag.name),
                                ]}
                            />
                        </div>
                    </div>
                </Container>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                    <Container className="py-16 bg-muted/30 mb-16">
                        <h2 className="text-2xl font-bold text-foreground mb-8">
                            {t("relatedArticles")}
                        </h2>
                        <BlogGrid blogs={relatedPosts} hideCover={false} />
                    </Container>
                )}
            </div>
        </>
    );
}
