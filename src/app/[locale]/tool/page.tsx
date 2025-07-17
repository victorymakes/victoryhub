import Container from "@/components/layout/container";
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import {getTools} from "@/service/tool-service";


interface ToolsPageProps {
	params: {
		locale: string;
	};
}

export default async function ToolsPage({ params }: ToolsPageProps) {
	const t = await getTranslations('Tools');
	const tools = getTools(params.locale);

	// Group tools by category
	const toolsByCategory = tools.reduce((acc, tool) => {
		if (!acc[tool.category]) {
			acc[tool.category] = [];
		}
		acc[tool.category].push(tool);
		return acc;
	}, {} as Record<string, typeof tools>);

	// Sort categories alphabetically
	const sortedCategories = Object.keys(toolsByCategory).sort();

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

				{/* Tools by Category */}
				<div className="space-y-12">
					{sortedCategories.map((category) => (
						<div key={category}>
							<h2 className="text-2xl font-bold text-foreground mb-6">{category}</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
								{toolsByCategory[category].map((tool) => (
									<Link
										key={tool.slug}
										href={`/tool/${tool.slug}`}
										className="bg-card text-card-foreground rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border"
									>
										<div className="mb-3">
											<h3 className="text-lg font-semibold text-foreground">{tool.name}</h3>
										</div>
										<p className="text-muted-foreground mb-3">{tool.description}</p>
										<span className="inline-block bg-secondary text-secondary-foreground text-sm px-3 py-1 rounded-full">
											{tool.category}
										</span>
									</Link>
								))}
							</div>
						</div>
					))}
				</div>
			</Container>
		</div>
	);
}
