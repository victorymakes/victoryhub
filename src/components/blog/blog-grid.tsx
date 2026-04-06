import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import type { Page } from "@/types/page";

interface BlogGridProps {
  blogs: Page[];
  hideCover?: boolean;
}

export default async function BlogGrid({ blogs, hideCover }: BlogGridProps) {
  const t = await getTranslations("Blog");

  if (blogs.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {t("noArticles")}
        </h3>
        <p className="text-muted-foreground">{t("noArticlesDesc")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {blogs.map((post) => (
        <article key={post.slug} className="group h-full">
          <Link
            href={`/${post.slug}`}
            className="flex flex-col bg-card text-card-foreground rounded-lg border overflow-hidden hover:shadow-md transition-shadow h-full"
          >
            {post.cover && !hideCover && (
              <div className="relative w-full h-48 overflow-hidden flex-shrink-0">
                <Image
                  src={post.cover}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            )}
            <div className="p-6 flex flex-col flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge>{post.category.name}</Badge>
                <span className="text-xs text-muted-foreground">
                  {post.readingTime} min read
                </span>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                {post.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-4 line-clamp-3 flex-1">
                {post.description}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
                <span>
                  {t("by")} {post.author}
                </span>
                <time dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString(post.locale)}
                </time>
              </div>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
}
