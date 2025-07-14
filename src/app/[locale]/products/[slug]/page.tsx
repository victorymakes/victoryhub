import Container from "@/components/container";
import { notFound } from "next/navigation";
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

// Mock data - in a real app, this would come from a database or API
const toolsData = {
  "visual-studio-code": {
    name: "Visual Studio Code",
    description: "A powerful, lightweight code editor with extensive extension support",
    category: "Development",
    website: "https://code.visualstudio.com",
    pricing: "Free",
    features: [
      "IntelliSense code completion",
      "Built-in Git support",
      "Extensive extension marketplace",
      "Integrated terminal",
      "Debugging support",
    ],
    longDescription: "Visual Studio Code is a free source-code editor made by Microsoft for Windows, Linux and macOS. Features include support for debugging, syntax highlighting, intelligent code completion, snippets, code refactoring, and embedded Git.",
  },
  "figma": {
    name: "Figma",
    description: "Collaborative interface design tool for teams",
    category: "Design",
    website: "https://figma.com",
    pricing: "Free / Paid plans",
    features: [
      "Real-time collaboration",
      "Vector editing tools",
      "Prototyping capabilities",
      "Design systems",
      "Developer handoff",
    ],
    longDescription: "Figma is a vector graphics editor and prototyping tool which is primarily web-based, with additional offline features enabled by desktop applications for macOS and Windows.",
  },
  "notion": {
    name: "Notion",
    description: "All-in-one workspace for notes, tasks, wikis, and databases",
    category: "Productivity",
    website: "https://notion.so",
    pricing: "Free / Paid plans",
    features: [
      "Rich text editing",
      "Database functionality",
      "Team collaboration",
      "Template gallery",
      "API integration",
    ],
    longDescription: "Notion is a freemium productivity and note-taking web application developed by Notion Labs Inc. It offers organizational tools including task management, project tracking, to-do lists, bookmarking, and more.",
  },
};

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ToolPage({ params }: PageProps) {
  const { slug } = await params;
  const t = await getTranslations('ToolDetail');
  const tool = toolsData[slug as keyof typeof toolsData];

  if (!tool) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link href="/tools" className="hover:text-foreground">Tools</Link>
            <span>/</span>
            <span className="text-foreground">{tool.name}</span>
          </div>
        </nav>

        {/* Tool Header */}
        <div className="bg-card rounded-lg shadow-sm p-8 mb-8 border">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{tool.name}</h1>
              <p className="text-lg text-muted-foreground mb-4">{tool.description}</p>
              <div className="flex items-center space-x-4">
                <span className="inline-block bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
                  {tool.category}
                </span>
                <span className="text-sm text-muted-foreground">
                  {t('pricing')}: {tool.pricing}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <a
              href={tool.website}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              {t('visitWebsite')}
            </a>
            <Link
              href="/tools"
              className="bg-secondary text-secondary-foreground px-6 py-2 rounded-lg font-medium hover:bg-secondary/80 transition-colors"
            >
              {t('backToTools')}
            </Link>
          </div>
        </div>

        {/* Tool Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg shadow-sm p-8 border">
              <h2 className="text-2xl font-bold text-foreground mb-4">{t('about')} {tool.name}</h2>
              <p className="text-muted-foreground leading-relaxed">{tool.longDescription}</p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-lg shadow-sm p-6 border">
              <h3 className="text-lg font-semibold text-foreground mb-4">{t('keyFeatures')}</h3>
              <ul className="space-y-2">
                {tool.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-muted-foreground">
                    <svg className="w-4 h-4 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
