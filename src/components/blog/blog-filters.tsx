"use client";

import { useTranslations } from "next-intl";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

interface CategoryFiltersProps {
    categories: string[];
    currentCategory: string;
}

export default function CategoryFilters({
    categories,
    currentCategory,
}: CategoryFiltersProps) {
    const t = useTranslations("Blog");
    const router = useRouter();
    const params = useParams();

    const handleCategoryChange = (category: string) => {
        const locale = params.locale;
        // Navigate to page 1 of the selected category
        router.push(`/${locale}/blog/category/${category}/page/1`);
    };

    return (
        <div className="space-y-4">
            {/* Category Filter */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">
                    {t("allCategories")}
                </h3>
                <div className="flex flex-wrap gap-2">
                    <Button
                        variant={
                            currentCategory === "all" ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => handleCategoryChange("all")}
                        className="rounded-full"
                    >
                        {t("allCategories")}
                    </Button>
                    {categories.map((category) => (
                        <Button
                            key={category}
                            variant={
                                currentCategory === category
                                    ? "default"
                                    : "outline"
                            }
                            size="sm"
                            onClick={() => handleCategoryChange(category)}
                            className="rounded-full"
                        >
                            {category}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
    );
}
