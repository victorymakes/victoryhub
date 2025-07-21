import Container from "@/components/layout/container";
import { Link } from "@/i18n/navigation";
import { getPopularTools } from "@/service/tool-service";
import { getTranslations } from "next-intl/server";

interface HomeProps {
    params: {
        locale: string;
    };
}

export default async function Home({ params: { locale } }: HomeProps) {
    const t = await getTranslations("Homepage");
    const popularTools = await getPopularTools(6, locale);

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
