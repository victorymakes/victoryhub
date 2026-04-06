import { cache } from "../lib/cache";

export const getMessages = (locale: string) =>
  cache(async () => {
    return await import(`../../messages/${locale}.json`).then((m) => m.default);
  }, ["i18n", locale])();
