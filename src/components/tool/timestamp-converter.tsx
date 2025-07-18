"use client";

import { FC, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const TimestampConverter: FC = () => {
    const [timestamp, setTimestamp] = useState<string>("");
    const [dateTime, setDateTime] = useState<string>("");
    const [currentTimestamp, setCurrentTimestamp] = useState<string>("");

    // Update current time every second
    useEffect(() => {
        const updateCurrentTime = () => {
            const now = new Date();
            setCurrentTimestamp(Math.floor(now.getTime() / 1000).toString());
        };

        updateCurrentTime();
        const interval = setInterval(updateCurrentTime, 1000);

        return () => clearInterval(interval);
    }, []);

    const convertTimestampToDate = () => {
        try {
            const ts = parseInt(timestamp);
            if (isNaN(ts)) {
                alert("Please enter a valid timestamp");
                return;
            }

            // Handle both seconds and milliseconds timestamps
            const date = new Date(ts < 10000000000 ? ts * 1000 : ts);
            setDateTime(date.toLocaleString());
        } catch {
            alert("Invalid timestamp format");
        }
    };

    const convertDateToTimestamp = () => {
        try {
            const date = new Date(dateTime);
            if (isNaN(date.getTime())) {
                alert("Please enter a valid date format");
                return;
            }
            setTimestamp(Math.floor(date.getTime() / 1000).toString());
        } catch {
            alert("Invalid date format");
        }
    };

    const useCurrentTimestamp = () => {
        setTimestamp(currentTimestamp);
        const date = new Date(parseInt(currentTimestamp) * 1000);
        setDateTime(date.toLocaleString());
    };

    const copyTimestamp = async () => {
        if (timestamp) await navigator.clipboard.writeText(timestamp);
    };

    const copyDateTime = async () => {
        if (dateTime) await navigator.clipboard.writeText(dateTime);
    };

    return (
        <div className="space-y-6">
            {/* Current Time Display */}
            <div className="bg-muted/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                        Current Timestamp: {currentTimestamp}
                    </span>
                    <Button
                        onClick={useCurrentTimestamp}
                        variant="outline"
                        size="sm"
                    >
                        Use Current
                    </Button>
                </div>
            </div>

            {/* Timestamp to Date */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium">Timestamp to Date</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                        value={timestamp}
                        onChange={(e) => setTimestamp(e.target.value)}
                        placeholder="Enter Unix timestamp (e.g., 1642694400)"
                        className="flex-1"
                    />
                    <Button onClick={convertTimestampToDate} variant="default">
                        Convert to Date
                    </Button>
                    <Button
                        onClick={copyTimestamp}
                        variant="secondary"
                        disabled={!timestamp}
                    >
                        Copy
                    </Button>
                </div>
                {dateTime && (
                    <div className="p-3 bg-muted/50 rounded border">
                        <p className="text-sm text-muted-foreground">Result:</p>
                        <p className="font-mono">{dateTime}</p>
                    </div>
                )}
            </div>

            {/* Date to Timestamp */}
            <div className="space-y-3">
                <h3 className="text-sm font-medium">Date to Timestamp</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                        value={dateTime}
                        onChange={(e) => setDateTime(e.target.value)}
                        placeholder="Enter date (e.g., 2022-01-20 12:00:00)"
                        className="flex-1"
                    />
                    <Button onClick={convertDateToTimestamp} variant="default">
                        Convert to Timestamp
                    </Button>
                    <Button
                        onClick={copyDateTime}
                        variant="secondary"
                        disabled={!dateTime}
                    >
                        Copy
                    </Button>
                </div>
            </div>
        </div>
    );
};
