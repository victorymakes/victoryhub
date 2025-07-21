"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, RefreshCw, Check, Hash, Plus, Minus } from "lucide-react";
import { useTranslations } from "next-intl";

export const UuidGenerator = () => {
    const t = useTranslations("Tools.uuidGenerator");
    const [uuids, setUuids] = useState<string[]>([]);
    const [count, setCount] = useState(1);
    const [copied, setCopied] = useState<number | null>(null);
    const [copiedAll, setCopiedAll] = useState(false);

    const generateUUIDs = () => {
        const newUuids = Array.from({ length: count }, () =>
            crypto.randomUUID(),
        );
        setUuids(newUuids);
        setCopied(null);
        setCopiedAll(false);
    };

    const copyUUID = async (uuid: string, index: number) => {
        await navigator.clipboard.writeText(uuid);
        setCopied(index);
        setTimeout(() => setCopied(null), 2000);
    };

    const copyAllUUIDs = async () => {
        if (uuids.length > 0) {
            const allUuids = uuids.join("\n");
            await navigator.clipboard.writeText(allUuids);
            setCopiedAll(true);
            setTimeout(() => setCopiedAll(false), 2000);
        }
    };

    const adjustCount = (delta: number) => {
        const newCount = Math.max(1, Math.min(50, count + delta));
        setCount(newCount);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Hash className="h-5 w-5" />
                        {t("title")}
                    </CardTitle>
                    <CardDescription>{t("description")}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Batch Count Control */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium">
                            {t("numberOfUuids")}
                        </label>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => adjustCount(-1)}
                                disabled={count <= 1}
                            >
                                <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                                type="number"
                                min="1"
                                max="50"
                                value={count}
                                onChange={(e) =>
                                    setCount(
                                        Math.max(
                                            1,
                                            Math.min(
                                                50,
                                                parseInt(e.target.value) || 1,
                                            ),
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
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                            <div className="flex-1" />
                            <Button
                                onClick={generateUUIDs}
                                className="flex items-center gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                {count > 1
                                    ? t("generateMultiple", { count })
                                    : t("generateSingle")}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {t("generateBetween")}
                        </p>
                    </div>

                    {/* Generated UUIDs */}
                    {uuids.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium">
                                    {uuids.length > 1
                                        ? t("generatedUuidsPlural")
                                        : t("generatedUuids")}{" "}
                                    ({uuids.length})
                                </label>
                                {uuids.length > 1 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={copyAllUUIDs}
                                        className="flex items-center gap-1"
                                    >
                                        {copiedAll ? (
                                            <Check className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                        {copiedAll
                                            ? t("copiedAll")
                                            : t("copyAll")}
                                    </Button>
                                )}
                            </div>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="space-y-2 max-h-80 overflow-y-auto">
                                        {uuids.map((uuid, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg"
                                            >
                                                <span className="text-xs text-muted-foreground w-6">
                                                    {index + 1}.
                                                </span>
                                                <Input
                                                    value={uuid}
                                                    readOnly
                                                    className="flex-1 font-mono text-sm"
                                                />
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() =>
                                                        copyUUID(uuid, index)
                                                    }
                                                >
                                                    {copied === index ? (
                                                        <Check className="h-4 w-4 text-green-500" />
                                                    ) : (
                                                        <Copy className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* UUID Information */}
                    <Card>
                        <CardContent className="pt-6">
                            <h4 className="text-sm font-semibold mb-3">
                                {t("aboutUuid")}
                            </h4>
                            <div className="space-y-2 text-xs text-muted-foreground">
                                <p>
                                    • <strong>{t("format")}</strong>{" "}
                                    {t("formatDesc")}
                                </p>
                                <p>
                                    • <strong>{t("example")}</strong>{" "}
                                    550e8400-e29b-41d4-a716-446655440000
                                </p>
                                <p>
                                    • <strong>{t("uniqueness")}</strong>{" "}
                                    {t("uniquenessDesc")}
                                </p>
                                <p>
                                    • <strong>{t("security")}</strong>{" "}
                                    {t("securityDesc")}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security Note */}
                    <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            <strong>{t("securityNote")}</strong>{" "}
                            {t("securityNoteDesc")}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
