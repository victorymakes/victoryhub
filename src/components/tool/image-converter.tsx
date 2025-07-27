"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    AlertTriangle,
    Upload,
    Download,
    Image as ImageIcon,
    Trash2,
    Loader2,
    X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

function formatBytes(bytes: number) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

interface ImageItem {
    id: string;
    file: File;
    originalSize: number;
    convertedSize?: number;
    convertedUrl?: string;
    status: "idle" | "processing" | "done" | "error";
    error?: string;
    originalFormat: string;
}

type SupportedFormat = "jpeg" | "png" | "webp";

const ImageConverter: React.FC = () => {
    const t = useTranslations("Tools.imageConverter");
    const [images, setImages] = useState<ImageItem[]>([]);
    const [outputFormat, setOutputFormat] = useState<SupportedFormat>("jpeg");
    const [quality, setQuality] = useState<number>(0.9);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Track total size stats
    const totalOriginalSize = images.reduce(
        (sum, img) => sum + img.originalSize,
        0,
    );
    const totalConvertedSize = images.reduce(
        (sum, img) => sum + (img.convertedSize || 0),
        0,
    );
    const hasCompletedImages = images.some((img) => img.status === "done");

    // Get MIME type for output format
    const getMimeType = (format: SupportedFormat): string => {
        switch (format) {
            case "jpeg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "webp":
                return "image/webp";
            default:
                return "image/jpeg";
        }
    };

    // Get file extension for output format
    const getFileExtension = (format: SupportedFormat): string => {
        switch (format) {
            case "jpeg":
                return "jpg";
            case "png":
                return "png";
            case "webp":
                return "webp";
            default:
                return "jpg";
        }
    };

    // Process a single image file and return a promise with the converted result
    const processImage = useCallback(
        (imageItem: ImageItem): Promise<ImageItem> => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new window.Image();
                    img.onload = () => {
                        const canvas = document.createElement("canvas");
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext("2d");
                        if (!ctx) {
                            reject(new Error(t("errors.canvasContextFailed")));
                            return;
                        }
                        ctx.drawImage(img, 0, 0);

                        const mimeType = getMimeType(outputFormat);
                        const qualityValue =
                            outputFormat === "png" ? undefined : quality;

                        canvas.toBlob(
                            (blob) => {
                                if (blob) {
                                    // Revoke previous URL to prevent memory leaks
                                    if (imageItem.convertedUrl) {
                                        URL.revokeObjectURL(
                                            imageItem.convertedUrl,
                                        );
                                    }

                                    const updatedItem = {
                                        ...imageItem,
                                        convertedUrl: URL.createObjectURL(blob),
                                        convertedSize: blob.size,
                                        status: "done" as const,
                                    };
                                    resolve(updatedItem);
                                } else {
                                    reject(
                                        new Error(t("errors.conversionFailed")),
                                    );
                                }
                            },
                            mimeType,
                            qualityValue,
                        );
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
        [outputFormat, quality, t],
    );

    // Process all images in the queue
    const processAllImages = useCallback(async () => {
        setError(null);

        try {
            // Mark all idle images as processing if they aren't already
            setImages((prev) => {
                if (prev.length === 0) return prev;

                const updatedImages = prev.map((img) => ({
                    ...img,
                    status: img.status === "idle" ? "processing" : img.status,
                }));

                // Process each image that needs processing
                (async () => {
                    for (const image of updatedImages) {
                        if (image.status === "processing") {
                            try {
                                const processedImage =
                                    await processImage(image);
                                // Update the image status immediately after processing
                                setImages((current) =>
                                    current.map((img) =>
                                        img.id === processedImage.id
                                            ? processedImage
                                            : img,
                                    ),
                                );
                            } catch (err) {
                                setImages((current) =>
                                    current.map((img) =>
                                        img.id === image.id
                                            ? {
                                                  ...img,
                                                  status: "error",
                                                  error:
                                                      err instanceof Error
                                                          ? err.message
                                                          : String(err),
                                              }
                                            : img,
                                    ),
                                );
                            }
                        }
                    }
                    // Set processing state to false after all images are processed
                    setIsProcessing(false);
                })();

                return updatedImages;
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
            setIsProcessing(false);
        }
    }, [processImage]);

    // Effect to reprocess images when format or quality changes
    useEffect(() => {
        // Only trigger reprocessing if there are images and we're not already processing
        if (images.length > 0) {
            // Use a debounce to prevent continuous reprocessing while slider is moving
            const debounceTimer = setTimeout(() => {
                // Only proceed if we're not already processing
                if (!isProcessing) {
                    // Mark all completed images as needing reprocessing
                    setIsProcessing(true);
                    setImages((prev) =>
                        prev.map((img) => ({
                            ...img,
                            status:
                                img.status === "done"
                                    ? "processing"
                                    : img.status,
                        })),
                    );

                    // Process all images with the new settings
                    processAllImages();
                }
            }, 300); // 300ms debounce

            return () => clearTimeout(debounceTimer);
        }
    }, [outputFormat, quality, images.length, isProcessing, processAllImages]);

    // Add new images to the queue
    const addImages = useCallback(
        (files: FileList | File[]) => {
            const imageFiles = Array.from(files).filter((file) =>
                file.type.startsWith("image/"),
            );

            if (imageFiles.length === 0) return;

            const newImages: ImageItem[] = imageFiles.map((file) => {
                // Extract original format from file type
                const originalFormat = file.type.split("/")[1] || "unknown";

                return {
                    id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                    file,
                    originalSize: file.size,
                    status: "idle",
                    originalFormat,
                };
            });

            // Add new images to the queue
            setImages((prev) => [...prev, ...newImages]);

            // Automatically start processing
            setIsProcessing(true);
            // Process immediately without delay
            processAllImages();
        },
        [processAllImages],
    );

    // Handle file input change
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            addImages(e.target.files);
            // Reset the input value so the same file can be selected again
            e.target.value = "";
        }
    };

    // Handle drag and drop
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            addImages(e.dataTransfer.files);
        }
    };

    // Remove a single image
    const removeImage = (id: string) => {
        setImages((prev) => {
            const updatedImages = prev.filter((img) => img.id !== id);
            // Revoke object URL to prevent memory leaks
            const imageToRemove = prev.find((img) => img.id === id);
            if (imageToRemove?.convertedUrl) {
                URL.revokeObjectURL(imageToRemove.convertedUrl);
            }
            return updatedImages;
        });
    };

    // Clear all images
    const clearAllImages = () => {
        // Revoke all object URLs to prevent memory leaks
        images.forEach((img) => {
            if (img.convertedUrl) {
                URL.revokeObjectURL(img.convertedUrl);
            }
        });
        setImages([]);
        setError(null);
    };

    // Clean up object URLs when component unmounts
    useEffect(() => {
        return () => {
            images.forEach((img) => {
                if (img.convertedUrl) {
                    URL.revokeObjectURL(img.convertedUrl);
                }
            });
        };
    }, []);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t("title")}</CardTitle>
                    <CardDescription>{t("description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* File Upload Section */}
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium">
                                {t("uploadImage")}
                                {images.length > 0 && (
                                    <Badge variant="outline" className="ml-2">
                                        {images.length}{" "}
                                        {images.length === 1
                                            ? t("image")
                                            : t("images")}
                                    </Badge>
                                )}
                            </label>
                            {images.length > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearAllImages}
                                    disabled={isProcessing}
                                >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    {t("clearAll")}
                                </Button>
                            )}
                        </div>
                        <div
                            className={cn(
                                "border-2 border-dashed rounded-lg p-6 transition-colors",
                                "flex flex-col items-center justify-center text-center",
                                isDragging
                                    ? "border-primary bg-primary/5"
                                    : "border-muted-foreground/25 hover:border-primary/50",
                                images.length > 0 ? "py-4" : "py-10",
                            )}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
                            <p className="text-sm text-muted-foreground mb-2">
                                {t("dragDropText")}
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isProcessing}
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                {t("chooseFiles")}
                            </Button>
                        </div>

                        {/* Display uploaded images */}
                        {images.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {images.map((img) => (
                                    <div
                                        key={img.id}
                                        className="border rounded-lg p-3 space-y-2"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium truncate">
                                                {img.file.name}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    removeImage(img.id)
                                                }
                                                disabled={isProcessing}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="text-xs text-muted-foreground space-y-1">
                                            <div className="flex justify-between">
                                                <span>
                                                    {t("originalFormat")}:
                                                </span>
                                                <span className="uppercase">
                                                    {img.originalFormat}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>
                                                    {t("originalSize")}:
                                                </span>
                                                <span>
                                                    {formatBytes(
                                                        img.originalSize,
                                                    )}
                                                </span>
                                            </div>
                                            {img.status === "done" &&
                                                img.convertedSize && (
                                                    <>
                                                        <div className="flex justify-between">
                                                            <span>
                                                                {t(
                                                                    "convertedSize",
                                                                )}
                                                                :
                                                            </span>
                                                            <span>
                                                                {formatBytes(
                                                                    img.convertedSize,
                                                                )}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span>
                                                                {t(
                                                                    "sizeChange",
                                                                )}
                                                                :
                                                            </span>
                                                            <span
                                                                className={
                                                                    img.convertedSize <
                                                                    img.originalSize
                                                                        ? "text-green-600"
                                                                        : img.convertedSize >
                                                                            img.originalSize
                                                                          ? "text-red-600"
                                                                          : ""
                                                                }
                                                            >
                                                                {img.convertedSize <
                                                                img.originalSize
                                                                    ? "-"
                                                                    : "+"}
                                                                {Math.abs(
                                                                    ((img.convertedSize -
                                                                        img.originalSize) /
                                                                        img.originalSize) *
                                                                        100,
                                                                ).toFixed(1)}
                                                                %
                                                            </span>
                                                        </div>
                                                    </>
                                                )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {img.status === "processing" && (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                    <span className="text-xs text-muted-foreground">
                                                        {t("processing")}
                                                    </span>
                                                </>
                                            )}
                                            {img.status === "error" && (
                                                <>
                                                    <AlertTriangle className="h-4 w-4 text-destructive" />
                                                    <span className="text-xs text-destructive">
                                                        {img.error}
                                                    </span>
                                                </>
                                            )}
                                            {img.status === "done" && (
                                                <>
                                                    <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                    >
                                                        {t("ready")}
                                                    </Badge>
                                                    {img.convertedUrl && (
                                                        <Button
                                                            asChild
                                                            variant="outline"
                                                            size="sm"
                                                            className="ml-auto"
                                                        >
                                                            <a
                                                                href={
                                                                    img.convertedUrl
                                                                }
                                                                download={`${img.file.name.split(".")[0]}.${getFileExtension(outputFormat)}`}
                                                                onClick={(e) =>
                                                                    e.stopPropagation()
                                                                }
                                                            >
                                                                <Download className="h-4 w-4 mr-1" />
                                                                {t("download")}
                                                            </a>
                                                        </Button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Conversion Settings */}
                    <div className="space-y-4 border-t pt-4">
                        <h3 className="text-sm font-medium">
                            {t("conversionSettings")}
                        </h3>

                        {/* Output Format Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">
                                {t("outputFormat")}
                            </label>
                            <Select
                                value={outputFormat}
                                onValueChange={(value: SupportedFormat) =>
                                    setOutputFormat(value)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="jpeg">
                                        JPEG (.jpg)
                                    </SelectItem>
                                    <SelectItem value="png">
                                        PNG (.png)
                                    </SelectItem>
                                    <SelectItem value="webp">
                                        WebP (.webp)
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Quality Slider (only for JPEG and WebP) */}
                        {(outputFormat === "jpeg" ||
                            outputFormat === "webp") && (
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-medium">
                                        {t("quality")}
                                    </label>
                                    <span className="text-sm text-muted-foreground">
                                        {Math.round(quality * 100)}%
                                    </span>
                                </div>
                                <Slider
                                    min={0.1}
                                    max={1}
                                    step={0.1}
                                    value={[quality]}
                                    onValueChange={(values) =>
                                        setQuality(values[0])
                                    }
                                    disabled={
                                        isProcessing || images.length === 0
                                    }
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{t("lowerQuality")}</span>
                                    <span>{t("higherQuality")}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Processing Status */}
                    {isProcessing && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                <span>{t("processing")}</span>
                            </div>
                            <Progress
                                value={
                                    (images.filter(
                                        (img) => img.status === "done",
                                    ).length /
                                        images.length) *
                                    100
                                }
                            />
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Summary and Download Section */}
                    {hasCompletedImages && (
                        <div className="space-y-4 border-t pt-4">
                            <div className="space-y-2 text-sm">
                                <h3 className="font-medium">
                                    {t("conversionSummary")}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-3 border rounded-md">
                                        <div className="text-muted-foreground mb-1">
                                            {t("originalSize")}
                                        </div>
                                        <div className="text-lg font-medium">
                                            {formatBytes(totalOriginalSize)}
                                        </div>
                                    </div>
                                    <div className="p-3 border rounded-md">
                                        <div className="text-muted-foreground mb-1">
                                            {t("convertedSize")}
                                        </div>
                                        <div className="text-lg font-medium">
                                            {formatBytes(totalConvertedSize)}
                                        </div>
                                    </div>
                                    <div className="p-3 border rounded-md">
                                        <div className="text-muted-foreground mb-1">
                                            {t("outputFormat")}
                                        </div>
                                        <div className="text-lg font-medium uppercase">
                                            {outputFormat}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {images.filter((img) => img.status === "done")
                                .length > 1 && (
                                <Button
                                    className="w-full"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        // Download all converted images one by one
                                        const completedImages = images.filter(
                                            (img) =>
                                                img.status === "done" &&
                                                img.convertedUrl,
                                        );
                                        completedImages.forEach(
                                            (img, index) => {
                                                if (img.convertedUrl) {
                                                    const link =
                                                        document.createElement(
                                                            "a",
                                                        );
                                                    link.href =
                                                        img.convertedUrl;
                                                    link.download = `${img.file.name.split(".")[0]}.${getFileExtension(outputFormat)}`;
                                                    // Add a small delay between downloads to prevent browser blocking
                                                    setTimeout(() => {
                                                        link.click();
                                                    }, index * 100);
                                                }
                                            },
                                        );
                                    }}
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    {t("downloadAll")}
                                </Button>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ImageConverter;
