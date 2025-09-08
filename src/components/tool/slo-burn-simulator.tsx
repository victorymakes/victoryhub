"use client";

import { useState, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { AlertCircle, Download } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";
import { toBlob } from "html-to-image";
import FileSaver from "file-saver";

const DEFAULT_ERROR_RATES = [0.1, 1, 5, 10, 25, 50, 100];

interface Series {
    name: string;
    data: ChartDataPoint[];
}

interface ChartDataPoint {
    time: string;
    budget: number;
}

const calculateErrorBudget = (
    sloTarget: number,
    windowDays: number,
    avgThroughput: number,
): number => {
    const errorPercentage = (100 - sloTarget) / 100;
    const totalRequests = avgThroughput * 60 * 24 * windowDays;
    return Math.floor(totalRequests * errorPercentage);
};

const calculateTimeToExhaustion = (
    errorBudget: number,
    errorRate: number,
    throughput: number,
): number => {
    if (errorRate <= 0 || throughput <= 0) return Infinity;
    const errorsPerMinute = throughput * (errorRate / 100);
    return errorBudget / errorsPerMinute;
};

const formatTime = (minutes: number): string => {
    if (!isFinite(minutes)) return "Infinite";
    if (minutes < 1) return "< 1 min";

    const days = Math.floor(minutes / (60 * 24));
    const hours = Math.floor((minutes % (60 * 24)) / 60);
    const mins = Math.floor(minutes % 60);

    let result = "";
    if (days > 0) result += `${days}d `;
    if (hours > 0) result += `${hours}h `;
    if (mins > 0) result += `${mins}m`;

    return result.trim();
};

const generateChartData = (
    errorBudget: number,
    errorRates: number[],
    throughput: number,
): Series[] => {
    return errorRates.map((rate) => {
        const exhaustionTime = Math.round(
            calculateTimeToExhaustion(errorBudget, rate, throughput),
        );
        return {
            name: `Error Rate ${rate}%`,
            data: [
                {
                    time: formatTimeLabel(0),
                    budget: 100,
                },
                {
                    time: formatTimeLabel(exhaustionTime),
                    budget: 0,
                },
            ] as ChartDataPoint[],
        };
    });
};

const formatTimeLabel = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.round(minutes / 60)}h`;
    return `${Math.round(minutes / 1440)}d`;
};

const exportToPNG = async () => {
    const node = document.getElementById("chart-container");
    if (!node) return;

    const blob = await toBlob(node, { backgroundColor: "white" });
    if (blob) {
        FileSaver.saveAs(blob, `slo-burn.png`);
    }
};

export default function SLOBurnSimulator() {
    const t = useTranslations("SLOBurnSimulator");

    const [sloTarget, setSloTarget] = useState<number>(99.9);
    const [sloWindow, setSloWindow] = useState<number>(28);
    const [avgThroughput, setAvgThroughput] = useState<number>(126000);
    const [maxThroughput, setMaxThroughput] = useState<number>(126000 * 2);
    const [throughputMode, setThroughputMode] = useState<"avg" | "max">("avg");
    const [errorRates, setErrorRates] = useState<number[]>(DEFAULT_ERROR_RATES);
    const [customErrorRate, setCustomErrorRate] = useState<string>("");
    const [error, setError] = useState<string>("");

    const errorBudget = useMemo(() => {
        return calculateErrorBudget(sloTarget, sloWindow, avgThroughput);
    }, [sloTarget, sloWindow, avgThroughput]);

    const series = useMemo(() => {
        const throughput =
            throughputMode === "avg" ? avgThroughput : maxThroughput;
        return generateChartData(errorBudget, errorRates, throughput);
    }, [errorBudget, errorRates, avgThroughput, maxThroughput, throughputMode]);

    const addCustomErrorRate = useCallback(() => {
        if (!customErrorRate) return;

        const rate = parseFloat(customErrorRate);
        if (isNaN(rate) || rate <= 0 || rate > 100) {
            setError(t("invalidErrorRate"));
            return;
        }

        if (!errorRates.includes(rate)) {
            setErrorRates([...errorRates, rate].sort((a, b) => a - b));
            setCustomErrorRate("");
            setError("");
        }
    }, [customErrorRate, errorRates, t]);

    const removeErrorRate = useCallback(
        (rate: number) => {
            setErrorRates(errorRates.filter((r) => r !== rate));
        },
        [errorRates],
    );

    const getExhaustionTime = useCallback(
        (rate: number): string => {
            const throughput =
                throughputMode === "avg" ? avgThroughput : maxThroughput;
            const minutes = calculateTimeToExhaustion(
                errorBudget,
                rate,
                throughput,
            );
            return formatTime(minutes);
        },
        [errorBudget, avgThroughput, maxThroughput, throughputMode],
    );

    const getLineColor = (index: number): string => {
        const colors = [
            "#ff0000",
            "#ff8000",
            "#ffff00",
            "#00ff00",
            "#00ffff",
            "#0000ff",
            "#8000ff",
            "#ff00ff",
            "#ff0080",
            "#808080",
            "#8B0000",
            "#FF1493",
            "#FFD700",
            "#32CD32",
            "#20B2AA",
            "#4682B4",
            "#4B0082",
            "#A0522D",
            "#FF4500",
            "#2E8B57",
            "#B22222",
            "#DAA520",
            "#5F9EA0",
            "#9932CC",
            "#DC143C",
            "#00CED1",
            "#7FFF00",
            "#D2691E",
            "#1E90FF",
            "#C71585",
        ];
        return colors[index % colors.length];
    };

    console.log(series);

    return (
        <div className="space-y-6">
            <Card>
                <CardContent>
                    <div className="space-y-4">
                        {/* SLO Target */}
                        <div className="space-y-2">
                            <Label htmlFor="slo-target">
                                {t("sloTarget")} (%)
                            </Label>
                            <Input
                                id="slo-target"
                                type="number"
                                step="0.01"
                                min="0"
                                max="100"
                                value={sloTarget}
                                onChange={(e) =>
                                    setSloTarget(parseFloat(e.target.value))
                                }
                            />
                        </div>

                        {/* SLO Window */}
                        <div className="space-y-2">
                            <Label htmlFor="slo-window">
                                {t("sloWindow")} ({t("days")})
                            </Label>
                            <Input
                                id="slo-window"
                                type="number"
                                min="1"
                                value={sloWindow}
                                onChange={(e) =>
                                    setSloWindow(parseInt(e.target.value))
                                }
                            />
                        </div>

                        {/* Throughput Mode */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="throughput-mode">
                                    {t("throughputMode")}
                                </Label>
                                <div className="flex items-center space-x-2">
                                    <span
                                        className={
                                            throughputMode === "avg"
                                                ? "font-medium"
                                                : "text-muted-foreground"
                                        }
                                    >
                                        {t("avg")}
                                    </span>
                                    <Switch
                                        id="throughput-mode"
                                        checked={throughputMode === "max"}
                                        onCheckedChange={(checked) => {
                                            setMaxThroughput(avgThroughput * 2);
                                            setThroughputMode(
                                                checked ? "max" : "avg",
                                            );
                                        }}
                                    />
                                    <span
                                        className={
                                            throughputMode === "max"
                                                ? "font-medium"
                                                : "text-muted-foreground"
                                        }
                                    >
                                        {t("max")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Average Throughput */}
                        <div className="space-y-2">
                            <Label htmlFor="avg-throughput">
                                {t("avgThroughput")} ({t("perMinute")})
                            </Label>
                            <Input
                                id="avg-throughput"
                                type="number"
                                min="1"
                                value={avgThroughput}
                                onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    setAvgThroughput(value);
                                }}
                            />
                        </div>

                        {/* Max Throughput (only shown when max mode is selected) */}
                        {throughputMode === "max" && (
                            <div className="space-y-2">
                                <Label htmlFor="max-throughput">
                                    {t("maxThroughput")} ({t("perMinute")})
                                </Label>
                                <Input
                                    id="max-throughput"
                                    type="number"
                                    min={avgThroughput}
                                    value={maxThroughput}
                                    onChange={(e) => {
                                        const value = parseInt(e.target.value);
                                        setMaxThroughput(
                                            Math.max(value, avgThroughput),
                                        );
                                    }}
                                />
                            </div>
                        )}

                        {/* Error Rates */}
                        <div className="space-y-2">
                            <Label>{t("errorRates")} (%)</Label>
                            <div className="flex flex-wrap gap-2">
                                {errorRates.map((rate) => (
                                    <div
                                        key={rate}
                                        className="bg-muted rounded-md px-3 py-1 flex items-center gap-2"
                                    >
                                        <span>{rate}%</span>
                                        <button
                                            onClick={() =>
                                                removeErrorRate(rate)
                                            }
                                            className="text-muted-foreground hover:text-destructive"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                                <div className="flex">
                                    <Input
                                        type="number"
                                        min="0.1"
                                        step="0.1"
                                        placeholder={t("addErrorRate")}
                                        value={customErrorRate}
                                        onChange={(e) =>
                                            setCustomErrorRate(e.target.value)
                                        }
                                        className="w-24 rounded-r-none"
                                    />
                                    <Button
                                        onClick={addCustomErrorRate}
                                        className="rounded-l-none"
                                    >
                                        +
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 p-4 bg-muted rounded-md">
                            <h3 className="text-md font-medium">
                                {t("formulas")}
                            </h3>
                            <ul className="space-y-2 list-disc pl-5">
                                <li>
                                    Error Budget Percent = (100 - SLO Target) /
                                    100
                                </li>
                                <li>
                                    Total Budget Errors = Events Per Min AVG *
                                    60 * 24 * SLO Window Days * Error Budget
                                    Percent
                                </li>
                                <li>
                                    Time To Exhaust = Total Budget Errors / (
                                    {throughputMode === "max"
                                        ? `Events Per Min Max `
                                        : "Events Per Min Avg "}
                                    * Error Rate)
                                </li>
                            </ul>
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Chart and Exhaustion Times */}
            <Card className="shadow-lg border-2 border-gray-100">
                <CardContent>
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h4 className="text-lg font-medium">
                                {t("burnChart")}
                            </h4>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={exportToPNG}
                                >
                                    <Download className="h-4 w-4 " />
                                    PNG
                                </Button>
                            </div>
                        </div>

                        <div
                            id="chart-container"
                            className="w-full border border-muted-foreground/20 rounded-md p-4 space-y-3"
                        >
                            <div
                                className={`grid grid-cols-1 sm:grid-cols-2 ${throughputMode === "max" ? `md:grid-cols-4` : `md:grid-cols-3`} gap-4`}
                            >
                                <div className="p-4 rounded-lg  flex flex-col items-center">
                                    <span className="text-xs text-muted-foreground">
                                        {t("sloTarget")}
                                    </span>
                                    <span className="text-2xl">
                                        {sloTarget}%
                                    </span>
                                </div>
                                <div className="p-4 rounded-lg  flex flex-col items-center">
                                    <span className="text-xs text-muted-foreground">
                                        {t("sloWindow")}
                                    </span>
                                    <span className="text-2xl">
                                        {sloWindow} {t("days")}
                                    </span>
                                </div>
                                <div className="p-4 rounded-lg  flex flex-col items-center">
                                    <span className="text-xs text-muted-foreground">
                                        {t("avgThroughput")}
                                    </span>
                                    <span className="text-2xl">
                                        {avgThroughput}/m
                                    </span>
                                </div>
                                {throughputMode === "max" && (
                                    <div className="p-4 rounded-lg  flex flex-col items-center">
                                        <span className="text-xs text-muted-foreground">
                                            {t("maxThroughput")}
                                        </span>
                                        <span className="text-2xl">
                                            {maxThroughput}/m
                                        </span>
                                    </div>
                                )}
                            </div>

                            <ResponsiveContainer className="w-full min-h-96">
                                <LineChart>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="time"
                                        type="category"
                                        allowDuplicatedCategory={false}
                                        label={{
                                            value: "Time to Break SLO",
                                            position: "insideBottom",
                                            offset: -4,
                                        }}
                                    />
                                    <YAxis
                                        label={{
                                            value: "Error Budget (%)",
                                            angle: -90,
                                            position: "insideLeft",
                                        }}
                                        domain={[0, 100]}
                                    />
                                    {series
                                        .slice()
                                        .reverse()
                                        .map((s, index) => (
                                            <Line
                                                type="linear"
                                                dataKey="budget"
                                                data={s.data}
                                                name={s.name}
                                                key={s.name}
                                                stroke={getLineColor(index)}
                                            />
                                        ))}
                                </LineChart>
                            </ResponsiveContainer>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {errorRates.map((rate, index) => (
                                    <div
                                        key={rate}
                                        className="flex justify-between items-center p-3 bg-muted rounded-md border border-muted-foreground/20 hover:border-primary/50 transition-colors duration-200"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="inline-block w-3 h-3 rounded-full"
                                                style={{
                                                    backgroundColor:
                                                        getLineColor(
                                                            errorRates.length -
                                                                1 -
                                                                index,
                                                        ),
                                                }}
                                            ></span>
                                            <span className="font-medium">
                                                {rate}% Error:
                                            </span>
                                        </div>
                                        <span className="text-lg text-primary">
                                            {getExhaustionTime(rate)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
