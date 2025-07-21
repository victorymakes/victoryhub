import Container from "@/components/layout/container";
import { Link } from "@/i18n/navigation";
import { getTools } from "@/service/tool-service";

export default async function Home() {
    // Get the first 6 tools to display as popular tools
    const allTools = await getTools("en");
    const popularTools = allTools.slice(0, 6);

    return (
        <div className="min-h-screen bg-background">
            {/* Hero Section */}
            <Container className="py-16">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-foreground sm:text-6xl">
                        Free Online Tools
                    </h1>
                    <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
                        Essential utilities for developers, designers, and
                        professionals. Generate UUIDs, convert timestamps,
                        encode URLs, create secure passwords, process images,
                        manipulate text and more - all free and privacy-focused.
                    </p>
                    <div className="mt-8 flex justify-center gap-4">
                        <Link
                            href="/tools"
                            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
                        >
                            Browse All Tools
                        </Link>
                    </div>
                </div>
            </Container>

            {/* Popular Tools */}
            <Container className="py-16">
                <h2 className="text-3xl font-bold text-foreground text-center mb-12">
                    Popular Tools
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
            <Container className="py-16 bg-muted/30">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-foreground mb-6">
                        Privacy-First Online Tools
                    </h2>
                    <p className="text-lg text-muted-foreground mb-8">
                        All tools run locally in your browser. No data is sent
                        to servers, ensuring your privacy and security.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">
                                🔒 Private
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Everything runs in your browser
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">
                                ⚡ Fast
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                No server requests needed
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-foreground mb-2">
                                🆓 Free
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                Always free to use
                            </p>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}
