import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ToolComponent } from "@/components/tool/tool";
import Container from "@/components/common/container";
import Share from "@/components/common/share";
import { FAQSection } from "@/components/tool/faq-section";
import { getRelatedTools, getTool } from "@/service/tool-service";
import {
    config,
    getLocalizedUrls,
    getLocalizedUrl,
    generateTitle,
} from "@/lib/config";
import { getTranslations } from "next-intl/server";
import { ToolDetailJsonLd } from "@/components/seo/page-json-ld";
import ToolGrid from "@/components/tool/tool-grid";

interface ToolPageProps {
    params: Promise<{
        slug: string;
        locale: string;
    }>;
}

export async function generateMetadata({
    params,
}: ToolPageProps): Promise<Metadata> {
    const { locale, slug } = await params;
    const tool = await getTool(slug, locale);

    if (!tool) {
        const t = await getTranslations("ToolDetail");
        return {
            title: generateTitle(t("notFoundTitle")),
            description: t("notFoundDescription"),
        };
    }

    const url = getLocalizedUrl(locale, `/tools/${slug}`);
    return {
        title: generateTitle(tool.name),
        description: tool.description,
        keywords: tool.keywords,
        openGraph: {
            title: generateTitle(tool.name),
            description: tool.description,
            url,
            siteName: config.siteName,
            locale: locale,
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: tool.name,
            description: tool.description,
        },
        alternates: {
            canonical: url,
            languages: getLocalizedUrls(`/tools/${slug}`),
        },
    };
}

export default async function ToolPage({ params }: ToolPageProps) {
    const { locale, slug } = await params;
    const tool = await getTool(slug, locale);
    if (!tool) return notFound();

    const t = await getTranslations("ToolDetail");
    const tTools = await getTranslations("Tools");
    const url = getLocalizedUrl(locale, `/tools/${slug}`);
    const relatedTools = await getRelatedTools(tool, locale);
    return (
        <>
            {/* JSON-LD structured data */}
            <ToolDetailJsonLd
                inLanguage={locale}
                name={tool.name}
                description={tool.description}
                url={url}
                keywords={tool.keywords}
                applicationCategory={tool.category.name}
                breadcrumbItems={[
                    { name: config.siteName, item: config.baseUrl },
                    {
                        name: tTools("seoTitle"),
                        item: `${config.baseUrl}/${locale}/tools`,
                    },
                    { name: tool.name, item: url },
                ]}
                faqItems={
                    tool.faq && tool.faq.length > 0
                        ? tool.faq.map((faqItem) => ({
                              question: faqItem.question,
                              answer: faqItem.answer,
                          }))
                        : undefined
                }
            />

            <div className="bg-background">
                <Container className="py-16 space-y-8">
                    {/* Header Section */}
                    <div className="w-full flex flex-col items-end sm:flex-row sm:items-center justify-between">
                        <div className="flex-1 w-full">
                            <h1 className="text-2xl font-bold mb-2">
                                {tool.name}
                            </h1>
                            <p className="text-muted-foreground">
                                {tool.description}
                            </p>
                        </div>
                        <div className="mt-4 sm:mt-0 sm:w-auto flex-shrink-0">
                            <Share
                                url={url}
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

                    {/* Tool Section */}
                    <ToolComponent
                        id={slug}
                        underConstructionMessage={t("toolUnderConstruction")}
                    />

                    {/* FAQ Section */}
                    <FAQSection faqItems={tool.faq} title={t("faq")} />

                    {/* Related Tools Section */}
                    {relatedTools && relatedTools.length > 0 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold">
                                {t("relatedTools")}
                            </h2>
                            <ToolGrid
                                tools={relatedTools}
                                showCategory={false}
                            />
                        </div>
                    )}
                </Container>
            </div>
        </>
    );
}
