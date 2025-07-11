import Container from "@/components/Container";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function DirectoryPage() {
	const t = await getTranslations("Directory");

	// Using translations for categories
	const categories = [
		{
			slug: "development",
			name: t("categories.development.name"),
			description: t("categories.development.description"),
			toolCount: 15,
			icon: "💻",
		},
		{
			slug: "design",
			name: t("categories.design.name"),
			description: t("categories.design.description"),
			toolCount: 12,
			icon: "🎨",
		},
		{
			slug: "productivity",
			name: t("categories.productivity.name"),
			description: t("categories.productivity.description"),
			toolCount: 18,
			icon: "⚡",
		},
		{
			slug: "analytics",
			name: t("categories.analytics.name"),
			description: t("categories.analytics.description"),
			toolCount: 8,
			icon: "📊",
		},
		{
			slug: "communication",
			name: t("categories.communication.name"),
			description: t("categories.communication.description"),
			toolCount: 10,
			icon: "💬",
		},
		{
			slug: "marketing",
			name: t("categories.marketing.name"),
			description: t("categories.marketing.description"),
			toolCount: 14,
			icon: "📈",
		},
	];

	return (
		<div className="min-h-screen bg-background">
			<Container className="py-8">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold text-foreground mb-4">
						{t("title")}
					</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						{t("subtitle")}
					</p>
				</div>

				{/* Categories Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
					{categories.map((category) => (
						<Link
							key={category.slug}
							href={`/directory/${category.slug}`}
							className="bg-card text-card-foreground rounded-lg shadow-sm hover:shadow-md transition-shadow p-8 border group"
						>
							<div className="text-center">
								<div className="text-4xl mb-4">{category.icon}</div>
								<h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
									{category.name}
								</h3>
								<p className="text-muted-foreground mb-4">
									{category.description}
								</p>
								<div className="flex items-center justify-center">
									<span className="bg-secondary text-secondary-foreground text-sm px-3 py-1 rounded-full">
										{category.toolCount} {t("toolsCount")}
									</span>
								</div>
							</div>
						</Link>
					))}
				</div>

				{/* Quick Stats */}
				<div className="mt-16 bg-card rounded-lg shadow-sm p-8 border">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
						<div>
							<div className="text-3xl font-bold text-primary mb-2">77</div>
							<div className="text-muted-foreground">
								{t("totalTools")}
							</div>
						</div>
						<div>
							<div className="text-3xl font-bold text-secondary mb-2">6</div>
							<div className="text-muted-foreground">
								{t("categories")}
							</div>
						</div>
						<div>
							<div className="text-3xl font-bold text-accent mb-2">15</div>
							<div className="text-muted-foreground">
								{t("featuredTools")}
							</div>
						</div>
					</div>
				</div>
			</Container>
		</div>
	);
}
