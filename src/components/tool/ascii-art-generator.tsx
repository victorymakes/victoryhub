"use client";

import { useTranslations } from "next-intl";
import React, { useState, useRef, useCallback } from "react";
import { trackToolUsage } from "@/lib/analytics";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
    Download,
    Upload,
    AlertTriangle,
    Loader2,
    Copy,
    X,
} from "lucide-react";
import { toast } from "sonner";

interface ImageItem {
    id: string;
    file: File;
    originalSize: number;
    asciiArt?: string;
    status: "idle" | "processing" | "done" | "error";
    error?: string;
}

const AsciiArtGenerator: React.FC = () => {
    const t = useTranslations("AsciiArtGenerator");
    const [image, setImage] = useState<ImageItem | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [characters, setCharacters] = useState<string>("@%#*+=-:. ");
    const [width, setWidth] = useState<number>(80);
    const [invert, setInvert] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Track usage
    React.useEffect(() => {
        trackToolUsage("ascii-art-generator");
    }, []);

    // Process the image and convert to ASCII art
    const processImage = useCallback(
        (imageItem: ImageItem): Promise<ImageItem> => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new window.Image();
                    img.onload = () => {
                        try {
                            // Create a canvas to process the image
                            const canvas = document.createElement("canvas");

                            // Calculate height while maintaining aspect ratio
                            const aspectRatio = img.height / img.width;
                            const calculatedWidth = Math.min(width, img.width);
                            const charAspectRatio = 0.6;
                            const calculatedHeight = Math.round(
                                calculatedWidth * aspectRatio * charAspectRatio,
                            );

                            canvas.width = calculatedWidth;
                            canvas.height = calculatedHeight;

                            const ctx = canvas.getContext("2d");
                            if (!ctx) {
                                reject(
                                    new Error(t("errors.canvasContextFailed")),
                                );
                                return;
                            }

                            // Draw the image on the canvas
                            ctx.drawImage(
                                img,
                                0,
                                0,
                                calculatedWidth,
                                calculatedHeight,
                            );

                            // Get the image data
                            const imageData = ctx.getImageData(
                                0,
                                0,
                                calculatedWidth,
                                calculatedHeight,
                            );
                            const data = imageData.data;

                            // Generate ASCII art
                            let asciiArt = "";
                            const charactersArray = characters.split("");
                            const charactersLength = charactersArray.length;

                            for (let y = 0; y < calculatedHeight; y++) {
                                for (let x = 0; x < calculatedWidth; x++) {
                                    const idx = (y * calculatedWidth + x) * 4;
                                    const r = data[idx];
                                    const g = data[idx + 1];
                                    const b = data[idx + 2];

                                    // Calculate grayscale value
                                    const gray =
                                        0.299 * r + 0.587 * g + 0.114 * b;

                                    // Map grayscale to character
                                    let charIndex = Math.floor(
                                        (gray / 255) * (charactersLength - 1),
                                    );

                                    // Invert if needed
                                    if (invert) {
                                        charIndex =
                                            charactersLength - 1 - charIndex;
                                    }

                                    const char = charactersArray[charIndex];

                                    asciiArt += char;
                                }
                                asciiArt += "\n";
                            }

                            // Update the image item with the ASCII art
                            const updatedItem = {
                                ...imageItem,
                                asciiArt: asciiArt,
                                status: "done" as const,
                            };

                            resolve(updatedItem);
                        } catch (err) {
                            reject(
                                err instanceof Error
                                    ? err
                                    : new Error(String(err)),
                            );
                        }
                    };

                    img.onerror = () =>
                        reject(new Error(t("errors.imageLoadFailed")));

                    if (typeof event.target?.result === "string") {
                        img.src = event.target.result;
                    }
                };

                reader.onerror = () =>
                    reject(new Error(t("errors.fileReadFailed")));
                reader.readAsDataURL(imageItem.file);
            });
        },
        [characters, width, invert, t],
    );

    // Process the image
    const processImageFile = useCallback(async () => {
        if (!image) return;

        setError(null);
        setIsProcessing(true);

        try {
            // Update image status to processing
            setImage((prev) =>
                prev ? { ...prev, status: "processing" } : null,
            );

            // Process the image
            const processedImage = await processImage(image);

            // Update the image with the ASCII art
            setImage(processedImage);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
            setImage((prev) =>
                prev
                    ? {
                          ...prev,
                          status: "error",
                          error:
                              err instanceof Error ? err.message : String(err),
                      }
                    : null,
            );
        } finally {
            setIsProcessing(false);
        }
    }, [image, processImage]);

    // Handle file selection
    const handleFileSelect = useCallback(
        (files: FileList | File[]) => {
            const imageFiles = Array.from(files).filter((file) =>
                file.type.startsWith("image/"),
            );

            if (imageFiles.length === 0) {
                setError(t("errors.noImageFiles"));
                return;
            }

            // Use only the first image
            const file = imageFiles[0];

            // Create image item
            const newImage: ImageItem = {
                id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                file,
                originalSize: file.size,
                status: "idle",
            };

            // Set the image and process it
            setImage(newImage);

            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        },
        [t],
    );

    // Handle file drop
    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setIsDragging(false);

            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFileSelect(e.dataTransfer.files);
            }
        },
        [handleFileSelect],
    );

    // Handle drag events
    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragging(false);
    }, []);

    // Handle file input change
    const handleFileInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files && e.target.files.length > 0) {
                handleFileSelect(e.target.files);
            }
        },
        [handleFileSelect],
    );

    // Clear the image
    const clearImage = useCallback(() => {
        setImage(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, []);

    // Copy ASCII art to clipboard
    const copyToClipboard = useCallback(() => {
        if (!image?.asciiArt) return;

        navigator.clipboard
            .writeText(image.asciiArt)
            .then(() => {
                toast.success(t("copied"));
            })
            .catch((err) => {
                console.error("Failed to copy:", err);
                setError(t("errors.copyFailed"));
            });
    }, [image, t]);

    // Download ASCII art as a text file
    const downloadAsciiArt = useCallback(() => {
        if (!image?.asciiArt) return;

        const blob = new Blob([image.asciiArt], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `ascii-art.txt`;
        document.body.appendChild(a);
        a.click();

        // Clean up
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }, [image]);

    // Apply changes and regenerate ASCII art
    const applyChanges = useCallback(() => {
        if (image) {
            processImageFile();
        }
    }, [image, processImageFile]);

    return (
        <Card>
            <CardContent className="space-y-6">
                {/* File Upload Area */}
                <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center ${
                        isDragging
                            ? "border-primary bg-primary/5"
                            : "border-muted-foreground/20"
                    }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileInputChange}
                        accept="image/*"
                        className="hidden"
                    />
                    {image?.file ? (
                        <div className="space-y-3">
                            <div className="flex justify-center">
                                <img
                                    src={URL.createObjectURL(image.file)}
                                    alt="Preview"
                                    className="max-h-[200px] max-w-full object-contain rounded-md"
                                />
                            </div>
                            <div className="flex justify-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearImage}
                                >
                                    <X className="h-4 w-4" />
                                    {t("clear")}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                >
                                    <Upload className="h-4 w-4" />
                                    {t("changeImage")}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex justify-center">
                                <Upload className="h-10 w-10 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">
                                {t("dragAndDrop")}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {t("supportedFormats")}
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {t("selectFile")}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Settings */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">{t("settings")}</h3>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t("characters")}</Label>
                            <Input
                                value={characters}
                                onChange={(e) => setCharacters(e.target.value)}
                                placeholder={t("charactersPlaceholder")}
                            />
                            <p className="text-xs text-muted-foreground">
                                {t("charactersHelp")}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>
                                {t("width")}: {width} {t("characters")}
                            </Label>
                            <Slider
                                value={[width]}
                                min={20}
                                max={200}
                                step={1}
                                onValueChange={(value) => setWidth(value[0])}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="invert"
                                    checked={invert}
                                    onCheckedChange={(checked) =>
                                        setInvert(checked)
                                    }
                                />
                                <Label
                                    htmlFor="invert"
                                    className="cursor-pointer"
                                >
                                    {t("invertColors")}
                                </Label>
                            </div>
                        </div>

                        <Button
                            onClick={applyChanges}
                            disabled={!image || isProcessing}
                        >
                            {isProcessing
                                ? t("processing")
                                : t("generateAsciiArt")}
                        </Button>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                {/* Processing Status */}
                {isProcessing && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span>{t("processing")}</span>
                        </div>
                        <Progress value={50} />
                    </div>
                )}

                {/* Result Display */}
                {image?.status === "done" && image.asciiArt && (
                    <div className="space-y-4 border-t pt-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">
                                {t("result")}
                            </h3>
                            <div className="space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={copyToClipboard}
                                >
                                    <Copy className="h-4 w-4 mr-2" />
                                    {t("copy")}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={downloadAsciiArt}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    {t("download")}
                                </Button>
                            </div>
                        </div>

                        <div className="border rounded-lg p-4 bg-muted/50 overflow-x-auto">
                            <pre
                                className="font-mono text-xs whitespace-pre text-center"
                                style={{ lineHeight: 1 }}
                            >
                                {image.asciiArt}
                            </pre>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default AsciiArtGenerator;
