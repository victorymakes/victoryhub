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
    Copy,
    ArrowUpDown,
    Check,
    FileText,
    ArrowDown,
    ArrowUp,
    AlertTriangle,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslations } from "next-intl";

export default function Base64EncoderDecoder() {
    const t = useTranslations("Tools.base64Encoder");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [mode, setMode] = useState<"encode" | "decode">("encode");
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [warning, setWarning] = useState<string | null>(null);

    const processBase64 = () => {
        setError(null);
        setWarning(null);

        if (!input.trim()) {
            setOutput("");
            return;
        }

        try {
            if (mode === "encode") {
                // Convert string to Base64
                const encoded = btoa(input);
                setOutput(encoded);

                // Show warning for large outputs
                if (encoded.length > 1000) {
                    setWarning(
                        "Large Base64 output. Consider splitting for better readability.",
                    );
                }
            } else {
                // Decode Base64 to string
                const decoded = atob(input);
                setOutput(decoded);

                // Check if the decoded result contains non-printable characters
                const hasNonPrintable =
                    /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/.test(decoded);
                if (hasNonPrintable) {
                    setWarning(
                        "Decoded result contains non-printable characters. This might be binary data.",
                    );
                }
            }
        } catch (err) {
            if (mode === "decode") {
                setError(
                    "Invalid Base64 input. Please check your input and try again.",
                );
            } else {
                setError("Failed to encode input. Please try again.");
            }
            setOutput("");
        }
    };

    const swapMode = () => {
        setMode(mode === "encode" ? "decode" : "encode");
        // Swap input and output
        const temp = input;
        setInput(output);
        setOutput(temp);
        setError(null);
        setWarning(null);
    };

    const copyToClipboard = async () => {
        if (output) {
            await navigator.clipboard.writeText(output);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const clearAll = () => {
        setInput("");
        setOutput("");
        setError(null);
        setWarning(null);
    };

    const loadExample = (
        exampleInput: string,
        exampleMode: "encode" | "decode",
    ) => {
        setMode(exampleMode);
        setInput(exampleInput);
    };

    // Auto-process when input or mode changes
    useEffect(() => {
        processBase64();
    }, [input, mode]);

    const getCharacterCount = (text: string) => {
        return {
            characters: text.length,
            bytes: new Blob([text]).size,
        };
    };

    const inputStats = getCharacterCount(input);
    const outputStats = getCharacterCount(output);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {t("title")}
                    </CardTitle>
                    <CardDescription>{t("description")}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Mode Toggle */}
                    <div className="flex items-center justify-center">
                        <Button
                            variant="outline"
                            onClick={() =>
                                setMode(mode === "encode" ? "decode" : "encode")
                            }
                            className="flex items-center gap-2"
                        >
                            <ArrowUpDown className="h-4 w-4" />
                            {mode === "encode" ? t("encode") : t("decode")}
                        </Button>
                    </div>

                    {/* Input Section */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium flex items-center gap-2">
                            {mode === "encode" ? (
                                <ArrowDown className="h-4 w-4" />
                            ) : (
                                <ArrowUp className="h-4 w-4" />
                            )}
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

                    {/* Warning Display */}
                    {warning && (
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{warning}</AlertDescription>
                        </Alert>
                    )}

                    {/* Output Section */}
                    {output && (
                        <div className="space-y-3">
                            <label className="text-sm font-medium flex items-center gap-2">
                                {mode === "encode" ? (
                                    <ArrowUp className="h-4 w-4" />
                                ) : (
                                    <ArrowDown className="h-4 w-4" />
                                )}
                                {t("output")}
                            </label>
                            <div className="flex items-start gap-2">
                                <textarea
                                    value={output}
                                    readOnly
                                    className="flex-1 min-h-[150px] p-3 border rounded-lg font-mono text-sm bg-muted/50"
                                />
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={copyToClipboard}
                                    className="mt-2"
                                >
                                    {copied ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            {copied && (
                                <Alert>
                                    <AlertDescription>
                                        {t("copied")}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setInput("");
                                setOutput("");
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
}
