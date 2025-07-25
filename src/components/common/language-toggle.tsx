"use client";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";

const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
    { code: "ko", name: "한국어", flag: "🇰🇷" },
];

export function LanguageToggle() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const currentLanguage =
        languages.find((lang) => lang.code === locale) || languages[0];

    const handleLanguageChange = (language: { code: string }) => {
        router.push(pathname, { locale: language.code });
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-full cursor-pointer"
                >
                    <span className="text-2xl">{currentLanguage.flag}</span>
                    <span className="sr-only">Change language</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="w-52 p-2 bg-popover border border-border rounded-xl shadow-xl space-y-1"
            >
                {languages.map((language) => (
                    <button
                        key={language.code}
                        onClick={() => handleLanguageChange(language)}
                        className={`cursor-pointer w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors whitespace-nowrap ${
                            currentLanguage.code === language.code
                                ? "bg-muted text-accent-foreground"
                                : ""
                        }`}
                    >
                        <span className="text-lg">{language.flag}</span>
                        <span>{language.name}</span>
                        {currentLanguage.code === language.code && (
                            <span className="ml-auto text-xs text-muted-foreground">
                                ✓
                            </span>
                        )}
                    </button>
                ))}
            </PopoverContent>
        </Popover>
    );
}
