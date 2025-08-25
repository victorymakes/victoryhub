"use client";

import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Download, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import JsBarcode from "jsbarcode";
import { Switch } from "@/components/ui/switch";

// improvement: load JsBarcode dynamically to reduce initial bundle size
// The password strength checker is an example.
const BarcodeGenerator: React.FC = () => {
    const t = useTranslations("BarcodeGenerator");
    const [value, setValue] = useState<string>("");
    const [barcodeType, setBarcodeType] = useState<string>("CODE128");
    const [width, setWidth] = useState<number>(2);
    const [height, setHeight] = useState<number>(100);
    const [displayValue, setDisplayValue] = useState<boolean>(true);
    const [textMargin, setTextMargin] = useState<number>(2);
    const [fontSize, setFontSize] = useState<number>(20);
    const [background, setBackground] = useState<string>("#FFFFFF");
    const [lineColor, setLineColor] = useState<string>("#000000");
    const [error, setError] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);

    const svgRef = useRef<SVGSVGElement>(null);

    const validateInput = (): boolean => {
        if (!value) {
            setError(t("errors.emptyValue"));
            return false;
        }

        // Validate based on barcode type
        if (barcodeType === "EAN13" && !/^\d{12,13}$/.test(value)) {
            setError(t("errors.invalidEAN13"));
            return false;
        }

        setError(null);
        return true;
    };

    const generateBarcode = () => {
        if (!validateInput()) return;

        setIsGenerating(true);
        try {
            if (svgRef.current) {
                JsBarcode(svgRef.current, value, {
                    format: barcodeType,
                    width: width,
                    height: height,
                    displayValue: displayValue,
                    textMargin: textMargin,
                    fontSize: fontSize,
                    background: background,
                    lineColor: lineColor,
                });
            }
            setIsGenerating(false);
        } catch (err) {
            console.log("Barcode generation error:", err);
            setError(t("errors.generationFailed"));
            setIsGenerating(false);
        }
    };

    const handleDownload = () => {
        if (!svgRef.current || !value) return;

        // Create a canvas to convert SVG to PNG
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const svgData = new XMLSerializer().serializeToString(svgRef.current);
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);

            // Create download link
            const a = document.createElement("a");
            a.download = `barcode-${value}.png`;
            a.href = canvas.toDataURL("image/png");
            a.click();
        };

        img.src = "data:image/svg+xml;base64," + btoa(svgData);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="barcode-value">
                                    {t("valueLabel")}
                                </Label>
                                <Input
                                    id="barcode-value"
                                    placeholder={t("valuePlaceholder")}
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                />
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">
                                    {t("options")}
                                </h3>

                                <div className="space-y-2">
                                    <Label htmlFor="barcode-type">
                                        {t("barcodeType")}
                                    </Label>
                                    <select
                                        id="barcode-type"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={barcodeType}
                                        onChange={(e) =>
                                            setBarcodeType(e.target.value)
                                        }
                                    >
                                        <option value="CODE128">CODE128</option>
                                        <option value="EAN13">EAN13</option>
                                    </select>
                                    <p className="text-xs text-muted-foreground">
                                        {barcodeType === "CODE128"
                                            ? t("code128Description")
                                            : t("ean13Description")}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="barcode-width">
                                            {t("width")}
                                        </Label>
                                        <Input
                                            id="barcode-width"
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={width}
                                            onChange={(e) =>
                                                setWidth(Number(e.target.value))
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="barcode-height">
                                            {t("height")}
                                        </Label>
                                        <Input
                                            id="barcode-height"
                                            type="number"
                                            min="50"
                                            max="200"
                                            value={height}
                                            onChange={(e) =>
                                                setHeight(
                                                    Number(e.target.value),
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="barcode-line-color">
                                            {t("lineColor")}
                                        </Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="barcode-line-color"
                                                type="color"
                                                value={lineColor}
                                                onChange={(e) =>
                                                    setLineColor(e.target.value)
                                                }
                                                className="w-12"
                                            />
                                            <Input
                                                type="text"
                                                value={lineColor}
                                                onChange={(e) =>
                                                    setLineColor(e.target.value)
                                                }
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="barcode-bg-color">
                                            {t("backgroundColor")}
                                        </Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="barcode-bg-color"
                                                type="color"
                                                value={background}
                                                onChange={(e) =>
                                                    setBackground(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-12"
                                            />
                                            <Input
                                                type="text"
                                                value={background}
                                                onChange={(e) =>
                                                    setBackground(
                                                        e.target.value,
                                                    )
                                                }
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="display-value"
                                            checked={displayValue}
                                            onCheckedChange={(checked) =>
                                                setDisplayValue(checked)
                                            }
                                        />
                                        <Label htmlFor="display-value">
                                            {t("displayValue")}
                                        </Label>
                                    </div>
                                </div>

                                {displayValue && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="text-margin">
                                                {t("textMargin")}
                                            </Label>
                                            <Input
                                                id="text-margin"
                                                type="number"
                                                min="0"
                                                max="10"
                                                value={textMargin}
                                                onChange={(e) =>
                                                    setTextMargin(
                                                        Number(e.target.value),
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="font-size">
                                                {t("fontSize")}
                                            </Label>
                                            <Input
                                                id="font-size"
                                                type="number"
                                                min="10"
                                                max="30"
                                                value={fontSize}
                                                onChange={(e) =>
                                                    setFontSize(
                                                        Number(e.target.value),
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                )}

                                <Button
                                    onClick={generateBarcode}
                                    disabled={isGenerating}
                                    className="w-full"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            {t("generating")}
                                        </>
                                    ) : (
                                        t("generate")
                                    )}
                                </Button>

                                {error && (
                                    <Alert variant="destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertDescription>
                                            {error}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="bg-white p-4 rounded-lg w-full flex justify-center">
                                <svg ref={svgRef} className="w-full"></svg>
                            </div>

                            <Button
                                variant="outline"
                                onClick={handleDownload}
                                disabled={!value || isGenerating}
                                className="w-full md:w-auto"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                {t("download")}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default BarcodeGenerator;
