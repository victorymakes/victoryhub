"use client";

import { AlertTriangle, ArrowDown, ArrowUp, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function URLEncoderDecoder() {
  const t = useTranslations("UrlEncoder");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  const processURL = useCallback(() => {
    setError(null);
    setWarning(null);

    if (!input.trim()) {
      setOutput("");
      return;
    }

    try {
      if (mode === "encode") {
        const encoded = encodeURIComponent(input);
        setOutput(encoded);

        // Show warning for very long URLs
        if (encoded.length > 2000) {
          setWarning(t("warnings.longUrl"));
        }
      } else {
        const decoded = decodeURIComponent(input);
        setOutput(decoded);

        // Check if input looks like it's already decoded
        if (input === decoded) {
          setWarning(t("warnings.alreadyDecoded"));
        }
      }
    } catch (err) {
      console.error("URL processing error:", err);
      if (mode === "decode") {
        setError(t("errors.invalidUrl"));
      } else {
        setError(t("errors.encodeFailed"));
      }
      setOutput("");
    }
  }, [input, mode, t]);

  const copyToClipboard = async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
      toast.success(t("copied"));
    }
  };

  // Auto-process when input or mode changes
  useEffect(() => {
    processURL();
  }, [processURL]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          {/* Mode Toggle - Improved Design */}
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center rounded-lg bg-muted p-1">
              <button
                type="button"
                onClick={() => setMode("encode")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  mode === "encode"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("encode")}
              </button>
              <button
                type="button"
                onClick={() => setMode("decode")}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  mode === "decode"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("decode")}
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Section */}
          <div className="space-y-3">
            <label
              htmlFor="encoder-input"
              className="text-sm font-medium flex items-center gap-2"
            >
              {mode === "encode" ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUp className="h-4 w-4" />
              )}
              {t("input")}
            </label>
            <textarea
              id="encoder-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("enterUrl")}
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
          <div className="space-y-3">
            <label
              htmlFor="encoder-output"
              className="text-sm font-medium flex items-center gap-2"
            >
              {mode === "encode" ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
              {t("output")}
            </label>
            <textarea
              id="encoder-output"
              value={output}
              readOnly
              placeholder={output ? "" : t("outputPlaceholder")}
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
