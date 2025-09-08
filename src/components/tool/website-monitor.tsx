"use client";

import React, { FC, useState, useEffect, useCallback } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { InfoIcon } from "lucide-react";
import { CheckCircle2, XCircle, RefreshCw, ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface SiteStatus {
    url: string;
    name?: string;
    isUp?: boolean;
    responseTime?: number;
    error?: string;
    isMainSite?: boolean;
}

interface WebsiteMonitorProps {
    sites: SiteStatus[];
    name: string;
}

const getNameFromUrl = (url: string) => {
    return url
        .replace("https://", "")
        .replace("http://", "")
        .replace("www.", "")
        .split(/[/?#]/)[0];
};

export const WebsiteMonitor: FC<WebsiteMonitorProps> = ({ sites, name }) => {
    const t = useTranslations("WebsiteMonitor");
    const [siteStatus, setSiteStatus] = useState<SiteStatus[]>(sites);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Simplified status check function
    const checkSiteStatus = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Extract only URLs from SITES for the API call
            const urls = sites.map((site) => site.url);

            // Call the uptime API with the urls parameter
            const response = await fetch(`/api/uptime`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(urls)
            });

            if (!response.ok) {
                setError(t("errors.apiError"));
            }

            const items: SiteStatus[] = await response.json();

            // Merge the API response data with the site information
            const updatedStatus = sites.map((site) => {
                const siteStatus = items.find((item) => item.url === site.url);
                return {
                    ...site,
                    isUp: siteStatus?.isUp,
                    responseTime: siteStatus?.responseTime,
                    error: siteStatus?.error
                };
            });

            setSiteStatus(updatedStatus);
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to check server status"
            );
        } finally {
            setIsLoading(false);
        }
    }, [t, sites]);

    const renderStatusBadge = (status: SiteStatus) => {
        if (status.isUp === undefined) {
            return (
                <Badge variant="outline" className="animate-pulse">
                    {t("checking")}
                </Badge>
            );
        }

        return status.isUp ? (
            <Badge
                variant="outline"
                className="bg-green-50 text-green-700 hover:bg-green-50 hover:text-green-700"
            >
                {t("online")}
            </Badge>
        ) : (
            <Badge
                variant="outline"
                className="bg-red-50 text-red-700 hover:bg-red-50 hover:text-red-700"
            >
                {t("offline")}
            </Badge>
        );
    };

    const renderStatusIcon = (status: SiteStatus) => {
        if (status.isUp === undefined) {
            return <Skeleton className="h-4 w-4 rounded-full" />;
        }

        return status.isUp ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : (
            <XCircle className="h-4 w-4 text-red-600" />
        );
    };

    useEffect(() => {
        checkSiteStatus();
    }, [checkSiteStatus]);

    return (
        <Card>
            <CardContent className="space-y-6">
                {error && (
                    <Alert variant="destructive" className="mb-4">
                        <InfoIcon className="h-4 w-4" />
                        <AlertTitle>{t("error")}</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">
                        {name + " " + t("status")}
                    </h2>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={checkSiteStatus}
                        disabled={isLoading}
                        className="flex items-center gap-1"
                    >
                        <RefreshCw
                            className={cn(
                                "h-3 w-3",
                                isLoading && "animate-spin"
                            )}
                        />
                        {t("refresh")}
                    </Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {/* Main website at the top with enhanced UI */}
                    {sites
                        .filter((site) => site.isMainSite)
                        .map((site) => {
                            const status = siteStatus.find(
                                (s) => s.url === site.url
                            );

                            if (!status) {
                                return null;
                            }

                            return (
                                <Card
                                    key={site.url}
                                    className="overflow-hidden flex flex-col border-primary/20 bg-gradient-to-r from-primary/5 to-transparent"
                                >
                                    <CardHeader>
                                        <CardTitle
                                            className="text-xl flex flex-col items-start sm:flex-row sm:items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                {renderStatusIcon(status)}
                                                {site.name ||
                                                    getNameFromUrl(site.url)}
                                            </div>
                                            <div className="space-x-2">
                                                <Badge variant="outline">
                                                    {t("mainWebsite")}
                                                </Badge>
                                                {renderStatusBadge(status)}
                                            </div>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-col space-y-2">
                                            <div className="flex items-center">
                                                <span className="text-muted-foreground mr-2">
                                                    {t("responseTime")}
                                                </span>
                                                <span>
                                                    {status.responseTime ? (
                                                        `${status.responseTime}ms`
                                                    ) : (
                                                        <Skeleton className="h-4 w-12" />
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="w-full mt-auto flex justify-center">
                                        <Button
                                            variant="default"
                                            size="sm"
                                            className="w-full flex items-center gap-1"
                                            asChild
                                        >
                                            <Link
                                                href={site.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <ExternalLink className="h-3 w-3" />
                                                {t("visitSite")}
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            );
                        })}
                </div>

                <div className="space-y-2">
                    <h3 className="text-lg font-medium">{t("mirrors")}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sites
                            .filter((site) => !site.isMainSite)
                            .map((site) => {
                                const status = siteStatus.find(
                                    (s) => s.url === site.url
                                );

                                if (!status) {
                                    return null;
                                }

                                return (
                                    <Card
                                        key={site.url}
                                        className="overflow-hidden flex flex-col"
                                    >
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    {renderStatusIcon(status)}
                                                    <span>
                                                        {site.name ||
                                                            getNameFromUrl(
                                                                site.url
                                                            )}
                                                    </span>
                                                </div>
                                                {renderStatusBadge(status)}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex flex-col space-y-2">
                                                <div className="flex items-center">
                                                    <span className="text-muted-foreground mr-2">
                                                        {t("responseTime")}
                                                    </span>
                                                    <span>
                                                        {status.responseTime ? (
                                                            `${status.responseTime}ms`
                                                        ) : (
                                                            <Skeleton className=" h-4 w-12" />
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="w-full mt-auto flex justify-center">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className=" flex items-center gap-1 w-full"
                                                asChild
                                            >
                                                <Link
                                                    href={site.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <ExternalLink className="h-3 w-3" />
                                                    {t("visitSite")}
                                                </Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
