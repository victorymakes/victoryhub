import Container from "@/components/common/container";
import { getTranslations } from "next-intl/server";
import { getCategories, getTools } from "@/service/tool-service";
import { DynamicIcon } from "@/components/common/dynamic-icon";
import { Metadata } from "next";
import {
    config,
    getLocalizedUrl,
    getLocalizedUrls,
    generateTitle,
} from "@/lib/config";
import ToolGrid from "@/components/tool/tool-grid";

interface ToolsPageProps {
    params: Promise<{
        locale: string;
    }>;
}

// SEO metadata for tools listing page
export async function generateMetadata({
    params,
}: ToolsPageProps): Promise<Metadata> {
    const resolvedParams = await params;
    const { locale } = resolvedParams;
    const t = await getTranslations("Tools");
    const url = getLocalizedUrl(locale, "/tools");

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
            languages: getLocalizedUrls("/tools"),
        },
    };
}

export default async function ToolsPage({ params }: ToolsPageProps) {
    const resolvedParams = await params;
    const t = await getTranslations("Tools");
    const tools = await getTools(resolvedParams.locale);

    // Group tools by category
    const toolsByCategory = tools.reduce(
        (acc, tool) => {
            if (!acc[tool.category.slug]) {
                acc[tool.category.slug] = [];
            }
            acc[tool.category.slug].push(tool);
            return acc;
        },
        {} as Record<string, typeof tools>,
    );

    // Sort categories alphabetically
    const categories = (await getCategories(resolvedParams.locale)).filter(
        (item) => item.slug.length > 0 && item.slug !== "all",
    );

    return (
        <div className="bg-background">
            <Container className="py-16">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-4">
                        {t("title")}
                    </h1>
                    <p className="text-muted-foreground">{t("subtitle")}</p>
                </div>

                {/* Tools by Category */}
                <div className="space-y-12">
                    {categories.map((category) => (
                        <div id={category.slug} key={category.slug}>
                            <div className={"mb-6 flex gap-2 items-center"}>
                                <DynamicIcon name={category.icon} />
                                <h2 className="text-2xl font-bold text-foreground">
                                    {category.name}
                                </h2>
                            </div>

                            <ToolGrid
                                tools={toolsByCategory[category.slug] || []}
                                showCategory={false}
                            />
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    );
}
