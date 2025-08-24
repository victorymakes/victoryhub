"use client";

import dynamic from "next/dynamic";
import React, { FC } from "react";
import type { ComponentType } from "react";

interface ToolComponentProps {
    id: string;
    underConstructionMessage: string;
}

const ToolLoader: FC = () => {
    return (
        <div className="w-full">
            <div className="animate-pulse space-y-4">
                <div className="h-6 bg-muted rounded w-1/3" />
                <div className="h-4 bg-muted rounded w-2/3" />
                <div className="h-4 bg-muted rounded w-1/2" />
                <div className="h-64 bg-muted rounded" />
                <div className="flex items-center gap-3 text-muted-foreground">
                    <span className="inline-block h-3 w-3 rounded-full bg-muted animate-bounce" />
                    {/*<span className="text-sm">Loading…</span>*/}
                </div>
            </div>
        </div>
    );
};

// Map each tool id to a dynamically imported component with a loading placeholder
const TOOL_COMPONENTS: Record<
    string,
    ComponentType<Record<string, React.ComponentType>>
> = {
    "json-yaml-converter": dynamic(
        () => import("./json-yaml-converter").then((m) => m.JsonYamlConverter),
        { loading: () => <ToolLoader />, ssr: false },
    ),
    "json-xml-converter": dynamic(
        () => import("./json-xml-converter").then((m) => m.JsonXmlConverter),
        { loading: () => <ToolLoader />, ssr: false },
    ),
    "uuid-generator": dynamic(
        () => import("./uuid-generator").then((m) => m.UuidGenerator),
        { loading: () => <ToolLoader />, ssr: false },
    ),
    "timestamp-converter": dynamic(
        () => import("./timestamp-converter").then((m) => m.TimestampConverter),
        { loading: () => <ToolLoader />, ssr: false },
    ),
    "whats-my-ip": dynamic(() => import("./whats-my-ip"), {
        loading: () => <ToolLoader />,
        ssr: false,
    }),
    "password-generator": dynamic(() => import("./password-generator"), {
        loading: () => <ToolLoader />,
        ssr: false,
    }),
    "url-encoder-decoder": dynamic(() => import("./url-encoder-decoder"), {
        loading: () => <ToolLoader />,
        ssr: false,
    }),
    "url-tracker-cleaner": dynamic(() => import("./url-tracker-cleaner"), {
        loading: () => <ToolLoader />,
        ssr: false,
    }),
    "random-picker": dynamic(() => import("./random-picker"), {
        loading: () => <ToolLoader />,
        ssr: false,
    }),
    "base64-encoder-decoder": dynamic(
        () => import("./base64-encoder-decoder"),
        { loading: () => <ToolLoader />, ssr: false },
    ),
    "image-compressor": dynamic(() => import("./image-compressor"), {
        loading: () => <ToolLoader />,
        ssr: false,
    }),
    "password-strength-checker": dynamic(
        () => import("./password-strength-checker"),
        {
            loading: () => <ToolLoader />,
            ssr: false,
        },
    ),
    "image-converter": dynamic(() => import("./image-converter"), {
        loading: () => <ToolLoader />,
        ssr: false,
    }),
    "exif-viewer": dynamic(() => import("./exif-viewer"), {
        loading: () => <ToolLoader />,
        ssr: false,
    }),
    "qrcode-generator": dynamic(() => import("./qrcode-generator"), {
        loading: () => <ToolLoader />,
        ssr: false,
    }),
    "cron-expression-generator": dynamic(
        () => import("./cron-expression-generator"),
        { loading: () => <ToolLoader />, ssr: false },
    ),
    "bmi-calculator": dynamic(() => import("./bmi-calculator"), {
        loading: () => <ToolLoader />,
        ssr: false,
    }),
    "bmr-calculator": dynamic(() => import("./bmr-calculator"), {
        loading: () => <ToolLoader />,
        ssr: false,
    }),
    "barcode-generator": dynamic(() => import("./barcode-generator"), {
        loading: () => <ToolLoader />,
        ssr: false,
    }),
    "carbon-footprint-calculator": dynamic(
        () => import("./carbon-footprint-calculator"),
        { loading: () => <ToolLoader />, ssr: false },
    ),
    "text-favicon-generator": dynamic(
        () => import("./text-favicon-generator"),
        { loading: () => <ToolLoader />, ssr: false },
    ),
    "color-model-converter": dynamic(
        () =>
            import("./color-model-converter").then(
                (m) => m.ColorModelConverter,
            ),
        { loading: () => <ToolLoader />, ssr: false },
    ),
    "slo-burn-simulator": dynamic(() => import("./slo-burn-simulator"), {
        loading: () => <ToolLoader />,
        ssr: false,
    }),
    "csv-json-converter": dynamic(() => import("./csv-json-converter"), {
        loading: () => <ToolLoader />,
        ssr: false,
    }),
    "base64-image-converter": dynamic(
        () => import("./base64-image-converter"),
        { loading: () => <ToolLoader />, ssr: false },
    ),
    "image-to-bw-converter": dynamic(() => import("./image-to-bw-converter"), {
        loading: () => <ToolLoader />,
        ssr: false,
    }),
    "text-redactor": dynamic(() => import("./text-redactor"), {
        loading: () => <ToolLoader />,
        ssr: false,
    }),
    "regex-tester": dynamic(() => import("./regex-tester"), {
        loading: () => <ToolLoader />,
        ssr: false,
    }),
};

export const ToolComponent: FC<ToolComponentProps> = ({
    id,
    underConstructionMessage,
}) => {
    const Component = TOOL_COMPONENTS[id];

    if (Component) {
        return <Component />;
    }

    return (
        <p className="text-muted-foreground text-sm">
            {underConstructionMessage}
        </p>
    );
};
