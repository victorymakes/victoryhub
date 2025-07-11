import Container from "@/components/Container";
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

// Mock data - in a real app, this would come from a database or API
const tools = [
	{
		slug: "visual-studio-code",
		name: "Visual Studio Code",
		description: "A powerful, lightweight code editor with extensive extension support",
		category: "Development",
		featured: true,
	},
	{
		slug: "figma",
		name: "Figma",
		description: "Collaborative interface design tool for teams",
		category: "Design",
		featured: true,
	},
	{
		slug: "notion",
		name: "Notion",
		description: "All-in-one workspace for notes, tasks, wikis, and databases",
		category: "Productivity",
		featured: false,
	},
	{
		slug: "github",
		name: "GitHub",
		description: "Version control and collaboration platform for developers",
		category: "Development",
		featured: true,
	},
	{
		slug: "slack",
		name: "Slack",
		description: "Team communication and collaboration platform",
		category: "Productivity",
		featured: false,
	},
	{
		slug: "adobe-photoshop",
		name: "Adobe Photoshop",
		description: "Professional image editing and graphic design software",
		category: "Design",
		featured: false,
	},
];

export default async function ToolsPage() {
	const t = await getTranslations('Tools');
	const featuredTools = tools.filter((tool) => tool.featured);

	return (
		<div className="min-h-screen bg-background">
			<Container className="py-8">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-foreground mb-4">{t('title')}</h1>
					<p className="text-muted-foreground">
						{t('subtitle')}
					</p>
				</div>

				{/* Featured Tools */}
				<div className="mb-12">
					<h2 className="text-2xl font-bold text-foreground mb-6">{t('featuredTools')}</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{featuredTools.map((tool) => (
							<Link
								key={tool.slug}
								href={`/tools/${tool.slug}`}
								className="bg-card text-card-foreground rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border"
							>
								<div className="flex items-start justify-between mb-3">
									<h3 className="text-lg font-semibold text-foreground">{tool.name}</h3>
									<span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">{t('featured')}</span>
								</div>
								<p className="text-muted-foreground mb-3">{tool.description}</p>
								<span className="inline-block bg-secondary text-secondary-foreground text-sm px-3 py-1 rounded-full">
									{tool.category}
								</span>
							</Link>
						))}
					</div>
				</div>

				{/* All Tools */}
				<div>
					<h2 className="text-2xl font-bold text-foreground mb-6">{t('allTools')}</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{tools.map((tool) => (
							<Link
								key={tool.slug}
								href={`/tools/${tool.slug}`}
								className="bg-card text-card-foreground rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border"
							>
								<div className="flex items-start justify-between mb-3">
									<h3 className="text-lg font-semibold text-foreground">{tool.name}</h3>
									{tool.featured && (
										<span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
											{t('featured')}
										</span>
									)}
								</div>
								<p className="text-muted-foreground mb-3">{tool.description}</p>
								<span className="inline-block bg-secondary text-secondary-foreground text-sm px-3 py-1 rounded-full">
									{tool.category}
								</span>
							</Link>
						))}
					</div>
				</div>
			</Container>
		</div>
	);
}
