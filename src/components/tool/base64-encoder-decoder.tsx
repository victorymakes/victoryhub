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

export default function Base64EncoderDecoder() {
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
                        Base64 Encoder/Decoder
                    </CardTitle>
                    <CardDescription>
                        Encode and decode Base64 strings for data transmission
                        and storage
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
                                    : "Base64 to Decode"}
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                    {inputStats.characters} chars,{" "}
                                    {inputStats.bytes} bytes
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={clearAll}
                                    className="text-xs"
                                >
                                    Clear
                                </Button>
                            </div>
                        </div>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={
                                mode === "encode"
                                    ? "Enter text to encode (e.g., Hello World!)"
                                    : "Enter Base64 string to decode (e.g., SGVsbG8gV29ybGQh)"
                            }
                            className="w-full h-32 p-3 border rounded-lg resize-none font-mono text-sm"
                            rows={4}
                        />
                    </div>

                    {/* Error/Warning Alerts */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {warning && (
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{warning}</AlertDescription>
                        </Alert>
                    )}

                    {/* Output Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">
                                {mode === "encode"
                                    ? "Base64 Encoded"
                                    : "Decoded Text"}
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                    {outputStats.characters} chars,{" "}
                                    {outputStats.bytes} bytes
                                </span>
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
                        </div>
                        <textarea
                            value={output}
                            readOnly
                            placeholder={`${mode === "encode" ? "Base64 encoded" : "Decoded"} result will appear here`}
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
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground">
                                                Simple text:
                                            </p>
                                            <code className="text-xs break-all">
                                                Hello World!
                                            </code>
                                            <p className="text-xs text-muted-foreground">
                                                → SGVsbG8gV29ybGQh
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                loadExample(
                                                    "Hello World!",
                                                    "encode",
                                                )
                                            }
                                            className="text-xs"
                                        >
                                            Try
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground">
                                                JSON data:
                                            </p>
                                            <code className="text-xs break-all">
                                                {"{"}"name":"John","age":30{"}"}
                                            </code>
                                            <p className="text-xs text-muted-foreground">
                                                →
                                                eyJuYW1lIjoiSm9obiIsImFnZSI6MzB9
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                loadExample(
                                                    '{"name":"John","age":30}',
                                                    "encode",
                                                )
                                            }
                                            className="text-xs"
                                        >
                                            Try
                                        </Button>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                        <div className="space-y-1">
                                            <p className="text-xs font-medium text-muted-foreground">
                                                Decode example:
                                            </p>
                                            <code className="text-xs break-all">
                                                VGhpcyBpcyBhIHRlc3Q=
                                            </code>
                                            <p className="text-xs text-muted-foreground">
                                                → This is a test
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                                loadExample(
                                                    "VGhpcyBpcyBhIHRlc3Q=",
                                                    "decode",
                                                )
                                            }
                                            className="text-xs"
                                        >
                                            Try
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Info Note */}
                    <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            <strong>Note:</strong> Base64 is an encoding scheme,
                            not encryption. It&apos;s designed to transport
                            binary data over text-based protocols. All
                            processing happens locally - no data is sent to
                            servers. Base64 encoded data is roughly 33% larger
                            than the original.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
