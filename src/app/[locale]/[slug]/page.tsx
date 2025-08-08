import { notFound } from "next/navigation";
import { getPage, getPageContent } from "@/service/cms-service";
import Container from "@/components/common/container";
import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
    config,
    generateTitle,
    getLocalizedUrl,
    getLocalizedUrls,
} from "@//lib/config";

interface PageProps {
    params: Promise<{
        locale: string;
        slug: string;
    }>;
}

// SEO metadata generation
export async function generateMetadata({
    params,
}: PageProps): Promise<Metadata> {
    const { locale, slug } = await params;
    const page = await getPage(slug, locale);

    if (!page) {
        const t = await getTranslations("Page");
        return {
            title: generateTitle(t("notFoundTitle")),
            description: t("notFoundDescription"),
        };
    }

    const url = getLocalizedUrl(locale, page.slug);

    // Create JSON-LD structured data for page
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: page.title,
        description: page.description,
        url: `${config.baseUrl}${url}`,
        datePublished: page.date,
        author: {
            "@type": "Person",
            name: page.author,
        },
        publisher: {
            "@type": "Organization",
            name: config.siteName,
            logo: {
                "@type": "ImageObject",
                url: `${config.baseUrl}/logo.png`,
            },
        },
        inLanguage: locale,
    };

    return {
        title: generateTitle(page.title),
        description: page.description,
        keywords: page.tags?.join(", ") ?? "",
        authors: [{ name: page.author }],
        openGraph: {
            title: page.title,
            description: page.description,
            url,
            siteName: config.siteName,
            locale: locale,
            type: "article",
            publishedTime: page.date,
            authors: [page.author],
            tags: page.tags?.map((item) => item.name) ?? [],
            ...(page.cover && {
                images: [{ url: page.cover, alt: page.title }],
            }),
        },
        twitter: {
            card: "summary_large_image",
            title: page.title,
            description: page.description,
            creator: `@${page.author}`,
            ...(page.cover && { images: [page.cover] }),
        },
        alternates: {
            canonical: url,
            languages: getLocalizedUrls(page.slug),
        },
        other: {
            "article:author": page.author,
            "article:published_time": page.date,
            "article:section": page.category?.name ?? "",
            "article:tag": page.tags?.join(",") ?? "",
            "script:ld+json": JSON.stringify(jsonLd),
        },
    };
}

export default async function DynamicPage({ params }: PageProps) {
    const { locale, slug } = await params;

    // Get page content
    const Content = await getPageContent(slug, locale);

    if (!Content) {
        notFound();
    }

    return (
        <div className="bg-background">
            {/* Article Header */}
            <Container className="py-16">
                <article className="prose prose-neutral dark:prose-invert max-w-none">
                    <Content />
                </article>
            </Container>
        </div>
    );
}
