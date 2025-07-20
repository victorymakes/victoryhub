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
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>What&apos;s My IP</CardTitle>
                            <CardDescription>
                                View your public IP address and related
                                information
                            </CardDescription>
                        </div>
                        <Button
                            onClick={fetchIPInfo}
                            disabled={ipInfo.loading}
                            variant="outline"
                            size="sm"
                        >
                            {ipInfo.loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <RefreshCw className="h-4 w-4" />
                            )}
                            Refresh
                        </Button>
                    </div>
                </CardHeader>

                <CardContent>
                    {ipInfo.error && (
                        <Alert variant="destructive" className="mb-6">
                            <AlertCircle />
                            <AlertDescription>{ipInfo.error}</AlertDescription>
                        </Alert>
                    )}

                    {ipInfo.loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="flex items-center space-x-2">
                                <Loader2 className="h-6 w-6 animate-spin" />
                                <span className="text-muted-foreground">
                                    Loading IP information...
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card>
                                    <CardContent className="flex items-start space-x-3">
                                        <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/20">
                                            <Wifi className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">
                                                IP Address
                                            </p>
                                            <p className="text-xl font-semibold">
                                                {ipInfo.ip}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                IPv{ipInfo.version}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="flex items-start space-x-3">
                                        <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/20">
                                            <Globe className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium text-muted-foreground">
                                                Location
                                            </p>
                                            <p className="text-xl font-semibold">
                                                {ipInfo.city}, {ipInfo.region}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {ipInfo.country}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardContent className="flex items-start space-x-3">
                                    <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/20">
                                        <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-muted-foreground">
                                            Internet Service Provider
                                        </p>
                                        <p className="text-xl font-semibold">
                                            {ipInfo.isp}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="rounded-lg bg-muted/50 p-4">
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    <strong>Privacy Note:</strong> Location data
                                    is approximate and based on your IP address.
                                    Your IP address is only used to display
                                    information to you and is not stored or
                                    shared with third parties.
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
