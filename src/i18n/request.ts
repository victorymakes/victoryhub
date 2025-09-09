import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { cache } from "../lib/cache";

const getMergedMessages = (locale: string) =>
    cache(async () => {
        return await import(`../../messages/${locale}.json`).then(
            (m) => m.default,
        );
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
