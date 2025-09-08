"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, RefreshCw, ArrowLeftRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { trackToolUsage } from "@/lib/analytics";

// Import TOML library
import * as TOML from "@iarna/toml";

// Function to convert JSON to TOML
const jsonToToml = (json: string): string => {
    try {
        const obj = JSON.parse(json);
        return TOML.stringify(obj);
    } catch (error) {
        throw new Error(`Invalid JSON: ${(error as Error).message}`);
    }
};

// Function to convert TOML to JSON
const tomlToJson = (tomlStr: string): string => {
    try {
        const obj = TOML.parse(tomlStr);
        return JSON.stringify(obj, null, 2);
    } catch (error) {
        throw new Error(`Invalid TOML: ${(error as Error).message}`);
    }
};

export const JsonTomlConverter = () => {
    const t = useTranslations("JsonTomlConverter");
    const [input, setInput] = useState("");
    const [output, setOutput] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("json-to-toml");

    const convert = useCallback(() => {
        if (!input.trim()) {
            setError(t("errors.emptyInput"));
            setOutput("");
            return;
        }

        try {
            setError(null);
            if (activeTab === "json-to-toml") {
                const tomlOutput = jsonToToml(input);
                setOutput(tomlOutput);
                trackToolUsage("json-toml-converter", "json-to-toml");
            } else {
                const jsonOutput = tomlToJson(input);
                setOutput(jsonOutput);
                trackToolUsage("json-toml-converter", "toml-to-json");
            }
        } catch (err) {
            setError((err as Error).message);
            setOutput("");
        }
    }, [input, activeTab, t]);

    const copyOutput = async () => {
        if (output) {
            await navigator.clipboard.writeText(output);
            toast.success(t("copied"));
            trackToolUsage("json-toml-converter", "copy");
        }
    };

    const clearAll = () => {
        setInput("");
        setOutput("");
        setError(null);
    };

    const handleTabChange = (value: string) => {
        setActiveTab(value);
        setInput("");
        setOutput("");
        setError(null);
    };

    return (
        <div className="space-y-6">
            <Tabs defaultValue="json-to-toml" onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="json-to-toml">
                        {t("jsonToToml")}
                    </TabsTrigger>
                    <TabsTrigger value="toml-to-json">
                        {t("tomlToJson")}
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="json-to-toml" className="space-y-4 mt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <h3 className="text-sm font-medium">
                                            {t("jsonInput")}
                                        </h3>
                                    </div>
                                    <Textarea
                                        placeholder={t("jsonPlaceholder")}
                                        className="min-h-[300px] font-mono text-sm"
                                        value={input}
                                        onChange={(e) =>
                                            setInput(e.target.value)
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <h3 className="text-sm font-medium">
                                            {t("tomlOutput")}
                                        </h3>
                                        {output && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={copyOutput}
                                            >
                                                <Copy className="h-4 w-4" />
                                                {t("copy")}
                                            </Button>
                                        )}
                                    </div>
                                    <Textarea
                                        readOnly
                                        placeholder={t("outputPlaceholder")}
                                        className="min-h-[300px] font-mono text-sm"
                                        value={output}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="toml-to-json" className="space-y-4 mt-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <h3 className="text-sm font-medium">
                                            {t("tomlInput")}
                                        </h3>
                                    </div>
                                    <Textarea
                                        placeholder={t("tomlPlaceholder")}
                                        className="min-h-[300px] font-mono text-sm"
                                        value={input}
                                        onChange={(e) =>
                                            setInput(e.target.value)
                                        }
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <h3 className="text-sm font-medium">
                                            {t("jsonOutput")}
                                        </h3>
                                        {output && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={copyOutput}
                                            >
                                                <Copy className="h-4 w-4" />
                                                {t("copy")}
                                            </Button>
                                        )}
                                    </div>
                                    <Textarea
                                        readOnly
                                        placeholder={t("outputPlaceholder")}
                                        className="min-h-[300px] font-mono text-sm"
                                        value={output}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="flex space-x-2 justify-center">
                <Button onClick={convert}>
                    <ArrowLeftRight className="h-4 w-4" />
                    {t("convert")}
                </Button>
                <Button variant="outline" onClick={clearAll}>
                    <RefreshCw className="h-4 w-4" />
                    {t("clear")}
                </Button>
            </div>
        </div>
    );
};

export default JsonTomlConverter;
