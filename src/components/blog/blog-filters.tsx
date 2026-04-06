import { useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { Category } from "@/types/page";

interface CategoryFiltersProps {
  currentCategoryId: string;
  categories: Category[];
}

export default function CategoryFilters({
  currentCategoryId,
  categories,
}: CategoryFiltersProps) {
  const t = useTranslations("Blog");

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          {t("allCategories")}
        </h3>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/blog/category/all/page/1`}
            className={cn(
              buttonVariants({
                variant: currentCategoryId === "all" ? "default" : "outline",
                size: "sm",
              }),
              "rounded-full",
            )}
          >
            {t("allCategories")}
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/blog/category/${category.id}/page/1`}
              className={cn(
                buttonVariants({
                  variant:
                    currentCategoryId === category.id ? "default" : "outline",
                  size: "sm",
                }),
                "rounded-full",
              )}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
