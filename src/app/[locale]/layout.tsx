import "../globals.css";

import { Geist, Geist_Mono } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Navbar } from "@/components/common/navigation";
import { Footer } from "@/components/common/footer";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@/components/common/analytics";
import { config } from "@/lib/config";
import { getTranslations } from "next-intl/server";
import { RootJsonLd } from "@/components/seo/page-json-ld";
import { Providers } from "@/components/common/providers";

//export const dynamic = "force-static";
export const revalidate = 86400;

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    // Ensure that the incoming `locale` is valid
    const { locale } = await params;
    if (!hasLocale(routing.locales, locale)) {
        notFound();
    }

    const t = await getTranslations("Homepage");
    const description = t("seoDescription");

    return (
        <html lang={locale} suppressHydrationWarning>
            <head>
                <title>{config.siteName}</title>
                <meta
                    name="description"
                    content="Free online tools for developers, designers, and professionals"
                />
                <link rel="icon" href="/favicon.png" sizes="any" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
                <link rel="manifest" href="/manifest.webmanifest" />
                <meta name="theme-color" content="#000000" />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
            >
                <NextIntlClientProvider>
                    <Providers>
                        <Navbar />
                        <main className="flex-1">
                            <RootJsonLd
                                inLanguage={locale}
                                description={description}
                            />
                            {children}
                        </main>
                        <Footer />
                        <Toaster />
                    </Providers>
                </NextIntlClientProvider>
                <Analytics />
            </body>
        </html>
    );
}
