"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
    BadgeCheckIcon,
    ChevronLeft,
    ChevronRight,
    Maximize2,
    Info,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatBytes, getImageMimeType } from "@/lib/file";
import JSZip from "jszip";
import FileSaver from "file-saver";
import Image from "next/image";

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

const ImageToBlackWhiteConverter: React.FC = () => {
    const t = useTranslations("ImageToBlackWhiteConverter");
    const [images, setImages] = useState<ImageItem[]>([]);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [previewIndex, setPreviewIndex] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const imagesRef = useRef<ImageItem[]>([]);

    const hasCompletedImages = images.some((img) => img.status === "done");

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

                        // Draw the original image
                        ctx.drawImage(img, 0, 0);

                        // Get the image data
                        const imageData = ctx.getImageData(
                            0,
                            0,
                            canvas.width,
                            canvas.height,
                        );
                        const data = imageData.data;

                        // Convert to black and white by setting each pixel's RGB values
                        // to the same value (grayscale)
                        for (let i = 0; i < data.length; i += 4) {
                            // Calculate grayscale value using luminance formula
                            const gray =
                                0.299 * data[i] +
                                0.587 * data[i + 1] +
                                0.114 * data[i + 2];

                            // Set RGB values to the grayscale value
                            data[i] = gray; // R
                            data[i + 1] = gray; // G
                            data[i + 2] = gray; // B
                            // data[i + 3] is Alpha (unchanged)
                        }

                        // Put the modified image data back on the canvas
                        ctx.putImageData(imageData, 0, 0);

                        // Get the output format based on original format
                        const outputFormat = getImageMimeType(
                            imageItem.originalFormat,
                        );

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
                            outputFormat,
                            1.0,
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
        [t],
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

    // download all converted images
    const downloadAll = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();

        const completedImages = images.filter(
            (img) => img.status === "done" && img.convertedUrl,
        );
        if (completedImages.length === 1) {
            // Directly download the single file
            downloadSingleFile(completedImages[0]);
            return;
        }

        // Download as zip if more than one image
        const zip = new JSZip();
        await Promise.all(
            completedImages.map(async (img) => {
                const response = await fetch(img.convertedUrl!);
                const blob = await response.blob();
                zip.file(getConvertedImageFileName(img), blob);
            }),
        );
        const zipBlob = await zip.generateAsync({ type: "blob" });
        FileSaver.saveAs(zipBlob, "bw-images.zip");
    };

    const downloadSingleFile = (img: ImageItem) => {
        const link = document.createElement("a");
        link.href = img.convertedUrl!;
        link.download = getConvertedImageFileName(img);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getConvertedImageFileName = (img: ImageItem) => {
        // Preserve original extension but add -bw suffix
        const nameParts = img.file.name.split(".");
        const extension = nameParts.pop() || "jpg";
        const baseName = nameParts.join(".");
        return `${baseName}-bw.${extension}`;
    };

    // Cache for original image URLs to prevent memory leaks
    const [originalImageUrls, setOriginalImageUrls] = useState<
        Record<string, string>
    >({});
    const originalImageUrlsRef = useRef<Record<string, string>>({});

    // Get or create URL for original image
    const getOriginalImageUrl = useCallback(
        (file: File) => {
            const fileId = `${file.name}-${file.size}-${file.lastModified}`;

            if (!originalImageUrls[fileId]) {
                const url = URL.createObjectURL(file);
                setOriginalImageUrls((prev) => ({ ...prev, [fileId]: url }));
                return url;
            }

            return originalImageUrls[fileId];
        },
        [originalImageUrls],
    );

    // Clean up temporary object URLs created for preview
    useEffect(() => {
        originalImageUrlsRef.current = originalImageUrls;
    }, [originalImageUrls]);
    useEffect(() => {
        return () => {
            // Revoke all original image URLs when component unmounts
            Object.values(originalImageUrlsRef.current).forEach((url) =>
                URL.revokeObjectURL(url),
            );
        };
    }, [originalImageUrlsRef]);

    // Clean up object URLs when component unmounts
    useEffect(() => {
        imagesRef.current = images;
    }, [images]);
    useEffect(() => {
        return () => {
            imagesRef.current.forEach((img) => {
                if (img.convertedUrl) {
                    URL.revokeObjectURL(img.convertedUrl);
                }
            });
        };
    }, []);

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="space-y-6">
                    {/* File Upload Section */}
                    <div className="space-y-3">
                        {/* icon header */}
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium">
                                {t("uploadImage")}
                                {images.length > 0 && (
                                    <Badge variant="outline" className="ml-2">
                                        {`${images.length} ${t("images")}`}
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

                        {/* upload images */}
                        <div
                            className={cn(
                                "border-2 border-dashed rounded-lg p-6 transition-colors",
                                isDragging
                                    ? "border-primary bg-primary/5"
                                    : "border-muted-foreground/20",
                                "flex flex-col items-center justify-center gap-2 text-center",
                            )}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
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

                        {/* Preview images */}
                        {images.length > 0 && previewIndex !== null && (
                            <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                                <div className="bg-background rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
                                    <div className="flex items-center justify-between p-4 border-b">
                                        <h3 className="text-lg font-medium">
                                            {images[previewIndex]?.file.name ||
                                                t("preview")}
                                        </h3>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                setPreviewIndex(null)
                                            }
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="flex-1 overflow-hidden relative p-4 flex items-center justify-center">
                                        {images[previewIndex]?.status ===
                                            "done" &&
                                        images[previewIndex]?.convertedUrl ? (
                                            <Image
                                                src={
                                                    images[previewIndex]
                                                        .convertedUrl
                                                }
                                                alt={
                                                    images[previewIndex].file
                                                        .name
                                                }
                                                width={800}
                                                height={600}
                                                className="object-contain max-h-full"
                                            />
                                        ) : images[previewIndex]?.status ===
                                          "error" ? (
                                            <div className="flex flex-col items-center justify-center h-full gap-2">
                                                <AlertTriangle className="h-8 w-8 text-destructive" />
                                                <p className="text-sm text-destructive">
                                                    {images[previewIndex]
                                                        ?.error ||
                                                        t(
                                                            "errors.conversionFailed",
                                                        )}
                                                </p>
                                                <Image
                                                    src={getOriginalImageUrl(
                                                        images[previewIndex]
                                                            .file,
                                                    )}
                                                    alt={
                                                        images[previewIndex]
                                                            .file.name
                                                    }
                                                    width={800}
                                                    height={600}
                                                    className="object-contain max-h-full mt-4 opacity-50"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center h-full gap-2">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                <p className="text-sm text-muted-foreground">
                                                    {t("processing")}
                                                </p>
                                                {images[previewIndex] && (
                                                    <Image
                                                        src={getOriginalImageUrl(
                                                            images[previewIndex]
                                                                .file,
                                                        )}
                                                        alt={
                                                            images[previewIndex]
                                                                .file.name
                                                        }
                                                        width={800}
                                                        height={600}
                                                        className="object-contain max-h-full mt-4 opacity-50"
                                                    />
                                                )}
                                            </div>
                                        )}

                                        {/* Navigation buttons */}
                                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="rounded-full bg-background/80 backdrop-blur-sm"
                                                onClick={() =>
                                                    setPreviewIndex(
                                                        Math.max(
                                                            0,
                                                            previewIndex - 1,
                                                        ),
                                                    )
                                                }
                                                disabled={
                                                    previewIndex <= 0 ||
                                                    images.length <= 1
                                                }
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="rounded-full bg-background/80 backdrop-blur-sm"
                                                onClick={() =>
                                                    setPreviewIndex(
                                                        Math.min(
                                                            images.length - 1,
                                                            previewIndex + 1,
                                                        ),
                                                    )
                                                }
                                                disabled={
                                                    previewIndex >=
                                                        images.length - 1 ||
                                                    images.length <= 1
                                                }
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="p-4 border-t flex justify-between items-center">
                                        <div className="text-sm text-muted-foreground">
                                            {previewIndex + 1} / {images.length}
                                        </div>
                                        {images[previewIndex]?.status ===
                                            "done" && (
                                            <Button
                                                variant="default"
                                                size="sm"
                                                onClick={() =>
                                                    downloadSingleFile(
                                                        images[previewIndex],
                                                    )
                                                }
                                            >
                                                <Download className="h-4 w-4 mr-2" />
                                                {t("download")}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Display uploaded images */}
                        {images.length > 0 && (
                            <div className="w-full space-y-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Info className="w-4 h-4" />
                                    {t("previewTip")}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                                    {images.map((img) => (
                                        <div
                                            key={img.id}
                                            className="border rounded-lg p-3 space-y-2 space-x-2 flex items-center"
                                        >
                                            {/* Left: Image preview */}
                                            <div
                                                className="w-24 flex-shrink-0 rounded overflow-hidden border bg-muted flex items-center justify-center cursor-pointer relative group"
                                                onClick={() =>
                                                    setPreviewIndex(
                                                        images.findIndex(
                                                            (image) =>
                                                                image.id ===
                                                                img.id,
                                                        ),
                                                    )
                                                }
                                            >
                                                <Image
                                                    width={96}
                                                    height={96}
                                                    src={
                                                        (img.status ===
                                                            "done" &&
                                                            img.convertedUrl) ||
                                                        getOriginalImageUrl(
                                                            img.file,
                                                        )
                                                    }
                                                    alt={img.file.name}
                                                    className={cn(
                                                        "object-contain w-full h-full",
                                                        img.status ===
                                                            "error" &&
                                                            "opacity-50",
                                                    )}
                                                />
                                                {img.status === "error" && (
                                                    <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                                                        <AlertTriangle className="h-4 w-4 text-destructive" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Maximize2 className="h-4 w-4 text-white" />
                                                </div>
                                            </div>
                                            {/* Right: Info */}
                                            <div className="flex flex-col space-y-2 justify-between min-w-0 w-full">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <span className="flex-1 min-w-0 truncate overflow-hidden whitespace-nowrap text-sm font-medium">
                                                        {img.file.name}
                                                    </span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0 rounded-full"
                                                        onClick={() =>
                                                            removeImage(img.id)
                                                        }
                                                        disabled={isProcessing}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <span>
                                                        {formatBytes(
                                                            img.originalSize,
                                                        )}
                                                    </span>
                                                    <span>→</span>
                                                    <span>
                                                        {img.convertedSize
                                                            ? formatBytes(
                                                                  img.convertedSize,
                                                              )
                                                            : "-"}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {img.status ===
                                                        "processing" && (
                                                        <div className="flex items-center gap-1 text-xs">
                                                            <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                                            <span>
                                                                {t(
                                                                    "processing",
                                                                )}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {img.status === "error" && (
                                                        <div className="flex items-center gap-1 text-xs text-destructive">
                                                            <AlertTriangle className="h-3 w-3" />
                                                            <span>
                                                                {img.error ||
                                                                    t(
                                                                        "errors.conversionFailed",
                                                                    )}
                                                            </span>
                                                        </div>
                                                    )}
                                                    {img.status === "done" && (
                                                        <>
                                                            <div className="flex items-center gap-1 text-xs text-primary">
                                                                <BadgeCheckIcon className="h-3 w-3" />
                                                                <span>
                                                                    {t("ready")}
                                                                </span>
                                                            </div>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="ml-auto"
                                                                onClick={() =>
                                                                    downloadSingleFile(
                                                                        img,
                                                                    )
                                                                }
                                                            >
                                                                <Download className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
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
                        <div className="space-y-3">
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

                    {hasCompletedImages && (
                        <div className="space-y-3 border-t">
                            <div></div>
                            <Button
                                variant="default"
                                disabled={isProcessing}
                                className="w-full"
                                onClick={downloadAll}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                {t("downloadAll")}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ImageToBlackWhiteConverter;
