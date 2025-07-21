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
    ArrowUpDown,
    Check,
    Link,
    ArrowDown,
    ArrowUp,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslations } from "next-intl";

export default function URLEncoderDecoder() {
    const t = useTranslations("Tools.urlEncoder");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [mode, setMode] = useState<"encode" | "decode">("encode");
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const processURL = () => {
        setError(null);

        if (!input.trim()) {
            setOutput("");
            return;
        }

        try {
            if (mode === "encode") {
                setOutput(encodeURIComponent(input));
            } else {
                setOutput(decodeURIComponent(input));
            }
        } catch (err) {
            setError(
                "Invalid input for URL decoding. Please check your input and try again.",
            );
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
    };

    // Auto-process when input or mode changes
    useEffect(() => {
        processURL();
    }, [input, mode]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Link className="h-5 w-5" />
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
                            placeholder={t("enterUrl")}
                            className="w-full min-h-[100px] p-3 border rounded-lg resize-y"
                        />
                    </div>

                    {/* Process Button */}
                    <Button onClick={processURL} className="w-full">
                        {mode === "encode" ? t("encode") : t("decode")}
                    </Button>

                    {/* Error Display */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
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
                                    className="flex-1 min-h-[100px] p-3 border rounded-lg font-mono text-sm bg-muted/50"
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
