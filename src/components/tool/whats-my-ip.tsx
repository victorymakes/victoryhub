"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    AlertCircle,
    Globe,
    Wifi,
    User,
    RefreshCw,
    Loader2,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslations } from "next-intl";

interface IPInfo {
    ip: string;
    version: string;
    city: string;
    region: string;
    country: string;
    isp: string;
    loading: boolean;
    error: string | null;
}

export default function WhatsMyIP() {
    const t = useTranslations("Tools.whatsMyIp");
    const [ipInfo, setIpInfo] = useState<IPInfo>({
        ip: "",
        version: "",
        city: "",
        region: "",
        country: "",
        isp: "",
        loading: true,
        error: null,
    });

    const fetchIPInfo = async () => {
        setIpInfo((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const response = await fetch("https://ipapi.co/json/");
            if (!response.ok) {
                setIpInfo((prev) => ({
                    ...prev,
                    loading: false,
                    error: "Failed to fetch IP information. Server returned an error.",
                }));
                return;
            }
            const data = await response.json();
            setIpInfo({
                ip: data.ip,
                version: data.version === "IPv4" ? "4" : "6",
                city: data.city || "Unknown",
                region: data.region || "Unknown",
                country: data.country_name || "Unknown",
                isp: data.org || "Unknown",
                loading: false,
                error: null,
            });
        } catch {
            setIpInfo((prev) => ({
                ...prev,
                loading: false,
                error: "Failed to fetch IP information. Please try again.",
            }));
        }
    };

    useEffect(() => {
        fetchIPInfo();
    }, []);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        {t("title")}
                    </CardTitle>
                    <CardDescription>{t("description")}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {ipInfo.loading && (
                        <div className="flex items-center justify-center py-8">
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span className="text-sm text-muted-foreground">
                                    {t("loading")}
                                </span>
                            </div>
                        </div>
                    )}

                    {ipInfo.error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {t("error")}: {ipInfo.error}
                            </AlertDescription>
                        </Alert>
                    )}

                    {!ipInfo.loading && !ipInfo.error && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Wifi className="h-4 w-4" />
                                            <span className="text-sm font-medium">
                                                {t("ipAddress")}
                                            </span>
                                        </div>
                                        <p className="text-2xl font-mono">
                                            {ipInfo.ip}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertCircle className="h-4 w-4" />
                                            <span className="text-sm font-medium">
                                                {t("version")}
                                            </span>
                                        </div>
                                        <p className="text-2xl">
                                            {ipInfo.version}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Globe className="h-4 w-4" />
                                            <span className="text-sm font-medium">
                                                {t("location")}
                                            </span>
                                        </div>
                                        <p className="text-lg">
                                            {ipInfo.city}, {ipInfo.region},{" "}
                                            {ipInfo.country}
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="pt-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <User className="h-4 w-4" />
                                            <span className="text-sm font-medium">
                                                {t("isp")}
                                            </span>
                                        </div>
                                        <p className="text-lg">{ipInfo.isp}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="flex justify-center">
                                <Button
                                    onClick={fetchIPInfo}
                                    className="flex items-center gap-2"
                                    disabled={ipInfo.loading}
                                >
                                    <RefreshCw className="h-4 w-4" />
                                    Refresh
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
