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
import { Input } from "@/components/ui/input";
import {
    Copy,
    RefreshCw,
    Check,
    Clock,
    ArrowUpDown,
    Calendar,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslations } from "next-intl";

export const TimestampConverter = () => {
    const t = useTranslations("Tools.timestampConverter");
    const [timestamp, setTimestamp] = useState<string>("");
    const [dateTime, setDateTime] = useState<string>("");
    const [currentTimestamp, setCurrentTimestamp] = useState<string>("");
    const [currentDateTime, setCurrentDateTime] = useState<string>("");
    const [currentDateTimeUTC, setCurrentDateTimeUTC] = useState<string>("");
    const [copiedTimestamp, setCopiedTimestamp] = useState(false);
    const [copiedDateTime, setCopiedDateTime] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mode, setMode] = useState<"timestamp-to-date" | "date-to-timestamp">(
        "timestamp-to-date",
    );

    // Update current time every second
    useEffect(() => {
        const updateCurrentTime = () => {
            const now = new Date();
            const timestampSeconds = Math.floor(now.getTime() / 1000);
            setCurrentTimestamp(timestampSeconds.toString());

            // Use consistent date formatting
            const localTime = now.toLocaleString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
            });
            const utcTime = now.toLocaleString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
                timeZone: "UTC",
            });

            setCurrentDateTime(localTime);
            setCurrentDateTimeUTC(utcTime + " UTC");
        };

        updateCurrentTime();
        const interval = setInterval(updateCurrentTime, 1000);

        return () => clearInterval(interval);
    }, []);

    const convertTimestampToDate = () => {
        setError(null);
        try {
            const ts = parseInt(timestamp);
            if (isNaN(ts) || ts < 0) {
                setError("Please enter a valid timestamp (positive number)");
                return;
            }

            // Handle both seconds and milliseconds timestamps
            const date = new Date(ts < 10000000000 ? ts * 1000 : ts);

            if (isNaN(date.getTime())) {
                setError("Invalid timestamp value");
                return;
            }

            // Use consistent date formatting
            const localTime = date.toLocaleString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
            });
            const utcTime = date.toLocaleString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
                timeZone: "UTC",
            });

            setDateTime(`${localTime} (Local)\n${utcTime} (UTC)`);
        } catch {
            setError("Invalid timestamp format");
        }
    };

    const convertDateToTimestamp = () => {
        setError(null);
        try {
            const date = new Date(dateTime.split(" (")[0]); // Remove (Local) part if present
            if (isNaN(date.getTime())) {
                setError(
                    "Please enter a valid date format (e.g., 2024-01-01 12:00:00 or Jan 1, 2024)",
                );
                return;
            }
            setTimestamp(Math.floor(date.getTime() / 1000).toString());
        } catch {
            setError("Invalid date format");
        }
    };

    const useCurrentTimestamp = () => {
        setTimestamp(currentTimestamp);
        const date = new Date(parseInt(currentTimestamp) * 1000);

        // Use consistent date formatting
        const localTime = date.toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });
        const utcTime = date.toLocaleString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
            timeZone: "UTC",
        });

        setDateTime(`${localTime} (Local)\n${utcTime} (UTC)`);
        setError(null);
    };

    const swapMode = () => {
        setMode(
            mode === "timestamp-to-date"
                ? "date-to-timestamp"
                : "timestamp-to-date",
        );
        // Clear inputs when switching modes
        setTimestamp("");
        setDateTime("");
        setError(null);
    };

    const copyTimestamp = async () => {
        if (timestamp) {
            await navigator.clipboard.writeText(timestamp);
            setCopiedTimestamp(true);
            setTimeout(() => setCopiedTimestamp(false), 2000);
        }
    };

    const copyDateTime = async () => {
        if (dateTime) {
            await navigator.clipboard.writeText(dateTime);
            setCopiedDateTime(true);
            setTimeout(() => setCopiedDateTime(false), 2000);
        }
    };

    // Auto-convert when input changes
    useEffect(() => {
        if (timestamp && mode === "timestamp-to-date") {
            convertTimestampToDate();
        }
    }, [timestamp, mode]);

    useEffect(() => {
        if (dateTime && mode === "date-to-timestamp") {
            convertDateToTimestamp();
        }
    }, [dateTime, mode]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        {t("title")}
                    </CardTitle>
                    <CardDescription>{t("description")}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Current Timestamp Display */}
                    <Card>
                        <CardContent className="pt-6">
                            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {t("currentTimestamp")}
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={currentTimestamp}
                                        readOnly
                                        className="flex-1 font-mono text-sm"
                                        placeholder="Current timestamp"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={copyTimestamp}
                                    >
                                        {copiedTimestamp ? (
                                            <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                <div className="text-xs text-muted-foreground space-y-1">
                                    <p>
                                        <strong>{t("local")}:</strong>{" "}
                                        {currentDateTime}
                                    </p>
                                    <p>
                                        <strong>{t("utc")}:</strong>{" "}
                                        {currentDateTimeUTC}
                                    </p>
                                    <p>
                                        <strong>{t("iso8601")}:</strong>{" "}
                                        {new Date().toISOString()}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Mode Toggle */}
                    <div className="flex items-center justify-center">
                        <Button
                            variant="outline"
                            onClick={swapMode}
                            className="flex items-center gap-2"
                        >
                            <ArrowUpDown className="h-4 w-4" />
                            {mode === "timestamp-to-date"
                                ? "Convert to Date"
                                : "Convert to Timestamp"}
                        </Button>
                    </div>

                    {/* Input Section */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium">
                            {t("enterTimestamp")}
                        </label>
                        <div className="flex items-center gap-2">
                            <Input
                                type={
                                    mode === "timestamp-to-date"
                                        ? "number"
                                        : "datetime-local"
                                }
                                value={timestamp}
                                onChange={(e) => setTimestamp(e.target.value)}
                                placeholder={t("timestampPlaceholder")}
                                className="flex-1"
                            />
                            <Button
                                onClick={
                                    mode === "timestamp-to-date"
                                        ? convertTimestampToDate
                                        : convertDateToTimestamp
                                }
                                className="flex items-center gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                {t("convert")}
                            </Button>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Result Display */}
                    {dateTime && (
                        <div className="space-y-3">
                            <label className="text-sm font-medium">
                                {t("humanReadable")}
                            </label>
                            <div className="flex items-center gap-2">
                                <Input
                                    value={dateTime}
                                    readOnly
                                    className="flex-1 font-mono text-sm"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={copyDateTime}
                                >
                                    {copiedDateTime ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
