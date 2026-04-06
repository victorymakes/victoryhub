"use client";

import { AlertTriangle, Copy, Minus, Plus, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export const UuidGenerator = () => {
  const t = useTranslations("UuidGenerator");
  const [uuids, setUuids] = useState<string[]>([]);
  const [count, setCount] = useState(1);
  const [warning, setWarning] = useState<string | null>(null);

  const generateUUIDs = useCallback(() => {
    setWarning(null);

    // Show warning for large batch generation
    if (count > 25) {
      setWarning(t("warnings.largeBatch"));
    }

    const newUuids = Array.from({ length: count }, () => crypto.randomUUID());
    setUuids(newUuids);
  }, [count, t]);

  const copyUUID = async (uuid: string) => {
    await navigator.clipboard.writeText(uuid);
    toast.success(t("copied"));
  };

  const copyAllUUIDs = async () => {
    if (uuids.length > 0) {
      const allUuids = uuids.join("\n");
      await navigator.clipboard.writeText(allUuids);
      toast.success(t("allCopied"));
    }
  };

  const adjustCount = (delta: number) => {
    const newCount = Math.max(1, Math.min(50, count + delta));
    setCount(newCount);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-6">
          {/* Batch Count Control - Improved styling */}
          <div className="space-y-3">
            <label htmlFor="uuid-count" className="text-sm font-medium">
              {t("numberOfUuids")}
            </label>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustCount(-1)}
                disabled={count <= 1}
                className="h-10 w-10 p-0"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="uuid-count"
                type="number"
                min="1"
                max="50"
                value={count}
                onChange={(e) =>
                  setCount(
                    Math.max(
                      1,
                      Math.min(50, parseInt(e.target.value, 10) || 1),
                    ),
                  )
                }
                className="w-20 text-center"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => adjustCount(1)}
                disabled={count >= 50}
                className="h-10 w-10 p-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Warning Display */}
          {warning && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{warning}</AlertDescription>
            </Alert>
          )}

          {/* Generate Button */}
          <Button
            onClick={generateUUIDs}
            className="w-full flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {t("generate")} {count > 1 ? `${count} UUIDs` : "UUID"}
          </Button>

          {/* Generated UUIDs */}
          {uuids.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {t("generatedUuids")} ({uuids.length})
                </p>
                {uuids.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyAllUUIDs}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="text-sm">{t("copyAll")}</span>
                  </Button>
                )}
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {uuids.map((uuid) => (
                  <div
                    key={uuid}
                    className="flex items-center gap-2 p-3 border rounded-lg bg-muted/30"
                  >
                    <Input
                      value={uuid}
                      readOnly
                      className="flex-1 font-mono text-sm border-0 bg-transparent"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyUUID(uuid)}
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setUuids([]);
                setWarning(null);
              }}
              className="flex-1"
              disabled={uuids.length === 0}
            >
              {t("clear")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
