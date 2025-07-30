import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import deepmerge from "deepmerge";

const mergedMessageCache: Record<string, Record<string, unknown>> = {};

export default getRequestConfig(async ({ requestLocale }) => {
    // Typically corresponds to the `[locale]` segment
    const requested = await requestLocale;
    const locale = hasLocale(routing.locales, requested)
        ? requested
        : routing.defaultLocale;

    if (mergedMessageCache[locale]) {
        return {
            locale,
            messages: mergedMessageCache[locale],
        };
    }

    const messages = (await import(`../../messages/${locale}.json`)).default;
    const fallback = (await import(`../../messages/en.json`)).default;
    const merged = deepmerge(fallback, messages);
    mergedMessageCache[locale] = merged;

    return {
        locale,
        messages: merged,
    };
});
