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

export const TimestampConverter = () => {
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
                        Timestamp Converter
                    </CardTitle>
                    <CardDescription>
                        Convert between Unix timestamps and human-readable dates
                        with UTC support
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Current Time Display */}
                    <Card>
                        <CardContent className="pt-6">
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Current Time
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <p className="text-xs text-muted-foreground">
                                            Timestamp (seconds)
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                value={currentTimestamp}
                                                readOnly
                                                className="font-mono text-sm"
                                            />
                                            <Button
                                                onClick={useCurrentTimestamp}
                                                variant="outline"
                                                size="sm"
                                                title="Use current timestamp"
                                            >
                                                <RefreshCw className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-xs text-muted-foreground">
                                            Date & Time
                                        </p>
                                        <div className="space-y-1">
                                            <p className="text-sm font-mono">
                                                {currentDateTime} (Local)
                                            </p>
                                            <p className="text-sm font-mono text-muted-foreground">
                                                {currentDateTimeUTC}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Mode Toggle */}
                    <div className="flex items-center justify-center gap-4">
                        <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                            <Button
                                variant={
                                    mode === "timestamp-to-date"
                                        ? "default"
                                        : "ghost"
                                }
                                size="sm"
                                onClick={() => setMode("timestamp-to-date")}
                                className="flex items-center gap-1"
                            >
                                Timestamp → Date
                            </Button>
                            <Button
                                variant={
                                    mode === "date-to-timestamp"
                                        ? "default"
                                        : "ghost"
                                }
                                size="sm"
                                onClick={() => setMode("date-to-timestamp")}
                                className="flex items-center gap-1"
                            >
                                Date → Timestamp
                            </Button>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={swapMode}
                            title="Switch conversion mode"
                        >
                            <ArrowUpDown className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Input Section */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium">
                            {mode === "timestamp-to-date"
                                ? "Unix Timestamp"
                                : "Date & Time"}
                        </label>
                        {mode === "timestamp-to-date" ? (
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    value={timestamp}
                                    onChange={(e) =>
                                        setTimestamp(e.target.value)
                                    }
                                    placeholder="Enter Unix timestamp (e.g., 1640995200)"
                                    className="font-mono"
                                />
                                {timestamp && (
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
                                )}
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Input
                                    value={dateTime}
                                    onChange={(e) =>
                                        setDateTime(e.target.value)
                                    }
                                    placeholder="Enter date (e.g., 2024-01-01 12:00:00 or Jan 1, 2024)"
                                />
                                {dateTime && (
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
                                )}
                            </div>
                        )}
                    </div>

                    {/* Output Section */}
                    {((mode === "timestamp-to-date" && dateTime) ||
                        (mode === "date-to-timestamp" && timestamp)) && (
                        <div className="space-y-3">
                            <label className="text-sm font-medium">
                                {mode === "timestamp-to-date"
                                    ? "Converted Date & Time"
                                    : "Converted Timestamp"}
                            </label>
                            {mode === "timestamp-to-date" ? (
                                <div className="flex gap-2">
                                    <textarea
                                        value={dateTime}
                                        readOnly
                                        className="flex-1 p-3 border rounded-lg font-mono text-sm bg-muted/50 resize-none"
                                        rows={2}
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
                            ) : (
                                <div className="flex gap-2">
                                    <Input
                                        value={timestamp}
                                        readOnly
                                        className="font-mono bg-muted/50"
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
                            )}
                        </div>
                    )}

                    {/* Examples */}
                    <Card>
                        <CardContent className="pt-6">
                            <h4 className="text-sm font-semibold mb-3">
                                Examples:
                            </h4>
                            <div className="space-y-2 text-xs">
                                {mode === "timestamp-to-date" ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="font-medium text-muted-foreground mb-1">
                                                Timestamp:
                                            </p>
                                            <code className="bg-muted p-1 rounded">
                                                1640995200
                                            </code>
                                            <p className="text-muted-foreground mt-1">
                                                → 01/01/2022 00:00:00 (Local)
                                            </p>
                                            <p className="text-muted-foreground">
                                                → 01/01/2022 00:00:00 (UTC)
                                            </p>
                                        </div>
                                        <div>
                                            <p className="font-medium text-muted-foreground mb-1">
                                                Another example:
                                            </p>
                                            <code className="bg-muted p-1 rounded">
                                                1672531200
                                            </code>
                                            <p className="text-muted-foreground mt-1">
                                                → 01/01/2023 00:00:00 (Local)
                                            </p>
                                            <p className="text-muted-foreground">
                                                → 01/01/2023 00:00:00 (UTC)
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="font-medium text-muted-foreground mb-1">
                                                Date formats you can enter:
                                            </p>
                                            <div className="space-y-1">
                                                <code className="bg-muted p-1 rounded text-xs block">
                                                    01/01/2024 12:00:00
                                                </code>
                                                <p className="text-muted-foreground text-xs">
                                                    → 1704110400
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="font-medium text-muted-foreground mb-1">
                                                Other supported formats:
                                            </p>
                                            <div className="space-y-1">
                                                <code className="bg-muted p-1 rounded text-xs block">
                                                    2024-01-01 12:00:00
                                                </code>
                                                <code className="bg-muted p-1 rounded text-xs block">
                                                    Jan 1, 2024 12:00 PM
                                                </code>
                                                <code className="bg-muted p-1 rounded text-xs block">
                                                    January 1, 2024
                                                </code>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Info Note */}
                    <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            <strong>Note:</strong> Unix timestamps represent
                            seconds since January 1, 1970 (UTC). This tool
                            automatically detects whether your timestamp is in
                            seconds or milliseconds. Dates are shown in both
                            local time and UTC for clarity.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
