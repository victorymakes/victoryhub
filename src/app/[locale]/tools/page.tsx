import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Container from "@/components/common/container";
import { DynamicIcon } from "@/components/common/dynamic-icon";
import { ToolCollectionJsonLd } from "@/components/seo/page-json-ld";
import ToolGrid from "@/components/tool/tool-grid";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  config,
  generateTitle,
  getLocalizedUrl,
  getLocalizedUrls,
} from "@/lib/config";
import { getCategories, getTools } from "@/service/tool-service";

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
  const { locale } = await params;
  const t = await getTranslations("Tools");
  const tools = await getTools(locale);
  const url = getLocalizedUrl(locale, "/tools");

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
  const categories = (await getCategories(locale)).filter(
    (item) => item.slug.length > 0 && item.slug !== "all",
  );

  return (
    <>
      {/* JSON-LD structured data */}
      <ToolCollectionJsonLd
        url={url}
        title={t("seoTitle")}
        description={t("seoDescription")}
        breadcrumbItems={[
          { name: config.siteName, item: config.baseUrl },
          { name: t("title"), item: url },
        ]}
        toolItems={tools.map((tool, index) => ({
          name: tool.name,
          url: getLocalizedUrl(locale, `/tools/${tool.slug}`),
          description: tool.description,
          position: index + 1,
        }))}
        inLanguage={locale}
      />
      <div className="bg-background">
        <Container className="py-16 space-y-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-foreground sm:text-6xl">
              {t("title")}
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("subtitle")}
            </p>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`#${category.slug}`}
                className="inline-block"
              >
                <Button
                  variant="outline"
                  className="inline-flex items-center gap-1 rounded-full text-xs"
                >
                  <DynamicIcon name={category.icon} className="w-4 h-4" />
                  {category.name}
                </Button>
              </Link>
            ))}
          </div>

          {/* Tools by Category */}
          <div className="space-y-12">
            {categories.map((category) => (
              <div id={category.slug} key={category.slug}>
                <div className={"mb-4 flex gap-2 items-center"}>
                  <DynamicIcon name={category.icon} />
                  <h2 className="text-2xl font-bold text-foreground">
                    {category.name}
                  </h2>
                </div>

                {category.description && (
                  <p className="text-muted-foreground mb-6">
                    {category.description}
                  </p>
                )}

                <ToolGrid
                  tools={toolsByCategory[category.slug] || []}
                  showCategory={false}
                />
              </div>
            ))}
          </div>
        </Container>
      </div>
    </>
  );
}
