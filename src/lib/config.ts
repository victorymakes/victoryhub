import { routing } from "@/i18n/routing";

export const config = {
    baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "https://yoursite.com",
    siteName: "VictoryHub",
    locales: routing.locales,
    defaultLocale: routing.defaultLocale,
} as const;

export function getLocalizedUrls(path: string) {
    const urls: Record<string, string> = {};

    config.locales.forEach((locale) => {
        urls[locale] = `${config.baseUrl}/${locale}${path}`;
    });

    return urls;
}

export function getLocalizedUrl(locale: string, path: string) {
    return `${config.baseUrl}/${locale}${path}`;
}
