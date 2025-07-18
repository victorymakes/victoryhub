import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ToolComponent } from "@/components/tool/tool";
import Container from "@/components/layout/container";
import { getTool } from "@/service/tool-service";

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
    if (!tool) return {};
    return {
        title: tool.name,
        description: tool.description,
        keywords: tool.keywords,
    };
}

export default async function ToolPage({ params }: ToolPageProps) {
    const resolvedParams = await params;
    const tool = await getTool(resolvedParams.slug, resolvedParams.locale);
    if (!tool) return notFound();

    return (
        <div className="min-h-screen bg-background">
            <Container className="py-8">
                <h1 className="text-2xl font-bold mb-2">{tool.name}</h1>
                <p className="text-muted-foreground mb-6">{tool.description}</p>

                <ToolComponent id={resolvedParams.slug} />

                {/* FAQ Section */}
                <div className="mt-8 space-y-4">
                    <h2 className="text-lg font-semibold">FAQs</h2>
                    {tool.faq?.map((item, index) => (
                        <div key={index}>
                            <p className="font-medium">Q: {item.question}</p>
                            <p className="text-sm text-muted-foreground">
                                A: {item.answer}
                            </p>
                        </div>
                    ))}
                </div>
            </Container>
        </div>
    );
}
