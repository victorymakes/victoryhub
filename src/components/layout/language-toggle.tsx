"use client";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {Globe} from "lucide-react";
import {useLocale} from "next-intl";
import {useRouter, usePathname} from "@/i18n/navigation";

const languages = [
    {code: "en", name: "English", flag: "🇺🇸"},
    {code: "zh", name: "中文", flag: "🇨🇳"},
    {code: "ja", name: "日本語", flag: "🇯🇵"},
    {code: "ko", name: "한국어", flag: "🇰🇷"},
];

export function LanguageToggle() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const currentLanguage =
        languages.find((lang) => lang.code === locale) || languages[0];

    const handleLanguageChange = (language: { code: string }) => {
        router.push(pathname, {locale: language.code});
    };

    return (
        <Popover>
            <PopoverTrigger
                className="flex items-center gap-2 h-9 px-3 rounded-md border text-sm hover:bg-muted transition">
                <Globe className="h-4 w-4"/>
                <span className="hidden sm:inline">{currentLanguage.flag}</span>
            </PopoverTrigger>
            <PopoverContent align="start"
                            className="w-52 p-2 bg-popover border border-border rounded-xl shadow-xl space-y-1">
                {languages.map((language) => (
                    <button
                        key={language.code}
                        onClick={() => handleLanguageChange(language)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors whitespace-nowrap ${
                            currentLanguage.code === language.code
                                ? "bg-muted text-accent-foreground"
                                : ""
                        }`}
                    >
                        <span className="text-lg">{language.flag}</span>
                        <span>{language.name}</span>
                        {currentLanguage.code === language.code && (
                            <span className="ml-auto text-xs text-muted-foreground">✓</span>
                        )}
                    </button>
                ))}
            </PopoverContent>
        </Popover>
    );
}
