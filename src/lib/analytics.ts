import { config } from "@/lib/config";

// Declare global window extensions for analytics
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    posthog?: {
      capture: (
        eventName: string,
        properties?: Record<string, unknown>,
      ) => void;
    };
  }
}

// Google Analytics event tracking
export const trackEvent = (
  eventName: string,
  parameters?: Record<string, unknown>,
) => {
  if (
    config.analytics.googleAnalytics.enabled &&
    typeof window !== "undefined" &&
    window.gtag
  ) {
    window.gtag("event", eventName, parameters);
  }
};

// PostHog event tracking
export const trackPostHogEvent = (
  eventName: string,
  properties?: Record<string, unknown>,
) => {
  if (
    config.analytics.posthog.enabled &&
    typeof window !== "undefined" &&
    window.posthog
  ) {
    window.posthog.capture(eventName, properties);
  }
};

// Tool usage tracking
export const trackToolUsage = (toolName: string, action: string = "use") => {
  const eventData = {
    tool_name: toolName,
    action,
    timestamp: new Date().toISOString(),
  };

  trackEvent("tool_usage", eventData);
  trackPostHogEvent("tool_usage", eventData);
};

// Page view tracking (for SPAs)
export const trackPageView = (path: string, title?: string) => {
  const eventData = {
    page_path: path,
    page_title: title,
  };

  if (
    config.analytics.googleAnalytics.enabled &&
    typeof window !== "undefined" &&
    window.gtag
  ) {
    window.gtag("config", config.analytics.googleAnalytics.measurementId, {
      page_path: path,
      page_title: title,
    });
  }

  trackPostHogEvent("$pageview", eventData);
};

// Button click tracking
export const trackButtonClick = (buttonName: string, location?: string) => {
  const eventData = {
    button_name: buttonName,
    location,
  };

  trackEvent("button_click", eventData);
  trackPostHogEvent("button_click", eventData);
};

// Share tracking
export const trackShare = (platform: string, content: string) => {
  const eventData = {
    platform,
    content,
  };

  trackEvent("share", eventData);
  trackPostHogEvent("share", eventData);
};
