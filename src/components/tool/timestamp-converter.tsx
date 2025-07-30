"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, ArrowDown, ArrowUp, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

export const TimestampConverter = () => {
    const t = useTranslations("TimestampConverter");
    const [timestamp, setTimestamp] = useState<string>("");
    const [dateTime, setDateTime] = useState<string>("");
    const [currentTimestamp, setCurrentTimestamp] = useState<string>("");
    const [currentDateTime, setCurrentDateTime] = useState<string>("");
    const [currentDateTimeUTC, setCurrentDateTimeUTC] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const [warning, setWarning] = useState<string | null>(null);
    const [mode, setMode] = useState<"timestamp-to-date" | "date-to-timestamp">(
        "timestamp-to-date",
    );

    // Update current time every second
    useEffect(() => {
        const updateCurrentTime = () => {
            const now = new Date();
            const timestampSeconds = Math.floor(now.getTime() / 1000);
            setCurrentTimestamp(timestampSeconds.toString());

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
            setCurrentDateTimeUTC(utcTime);
        };

        updateCurrentTime();
        const interval = setInterval(updateCurrentTime, 1000);
        return () => clearInterval(interval);
    }, []);

    const convertTimestampToDate = useCallback(() => {
        setError(null);
        setWarning(null);

        if (!timestamp.trim()) {
            setDateTime("");
            return;
        }

        try {
            const ts = parseInt(timestamp);
            if (isNaN(ts) || ts < 0) {
                setError(t("errors.invalidTimestamp"));
                setDateTime("");
                return;
            }

            // Show warning for very old or future timestamps
            const now = Date.now() / 1000;
            const timestampSeconds = ts < 10000000000 ? ts : ts / 1000;

            if (timestampSeconds < 946684800) {
                // Before year 2000
                setWarning(t("warnings.oldTimestamp"));
            } else if (timestampSeconds > now + 31536000) {
                // More than 1 year in future
                setWarning(t("warnings.futureTimestamp"));
            }

            const date = new Date(ts < 10000000000 ? ts * 1000 : ts);

            if (isNaN(date.getTime())) {
                setError(t("errors.invalidDate"));
                setDateTime("");
                return;
            }

            const localTime = date.toLocaleString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
                hour12: false,
            });

            setDateTime(localTime);
        } catch (error) {
            console.error("Timestamp conversion error:", error);
            setError(t("errors.conversionFailed"));
            setDateTime("");
        }
    }, [timestamp, t]);

    const convertDateToTimestamp = useCallback(() => {
        setError(null);
        setWarning(null);

        if (!dateTime.trim()) {
            setTimestamp("");
            return;
        }

        try {
            const date = new Date(dateTime);

            if (isNaN(date.getTime())) {
                setError(t("errors.invalidDate"));
                setTimestamp("");
                return;
            }

            const timestampSeconds = Math.floor(date.getTime() / 1000);
            setTimestamp(timestampSeconds.toString());
        } catch (error) {
            console.error("Date conversion error:", error);
            setError(t("errors.conversionFailed"));
            setTimestamp("");
        }
    }, [dateTime, t]);

    // Auto-convert when input changes
    useEffect(() => {
        if (mode === "timestamp-to-date") {
            convertTimestampToDate();
        } else {
            convertDateToTimestamp();
        }
    }, [mode, convertTimestampToDate, convertDateToTimestamp]);

    const copyToClipboard = async (text: string) => {
        if (text) {
            await navigator.clipboard.writeText(text);
            toast.success(t("copied"));
        }
    };

    const useCurrentTimestamp = () => {
        if (mode === "timestamp-to-date") {
            setTimestamp(currentTimestamp);
        } else {
            // 在日期转时间戳模式下，使用当前的本地时间
            setDateTime(currentDateTime);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    {/* Mode Toggle - Improved Design */}
                    <div className="flex items-center justify-center mt-4">
                        <div className="inline-flex items-center rounded-lg bg-muted p-1">
                            <button
                                onClick={() => setMode("timestamp-to-date")}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                                    mode === "timestamp-to-date"
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {t("timestampToDate")}
                            </button>
                            <button
                                onClick={() => setMode("date-to-timestamp")}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                                    mode === "date-to-timestamp"
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {t("dateToTimestamp")}
                            </button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Current Time Display */}
                    <div className="p-4 border rounded-lg bg-muted/50">
                        <h3 className="text-sm font-medium mb-3">
                            {t("currentTime")}
                        </h3>
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">
                                    {t("timestamp")}:
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm">
                                        {currentTimestamp}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            copyToClipboard(currentTimestamp)
                                        }
                                    >
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">
                                    Local:
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm">
                                        {currentDateTime}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            copyToClipboard(currentDateTime)
                                        }
                                    >
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">
                                    UTC:
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono text-sm">
                                        {currentDateTimeUTC}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            copyToClipboard(currentDateTimeUTC)
                                        }
                                    >
                                        <Copy className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={useCurrentTimestamp}
                            className="w-full mt-3"
                        >
                            {mode === "timestamp-to-date"
                                ? t("useCurrentTimestamp")
                                : t("useCurrentDateTime")}
                        </Button>
                    </div>

                    {mode === "timestamp-to-date" ? (
                        <>
                            {/* Timestamp Input */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <ArrowDown className="h-4 w-4" />
                                    {t("timestamp")}
                                </label>
                                <Input
                                    value={timestamp}
                                    onChange={(e) =>
                                        setTimestamp(e.target.value)
                                    }
                                    placeholder={t("enterTimestamp")}
                                    className="font-mono"
                                />
                            </div>

                            {/* Error/Warning Display */}
                            {error && (
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {warning && (
                                <Alert>
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>
                                        {warning}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Date Output */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <ArrowUp className="h-4 w-4" />
                                    {t("dateTime")}
                                </label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={dateTime}
                                        readOnly
                                        placeholder={t("outputPlaceholderDate")}
                                        className="flex-1 font-mono bg-muted/50"
                                    />
                                    <Button
                                        variant={
                                            dateTime ? "default" : "outline"
                                        }
                                        size="sm"
                                        onClick={() =>
                                            copyToClipboard(dateTime)
                                        }
                                        disabled={!dateTime}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Date Input */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <ArrowDown className="h-4 w-4" />
                                    {t("dateTime")}
                                </label>
                                <Input
                                    value={dateTime}
                                    onChange={(e) =>
                                        setDateTime(e.target.value)
                                    }
                                    placeholder={t("enterDateTime")}
                                    className="font-mono"
                                />
                            </div>

                            {/* Error Display */}
                            {error && (
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {/* Timestamp Output */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <ArrowUp className="h-4 w-4" />
                                    {t("timestamp")}
                                </label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={timestamp}
                                        readOnly
                                        placeholder={t(
                                            "outputPlaceholderTimestamp",
                                        )}
                                        className="flex-1 font-mono bg-muted/50"
                                    />
                                    <Button
                                        variant={
                                            timestamp ? "default" : "outline"
                                        }
                                        size="sm"
                                        onClick={() =>
                                            copyToClipboard(timestamp)
                                        }
                                        disabled={!timestamp}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setTimestamp("");
                                setDateTime("");
                                setError(null);
                                setWarning(null);
                            }}
                            className="flex-1"
                        >
                            {t("clear")}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
