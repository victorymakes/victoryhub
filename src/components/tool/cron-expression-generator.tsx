"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, RefreshCw, AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import cronstrue from "cronstrue/i18n";

const CronExpressionGenerator = () => {
    const t = useTranslations("CronGenerator");
    const locale = useLocale();
    const [cronExpression, setCronExpression] = useState<string>("* * * * *");
    const [humanReadable, setHumanReadable] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    // Predefined cron expressions
    const predefinedExpressions = [
        { value: "* * * * *", label: t("everyMinute") },
        { value: "0 * * * *", label: t("everyHour") },
        { value: "0 0 * * *", label: t("everyDay") },
        { value: "0 0 * * 0", label: t("everySunday") },
        { value: "0 0 1 * *", label: t("everyMonth") },
        { value: "0 0 1 1 *", label: t("everyYear") },
        { value: "0 0 1-5 * *", label: t("weekdays") },
        { value: "0 0 * * 0,6", label: t("weekends") },
        { value: "*/5 * * * *", label: t("everyFiveMinutes") },
        { value: "0 */2 * * *", label: t("everyTwoHours") },
    ];

    // Parse cron expression
    const parseCronExpression = useCallback(() => {
        setError(null);
        try {
            let cronstrueLocale = locale;
            // Handle zh and pt special cases
            if (locale === "zh") cronstrueLocale = "zh_CN";
            else if (locale === "pt") cronstrueLocale = "pt_BR";
            const options = { locale: cronstrueLocale };
            const readable = cronstrue.toString(cronExpression, options);
            setHumanReadable(readable);
        } catch (err) {
            console.error("Cron parsing error:", err);
            setError(t("errors.invalidExpression"));
        }
    }, [cronExpression, locale, t]);

    // Update human readable text when cron expression changes
    useEffect(() => {
        parseCronExpression();
    }, [cronExpression, parseCronExpression]);

    // Copy to clipboard
    const copyToClipboard = async (text: string) => {
        if (text) {
            await navigator.clipboard.writeText(text);
            toast.success(t("copied"));
        }
    };

    // Generate random cron expression
    const generateRandomCron = () => {
        const minutes = Math.floor(Math.random() * 60);
        const hours = Math.floor(Math.random() * 24);
        const dayOfMonth = Math.floor(Math.random() * 28) + 1;
        const month = Math.floor(Math.random() * 12) + 1;
        const dayOfWeek = Math.floor(Math.random() * 7);

        const randomCron = `${minutes} ${hours} ${dayOfMonth} ${month} ${dayOfWeek}`;
        setCronExpression(randomCron);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="space-y-6 pt-6">
                    {/* Predefined Expressions */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium">
                            {t("predefinedExpressions")}
                        </label>
                        <Select
                            onValueChange={(value) => setCronExpression(value)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue
                                    placeholder={t("selectExpression")}
                                />
                            </SelectTrigger>
                            <SelectContent>
                                {predefinedExpressions.map((expression) => (
                                    <SelectItem
                                        key={expression.value}
                                        value={expression.value}
                                    >
                                        {expression.label} ({expression.value})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Cron Expression Input */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium flex items-center gap-2">
                            {t("cronExpression")}
                        </label>
                        <div className="flex items-center gap-2">
                            <Input
                                value={cronExpression}
                                onChange={(e) =>
                                    setCronExpression(e.target.value)
                                }
                                placeholder={t("enterCronExpression")}
                                className="flex-1 font-mono"
                            />
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(cronExpression)}
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Cron Format Info */}
                    <Alert variant="default" className="bg-muted/50">
                        <Info className="h-4 w-4" />
                        <AlertDescription>{t("formatInfo")}</AlertDescription>
                    </Alert>

                    {/* Human Readable Output */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium">
                            {t("humanReadable")}
                        </label>
                        <div className="flex items-center gap-2">
                            <Input
                                value={humanReadable}
                                readOnly
                                placeholder={t("outputPlaceholder")}
                                className="flex-1 bg-muted/50"
                            />
                            <Button
                                variant={humanReadable ? "default" : "outline"}
                                size="sm"
                                onClick={() => copyToClipboard(humanReadable)}
                                disabled={!humanReadable}
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={generateRandomCron}
                            className="flex-1 flex items-center gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            {t("generateRandom")}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setCronExpression("* * * * *");
                                setError(null);
                            }}
                            className="flex-1"
                        >
                            {t("reset")}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default CronExpressionGenerator;
