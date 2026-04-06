import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: [
    "en",
    "ja",
    "ko",
    "zh",
    "de",
    "fr",
    "es",
    "ru",
    "nl",
    "no",
    "sv",
    "fi",
    "da",
    "pt",
    "it",
  ],

  // Used when no locale matches
  defaultLocale: "en",
});
