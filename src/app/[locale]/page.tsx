import Container from "@/components/Container";
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

export default async function Home() {
  const t = await getTranslations('Homepage');

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <Container className="py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground sm:text-6xl">
            {t('title')}
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/tools"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              {t('browseTools')}
            </Link>
            <Link
              href="/directory"
              className="bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-medium hover:bg-secondary/80 transition-colors"
            >
              {t('viewDirectory')}
            </Link>
          </div>
        </div>
      </Container>

      {/* Featured Categories */}
      <Container className="py-16">
        <h2 className="text-3xl font-bold text-foreground text-center mb-12">
          {t('popularCategories')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link
            href="/directory/development"
            className="bg-card text-card-foreground p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border"
          >
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t('development')}
            </h3>
            <p className="text-muted-foreground">
              {t('developmentDesc')}
            </p>
          </Link>
          <Link
            href="/directory/productivity"
            className="bg-card text-card-foreground p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border"
          >
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t('productivity')}
            </h3>
            <p className="text-muted-foreground">
              {t('productivityDesc')}
            </p>
          </Link>
          <Link
            href="/directory/design"
            className="bg-card text-card-foreground p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border"
          >
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t('design')}
            </h3>
            <p className="text-muted-foreground">
              {t('designDesc')}
            </p>
          </Link>
        </div>
      </Container>
    </div>
  );
}
