import Container from "@/components/Container";
import { notFound } from "next/navigation";
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

// Mock data for categories and their tools
const categoryData = {
  development: {
    name: "Development",
    description: "Code editors, frameworks, libraries, and development tools",
    icon: "💻",
    tools: [
      {
        slug: "visual-studio-code",
        name: "Visual Studio Code",
        description: "A powerful, lightweight code editor with extensive extension support",
        pricing: "Free",
        featured: true,
      },
      {
        slug: "github",
        name: "GitHub",
        description: "Version control and collaboration platform for developers",
        pricing: "Free / Paid plans",
        featured: true,
      },
      {
        slug: "docker",
        name: "Docker",
        description: "Platform for developing, shipping, and running applications in containers",
        pricing: "Free / Paid plans",
        featured: false,
      },
      {
        slug: "postman",
        name: "Postman",
        description: "API development and testing platform",
        pricing: "Free / Paid plans",
        featured: false,
      },
    ],
  },
  design: {
    name: "Design",
    description: "UI/UX design tools, graphics software, and creative applications",
    icon: "🎨",
    tools: [
      {
        slug: "figma",
        name: "Figma",
        description: "Collaborative interface design tool for teams",
        pricing: "Free / Paid plans",
        featured: true,
      },
      {
        slug: "adobe-photoshop",
        name: "Adobe Photoshop",
        description: "Professional image editing and graphic design software",
        pricing: "Subscription",
        featured: false,
      },
      {
        slug: "sketch",
        name: "Sketch",
        description: "Digital design toolkit for Mac",
        pricing: "Subscription",
        featured: false,
      },
    ],
  },
  productivity: {
    name: "Productivity",
    description: "Task management, note-taking, and workflow optimization tools",
    icon: "⚡",
    tools: [
      {
        slug: "notion",
        name: "Notion",
        description: "All-in-one workspace for notes, tasks, wikis, and databases",
        pricing: "Free / Paid plans",
        featured: true,
      },
      {
        slug: "slack",
        name: "Slack",
        description: "Team communication and collaboration platform",
        pricing: "Free / Paid plans",
        featured: false,
      },
      {
        slug: "trello",
        name: "Trello",
        description: "Visual project management with boards and cards",
        pricing: "Free / Paid plans",
        featured: false,
      },
    ],
  },
};

interface PageProps {
  params: Promise<{
    category: string;
  }>;
}

export default async function CategoryPage({ params }: PageProps) {
  const { category } = await params;
  const t = await getTranslations('CategoryDetail');
  const tDir = await getTranslations('Directory');
  const categoryInfo = categoryData[category as keyof typeof categoryData];

  if (!categoryInfo) {
    notFound();
  }

  const featuredTools = categoryInfo.tools.filter(tool => tool.featured);
  const allTools = categoryInfo.tools;

  return (
    <div className="min-h-screen bg-background">
      <Container className="py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link href="/directory" className="hover:text-foreground">Directory</Link>
            <span>/</span>
            <span className="text-foreground">{tDir(`categories.${category}.name`)}</span>
          </div>
        </nav>

        {/* Category Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">{categoryInfo.icon}</div>
          <h1 className="text-4xl font-bold text-foreground mb-4">{tDir(`categories.${category}.name`)}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {tDir(`categories.${category}.description`)}
          </p>
          <div className="mt-6">
            <span className="bg-primary/10 text-primary text-sm px-4 py-2 rounded-full">
              {allTools.length} {t('toolsAvailable')}
            </span>
          </div>
        </div>

        {/* Featured Tools */}
        {featuredTools.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">{t('featuredTools')} {tDir(`categories.${category}.name`)}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredTools.map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="bg-card text-card-foreground rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-foreground">{tool.name}</h3>
                    <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                      Featured
                    </span>
                  </div>
                  <p className="text-muted-foreground mb-3">{tool.description}</p>
                  <span className="inline-block bg-secondary text-secondary-foreground text-sm px-3 py-1 rounded-full">
                    {tool.pricing}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* All Tools */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">All {tDir(`categories.${category}.name`)} Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allTools.map((tool) => (
              <Link
                key={tool.slug}
                href={`/tools/${tool.slug}`}
                className="bg-card text-card-foreground rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-foreground">{tool.name}</h3>
                  {tool.featured && (
                    <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground mb-3">{tool.description}</p>
                <span className="inline-block bg-secondary text-secondary-foreground text-sm px-3 py-1 rounded-full">
                  {tool.pricing}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Back to Directory */}
        <div className="mt-12 text-center">
          <Link
            href="/directory"
            className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {t('backToDirectory')}
          </Link>
        </div>
      </Container>
    </div>
  );
}
