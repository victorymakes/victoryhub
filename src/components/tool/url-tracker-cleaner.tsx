"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Trash2, AlertTriangle, ExternalLink, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { trackToolUsage } from "@/lib/analytics";
import { Link } from "@/i18n/navigation";

// Common tracking parameters to detect
const COMMON_TRACKERS: readonly string[] = [
    "utm_*",
    "gclid",
    "fbclid",
    "msclkid",
    "dclid",
    "twclid",
    "li_fat_id",
    "mc_eid",
    "_hsenc",
    "_hsmi",
    "ref",
    "source",
    "cmpid",
    "icid",
    "yclid",
];

export default function URLTrackerCleaner() {
    const t = useTranslations("UrlTrackerCleaner");
    const [input, setInput] = useState("");
    const [cleanedUrl, setCleanedUrl] = useState("");
    const [trackers, setTrackers] = useState<
        Array<{ name: string; value: string }>
    >([]);
    const [error, setError] = useState<string | null>(null);
    const [warning, setWarning] = useState<string | null>(null);

    // Process URL to find and remove trackers
    const processURL = useCallback(() => {
        setError(null);
        setWarning(null);
        setTrackers([]);
        setCleanedUrl("");

        if (!input.trim()) {
            return;
        }

        try {
            // Track usage
            trackToolUsage("url-tracker-cleaner");

            // Parse the URL
            const url = new URL(input.trim());
            const foundTrackers: Array<{ name: string; value: string }> = [];

            // Check for tracking parameters
            url.searchParams.forEach((value, name) => {
                // Check if parameter is a known tracker or matches utm_ pattern
                if (
                    COMMON_TRACKERS.some((tracker) =>
                        tracker.endsWith("*")
                            ? name.startsWith(tracker.slice(0, -1))
                            : tracker === name,
                    )
                ) {
                    foundTrackers.push({ name, value });
                }
            });

            setTrackers(foundTrackers);

            // Create cleaned URL by removing all trackers
            const cleanUrl = new URL(url.toString());
            foundTrackers.forEach((tracker) => {
                cleanUrl.searchParams.delete(tracker.name);
            });

            // If there are no search params left, remove the trailing '?'
            const cleanedUrlString = cleanUrl.toString().replace(/\?$/, "");
            setCleanedUrl(cleanedUrlString);

            // Show warning if no trackers found
            if (foundTrackers.length === 0) {
                setWarning(t("warnings.noTrackers"));
            }
        } catch (err) {
            console.error("URL processing error:", err);
            setError(t("errors.invalidUrl"));
        }
    }, [input, t]);

    const copyToClipboard = async (text: string) => {
        if (text) {
            await navigator.clipboard.writeText(text);
            toast.success(t("copied"));
        }
    };

    const visitCleanUrl = () => {
        if (cleanedUrl) {
            window.open(cleanedUrl, "_blank", "noopener,noreferrer");
        }
    };

    // Auto-process when input changes
    useEffect(() => {
        if (input.trim()) {
            processURL();
        }
    }, [input, processURL]);

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="space-y-6">
                    {/* Input Section */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium">
                            {t("inputLabel")}
                        </label>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t("inputPlaceholder")}
                            className="w-full min-h-[100px] p-3 border rounded-lg resize-y font-mono text-sm"
                        />
                    </div>

                    {/* Error Display */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Warning Display */}
                    {warning && (
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{warning}</AlertDescription>
                        </Alert>
                    )}

                    {/* Trackers Found Section */}
                    {trackers.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium">
                                {t("trackersFound")}
                            </h3>
                            <div className="p-3 border rounded-lg bg-muted/30">
                                <div className="flex flex-wrap gap-2">
                                    {trackers.map((tracker, index) => (
                                        <Badge
                                            key={index}
                                            variant="outline"
                                            className="flex items-center gap-1"
                                        >
                                            <span className="font-mono">
                                                {tracker.name}
                                            </span>
                                            <span className="text-muted-foreground">
                                                =
                                            </span>
                                            <span className="font-mono truncate max-w-[150px]">
                                                {tracker.value}
                                            </span>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div className="text-primary flex gap-2 justify-end items-center">
                                <Info className="h-4 w-4" />
                                <Link
                                    href={
                                        "/blog/why-you-should-care-about-url-trackers-and-how-to-remove-them"
                                    }
                                >
                                    {t("learnMore")}
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Cleaned URL Section */}
                    {cleanedUrl && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium">
                                {t("cleanedUrl")}
                            </h3>
                            <div className="p-3 border rounded-lg bg-muted/30 font-mono text-sm break-all">
                                {cleanedUrl}
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => copyToClipboard(cleanedUrl)}
                                    className="flex items-center gap-2"
                                >
                                    <Copy className="h-4 w-4" />
                                    <span>{t("copy")}</span>
                                </Button>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={visitCleanUrl}
                                    className="flex items-center gap-2"
                                >
                                    <ExternalLink className="h-4 w-4" />
                                    <span>{t("visit")}</span>
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setInput("");
                                setCleanedUrl("");
                                setTrackers([]);
                                setError(null);
                                setWarning(null);
                            }}
                            className="flex-1 flex items-center justify-center gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>{t("clear")}</span>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
