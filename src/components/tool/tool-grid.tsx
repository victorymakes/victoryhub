import { Link } from "@/i18n/navigation";
import { Tool } from "@/types/tool";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "next-intl/server";

interface ToolGridProps {
    tools: Tool[];
    showCategory?: boolean;
}

export default async function ToolGrid({
    tools,
    showCategory = true,
}: ToolGridProps) {
    const t = await getTranslations("Tools");

    if (tools.length === 0) {
        return (
            <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                    {t("noTools")}
                </h3>
                <p className="text-muted-foreground">{t("noToolsDesc")}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => (
                <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    className="bg-card text-card-foreground p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border space-y-3 group"
                >
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {tool.name}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-3">
                        {tool.description}
                    </p>
                    {showCategory && (
                        <Badge className="inline-block">
                            {tool.category.name}
                        </Badge>
                    )}
                </Link>
            ))}
        </div>
    );
}
