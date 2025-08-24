"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, AlertTriangle, Check, Settings2, Text } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trackToolUsage } from "@/lib/analytics";

interface RedactionOption {
    id: string;
    label: string;
    pattern: RegExp;
    enabled: boolean;
}

type MaskingType = "full" | "partial";

export default function TextRedactor() {
    const t = useTranslations("TextRedactor");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [redactionChar, setRedactionChar] = useState("*");
    const [customPattern, setCustomPattern] = useState("");
    const [activeTab, setActiveTab] = useState("redact");
    const [maskingType, setMaskingType] = useState<MaskingType>("full");

    // Define redaction options with patterns
    const [redactionOptions, setRedactionOptions] = useState<RedactionOption[]>(
        [
            {
                id: "email",
                label: "Email Addresses",
                pattern: /[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}/g,
                enabled: true,
            },
            {
                id: "phone",
                label: "Phone Numbers",
                pattern: /(\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/g,
                enabled: true,
            },
            {
                id: "address",
                label: "Postal Addresses",
                pattern:
                    /\d+\s+[a-zA-Z0-9\s.,]+(?:Avenue|Lane|Road|Boulevard|Drive|Street|Ave|Dr|Rd|Blvd|Ln|St)\.?/gi,
                enabled: true,
            },
            {
                id: "ip",
                label: "IP Addresses",
                pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
                enabled: true,
            },
            {
                id: "creditcard",
                label: "Credit Card Numbers",
                pattern: /\b(?:\d{4}[- ]?){3}\d{4}\b/g,
                enabled: true,
            },
            {
                id: "ssn",
                label: "Social Security Numbers",
                pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
                enabled: true,
            },
        ],
    );

    // Toggle redaction option
    const toggleOption = (id: string) => {
        setRedactionOptions(
            redactionOptions.map((option) =>
                option.id === id
                    ? { ...option, enabled: !option.enabled }
                    : option,
            ),
        );
    };

    // Process text redaction
    const processRedaction = useCallback(() => {
        setError(null);

        if (!input.trim()) {
            setOutput("");
            return;
        }

        try {
            // Track usage
            trackToolUsage("text-redactor");

            let processedText = input;

            // Apply each enabled redaction pattern
            redactionOptions.forEach((option) => {
                if (option.enabled) {
                    if (maskingType === "full") {
                        // Full mask - replace entire match with redaction characters
                        processedText = processedText.replace(
                            option.pattern,
                            (match) => redactionChar.repeat(match.length),
                        );
                    } else {
                        // Partial mask - preserve some characters for readability
                        processedText = processedText.replace(
                            option.pattern,
                            (match) => {
                                // Handle different data types differently
                                if (option.id === "email") {
                                    // Format: u***@gmail.com
                                    const parts = match.split("@");
                                    if (parts.length === 2) {
                                        const username = parts[0];
                                        const domain = parts[1];
                                        const firstChar = username.charAt(0);
                                        return `${firstChar}${redactionChar.repeat(username.length - 1)}@${domain}`;
                                    }
                                } else if (option.id === "phone") {
                                    // Format: 138****5678
                                    if (match.length >= 8) {
                                        const prefix = match.substring(0, 3);
                                        const suffix = match.substring(
                                            match.length - 4,
                                        );
                                        return `${prefix}${redactionChar.repeat(match.length - 7)}${suffix}`;
                                    }
                                } else if (option.id === "creditcard") {
                                    // Format: ****-****-****-1234
                                    if (match.length >= 12) {
                                        const suffix = match.substring(
                                            match.length - 4,
                                        );
                                        return `${redactionChar.repeat(match.length - 4)}${suffix}`;
                                    }
                                }

                                // Default partial masking for other types
                                // Show first and last character, mask the rest
                                if (match.length > 2) {
                                    const firstChar = match.charAt(0);
                                    const lastChar = match.charAt(
                                        match.length - 1,
                                    );
                                    return `${firstChar}${redactionChar.repeat(match.length - 2)}${lastChar}`;
                                } else {
                                    return redactionChar.repeat(match.length);
                                }
                            },
                        );
                    }
                }
            });

            // Apply custom pattern if provided
            if (customPattern.trim()) {
                try {
                    const regex = new RegExp(customPattern, "gi");
                    processedText = processedText.replace(regex, (match) => {
                        if (maskingType === "full") {
                            return redactionChar.repeat(match.length);
                        } else {
                            // Default partial masking for custom patterns
                            if (match.length > 2) {
                                const firstChar = match.charAt(0);
                                const lastChar = match.charAt(match.length - 1);
                                return `${firstChar}${redactionChar.repeat(match.length - 2)}${lastChar}`;
                            } else {
                                return redactionChar.repeat(match.length);
                            }
                        }
                    });
                } catch (regexError) {
                    console.error("Invalid regex pattern:", regexError);
                    // Don't set error here to avoid blocking other redactions
                }
            }

            setOutput(processedText);
        } catch (err) {
            console.error("Text redaction error:", err);
            setError(t("errors.processingFailed"));
            setOutput("");
        }
    }, [input, maskingType, redactionOptions, redactionChar, customPattern, t]);

    // Copy to clipboard
    const copyToClipboard = async () => {
        if (output) {
            await navigator.clipboard.writeText(output);
            toast.success(t("copied"));
        }
    };

    // Auto-process when input or options change
    useEffect(() => {
        if (activeTab === "redact") {
            processRedaction();
        }
    }, [processRedaction, activeTab]);

    return (
        <div className="space-y-6">
            <Tabs
                defaultValue="redact"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
            >
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="redact">
                        <Text className="h-5 w-5 text-muted-foreground" />
                        {t("redact")}
                    </TabsTrigger>
                    <TabsTrigger value="settings">
                        <Settings2 className="h-5 w-5 text-muted-foreground" />
                        {t("settings")}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="redact" className="mt-4">
                    <Card>
                        <CardContent className="pt-6 space-y-6">
                            {/* Input Section */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium">
                                    {t("input")}
                                </label>
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder={t("enterText")}
                                    className="w-full min-h-[150px] p-3 border rounded-lg resize-y font-mono text-sm"
                                />
                            </div>

                            {/* Error Display */}
                            {error && (
                                <Alert variant="destructive">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {/* Output Section */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium">
                                    {t("output")}
                                </label>
                                <textarea
                                    value={output}
                                    readOnly
                                    placeholder={
                                        output ? "" : t("outputPlaceholder")
                                    }
                                    className="w-full min-h-[150px] p-3 border rounded-lg font-mono text-sm bg-muted/50"
                                />
                                <div className="flex justify-end">
                                    <Button
                                        variant={output ? "default" : "outline"}
                                        size="sm"
                                        onClick={copyToClipboard}
                                        disabled={!output}
                                        className="flex items-center gap-2"
                                    >
                                        <Copy className="h-4 w-4" />
                                        <span className="text-sm">
                                            {t("copy")}
                                        </span>
                                    </Button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setInput("");
                                        setOutput("");
                                        setError(null);
                                    }}
                                    className="flex-1"
                                >
                                    {t("clear")}
                                </Button>
                                <Button
                                    onClick={processRedaction}
                                    className="flex-1"
                                >
                                    {t("redactButton")}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="settings" className="mt-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <h3 className="text-lg font-semibold">
                                {t("redactionOptions")}
                            </h3>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Masking Type */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium">
                                    {t("maskingType")}
                                </label>
                                <div className="flex gap-2">
                                    <Button
                                        variant={
                                            maskingType === "full"
                                                ? "default"
                                                : "outline"
                                        }
                                        size="sm"
                                        onClick={() => setMaskingType("full")}
                                        className="flex-1"
                                    >
                                        {t("fullMask")}
                                    </Button>
                                    <Button
                                        variant={
                                            maskingType === "partial"
                                                ? "default"
                                                : "outline"
                                        }
                                        size="sm"
                                        onClick={() =>
                                            setMaskingType("partial")
                                        }
                                        className="flex-1"
                                    >
                                        {t("partialMask")}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {maskingType === "full"
                                        ? t("fullMaskHelp")
                                        : t("partialMaskHelp")}
                                </p>
                            </div>

                            {/* Redaction Character */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium">
                                    {t("redactionCharacter")}
                                </label>
                                <div className="flex gap-2">
                                    {["x", "*", "#", "■"].map((char) => (
                                        <Button
                                            key={char}
                                            variant={
                                                redactionChar === char
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="sm"
                                            onClick={() =>
                                                setRedactionChar(char)
                                            }
                                            className="w-10 h-10 flex items-center justify-center text-lg"
                                        >
                                            {char}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Redaction Options */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium">
                                    {t("dataTypesToRedact")}
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {redactionOptions.map((option) => (
                                        <div
                                            key={option.id}
                                            className="flex items-center justify-between space-x-2 p-2 border rounded-md"
                                        >
                                            <Label
                                                htmlFor={option.id}
                                                className="flex-1"
                                            >
                                                {option.label}
                                            </Label>
                                            <Switch
                                                id={option.id}
                                                checked={option.enabled}
                                                onCheckedChange={() =>
                                                    toggleOption(option.id)
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Pattern */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium">
                                    {t("customPattern")}
                                </label>
                                <input
                                    type="text"
                                    value={customPattern}
                                    onChange={(e) =>
                                        setCustomPattern(e.target.value)
                                    }
                                    placeholder={t("customPatternPlaceholder")}
                                    className="w-full p-2 border rounded-lg font-mono text-sm"
                                />
                                <p className="text-xs text-muted-foreground">
                                    {t("customPatternHelp")}
                                </p>
                            </div>

                            {/* Apply Settings Button */}
                            <Button
                                onClick={() => {
                                    setActiveTab("redact");
                                    processRedaction();
                                }}
                                className="w-full"
                            >
                                <Check className="h-4 w-4 mr-2" />
                                {t("applySettings")}
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
