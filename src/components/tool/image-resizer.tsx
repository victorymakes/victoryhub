"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    AlertTriangle,
    Download,
    Image as ImageIcon,
    Trash2,
    Loader2,
    X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { formatBytes } from "@/lib/file";
import JSZip from "jszip";
import FileSaver from "file-saver";
import Image from "next/image";
import UploadFiles from "@/components/tool/upload-files";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ImageItem {
    id: string;
    file: File;
    originalSize: number;
    originalWidth: number;
    originalHeight: number;
    resizedSize?: number;
    resizedUrl?: string;
    status: "idle" | "processing" | "done" | "error";
    error?: string;
}

interface ResizeOptions {
    width: number | null;
    height: number | null;
    maintainAspectRatio: boolean;
    resizeMode: "dimensions" | "percentage" | "maxSize";
    percentage: number;
    maxSize: number;
}

const ImageResizer: React.FC = () => {
    const t = useTranslations("ImageResizer");
    const [images, setImages] = useState<ImageItem[]>([]);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const imagesRef = useRef<ImageItem[]>([]);

    // Resize options
    const [resizeOptions, setResizeOptions] = useState<ResizeOptions>({
        width: null,
        height: null,
        maintainAspectRatio: true,
        resizeMode: "dimensions",
        percentage: 50,
        maxSize: 1024, // Default max size 1024px
    });

    const allCompleted = images.every(
        (img) => img.status === "done" || img.status === "error",
    );

    // Calculate dimensions based on resize mode
    const calculateDimensions = useCallback(
        (
            originalWidth: number,
            originalHeight: number,
        ): { width: number; height: number } => {
            const {
                resizeMode,
                width,
                height,
                maintainAspectRatio,
                percentage,
                maxSize,
            } = resizeOptions;
            const aspectRatio = originalWidth / originalHeight;

            if (resizeMode === "percentage") {
                return {
                    width: Math.round(originalWidth * (percentage / 100)),
                    height: Math.round(originalHeight * (percentage / 100)),
                };
            } else if (resizeMode === "maxSize") {
                if (originalWidth > originalHeight) {
                    return {
                        width: maxSize,
                        height: Math.round(maxSize / aspectRatio),
                    };
                } else {
                    return {
                        width: Math.round(maxSize * aspectRatio),
                        height: maxSize,
                    };
                }
            } else {
                // dimensions mode
                if (maintainAspectRatio) {
                    if (width && !height) {
                        return {
                            width,
                            height: Math.round(width / aspectRatio),
                        };
                    } else if (!width && height) {
                        return {
                            width: Math.round(height * aspectRatio),
                            height,
                        };
                    } else if (width && height) {
                        // Use width as the primary dimension
                        return {
                            width,
                            height: Math.round(width / aspectRatio),
                        };
                    }
                }

                return {
                    width: width || originalWidth,
                    height: height || originalHeight,
                };
            }
        },
        [resizeOptions],
    );

    // Process a single image file and return a promise with the resized result
    const processImage = useCallback(
        (imageItem: ImageItem): Promise<ImageItem> => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new window.Image();
                    img.onload = () => {
                        const { width, height } = calculateDimensions(
                            img.width,
                            img.height,
                        );

                        const canvas = document.createElement("canvas");
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext("2d");
                        if (!ctx) {
                            reject(new Error(t("errors.canvasContextFailed")));
                            return;
                        }
                        ctx.drawImage(img, 0, 0, width, height);

                        canvas.toBlob(
                            (blob) => {
                                if (blob) {
                                    // Revoke previous URL to prevent memory leaks
                                    if (imageItem.resizedUrl) {
                                        URL.revokeObjectURL(
                                            imageItem.resizedUrl,
                                        );
                                    }

                                    const updatedItem = {
                                        ...imageItem,
                                        resizedUrl: URL.createObjectURL(blob),
                                        resizedSize: blob.size,
                                        status: "done" as const,
                                    };
                                    resolve(updatedItem);
                                } else {
                                    reject(new Error(t("errors.resizeFailed")));
                                }
                            },
                            imageItem.file.type,
                            1, // Quality for JPEG/WebP
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
        [calculateDimensions, t],
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

            // Load image dimensions before adding to state
            const loadImageDimensions = (file: File): Promise<ImageItem> => {
                return new Promise((resolve) => {
                    const img = new window.Image();
                    img.onload = () => {
                        resolve({
                            id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                            file,
                            originalSize: file.size,
                            originalWidth: img.width,
                            originalHeight: img.height,
                            status: "idle",
                        });
                        URL.revokeObjectURL(img.src);
                    };
                    img.onerror = () => {
                        // If we can't load dimensions, use defaults
                        resolve({
                            id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                            file,
                            originalSize: file.size,
                            originalWidth: 0,
                            originalHeight: 0,
                            status: "idle",
                        });
                    };
                    img.src = URL.createObjectURL(file);
                });
            };

            // Load all image dimensions then update state
            Promise.all(imageFiles.map(loadImageDimensions)).then(
                (newImages) => {
                    setImages((prev) => [...prev, ...newImages]);
                    // Process immediately
                    processAllImages();
                },
            );
        },
        [processAllImages],
    );

    // Remove an image from the queue
    const removeImage = useCallback((id: string) => {
        setImages((prev) => {
            const updatedImages = prev.filter((img) => img.id !== id);
            // Clean up object URLs to prevent memory leaks
            const removedImage = prev.find((img) => img.id === id);
            if (removedImage?.resizedUrl) {
                URL.revokeObjectURL(removedImage.resizedUrl);
            }
            return updatedImages;
        });
    }, []);

    // Clear all images
    const clearAllImages = useCallback(() => {
        // Clean up object URLs to prevent memory leaks
        images.forEach((img) => {
            if (img.resizedUrl) {
                URL.revokeObjectURL(img.resizedUrl);
            }
        });
        setImages([]);
        imagesRef.current = [];
    }, [images]);

    // Download a single resized image
    const downloadImage = useCallback((image: ImageItem) => {
        if (!image.resizedUrl) return;

        const link = document.createElement("a");
        link.href = image.resizedUrl;
        link.download = `resized-${image.file.name}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, []);

    // Download all resized images as a zip file
    const downloadAllImages = useCallback(() => {
        const zip = new JSZip();
        const doneImages = images.filter((img) => img.status === "done");

        if (doneImages.length === 0) return;

        const fetchPromises = doneImages.map((img) => {
            if (!img.resizedUrl) return Promise.resolve();
            return fetch(img.resizedUrl)
                .then((response) => response.blob())
                .then((blob) => {
                    zip.file(`resized-${img.file.name}`, blob);
                });
        });

        Promise.all(fetchPromises)
            .then(() => {
                return zip.generateAsync({ type: "blob" });
            })
            .then((content) => {
                FileSaver.saveAs(content, "resized-images.zip");
            });
    }, [images]);

    // Handle resize option changes
    const handleResizeModeChange = (
        mode: "dimensions" | "percentage" | "maxSize",
    ) => {
        setResizeOptions((prev) => ({
            ...prev,
            resizeMode: mode,
        }));
    };

    const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value =
            e.target.value === "" ? null : parseInt(e.target.value, 10);
        setResizeOptions((prev) => ({
            ...prev,
            width: isNaN(value as number) ? null : value,
        }));
    };

    const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value =
            e.target.value === "" ? null : parseInt(e.target.value, 10);
        setResizeOptions((prev) => ({
            ...prev,
            height: isNaN(value as number) ? null : value,
        }));
    };

    const handlePercentageChange = (value: number[]) => {
        setResizeOptions((prev) => ({
            ...prev,
            percentage: value[0],
        }));
    };

    const handleMaxSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        setResizeOptions((prev) => ({
            ...prev,
            maxSize: isNaN(value) ? 1024 : value,
        }));
    };

    const handleAspectRatioChange = (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        setResizeOptions((prev) => ({
            ...prev,
            maintainAspectRatio: e.target.checked,
        }));
    };

    // Effect to process images when resize options change
    useEffect(() => {
        if (imagesRef.current.length > 0) {
            // Reset all images to idle state
            setImages((prev) =>
                prev.map((img) => ({
                    ...img,
                    status: "idle",
                    resizedUrl: undefined,
                    resizedSize: undefined,
                })),
            );
            // Process with new settings
            processAllImages();
        }
    }, [resizeOptions, processAllImages]);

    // Clean up object URLs when component unmounts
    useEffect(() => {
        imagesRef.current = images;
    }, [images]);
    useEffect(() => {
        return () => {
            imagesRef.current.forEach((img) => {
                if (img.resizedUrl) {
                    URL.revokeObjectURL(img.resizedUrl);
                }
            });
        };
    }, []);

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="space-y-6">
                    {/* File Upload */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">
                            {t("uploadImages")}
                        </h3>
                        <UploadFiles
                            onFilesSelected={addImages}
                            multiple={true}
                            accept="image/*"
                        />
                    </div>

                    {/* Resize Options */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">{t("options")}</h3>

                        <RadioGroup
                            value={resizeOptions.resizeMode}
                            onValueChange={(value) =>
                                handleResizeModeChange(
                                    value as
                                        | "dimensions"
                                        | "percentage"
                                        | "maxSize",
                                )
                            }
                            className="space-y-2"
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                    value="dimensions"
                                    id="dimensions"
                                />
                                <Label htmlFor="dimensions">
                                    {t("specificDimensions")}
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                    value="percentage"
                                    id="percentage"
                                />
                                <Label htmlFor="percentage">
                                    {t("percentageResize")}
                                </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="maxSize" id="maxSize" />
                                <Label htmlFor="maxSize">
                                    {t("maxDimension")}
                                </Label>
                            </div>
                        </RadioGroup>

                        {resizeOptions.resizeMode === "dimensions" && (
                            <div className="space-y-4">
                                <div className="flex items-center space-x-4">
                                    <div className="space-y-2 flex-1">
                                        <Label htmlFor="width">
                                            {t("width")}
                                        </Label>
                                        <Input
                                            id="width"
                                            type="number"
                                            min="1"
                                            value={resizeOptions.width || ""}
                                            onChange={handleWidthChange}
                                            placeholder={t("widthPlaceholder")}
                                        />
                                    </div>
                                    <div className="space-y-2 flex-1">
                                        <Label htmlFor="height">
                                            {t("height")}
                                        </Label>
                                        <Input
                                            id="height"
                                            type="number"
                                            min="1"
                                            value={resizeOptions.height || ""}
                                            onChange={handleHeightChange}
                                            placeholder={t("heightPlaceholder")}
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="maintainAspectRatio"
                                        checked={
                                            resizeOptions.maintainAspectRatio
                                        }
                                        onChange={handleAspectRatioChange}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label htmlFor="maintainAspectRatio">
                                        {t("maintainAspectRatio")}
                                    </Label>
                                </div>
                            </div>
                        )}

                        {resizeOptions.resizeMode === "percentage" && (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label>
                                            {t("percentage")}:{" "}
                                            {resizeOptions.percentage}%
                                        </Label>
                                    </div>
                                    <Slider
                                        value={[resizeOptions.percentage]}
                                        min={1}
                                        max={100}
                                        step={1}
                                        onValueChange={handlePercentageChange}
                                    />
                                </div>
                            </div>
                        )}

                        {resizeOptions.resizeMode === "maxSize" && (
                            <div className="space-y-2">
                                <Label htmlFor="maxSize">
                                    {t("maxDimensionValue")}
                                </Label>
                                <Input
                                    id="maxSizeValue"
                                    type="number"
                                    min="1"
                                    value={resizeOptions.maxSize}
                                    onChange={handleMaxSizeChange}
                                    placeholder="1024"
                                />
                                <p className="text-sm text-gray-500">
                                    {t("maxDimensionHelp")}
                                </p>
                            </div>
                        )}
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
                        <div className="flex items-center space-x-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>{t("processing")}</span>
                        </div>
                    )}

                    {/* Image List */}
                    {images.length > 0 && (
                        <div className="space-y-4 border-t-3 pt-4">
                            {/* Header with actions */}
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium">
                                    {images.length}{" "}
                                    {images.length === 1
                                        ? t("image")
                                        : t("images")}
                                </h3>
                                <div className="space-x-2">
                                    <Button
                                        variant="outline"
                                        onClick={downloadAllImages}
                                        disabled={isProcessing || !allCompleted}
                                    >
                                        <Download className="h-4 w-4" />
                                        {t("downloadAll")}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={clearAllImages}
                                        disabled={isProcessing || !allCompleted}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        {t("clearAll")}
                                    </Button>
                                </div>
                            </div>

                            {/* Image Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {images.map((image) => (
                                    <Card
                                        key={image.id}
                                        className="overflow-hidden"
                                    >
                                        <CardContent className="p-0">
                                            <div className="relative aspect-video bg-muted">
                                                {image.status === "done" &&
                                                image.resizedUrl ? (
                                                    <Image
                                                        src={image.resizedUrl}
                                                        alt={image.file.name}
                                                        fill
                                                        className="object-contain"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full">
                                                        {image.status ===
                                                        "processing" ? (
                                                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                                        ) : image.status ===
                                                          "error" ? (
                                                            <AlertTriangle className="h-8 w-8 text-destructive" />
                                                        ) : (
                                                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute top-2 right-2 h-6 w-6 rounded-full bg-background/80 backdrop-blur-sm"
                                                    onClick={() =>
                                                        removeImage(image.id)
                                                    }
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="p-4 space-y-2">
                                                <div className="flex justify-between items-center">
                                                    <h4 className="font-medium truncate">
                                                        {image.file.name}
                                                    </h4>
                                                    {image.status ===
                                                        "done" && (
                                                        <Badge
                                                            variant="outline"
                                                            className="ml-2"
                                                        >
                                                            {
                                                                image.originalWidth
                                                            }
                                                            x
                                                            {
                                                                image.originalHeight
                                                            }{" "}
                                                            →
                                                            {
                                                                calculateDimensions(
                                                                    image.originalWidth,
                                                                    image.originalHeight,
                                                                ).width
                                                            }
                                                            x
                                                            {
                                                                calculateDimensions(
                                                                    image.originalWidth,
                                                                    image.originalHeight,
                                                                ).height
                                                            }
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <div>
                                                        <span className="text-muted-foreground">
                                                            {t("originalSize")}:
                                                        </span>{" "}
                                                        {formatBytes(
                                                            image.originalSize,
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground">
                                                            {t("resizedSize")}:
                                                        </span>{" "}
                                                        {image.resizedSize
                                                            ? formatBytes(
                                                                  image.resizedSize,
                                                              )
                                                            : "-"}
                                                    </div>
                                                </div>
                                                {image.error && (
                                                    <Alert
                                                        variant="destructive"
                                                        className="py-2"
                                                    >
                                                        <AlertDescription className="text-xs">
                                                            {image.error}
                                                        </AlertDescription>
                                                    </Alert>
                                                )}
                                                {image.status === "done" && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full"
                                                        onClick={() =>
                                                            downloadImage(image)
                                                        }
                                                    >
                                                        <Download className="h-3 w-3" />
                                                        {t("download")}
                                                    </Button>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ImageResizer;
