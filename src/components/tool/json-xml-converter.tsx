"use client";

import { ArrowLeftRight, Copy, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

// Function to convert JSON to XML
const jsonToXml = (json: string): string => {
  try {
    const obj = JSON.parse(json);
    const xml = convertJsonToXml(obj);
    return `<?xml version="1.0" encoding="UTF-8"?>\n${xml}`;
  } catch (error) {
    throw new Error(`Invalid JSON: ${(error as Error).message}`);
  }
};

// Helper function to convert JSON object to XML string
// biome-ignore lint/suspicious/noExplicitAny: JSON structure is inherently dynamic
const convertJsonToXml = (obj: any, tagName?: string): string => {
  if (obj === null || obj === undefined) {
    return tagName ? `<${tagName}></${tagName}>` : "";
  }

  if (typeof obj !== "object") {
    // Handle primitive values
    const value = String(obj)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    return tagName ? `<${tagName}>${value}</${tagName}>` : value;
  }

  if (Array.isArray(obj)) {
    // Handle arrays
    return obj
      .map((item) => {
        const itemTagName = tagName || "item";
        return convertJsonToXml(item, itemTagName);
      })
      .join("\n");
  }

  // Handle objects
  const currentTagName = tagName || "root";
  const childrenXml = Object.entries(obj)
    .map(([key, value]) => {
      return convertJsonToXml(value, key);
    })
    .join("\n");

  return `<${currentTagName}>\n${childrenXml}\n</${currentTagName}>`;
};

// Function to convert XML to JSON
const xmlToJson = (xml: string): string => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xml, "text/xml");

    // Check for parsing errors
    const parserError = xmlDoc.querySelector("parsererror");
    if (parserError) {
      throw new Error("Invalid XML");
    }

    const obj = convertXmlToJson(xmlDoc.documentElement);
    return JSON.stringify(obj, null, 2);
  } catch (error) {
    throw new Error(`Invalid XML: ${(error as Error).message}`);
  }
};

// Helper function to convert XML node to JSON object
// biome-ignore lint/suspicious/noExplicitAny: XML-to-JSON result is inherently dynamic
const convertXmlToJson = (node: Element): any => {
  // If node has no children and no attributes, return the text content
  if (node.childNodes.length === 0 && node.attributes.length === 0) {
    return node.textContent?.trim() || "";
  }

  const result: Record<string, unknown> = {};

  // Process attributes
  if (node.attributes.length > 0) {
    result["@attributes"] = {};
    for (let i = 0; i < node.attributes.length; i++) {
      const attr = node.attributes[i];
      (result["@attributes"] as Record<string, unknown>)[attr.nodeName] =
        attr.nodeValue;
    }
  }

  // Process child elements
  const childElements = Array.from(node.childNodes).filter(
    (node) => node.nodeType === 1,
  ) as Element[];

  // Group child elements by tag name
  const childElementsByTag: Record<string, Element[]> = {};
  childElements.forEach((element) => {
    const tagName = element.tagName;
    if (!childElementsByTag[tagName]) {
      childElementsByTag[tagName] = [];
    }
    childElementsByTag[tagName].push(element);
  });

  // Process each group of child elements
  Object.entries(childElementsByTag).forEach(([tagName, elements]) => {
    if (elements.length === 1) {
      // Single element
      result[tagName] = convertXmlToJson(elements[0]);
    } else {
      // Multiple elements with the same tag name (array)
      result[tagName] = elements.map((element) => convertXmlToJson(element));
    }
  });

  // Process text content if there are no child elements but there is text
  if (childElements.length === 0 && node.textContent?.trim()) {
    const text = node.textContent.trim();
    if (Object.keys(result).length > 0) {
      result["#text"] = text;
    } else {
      return text;
    }
  }

  return result;
};

export const JsonXmlConverter = () => {
  const t = useTranslations("JsonXmlConverter");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("json-to-xml");

  const convert = useCallback(() => {
    if (!input.trim()) {
      setError(t("errors.emptyInput"));
      setOutput("");
      return;
    }

    try {
      setError(null);
      if (activeTab === "json-to-xml") {
        const xml = jsonToXml(input);
        setOutput(xml);
      } else {
        const json = xmlToJson(input);
        setOutput(json);
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
      <Tabs defaultValue="json-to-xml" onValueChange={handleTabChange}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="json-to-xml">{t("jsonToXml")}</TabsTrigger>
          <TabsTrigger value="xml-to-json">{t("xmlToJson")}</TabsTrigger>
        </TabsList>

        <TabsContent value="json-to-xml" className="space-y-4">
          <Card>
            <CardContent className=" space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="json-input"
                  className="block text-sm font-medium"
                >
                  {t("inputJson")}
                </label>
                <Textarea
                  id="json-input"
                  placeholder={t("jsonPlaceholder")}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="font-mono h-64 resize-none"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={convert}>
                  <ArrowLeftRight className=" h-4 w-4" />
                  {t("convert")}
                </Button>
                <Button variant="outline" onClick={clearAll}>
                  <RefreshCw className=" h-4 w-4" />
                  {t("clear")}
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {output && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="xml-output-textarea"
                      className="block text-sm font-medium"
                    >
                      {t("outputXml")}
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyOutput}
                      className="h-8"
                    >
                      <Copy className="h-4 w-4 " />
                      {t("copy")}
                    </Button>
                  </div>
                  <Textarea
                    readOnly
                    value={output}
                    className="font-mono h-64 resize-none"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="xml-to-json" className="space-y-4">
          <Card>
            <CardContent className=" space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="xml-output"
                  className="block text-sm font-medium"
                >
                  {t("inputXml")}
                </label>
                <Textarea
                  id="xml-input"
                  placeholder={t("xmlPlaceholder")}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="font-mono h-64 resize-none"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={convert}>
                  <ArrowLeftRight className=" h-4 w-4" />
                  {t("convert")}
                </Button>
                <Button variant="outline" onClick={clearAll}>
                  <RefreshCw className=" h-4 w-4" />
                  {t("clear")}
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {output && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label
                      htmlFor="json-output"
                      className="block text-sm font-medium"
                    >
                      {t("outputJson")}
                    </label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyOutput}
                      className="h-8"
                    >
                      <Copy className="h-4 w-4 " />
                      {t("copy")}
                    </Button>
                  </div>
                  <Textarea
                    readOnly
                    value={output}
                    className="font-mono h-64 resize-none"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
