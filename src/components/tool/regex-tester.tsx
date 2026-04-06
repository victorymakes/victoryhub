"use client";

import { AlertTriangle, Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { trackToolUsage } from "@/lib/analytics";

export default function RegexTester() {
  const t = useTranslations("RegexTester");
  const [pattern, setPattern] = useState("");
  const [testString, setTestString] = useState("");
  const [result, setResult] = useState<{ id: number; value: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [flags, setFlags] = useState({
    global: true,
    caseInsensitive: false,
    multiline: false,
    dotAll: false,
    unicode: false,
    sticky: false,
  });

  const testRegex = useCallback(() => {
    setError(null);
    setResult([]);

    if (!pattern.trim() || !testString.trim()) {
      return;
    }

    try {
      // Track usage
      trackToolUsage("regex-tester");

      // Build flags string
      let flagsStr = "";
      if (flags.global) flagsStr += "g";
      if (flags.caseInsensitive) flagsStr += "i";
      if (flags.multiline) flagsStr += "m";
      if (flags.dotAll) flagsStr += "s";
      if (flags.unicode) flagsStr += "u";
      if (flags.sticky) flagsStr += "y";

      // Create regex with flags
      const regex = new RegExp(pattern, flagsStr);

      // Find all matches
      const matches: string[] = [];

      if (flags.global) {
        // For global flag, find all matches
        let match = regex.exec(testString);
        while (match !== null) {
          matches.push(match[0]);
          match = regex.exec(testString);
        }
      } else {
        // For non-global, just find the first match
        const match = regex.exec(testString);
        if (match) {
          matches.push(match[0]);
        }
      }

      setResult(matches.map((value, id) => ({ id, value })));
    } catch (err) {
      console.error("Regex testing error:", err);
      setError(t("errors.invalidRegex"));
    }
  }, [pattern, testString, flags, t]);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(t("copied"));
  };

  const clear = () => {
    setPattern("");
    setTestString("");
    setResult([]);
    setError(null);
  };

  // Auto-test when inputs change
  useEffect(() => {
    if (pattern.trim() && testString.trim()) {
      testRegex();
    }
  }, [pattern, testString, testRegex]);

  return (
    <Card>
      <CardContent className="space-y-6">
        {/* Pattern Input */}
        <div className="space-y-3">
          <label className="block text-sm font-medium" htmlFor="pattern">
            {t("pattern")}
          </label>
          <div className="relative">
            <input
              id="pattern"
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              placeholder={t("patternPlaceholder")}
              className="w-full p-3 border rounded-lg font-mono text-sm"
            />
          </div>
        </div>

        {/* Regex Flags */}
        <div className="space-y-3">
          <label htmlFor="flags" className="block text-sm font-medium">
            {t("flags")}
          </label>
          <div id="flags" className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="global"
                checked={flags.global}
                onCheckedChange={(checked) =>
                  setFlags({ ...flags, global: checked })
                }
              />
              <Label htmlFor="global" className="cursor-pointer">
                g - {t("flagGlobal")}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="caseInsensitive"
                checked={flags.caseInsensitive}
                onCheckedChange={(checked) =>
                  setFlags({
                    ...flags,
                    caseInsensitive: checked,
                  })
                }
              />
              <Label htmlFor="caseInsensitive" className="cursor-pointer">
                i - {t("flagCaseInsensitive")}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="multiline"
                checked={flags.multiline}
                onCheckedChange={(checked) =>
                  setFlags({
                    ...flags,
                    multiline: checked,
                  })
                }
              />
              <Label htmlFor="multiline" className="cursor-pointer">
                m - {t("flagMultiline")}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="dotAll"
                checked={flags.dotAll}
                onCheckedChange={(checked) =>
                  setFlags({ ...flags, dotAll: checked })
                }
              />
              <Label htmlFor="dotAll" className="cursor-pointer">
                s - {t("flagDotAll")}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="unicode"
                checked={flags.unicode}
                onCheckedChange={(checked) =>
                  setFlags({ ...flags, unicode: checked })
                }
              />
              <Label htmlFor="unicode" className="cursor-pointer">
                u - {t("flagUnicode")}
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="sticky"
                checked={flags.sticky}
                onCheckedChange={(checked) =>
                  setFlags({ ...flags, sticky: checked })
                }
              />
              <Label htmlFor="sticky" className="cursor-pointer">
                y - {t("flagSticky")}
              </Label>
            </div>
          </div>
        </div>

        {/* Test String Input */}
        <div className="space-y-3">
          <label htmlFor="testString" className="block text-sm font-medium">
            {t("testString")}
          </label>
          <textarea
            id="testString"
            value={testString}
            onChange={(e) => setTestString(e.target.value)}
            placeholder={t("testStringPlaceholder")}
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

        {/* Results Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">{t("results")}</p>
            {result.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {t("matchesFound", {
                  count: result.length,
                })}
              </span>
            )}
          </div>
          <div className="p-3 border rounded-lg bg-muted/30 min-h-[100px]">
            {result.length > 0 ? (
              <div className="space-y-2">
                {result.map(({ id, value: match }) => (
                  <div
                    key={id}
                    className="flex justify-between items-center p-2 bg-background rounded border"
                  >
                    <code className="text-sm font-mono break-all">{match}</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(match)}
                      className="h-8 w-8"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : pattern && testString ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                {t("noMatches")}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                {t("enterPatternAndString")}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={clear} className="flex-1">
            {t("clear")}
          </Button>
          <Button
            onClick={testRegex}
            className="flex-1"
            disabled={!pattern.trim() || !testString.trim()}
          >
            <Check className="h-4 w-4 " />
            {t("test")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
