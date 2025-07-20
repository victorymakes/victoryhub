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

export default function URLEncoderDecoder() {
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
                        URL Encoder/Decoder
                    </CardTitle>
                    <CardDescription>
                        Encode and decode URLs and URL components for web
                        development
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Mode Toggle */}
                    <div className="flex items-center justify-center gap-4">
                        <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                            <Button
                                variant={
                                    mode === "encode" ? "default" : "ghost"
                                }
                                size="sm"
                                onClick={() => setMode("encode")}
                                className="flex items-center gap-1"
                            >
                                <ArrowDown className="h-4 w-4" />
                                Encode
                            </Button>
                            <Button
                                variant={
                                    mode === "decode" ? "default" : "ghost"
                                }
                                size="sm"
                                onClick={() => setMode("decode")}
                                className="flex items-center gap-1"
                            >
                                <ArrowUp className="h-4 w-4" />
                                Decode
                            </Button>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={swapMode}
                            title="Swap input and output"
                        >
                            <ArrowUpDown className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Input Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">
                                {mode === "encode"
                                    ? "Text to Encode"
                                    : "URL to Decode"}
                            </label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearAll}
                                className="text-xs"
                            >
                                Clear
                            </Button>
                        </div>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={
                                mode === "encode"
                                    ? "Enter text or URL to encode (e.g., hello world!@#$%)"
                                    : "Enter encoded URL to decode (e.g., hello%20world%21%40%23%24%25)"
                            }
                            className="w-full h-32 p-3 border rounded-lg resize-none font-mono text-sm"
                            rows={4}
                        />
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Output Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">
                                {mode === "encode"
                                    ? "Encoded URL"
                                    : "Decoded Text"}
                            </label>
                            {output && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={copyToClipboard}
                                    className="flex items-center gap-1"
                                >
                                    {copied ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                    {copied ? "Copied!" : "Copy"}
                                </Button>
                            )}
                        </div>
                        <textarea
                            value={output}
                            readOnly
                            placeholder={`${mode === "encode" ? "Encoded" : "Decoded"} result will appear here`}
                            className="w-full h-32 p-3 border rounded-lg resize-none font-mono text-sm bg-muted/50"
                            rows={4}
                        />
                    </div>

                    {/* Examples */}
                    <Card>
                        <CardContent className="pt-6">
                            <h4 className="text-sm font-semibold mb-3">
                                Examples:
                            </h4>
                            <div className="space-y-2 text-xs">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="font-medium text-muted-foreground mb-1">
                                            Original:
                                        </p>
                                        <code className="bg-muted p-1 rounded text-xs break-all">
                                            hello world!@#$%
                                        </code>
                                    </div>
                                    <div>
                                        <p className="font-medium text-muted-foreground mb-1">
                                            Encoded:
                                        </p>
                                        <code className="bg-muted p-1 rounded text-xs break-all">
                                            hello%20world%21%40%23%24%25
                                        </code>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                    <div>
                                        <p className="font-medium text-muted-foreground mb-1">
                                            URL with query:
                                        </p>
                                        <code className="bg-muted p-1 rounded text-xs break-all">
                                            name=John Doe&email=john@example.com
                                        </code>
                                    </div>
                                    <div>
                                        <p className="font-medium text-muted-foreground mb-1">
                                            Encoded:
                                        </p>
                                        <code className="bg-muted p-1 rounded text-xs break-all">
                                            name%3DJohn%20Doe%26email%3Djohn%40example.com
                                        </code>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Info Note */}
                    <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            <strong>Note:</strong> URL encoding (percent
                            encoding) is used to encode special characters in
                            URLs. All processing is done locally in your browser
                            - no data is sent to any server. This tool uses the
                            standard encodeURIComponent/decodeURIComponent
                            functions.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
