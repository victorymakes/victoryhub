"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Copy,
    ArrowDown,
    ArrowUp,
    AlertTriangle,
    Download,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CsvJsonConverter() {
    const t = useTranslations("CsvJsonConverter");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [mode, setMode] = useState<"csvToJson" | "jsonToCsv">("csvToJson");
    const [error, setError] = useState<string | null>(null);
    const [warning, setWarning] = useState<string | null>(null);

    const processConversion = useCallback(() => {
        setError(null);
        setWarning(null);

        if (!input.trim()) {
            setOutput("");
            return;
        }

        try {
            if (mode === "csvToJson") {
                // Convert CSV to JSON
                const json = csvToJson(input);
                const formattedJson = JSON.stringify(json, null, 2);
                setOutput(formattedJson);

                // Show warning for large outputs
                if (formattedJson.length > 10000) {
                    setWarning(t("warnings.largeOutput"));
                }
            } else {
                // Convert JSON to CSV
                const jsonData = JSON.parse(input);
                const csv = jsonToCsv(jsonData);
                setOutput(csv);

                // Show warning for large outputs
                if (csv.length > 10000) {
                    setWarning(t("warnings.largeOutput"));
                }
            }
        } catch (error) {
            console.error("Conversion error:", error);
            if (mode === "csvToJson") {
                setError(t("errors.invalidCsv"));
            } else {
                setError(t("errors.invalidJson"));
            }
            setOutput("");
        }
    }, [input, mode, t]);

    // CSV to JSON conversion function with auto-detection of delimiter
    const csvToJson = (csv: string): Record<string, string>[] => {
        // Split the CSV into lines
        const lines = csv.split(/\r?\n/);
        if (lines.length === 0) throw new Error("Empty CSV");

        // Auto-detect delimiter by checking the first line
        const firstLine = lines[0];
        let delimiter = ","; // Default to comma

        // Check if spaces are more likely to be the delimiter
        if (firstLine.split(" ").length > firstLine.split(",").length) {
            delimiter = " ";
        }

        // Extract headers from the first line
        const headers = lines[0]
            .split(delimiter)
            .map((header) => header.trim());

        // Process data rows
        const result: Record<string, string>[] = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue; // Skip empty lines

            const values = line.split(delimiter);
            const obj: Record<string, string> = {};

            // Map values to headers
            for (let j = 0; j < headers.length; j++) {
                obj[headers[j]] = values[j] ? values[j].trim() : "";
            }

            result.push(obj);
        }

        return result;
    };

    // JSON to CSV conversion function
    const jsonToCsv = (json: Record<string, unknown>[]): string => {
        if (!Array.isArray(json) || json.length === 0) {
            throw new Error("Invalid JSON array");
        }

        const delimiter = ","; // Use comma as standard delimiter for CSV output

        // Extract headers from the first object
        const headers = Object.keys(json[0]);

        // Create CSV header row
        let csv = headers.join(delimiter) + "\n";

        // Add data rows
        json.forEach((item) => {
            const row = headers.map((header) => {
                // Handle values that contain the delimiter or newlines
                let value =
                    item[header] !== undefined ? String(item[header]) : "";
                if (
                    value.includes(delimiter) ||
                    value.includes('"') ||
                    value.includes("\n")
                ) {
                    value = '"' + value.replace(/"/g, '""') + '"';
                }
                return value;
            });
            csv += row.join(delimiter) + "\n";
        });

        return csv;
    };

    const copyToClipboard = async () => {
        if (output) {
            await navigator.clipboard.writeText(output);
            toast.success(t("copied"));
        }
    };

    const downloadOutput = () => {
        if (!output) return;

        const blob = new Blob([output], {
            type: mode === "csvToJson" ? "application/json" : "text/csv",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = mode === "csvToJson" ? "converted.json" : "converted.csv";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Auto-process when input, mode, or delimiter changes
    useEffect(() => {
        processConversion();
    }, [processConversion]);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    {/* Mode Toggle */}
                    <div className="flex items-center justify-center">
                        <Tabs
                            defaultValue="csvToJson"
                            value={mode}
                            onValueChange={(value) =>
                                setMode(value as "csvToJson" | "jsonToCsv")
                            }
                            className="w-full max-w-md"
                        >
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="csvToJson">
                                    {t("csvToJson")}
                                </TabsTrigger>
                                <TabsTrigger value="jsonToCsv">
                                    {t("jsonToCsv")}
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Input Section */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <ArrowDown className="h-4 w-4" />
                            {t("input")}
                        </label>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={
                                mode === "csvToJson"
                                    ? t("enterCsv")
                                    : t("enterJson")
                            }
                            className="w-full min-h-[200px] p-3 border rounded-lg resize-y font-mono text-sm"
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
                    <div className="space-y-3">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <ArrowUp className="h-4 w-4" />
                            {t("output")}
                        </label>
                        <textarea
                            value={output}
                            readOnly
                            placeholder={output ? "" : t("outputPlaceholder")}
                            className="w-full min-h-[200px] p-3 border rounded-lg font-mono text-sm bg-muted/50"
                        />
                        <div className="flex justify-end space-x-2">
                            <Button
                                variant={output ? "outline" : "ghost"}
                                size="sm"
                                onClick={downloadOutput}
                                disabled={!output}
                                className="flex items-center gap-2"
                            >
                                <Download className="h-4 w-4" />
                                <span className="text-sm">{t("download")}</span>
                            </Button>
                            <Button
                                variant={output ? "default" : "outline"}
                                size="sm"
                                onClick={copyToClipboard}
                                disabled={!output}
                                className="flex items-center gap-2"
                            >
                                <Copy className="h-4 w-4" />
                                <span className="text-sm">{t("copy")}</span>
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
