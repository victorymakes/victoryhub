"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Slider } from "@/components/ui/slider";
import { formatBytes } from "@/lib/file";
import JSZip from "jszip";
import FileSaver from "file-saver";

interface ImageItem {
    id: string;
    file: File;
    originalSize: number;
    compressedSize?: number;
    compressedUrl?: string;
    status: "idle" | "processing" | "done" | "error";
    error?: string;
}

const ImageCompressor: React.FC = () => {
    const t = useTranslations("Tools.imageCompressor");
    const [images, setImages] = useState<ImageItem[]>([]);
    const [quality, setQuality] = useState<number>(70);
    const [sliderValue, setSliderValue] = useState<number>(70);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Track total size stats
    const totalOriginalSize = images.reduce(
        (sum, img) => sum + img.originalSize,
        0,
    );
    const totalCompressedSize = images.reduce(
        (sum, img) => sum + (img.compressedSize || 0),
        0,
    );
    const hasCompletedImages = images.some((img) => img.status === "done");

    // Process a single image file and return a promise with the compressed result
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

                        canvas.toBlob(
                            (blob) => {
                                if (blob) {
                                    // Revoke previous URL to prevent memory leaks
                                    if (imageItem.compressedUrl) {
                                        URL.revokeObjectURL(
                                            imageItem.compressedUrl,
                                        );
                                    }

                                    const updatedItem = {
                                        ...imageItem,
                                        compressedUrl:
                                            URL.createObjectURL(blob),
                                        compressedSize: blob.size,
                                        status: "done" as const,
                                    };
                                    resolve(updatedItem);
                                } else {
                                    reject(
                                        new Error(
                                            t("errors.compressionFailed"),
                                        ),
                                    );
                                }
                            },
                            imageItem.file.type === "image/webp" ||
                                imageItem.file.type === "image/jpeg"
                                ? imageItem.file.type
                                : "image/jpeg",
                            quality / 100,
                        );
                    };
                    if (typeof event.target?.result === "string") {
                        img.src = event.target.result;
                    }
                };
                reader.onerror = () =>
                    reject(new Error(t("errors.fileReadFailed")));
                reader.readAsDataURL(imageItem.file);
            });
        },
        [quality, t],
    );

    // Process all images in the queue
    const processAllImages = useCallback(async () => {
        setError(null);
        setIsProcessing(true);
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

    // Add new images to the queue
    const addImages = useCallback(
        (files: FileList | File[]) => {
            const imageFiles = Array.from(files).filter((file) =>
                file.type.startsWith("image/"),
            );

            if (imageFiles.length === 0) return;

            const newImages: ImageItem[] = imageFiles.map((file) => ({
                id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                file,
                originalSize: file.size,
                status: "idle",
            }));

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
            if (imageToRemove?.compressedUrl) {
                URL.revokeObjectURL(imageToRemove.compressedUrl);
            }
            return updatedImages;
        });
    };

    // Clear all images
    const clearAllImages = () => {
        setImages([]);
        setError(null);
    };

    // download all compressed images
    const downloadAllCompressedImages = async (
        e: React.MouseEvent<HTMLButtonElement>,
    ) => {
        e.preventDefault();
        const completedImages = images.filter(
            (img) => img.status === "done" && img.compressedUrl,
        );
        // Download as zip if more than one image
        const zip = new JSZip();
        // Fetch blobs and add to zip
        await Promise.all(
            completedImages.map(async (img) => {
                const response = await fetch(img.compressedUrl!);
                const blob = await response.blob();
                zip.file(`compressed-${img.file.name}`, blob);
            }),
        );
        const zipBlob = await zip.generateAsync({ type: "blob" });
        FileSaver.saveAs(zipBlob, "compressed-images.zip");
    };

    // Clean up object URLs when component unmounts
    useEffect(() => {
        return () => {
            images.forEach((img) => {
                if (img.compressedUrl) {
                    URL.revokeObjectURL(img.compressedUrl);
                }
            });
        };
    }, []);

    // Effect to reprocess images when quality changes
    useEffect(() => {
        // Only trigger reprocessing if there are images and we're not already processing
        if (images.length > 0 && !isProcessing) {
            // Use a debounce to prevent continuous reprocessing while slider is moving
            const debounceTimer = setTimeout(() => {
                // Mark all completed images as needing reprocessing
                setIsProcessing(true);
                setImages((prev) =>
                    prev.map((img) => ({
                        ...img,
                        status:
                            img.status === "done" ? "processing" : img.status,
                    })),
                );

                // Process all images with the new quality setting
                processAllImages();
            }, 300); // 300ms debounce

            return () => clearTimeout(debounceTimer);
        }
    }, [quality]); // Include isProcessing and processAllImages in dependencies

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="space-y-6">
                    {/* File Upload Section - DiceUI inspired */}
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
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                multiple
                            />

                            {images.length > 0 ? (
                                <div className="w-full">
                                    <p className="text-sm text-muted-foreground mb-3">
                                        {t("dropMoreImages")}
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-h-[300px] overflow-y-auto p-1">
                                        {images.map((img) => (
                                            <div
                                                key={img.id}
                                                className="relative flex items-center p-2 border rounded-md group"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <div className="relative w-16 h-16 rounded-md border overflow-hidden bg-muted mr-2 flex-shrink-0">
                                                    {img.compressedUrl ? (
                                                        <img
                                                            src={
                                                                img.compressedUrl
                                                            }
                                                            alt={img.file.name}
                                                            className="object-cover w-full h-full"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center w-full h-full">
                                                            {img.status ===
                                                            "processing" ? (
                                                                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                                            ) : img.status ===
                                                              "error" ? (
                                                                <AlertTriangle className="h-8 w-8 text-destructive" />
                                                            ) : (
                                                                <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-sm flex-grow min-w-0">
                                                    <p className="font-medium truncate">
                                                        {img.file.name}
                                                    </p>
                                                    <div className="flex items-center text-xs text-muted-foreground">
                                                        <span>
                                                            {formatBytes(
                                                                img.originalSize,
                                                            )}
                                                        </span>
                                                        {img.compressedSize && (
                                                            <span className="ml-2">
                                                                →{" "}
                                                                {formatBytes(
                                                                    img.compressedSize,
                                                                )}
                                                                <span className="ml-1 text-green-600">
                                                                    (
                                                                    {(
                                                                        (1 -
                                                                            img.compressedSize /
                                                                                img.originalSize) *
                                                                        100
                                                                    ).toFixed(
                                                                        1,
                                                                    )}
                                                                    %)
                                                                </span>
                                                            </span>
                                                        )}
                                                    </div>
                                                    {img.status === "error" &&
                                                        img.error && (
                                                            <p className="text-xs text-destructive truncate">
                                                                {img.error}
                                                            </p>
                                                        )}
                                                </div>
                                                <button
                                                    className="absolute top-1 right-1 p-1 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() =>
                                                        removeImage(img.id)
                                                    }
                                                    disabled={isProcessing}
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                                    <p className="text-sm font-medium mb-1">
                                        {t("dragAndDrop")}
                                    </p>
                                    <p className="text-xs text-muted-foreground mb-3">
                                        {t("supportMultiple")}
                                    </p>
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="mt-2"
                                    >
                                        {t("chooseFiles")}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Quality Slider */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium">
                                {t("quality")}
                            </label>
                            <span className="text-sm font-medium">
                                {quality}%
                            </span>
                        </div>
                        <Slider
                            min={10}
                            max={100}
                            step={1}
                            value={[sliderValue]}
                            onValueChange={(values) =>
                                setSliderValue(values[0])
                            }
                            onValueCommit={(values) => setQuality(values[0])}
                            disabled={isProcessing}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{t("lowerQualitySmallerFile")}</span>
                            <span>{t("higherQualityLargerFile")}</span>
                        </div>
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
                                    {t("compressionSummary")}
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
                                            {t("compressedSize")}
                                        </div>
                                        <div className="text-lg font-medium">
                                            {formatBytes(totalCompressedSize)}
                                        </div>
                                    </div>
                                    <div className="p-3 border rounded-md">
                                        <div className="text-muted-foreground mb-1">
                                            {t("reduction")}
                                        </div>
                                        <div className="text-lg font-medium text-green-600">
                                            {totalOriginalSize > 0
                                                ? (
                                                      (1 -
                                                          totalCompressedSize /
                                                              totalOriginalSize) *
                                                      100
                                                  ).toFixed(1)
                                                : 0}
                                            %
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {images
                                    .filter(
                                        (img) =>
                                            img.status === "done" &&
                                            img.compressedUrl,
                                    )
                                    .map((img) => (
                                        <Button
                                            key={img.id}
                                            asChild
                                            variant="outline"
                                            size="sm"
                                            className="flex-grow-0"
                                        >
                                            <a
                                                href={img.compressedUrl}
                                                download={`compressed-${img.file.name}`}
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                {img.file.name.length > 15
                                                    ? `${img.file.name.substring(0, 15)}...`
                                                    : img.file.name}
                                            </a>
                                        </Button>
                                    ))}
                            </div>

                            {images.filter((img) => img.status === "done")
                                .length > 1 && (
                                <Button
                                    className="w-full"
                                    onClick={downloadAllCompressedImages}
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

export default ImageCompressor;
