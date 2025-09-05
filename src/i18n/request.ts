import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import deepmerge from "deepmerge";
import { unstable_cache } from "next/cache";

const getMergedMessages = (locale: string) =>
    unstable_cache(async () => {
        const [fallback, messages] = await Promise.all([
            // replace with fetch(...) if pulling from a CMS
            import(`../../messages/en.json`).then((m) => m.default),
            import(`../../messages/${locale}.json`).then((m) => m.default),
        ]);
        return deepmerge(fallback, messages);
    }, ["i18n", locale])();

export default getRequestConfig(async ({ requestLocale }) => {
    // Typically corresponds to the `[locale]` segment
    const requested = await requestLocale;
    const locale = hasLocale(routing.locales, requested)
        ? requested
        : routing.defaultLocale;

    return {
        locale,
        messages: await getMergedMessages(locale),
    };
});
