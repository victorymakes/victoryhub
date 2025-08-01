import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ToolComponent } from "@/components/tool/tool";
import Container from "@/components/common/container";
import Share from "@/components/common/share";
import { FAQSection } from "@/components/tool/faq-section";
import { getTool } from "@/service/tool-service";
import {
    config,
    getLocalizedUrls,
    getLocalizedUrl,
    generateTitle,
} from "@/lib/config";
import { getTranslations } from "next-intl/server";

interface ToolPageProps {
    params: Promise<{
        slug: string;
        locale: string;
    }>;
}

export async function generateMetadata({
    params,
}: ToolPageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const tool = await getTool(resolvedParams.slug, resolvedParams.locale);

    if (!tool) {
        const t = await getTranslations("ToolDetail");
        return {
            title: generateTitle(t("notFoundTitle")),
            description: t("notFoundDescription"),
        };
    }

    const url = getLocalizedUrl(
        resolvedParams.locale,
        `/tool/${resolvedParams.slug}`,
    );

    const jsonLdSchemas = [];
    // 创建JSON-LD结构化数据
    jsonLdSchemas.push({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: tool.name,
        description: tool.description,
        applicationCategory: "WebApplication",
        operatingSystem: "Any",
        offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
        },
        url: url,
        provider: {
            "@type": "Organization",
            name: config.siteName,
            url: config.baseUrl,
        },
        keywords: tool.keywords?.join(", "),
        inLanguage: resolvedParams.locale || config.defaultLocale,
    });

    // Add FAQ schema if FAQ items exist
    if (tool.faq && tool.faq.length > 0) {
        jsonLdSchemas.push({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: tool.faq.map((item) => ({
                "@type": "Question",
                name: item.question,
                acceptedAnswer: {
                    "@type": "Answer",
                    text: item.answer,
                },
            })),
        });
    }

    return {
        title: generateTitle(tool.name),
        description: tool.description,
        keywords: tool.keywords,
        openGraph: {
            title: generateTitle(tool.name),
            description: tool.description,
            url,
            siteName: config.siteName,
            locale: resolvedParams.locale,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: tool.name,
            description: tool.description,
        },
        alternates: {
            canonical: url,
            languages: getLocalizedUrls(`/tool/${resolvedParams.slug}`),
        },
        other: {
            "script:ld+json": JSON.stringify(
                jsonLdSchemas.length === 1 ? jsonLdSchemas[0] : jsonLdSchemas,
            ),
        },
    };
}

export default async function ToolPage({ params }: ToolPageProps) {
    const resolvedParams = await params;
    const tool = await getTool(resolvedParams.slug, resolvedParams.locale);
    if (!tool) return notFound();

    const t = await getTranslations("ToolDetail");

    const currentUrl = getLocalizedUrl(
        resolvedParams.locale,
        `/tool/${resolvedParams.slug}`,
    );

    return (
        <div className="bg-background">
            <Container className="py-16">
                <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold mb-2">{tool.name}</h1>
                        <p className="text-muted-foreground">
                            {tool.description}
                        </p>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                        <Share
                            url={currentUrl}
                            title={`${tool.name} - ${config.siteName}`}
                            description={tool.description}
                            hashtags={[
                                config.siteName,
                                "tools",
                                "productivity",
                                "developer",
                            ]}
                        />
                    </div>
                </div>

                <ToolComponent
                    id={resolvedParams.slug}
                    underConstructionMessage={t("toolUnderConstruction")}
                />

                {/* FAQ Section */}
                <FAQSection faqItems={tool.faq} title={t("faq")} />
            </Container>
        </div>
    );
}
