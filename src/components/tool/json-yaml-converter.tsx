"use client";

// Import YAML library
import * as yaml from "js-yaml";
import { ArrowLeftRight, Copy, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { trackToolUsage } from "@/lib/analytics";

// Function to convert JSON to YAML
const jsonToYaml = (json: string): string => {
  try {
    const obj = JSON.parse(json);
    return yaml.dump(obj, { indent: 2 });
  } catch (error) {
    throw new Error(`Invalid JSON: ${(error as Error).message}`);
  }
};

// Function to convert YAML to JSON
const yamlToJson = (yamlStr: string): string => {
  try {
    const obj = yaml.load(yamlStr);
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    throw new Error(`Invalid YAML: ${(error as Error).message}`);
  }
};

export const JsonYamlConverter = () => {
  const t = useTranslations("JsonYamlConverter");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("json-to-yaml");

  const convert = useCallback(() => {
    if (!input.trim()) {
      setError(t("errors.emptyInput"));
      setOutput("");
      return;
    }

    try {
      setError(null);
      if (activeTab === "json-to-yaml") {
        const yamlOutput = jsonToYaml(input);
        setOutput(yamlOutput);
        trackToolUsage("json-yaml-converter", "json-to-yaml");
      } else {
        const jsonOutput = yamlToJson(input);
        setOutput(jsonOutput);
        trackToolUsage("json-yaml-converter", "yaml-to-json");
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
      trackToolUsage("json-yaml-converter", "copy");
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
      <Tabs defaultValue="json-to-yaml" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="json-to-yaml">{t("jsonToYaml")}</TabsTrigger>
          <TabsTrigger value="yaml-to-json">{t("yamlToJson")}</TabsTrigger>
        </TabsList>

        <TabsContent value="json-to-yaml" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <h3 className="text-sm font-medium">{t("jsonInput")}</h3>
                  </div>
                  <Textarea
                    placeholder={t("jsonInputPlaceholder")}
                    className="min-h-[300px] font-mono text-sm"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <h3 className="text-sm font-medium">{t("yamlOutput")}</h3>
                    {output && (
                      <Button variant="ghost" size="sm" onClick={copyOutput}>
                        <Copy className="h-4 w-4 " />
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

        <TabsContent value="yaml-to-json" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <h3 className="text-sm font-medium">{t("yamlInput")}</h3>
                  </div>
                  <Textarea
                    placeholder={t("yamlInputPlaceholder")}
                    className="min-h-[300px] font-mono text-sm"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <h3 className="text-sm font-medium">{t("jsonOutput")}</h3>
                    {output && (
                      <Button variant="ghost" size="sm" onClick={copyOutput}>
                        <Copy className="h-4 w-4 " />
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
          <ArrowLeftRight className="h-4 w-4 " />
          {t("convert")}
        </Button>
        <Button variant="outline" onClick={clearAll}>
          <RefreshCw className="h-4 w-4 " />
          {t("clear")}
        </Button>
      </div>
    </div>
  );
};

export default JsonYamlConverter;
