import Container from "@/components/layout/container";
import { Link } from "@/i18n/navigation";
import {
    getBlog,
    getBlogContent,
    getRelatedBlogs,
} from "@/service/blog-service";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { config, getLocalizedUrls, getLocalizedUrl } from "@/lib/config";

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
            title: t("notFoundTitle"),
            description: t("notFoundDescription"),
        };
    }

    const url = getLocalizedUrl(locale, `/blog/${slug}`);

    return {
        title: post.title,
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
            tags: post.tags,
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.description,
            creator: `@${post.author}`,
        },
        alternates: {
            canonical: url,
            languages: getLocalizedUrls(`/blog/${slug}`),
        },
        other: {
            "article:author": post.author,
            "article:published_time": post.date,
            "article:section": post.category,
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

    return (
        <div className="bg-background">
            {/* Article Header */}
            <Container className="py-16">
                <div className="max-w-4xl mx-auto">
                    {/* Article Meta */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <span className="bg-primary text-primary-foreground px-3 py-1 text-sm rounded-full">
                                {post.category}
                            </span>
                            <span className="text-sm text-muted-foreground">
                                {post.readingTime} min read
                            </span>
                            {post.featured && (
                                <span className="bg-accent text-accent-foreground px-3 py-1 text-sm rounded-full">
                                    {t("featured")}
                                </span>
                            )}
                        </div>

                        <h1 className="text-4xl font-bold text-foreground mb-4 lg:text-5xl">
                            {post.title}
                        </h1>

                        <div className="flex items-center justify-between border-b pb-6">
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
                                            key={tag}
                                            className="bg-muted text-muted-foreground px-3 py-1 text-sm rounded-full"
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Article Content */}
                    <article className="prose prose-neutral dark:prose-invert max-w-none">
                        <Content />
                    </article>

                    {/* Article Footer */}
                    <div className="border-t pt-8 mt-12">
                        <div className="flex items-center justify-between">
                            <Link
                                href="/blog"
                                className="text-primary hover:text-primary/80 transition-colors"
                            >
                                ← Back to Blog
                            </Link>

                            <div className="flex items-center gap-4">
                                <span className="text-sm text-muted-foreground">
                                    Share:
                                </span>
                                <button className="text-muted-foreground hover:text-foreground transition-colors">
                                    Twitter
                                </button>
                                <button className="text-muted-foreground hover:text-foreground transition-colors">
                                    LinkedIn
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
                <Container className="py-16 bg-muted/30">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold text-foreground mb-8">
                            Related Articles
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedPosts.map((relatedPost) => (
                                <article
                                    key={relatedPost.slug}
                                    className="group"
                                >
                                    <Link
                                        href={`/blog/${relatedPost.slug}`}
                                        className="block bg-card text-card-foreground rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
                                    >
                                        <div className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="bg-muted text-muted-foreground px-2 py-1 text-xs rounded">
                                                    {relatedPost.category}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {relatedPost.readingTime}{" "}
                                                    min
                                                </span>
                                            </div>
                                            <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                                {relatedPost.title}
                                            </h3>
                                            <p className="text-muted-foreground text-sm line-clamp-2">
                                                {relatedPost.description}
                                            </p>
                                            <div className="mt-3 text-xs text-muted-foreground">
                                                {new Date(
                                                    relatedPost.date,
                                                ).toLocaleDateString(locale)}
                                            </div>
                                        </div>
                                    </Link>
                                </article>
                            ))}
                        </div>
                    </div>
                </Container>
            )}
        </div>
    );
}
