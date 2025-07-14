import { notFound } from "next/navigation";
import { tools } from "@/lib/tools";
import { Metadata } from "next";
import { ToolComponent } from "@/components/tools/tool";
import Container from "@/components/container";

interface ToolPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ToolPageProps): Promise<Metadata> {
  const tool = tools.find((t) => t.slug === params.slug);
  if (!tool) return {};
  return {
    title: tool.title,
    description: tool.description,
    keywords: tool.keywords,
  };
}

export default async function ToolPage({ params }: ToolPageProps) {
  const tool = tools.find((t) => t.slug === params.slug);
  if (!tool) return notFound();

  return (
      <Container>
        <h1 className="text-2xl font-bold mb-2">{tool.title}</h1>
        <p className="text-muted-foreground mb-6">{tool.description}</p>

        {/* Ad Slot */}
        {/*<div id="ad-1" className="mb-6 w-full h-[90px] bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">*/}
        {/*  AD Slot*/}
        {/*</div>*/}

        {/* Tool Component (can switch by slug or pass in tool) */}
        <ToolComponent tool={tool} />

        {/* FAQ Section */}
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold">FAQs</h2>
          {tool.faq?.map((item, index) => (
              <div key={index}>
                <p className="font-medium">Q: {item.question}</p>
                <p className="text-sm text-muted-foreground">A: {item.answer}</p>
              </div>
          ))}
        </div>

        {/* Ad Slot Bottom */}
        {/*<div id="ad-2" className="mt-10 w-full h-[90px] bg-muted rounded-md flex items-center justify-center text-xs text-muted-foreground">*/}
        {/*  AD Slot*/}
        {/*</div>*/}
      </Container>
  );
}
