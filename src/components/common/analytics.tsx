"use client";

import Script from "next/script";
import { config } from "@/lib/config";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";

export function Analytics() {
    return (
        <>
            {/* Google Analytics */}
            {config.analytics.googleAnalytics.enabled && (
                <>
                    <Script
                        src={`https://www.googletagmanager.com/gtag/js?id=${config.analytics.googleAnalytics.measurementId}`}
                        strategy="afterInteractive"
                    />
                    <Script id="google-analytics" strategy="afterInteractive">
                        {`
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', '${config.analytics.googleAnalytics.measurementId}');
                        `}
                    </Script>
                </>
            )}

            {/* Plausible Analytics */}
            {config.analytics.plausible.enabled && (
                <Script
                    defer
                    data-domain={config.analytics.plausible.domain}
                    src="https://plausible.io/js/script.js"
                    strategy="afterInteractive"
                />
            )}

            {/* Umami Analytics */}
            {config.analytics.umami.enabled && (
                <Script
                    defer
                    src={config.analytics.umami.src}
                    data-website-id={config.analytics.umami.websiteId}
                    strategy="afterInteractive"
                />
            )}

            {/* PostHog Analytics */}
            {config.analytics.posthog.enabled && (
                <Script id="posthog-analytics" strategy="afterInteractive">
                    {`
                        !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]);var n=t;if("undefined"!=typeof n){var p=function(t){return function(){n[t].apply(n,arguments)}};for(var r in t)e[r]="function"==typeof t[r]&&"function"==typeof n[r]?p(r):function(){};e._i.push([i,r,t])}}function l(t){e._i.push([t])}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
                        posthog.init('${config.analytics.posthog.key}',{api_host:'${config.analytics.posthog.host}'})
                    `}
                </Script>
            )}

            {config.analytics.vercel.enabled && <VercelAnalytics />}
        </>
    );
}
