import Container from "@/components/container";
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

// Mock blog data
const blogPosts = [
	{
		id: 1,
		title: "The Best Development Tools for 2025",
		excerpt: "Discover the most essential development tools that every developer should know about in 2025.",
		author: "Sarah Johnson",
		date: "2025-01-15",
		readTime: "5 min read",
		category: "Development",
		featured: true,
	},
	{
		id: 2,
		title: "How to Choose the Right Design Tool for Your Team",
		excerpt: "A comprehensive guide to selecting the perfect design tool based on your team's needs and workflow.",
		author: "Mike Chen",
		date: "2025-01-12",
		readTime: "8 min read",
		category: "Design",
		featured: true,
	},
	{
		id: 3,
		title: "Productivity Hacks with Modern Tools",
		excerpt: "Learn how to maximize your productivity using the latest productivity tools and techniques.",
		author: "Emma Davis",
		date: "2025-01-10",
		readTime: "6 min read",
		category: "Productivity",
		featured: false,
	},
	{
		id: 4,
		title: "The Rise of AI-Powered Development Tools",
		excerpt: "Exploring how artificial intelligence is transforming the development landscape.",
		author: "Alex Rodriguez",
		date: "2025-01-08",
		readTime: "7 min read",
		category: "Development",
		featured: false,
	},
	{
		id: 5,
		title: "Building Better User Experiences with Design Systems",
		excerpt: "How design systems and the right tools can help create consistent, scalable user experiences.",
		author: "Jessica Kim",
		date: "2025-01-05",
		readTime: "9 min read",
		category: "Design",
		featured: false,
	},
];

export default async function BlogPage() {
	const t = await getTranslations('Blog');
	const featuredPosts = blogPosts.filter((post) => post.featured);
	const recentPosts = blogPosts.filter((post) => !post.featured);

	return (
		<div className="min-h-screen bg-background">
			<Container className="py-8">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold text-foreground mb-4">{t('title')}</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						{t('subtitle')}
					</p>
				</div>

				{/* Featured Posts */}
				<div className="mb-16">
					<h2 className="text-2xl font-bold text-foreground mb-8">{t('featuredArticles')}</h2>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{featuredPosts.map((post) => (
							<article key={post.id} className="bg-card rounded-lg shadow-sm overflow-hidden border">
								<div className="p-8">
									<div className="flex items-center justify-between mb-4">
										<span className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
											{post.category}
										</span>
										<span className="bg-accent/10 text-accent text-xs px-2 py-1 rounded-full">
											{t('featured')}
										</span>
									</div>
									<h3 className="text-xl font-bold text-foreground mb-3 hover:text-primary transition-colors">
										<Link href={`/blog/${post.id}`}>{post.title}</Link>
									</h3>
									<p className="text-muted-foreground mb-4">{post.excerpt}</p>
									<div className="flex items-center justify-between text-sm text-muted-foreground">
										<div className="flex items-center space-x-4">
											<span>{t('by')} {post.author}</span>
											<span>{new Date(post.date).toLocaleDateString()}</span>
										</div>
										<span>{post.readTime}</span>
									</div>
								</div>
							</article>
						))}
					</div>
				</div>

				{/* Recent Posts */}
				<div>
					<h2 className="text-2xl font-bold text-foreground mb-8">{t('recentArticles')}</h2>
					<div className="space-y-6">
						{recentPosts.map((post) => (
							<article key={post.id} className="bg-card rounded-lg shadow-sm p-6 flex flex-col md:flex-row md:items-center gap-6 border">
								<div className="flex-1">
									<div className="flex items-center gap-3 mb-3">
										<span className="bg-secondary text-secondary-foreground text-sm px-3 py-1 rounded-full">
											{post.category}
										</span>
									</div>
									<h3 className="text-lg font-semibold text-foreground mb-2 hover:text-primary transition-colors">
										<Link href={`/blog/${post.id}`}>{post.title}</Link>
									</h3>
									<p className="text-muted-foreground mb-3">{post.excerpt}</p>
									<div className="flex items-center space-x-4 text-sm text-muted-foreground">
										<span>{t('by')} {post.author}</span>
										<span>{new Date(post.date).toLocaleDateString()}</span>
										<span>{post.readTime}</span>
									</div>
								</div>
								<div className="md:w-32">
									<Link
										href={`/blog/${post.id}`}
										className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
									>
										{t('readMore')}
									</Link>
								</div>
							</article>
						))}
					</div>
				</div>

				{/* Newsletter Signup */}
				<div className="mt-16 bg-primary rounded-lg p-8 text-center text-primary-foreground">
					<h3 className="text-2xl font-bold mb-4">{t('stayUpdated')}</h3>
					<p className="mb-6">{t('newsletterDesc')}</p>
					<div className="max-w-md mx-auto flex gap-4">
						<input
							type="email"
							placeholder={t('emailPlaceholder')}
							className="flex-1 px-4 py-2 rounded-lg text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary-foreground"
						/>
						<button className="bg-background text-foreground px-6 py-2 rounded-lg font-medium hover:bg-muted transition-colors">
							{t('subscribe')}
						</button>
					</div>
				</div>
			</Container>
		</div>
	);
}
