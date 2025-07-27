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
    Lock,
    Unlock,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { formatBytes } from "@/lib/file";

interface ImageItem {
    id: string;
    file: File;
    originalSize: number;
    originalWidth: number;
    originalHeight: number;
    resizedSize?: number;
    resizedUrl?: string;
    resizedWidth: number;
    resizedHeight: number;
    status: "idle" | "processing" | "done" | "error";
    error?: string;
}

const ImageResizer: React.FC = () => {
    const t = useTranslations("Tools.imageResizer");
    const [images, setImages] = useState<ImageItem[]>([]);
    const [width, setWidth] = useState<number>(800);
    const [height, setHeight] = useState<number>(600);
    const [maintainAspectRatio, setMaintainAspectRatio] =
        useState<boolean>(true);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Track total size stats
    const totalOriginalSize = images.reduce(
        (sum, img) => sum + img.originalSize,
        0,
    );
    const totalResizedSize = images.reduce(
        (sum, img) => sum + (img.resizedSize || 0),
        0,
    );
    const hasCompletedImages = images.some((img) => img.status === "done");

    // Process a single image file and return a promise with the resized result
    const processImage = useCallback(
        (imageItem: ImageItem): Promise<ImageItem> => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const img = new window.Image();
                    img.onload = () => {
                        // Calculate dimensions based on aspect ratio if needed
                        let targetWidth = width;
                        let targetHeight = height;

                        if (maintainAspectRatio) {
                            const aspectRatio = img.width / img.height;
                            if (targetWidth / targetHeight > aspectRatio) {
                                targetWidth = Math.round(
                                    targetHeight * aspectRatio,
                                );
                            } else {
                                targetHeight = Math.round(
                                    targetWidth / aspectRatio,
                                );
                            }
                        }

                        const canvas = document.createElement("canvas");
                        canvas.width = targetWidth;
                        canvas.height = targetHeight;
                        const ctx = canvas.getContext("2d");
                        if (!ctx) {
                            reject(new Error(t("errors.canvasContextFailed")));
                            return;
                        }
                        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                        canvas.toBlob((blob) => {
                            if (blob) {
                                // Revoke previous URL to prevent memory leaks
                                if (imageItem.resizedUrl) {
                                    URL.revokeObjectURL(imageItem.resizedUrl);
                                }

                                const updatedItem = {
                                    ...imageItem,
                                    resizedUrl: URL.createObjectURL(blob),
                                    resizedSize: blob.size,
                                    resizedWidth: targetWidth,
                                    resizedHeight: targetHeight,
                                    status: "done" as const,
                                };
                                resolve(updatedItem);
                            } else {
                                reject(new Error(t("errors.resizeFailed")));
                            }
                        }, imageItem.file.type);
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
        [width, height, maintainAspectRatio, t],
    );

    // Process all images in the queue
    const processAllImages = useCallback(async () => {
        if (images.length === 0) return;

        setError(null);

        try {
            // Mark all idle images as processing if they aren't already
            setImages((prev) =>
                prev.map((img) => ({
                    ...img,
                    status: img.status === "idle" ? "processing" : img.status,
                })),
            );

            // Create a copy of the images array to avoid race conditions
            const imagesToProcess = [...images];

            // Process each image that needs processing
            for (const image of imagesToProcess) {
                if (image.status === "processing") {
                    try {
                        const processedImage = await processImage(image);
                        // Update the image status immediately after processing
                        setImages((prev) =>
                            prev.map((img) =>
                                img.id === processedImage.id
                                    ? processedImage
                                    : img,
                            ),
                        );
                    } catch (err) {
                        setImages((prev) =>
                            prev.map((img) =>
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
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            // Set processing state to false immediately after all images are processed
            setIsProcessing(false);
        }
    }, [images, processImage]);

    // Effect to reprocess images when dimensions change
    useEffect(() => {
        // Store the current dimension values to prevent stale closures
        const currentWidth = width;
        const currentHeight = height;
        const currentMaintainAspectRatio = maintainAspectRatio;

        // Only trigger reprocessing if there are images
        if (images.length > 0) {
            // Use a debounce to prevent continuous reprocessing while inputs are changing
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

                    // Process all images with the new dimensions
                    processAllImages();
                }
            }, 300); // 300ms debounce

            return () => clearTimeout(debounceTimer);
        }
    }, [width, height, maintainAspectRatio, images.length]);

    // Add new images to the queue
    const addImages = useCallback(
        (files: FileList | File[]) => {
            const imageFiles = Array.from(files).filter((file) =>
                file.type.startsWith("image/"),
            );

            if (imageFiles.length === 0) return;

            // Create promises to get image dimensions
            const imagePromises = imageFiles.map((file) => {
                return new Promise<ImageItem>((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        const img = new window.Image();
                        img.onload = () => {
                            resolve({
                                id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                                file,
                                originalSize: file.size,
                                originalWidth: img.width,
                                originalHeight: img.height,
                                resizedWidth: width,
                                resizedHeight: height,
                                status: "idle",
                            });
                        };
                        img.onerror = () => {
                            // If we can't load the image, create an item with default dimensions
                            resolve({
                                id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                                file,
                                originalSize: file.size,
                                originalWidth: 0,
                                originalHeight: 0,
                                resizedWidth: width,
                                resizedHeight: height,
                                status: "idle",
                            });
                        };
                        if (typeof event.target?.result === "string") {
                            img.src = event.target.result;
                        }
                    };
                    reader.onerror = () => {
                        // If we can't read the file, create an item with default dimensions
                        resolve({
                            id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                            file,
                            originalSize: file.size,
                            originalWidth: 0,
                            originalHeight: 0,
                            resizedWidth: width,
                            resizedHeight: height,
                            status: "idle",
                        });
                    };
                    reader.readAsDataURL(file);
                });
            });

            // Wait for all images to be processed and add them to the state
            Promise.all(imagePromises).then((newImages) => {
                setImages((prev) => [...prev, ...newImages]);

                // Automatically start processing
                setIsProcessing(true);
                // Process immediately without delay
                processAllImages();
            });
        },
        [width, height, processAllImages],
    );

    // Handle file input change
    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            if (imageToRemove?.resizedUrl) {
                URL.revokeObjectURL(imageToRemove.resizedUrl);
            }
            return updatedImages;
        });
    };

    // Clear all images
    const clearAllImages = () => {
        // Revoke all object URLs to prevent memory leaks
        images.forEach((img) => {
            if (img.resizedUrl) {
                URL.revokeObjectURL(img.resizedUrl);
            }
        });
        setImages([]);
        setError(null);
    };

    // Handle width change with aspect ratio maintenance
    const handleWidthChange = (newWidth: number) => {
        setWidth(newWidth);
        if (maintainAspectRatio && images.length > 0) {
            // Use the first image's aspect ratio as reference
            const firstImage = images[0];
            if (firstImage.originalWidth > 0 && firstImage.originalHeight > 0) {
                const aspectRatio =
                    firstImage.originalWidth / firstImage.originalHeight;
                setHeight(Math.round(newWidth / aspectRatio));
            }
        }
    };

    // Handle height change with aspect ratio maintenance
    const handleHeightChange = (newHeight: number) => {
        setHeight(newHeight);
        if (maintainAspectRatio && images.length > 0) {
            // Use the first image's aspect ratio as reference
            const firstImage = images[0];
            if (firstImage.originalWidth > 0 && firstImage.originalHeight > 0) {
                const aspectRatio =
                    firstImage.originalWidth / firstImage.originalHeight;
                setWidth(Math.round(newHeight * aspectRatio));
            }
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{t("title")}</CardTitle>
                    <CardDescription>{t("description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* File Upload Section */}
                    <div className="space-y-4">
                        <div
                            className={cn(
                                "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                                isDragging
                                    ? "border-primary bg-primary/5"
                                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-primary/5",
                            )}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                multiple
                                onChange={handleFileInputChange}
                                disabled={isProcessing}
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
                                                    {img.resizedUrl ? (
                                                        <img
                                                            src={img.resizedUrl}
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
                                                                <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">
                                                        {img.file.name}
                                                    </p>
                                                    <div className="flex items-center text-xs text-muted-foreground">
                                                        <span className="truncate">
                                                            {img.status ===
                                                            "done" ? (
                                                                <>
                                                                    {
                                                                        img.originalWidth
                                                                    }
                                                                    x
                                                                    {
                                                                        img.originalHeight
                                                                    }{" "}
                                                                    →{" "}
                                                                    {
                                                                        img.resizedWidth
                                                                    }
                                                                    x
                                                                    {
                                                                        img.resizedHeight
                                                                    }
                                                                </>
                                                            ) : img.status ===
                                                              "error" ? (
                                                                <span className="text-destructive">
                                                                    {img.error ||
                                                                        t(
                                                                            "errors.resizeFailed",
                                                                        )}
                                                                </span>
                                                            ) : (
                                                                <>
                                                                    {
                                                                        img.originalWidth
                                                                    }
                                                                    x
                                                                    {
                                                                        img.originalHeight
                                                                    }
                                                                </>
                                                            )}
                                                        </span>
                                                    </div>
                                                    {img.status === "done" && (
                                                        <div className="text-xs text-muted-foreground">
                                                            {formatBytes(
                                                                img.originalSize,
                                                            )}{" "}
                                                            →{" "}
                                                            {formatBytes(
                                                                img.resizedSize ||
                                                                    0,
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
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

                    {/* Dimension Controls */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">
                                {t("dimensions")}
                            </h3>
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="aspect-ratio"
                                    checked={maintainAspectRatio}
                                    onCheckedChange={setMaintainAspectRatio}
                                    disabled={
                                        isProcessing || images.length === 0
                                    }
                                />
                                <Label
                                    htmlFor="aspect-ratio"
                                    className="text-sm cursor-pointer"
                                >
                                    {maintainAspectRatio ? (
                                        <div className="flex items-center">
                                            <Lock className="h-3 w-3 mr-1" />
                                            {t("lockAspectRatio")}
                                        </div>
                                    ) : (
                                        <div className="flex items-center">
                                            <Unlock className="h-3 w-3 mr-1" />
                                            {t("unlockAspectRatio")}
                                        </div>
                                    )}
                                </Label>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="width" className="text-sm">
                                    {t("width")}
                                </Label>
                                <div className="flex items-center space-x-2">
                                    <Input
                                        id="width"
                                        type="number"
                                        value={width}
                                        onChange={(e) =>
                                            handleWidthChange(
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                        min="1"
                                        max="10000"
                                        disabled={
                                            isProcessing || images.length === 0
                                        }
                                        className="w-full"
                                    />
                                    <span className="text-sm text-muted-foreground">
                                        px
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="height" className="text-sm">
                                    {t("height")}
                                </Label>
                                <div className="flex items-center space-x-2">
                                    <Input
                                        id="height"
                                        type="number"
                                        value={height}
                                        onChange={(e) =>
                                            handleHeightChange(
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                        min="1"
                                        max="10000"
                                        disabled={
                                            isProcessing || images.length === 0
                                        }
                                        className="w-full"
                                    />
                                    <span className="text-sm text-muted-foreground">
                                        px
                                    </span>
                                </div>
                            </div>
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
                                    {t("resizeSummary")}
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
                                            {t("resizedSize")}
                                        </div>
                                        <div className="text-lg font-medium">
                                            {formatBytes(totalResizedSize)}
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
                                                          totalResizedSize /
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
                                            img.resizedUrl,
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
                                                href={img.resizedUrl}
                                                download={`resized-${img.file.name}`}
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
                                    onClick={(e) => {
                                        e.preventDefault();
                                        // Download all resized images one by one
                                        const completedImages = images.filter(
                                            (img) =>
                                                img.status === "done" &&
                                                img.resizedUrl,
                                        );
                                        completedImages.forEach(
                                            (img, index) => {
                                                if (img.resizedUrl) {
                                                    const link =
                                                        document.createElement(
                                                            "a",
                                                        );
                                                    link.href = img.resizedUrl;
                                                    link.download = `resized-${img.file.name}`;
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

export default ImageResizer;
