import { routing } from "@/i18n/routing";

export const config = {
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || "https://victoryhub.cc",
  siteName: "VictoryHub",
  locales: routing.locales,
  defaultLocale: routing.defaultLocale,
  contact: {
    email: "victorylaunches@gmail.com",
    twitter: {
      handle: "@Victory",
      url: "https://twitter.com/victorymakes",
    },
  },
  analytics: {
    googleAnalytics: {
      measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      enabled: Boolean(process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID),
    },
    plausible: {
      domain: process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN,
      enabled: Boolean(process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN),
    },
    umami: {
      websiteId: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
      src: process.env.NEXT_PUBLIC_UMAMI_SRC,
      enabled: Boolean(process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID),
    },
    posthog: {
      key: process.env.NEXT_PUBLIC_POSTHOG_KEY,
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      enabled: Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY),
    },
    vercel: {
      enabled: Boolean(process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ENABLED),
    },
  },
} as const;

export function getLocalizedUrls(path: string) {
  const urls: Record<string, string> = {};
  path = path.startsWith("/") ? path : `/${path}`;

  config.locales.forEach((locale) => {
    urls[locale] = `${config.baseUrl}/${locale}${path}`;
  });

  return urls;
}

export function getLocalizedUrl(locale: string, path: string) {
  path = path.startsWith("/") ? path : `/${path}`;
  return `${config.baseUrl}/${locale}${path}`;
}

export function generateTitle(pageTitle?: string): string {
  if (!pageTitle) {
    return config.siteName;
  }
  return `${pageTitle} | ${config.siteName}`;
}
