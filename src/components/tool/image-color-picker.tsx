"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Copy, Trash2, Pipette, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { trackToolUsage } from "@/lib/analytics";
import UploadFiles from "@/components/tool/upload-files";

interface ColorInfo {
    hex: string;
    rgb: string;
    hsl: string;
}

interface DominantColor {
    color: string;
    count: number;
    percentage: number;
}

const ImageColorPicker: React.FC = () => {
    const t = useTranslations("ImageColorPicker");
    const [image, setImage] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string>("");
    const [selectedColor, setSelectedColor] = useState<ColorInfo | null>(null);
    const [dominantColors, setDominantColors] = useState<DominantColor[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [pickerActive, setPickerActive] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    // Handle file upload
    const handleFileChange = useCallback(
        (files: File[] | FileList) => {
            if (files.length === 0) return;

            const file = files[0];
            if (!file.type.startsWith("image/")) {
                setError(t("errors.invalidFileType"));
                return;
            }

            // Check file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                setError(t("errors.fileTooLarge"));
                return;
            }

            setImage(file);
            setError(null);
            setSelectedColor(null);
            setDominantColors([]);

            // Track usage
            trackToolUsage("image-color-picker");
        },
        [t],
    );

    // Process the image when it's uploaded
    useEffect(() => {
        if (!image) {
            setImageUrl("");
            return;
        }

        const objectUrl = URL.createObjectURL(image);
        setImageUrl(objectUrl);
        setIsProcessing(true);

        // Clean up the object URL when component unmounts or image changes
        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [image]);

    // Handle image load and extract dominant colors
    const handleImageLoad = useCallback(() => {
        if (!imageRef.current || !canvasRef.current) return;

        const img = imageRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) return;

        // Set canvas dimensions to match image
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;

        // Draw image on canvas
        ctx.drawImage(img, 0, 0);

        // Extract dominant colors
        extractDominantColors(ctx, canvas.width, canvas.height);

        setIsProcessing(false);
    }, []);

    // Extract dominant colors from the image
    const extractDominantColors = (
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
    ) => {
        const colorMap: Record<string, number> = {};
        const pixelCount = width * height;
        const sampleSize = Math.max(1, Math.floor(pixelCount / 10000)); // Sample fewer pixels for large images

        for (let x = 0; x < width; x += sampleSize) {
            for (let y = 0; y < height; y += sampleSize) {
                const pixelData = ctx.getImageData(x, y, 1, 1).data;
                const r = pixelData[0];
                const g = pixelData[1];
                const b = pixelData[2];

                // Quantize colors to reduce the number of unique colors
                const quantizedR = Math.round(r / 8) * 8;
                const quantizedG = Math.round(g / 8) * 8;
                const quantizedB = Math.round(b / 8) * 8;

                const hex = rgbToHex(quantizedR, quantizedG, quantizedB);
                colorMap[hex] = (colorMap[hex] || 0) + 1;
            }
        }

        // Sort colors by frequency
        const sortedColors = Object.entries(colorMap)
            .map(([color, count]) => ({
                color,
                count,
                percentage:
                    (count / (pixelCount / sampleSize / sampleSize)) * 100,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10); // Get top 10 colors

        setDominantColors(sortedColors);
    };

    // Handle canvas click to pick a color
    const handleCanvasClick = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
            if (!pickerActive || !canvasRef.current) return;

            const canvas = canvasRef.current;
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;

            const x = Math.floor((e.clientX - rect.left) * scaleX);
            const y = Math.floor((e.clientY - rect.top) * scaleY);

            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (!ctx) return;

            const pixelData = ctx.getImageData(x, y, 1, 1).data;
            const r = pixelData[0];
            const g = pixelData[1];
            const b = pixelData[2];

            const hex = rgbToHex(r, g, b);
            const rgb = `rgb(${r}, ${g}, ${b})`;
            const [h, s, l] = rgbToHsl(r, g, b);
            const hsl = `hsl(${h}, ${s}%, ${l}%)`;

            setSelectedColor({ hex, rgb, hsl });
        },
        [pickerActive],
    );

    // Toggle color picker mode
    const togglePicker = useCallback(() => {
        setPickerActive(!pickerActive);
    }, [pickerActive]);

    // Copy color to clipboard
    const copyToClipboard = useCallback(
        (text: string) => {
            navigator.clipboard
                .writeText(text)
                .then(() => {
                    toast.success(t("colorCopied"));
                })
                .catch(() => {
                    toast.error(t("errors.copyFailed"));
                });
        },
        [t],
    );

    // Clear the current image
    const clearImage = useCallback(() => {
        setImage(null);
        setImageUrl("");
        setSelectedColor(null);
        setDominantColors([]);
        setPickerActive(false);
    }, []);

    // Download color palette
    const downloadPalette = useCallback(() => {
        if (dominantColors.length === 0) return;

        const paletteData = dominantColors.map((color) => {
            const hex = color.color;
            const rgb = hexToRgb(hex);
            const [h, s, l] = rgb
                ? rgbToHsl(rgb[0], rgb[1], rgb[2])
                : [0, 0, 0];

            return {
                hex,
                rgb: rgb ? `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})` : "",
                hsl: `hsl(${h}, ${s}%, ${l}%)`,
                percentage: color.percentage.toFixed(2) + "%",
            };
        });

        const jsonString = JSON.stringify(paletteData, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "color-palette.json";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success(t("paletteDownloaded"));
    }, [dominantColors, t]);

    // Utility functions for color conversion
    const rgbToHex = (r: number, g: number, b: number): string => {
        return (
            "#" +
            [r, g, b]
                .map((x) => {
                    const hex = x.toString(16);
                    return hex.length === 1 ? "0" + hex : hex;
                })
                .join("")
        );
    };

    const hexToRgb = (hex: string): [number, number, number] | null => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? [
                  parseInt(result[1], 16),
                  parseInt(result[2], 16),
                  parseInt(result[3], 16),
              ]
            : null;
    };

    const rgbToHsl = (
        r: number,
        g: number,
        b: number,
    ): [number, number, number] => {
        r /= 255;
        g /= 255;
        b /= 255;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0,
            s = 0;
        const l = (max + min) / 2;

        if (max !== min) {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

            switch (max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;
                case g:
                    h = (b - r) / d + 2;
                    break;
                case b:
                    h = (r - g) / d + 4;
                    break;
            }

            h /= 6;
        }

        return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
    };

    return (
        <Card>
            <CardContent className="p-6 space-y-4">
                {error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {!image ? (
                    <UploadFiles
                        onFilesSelected={(files) =>
                            handleFileChange(Array.from(files))
                        }
                        accept="image/*"
                        multiple={false}
                        dragInactiveText={t("dropImageHere")}
                        selectButtonText={t("orClickToBrowse")}
                    />
                ) : (
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={togglePicker}
                                className={
                                    pickerActive
                                        ? "bg-primary text-primary-foreground"
                                        : ""
                                }
                            >
                                <Pipette className="h-4 w-4" />
                                {pickerActive
                                    ? t("pickerActive")
                                    : t("activatePicker")}
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearImage}
                            >
                                <Trash2 className="h-4 w-4" />
                                {t("clearImage")}
                            </Button>

                            {dominantColors.length > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={downloadPalette}
                                >
                                    <Download className="h-4 w-4" />
                                    {t("downloadPalette")}
                                </Button>
                            )}
                        </div>

                        <div className="relative border rounded-md overflow-hidden cursor-crosshair  flex justify-center">
                            <img
                                ref={imageRef}
                                src={imageUrl}
                                alt="Uploaded image"
                                className="max-w-full h-auto"
                                style={{ display: "none" }}
                                onLoad={handleImageLoad}
                            />
                            <canvas
                                ref={canvasRef}
                                onClick={handleCanvasClick}
                                className="max-w-full h-auto"
                                style={{
                                    cursor: pickerActive
                                        ? "crosshair"
                                        : "default",
                                }}
                            />
                            {isProcessing && (
                                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                                    <div className="text-center space-y-2">
                                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                                        <p>{t("processingImage")}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {selectedColor && (
                            <div>
                                <h3 className="text-lg font-medium mb-2">
                                    {t("selectedColor")}
                                </h3>
                                <div className="p-4 border rounded-md">
                                    <div className="flex flex-col sm:flex-row gap-4 items-center  items-stretch">
                                        <div
                                            className="w-16 h-16 rounded-md border"
                                            style={{
                                                backgroundColor:
                                                    selectedColor.hex,
                                            }}
                                        ></div>
                                        <div className="space-y-2 flex-1">
                                            <div className="flex items-center justify-between">
                                                <Badge variant="outline">
                                                    HEX
                                                </Badge>
                                                <div className="flex items-center gap-2">
                                                    <code>
                                                        {selectedColor.hex}
                                                    </code>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() =>
                                                            copyToClipboard(
                                                                selectedColor.hex,
                                                            )
                                                        }
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <Badge variant="outline">
                                                    RGB
                                                </Badge>
                                                <div className="flex items-center gap-2">
                                                    <code>
                                                        {selectedColor.rgb}
                                                    </code>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() =>
                                                            copyToClipboard(
                                                                selectedColor.rgb,
                                                            )
                                                        }
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <Badge variant="outline">
                                                    HSL
                                                </Badge>
                                                <div className="flex items-center gap-2">
                                                    <code>
                                                        {selectedColor.hsl}
                                                    </code>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6"
                                                        onClick={() =>
                                                            copyToClipboard(
                                                                selectedColor.hsl,
                                                            )
                                                        }
                                                    >
                                                        <Copy className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {dominantColors.length > 0 && (
                            <div>
                                <h3 className="text-lg font-medium mb-3">
                                    {t("dominantColors")}
                                </h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                                    {dominantColors.map((color, index) => (
                                        <div
                                            key={index}
                                            className="border rounded-md overflow-hidden hover:shadow-md transition-shadow"
                                            onClick={() => {
                                                const rgb = hexToRgb(
                                                    color.color,
                                                );
                                                if (rgb) {
                                                    const [h, s, l] = rgbToHsl(
                                                        rgb[0],
                                                        rgb[1],
                                                        rgb[2],
                                                    );
                                                    setSelectedColor({
                                                        hex: color.color,
                                                        rgb: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
                                                        hsl: `hsl(${h}, ${s}%, ${l}%)`,
                                                    });
                                                }
                                            }}
                                        >
                                            <div
                                                className="h-16 w-full"
                                                style={{
                                                    backgroundColor:
                                                        color.color,
                                                }}
                                            ></div>
                                            <div className="p-2 text-xs">
                                                <div className="font-mono">
                                                    {color.color}
                                                </div>
                                                <div className="text-muted-foreground">
                                                    {color.percentage.toFixed(
                                                        1,
                                                    )}
                                                    %
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default ImageColorPicker;
