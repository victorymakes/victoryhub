"use client";

import FileSaver from "file-saver";
import JSZip from "jszip";
import {
  AlertTriangle,
  BadgeCheckIcon,
  Download,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import UploadFiles from "@/components/tool/upload-files";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  formatBytes,
  getImageFileExtension,
  getImageMimeType,
} from "@/lib/file";

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
  const t = useTranslations("ImageConverter");
  const [images, setImages] = useState<ImageItem[]>([]);
  const [outputFormat, setOutputFormat] = useState<SupportedFormat>("jpeg");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const imagesRef = useRef<ImageItem[]>([]);
  const isProcessingRef = useRef<boolean>(false);

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

  // Process a single image file and return a promise with the converted result
  const processImage = useCallback(
    (imageItem: ImageItem): Promise<ImageItem> => {
      // If output format is the same as original, skip conversion
      if (
        imageItem.originalFormat.toLowerCase() === outputFormat.toLowerCase()
      ) {
        return Promise.resolve({
          ...imageItem,
          convertedUrl:
            imageItem.convertedUrl || URL.createObjectURL(imageItem.file),
          convertedSize: imageItem.file.size,
          status: "done",
        });
      }
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

            const mimeType = getImageMimeType(outputFormat);

            canvas.toBlob(
              (blob) => {
                if (blob) {
                  // Revoke previous URL to prevent memory leaks
                  if (imageItem.convertedUrl) {
                    URL.revokeObjectURL(imageItem.convertedUrl);
                  }

                  const updatedItem = {
                    ...imageItem,
                    convertedUrl: URL.createObjectURL(blob),
                    convertedSize: blob.size,
                    status: "done" as const,
                  };
                  resolve(updatedItem);
                } else {
                  reject(new Error(t("errors.conversionFailed")));
                }
              },
              mimeType,
              1.0,
            );
          };
          img.onerror = () => reject(new Error(t("errors.imageLoadFailed")));
          if (typeof event.target?.result === "string") {
            img.src = event.target.result;
          }
        };
        reader.onerror = () => reject(new Error(t("errors.fileReadFailed")));
        reader.readAsDataURL(imageItem.file);
      });
    },
    [outputFormat, t],
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
                const processedImage = await processImage(image);
                // Update the image status immediately after processing
                setImages((current) =>
                  current.map((img) =>
                    img.id === processedImage.id ? processedImage : img,
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
                            err instanceof Error ? err.message : String(err),
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
  const handleFileChange = (files: FileList | File[]) => {
    addImages(files);
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

  // download all compressed images
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
        const response = await fetch(img.convertedUrl ?? "");
        const blob = await response.blob();
        zip.file(getConvertedImageFileName(img), blob);
      }),
    );
    const zipBlob = await zip.generateAsync({ type: "blob" });
    FileSaver.saveAs(zipBlob, "converted-images.zip");
  };

  const downloadSingleFile = (img: ImageItem) => {
    const link = document.createElement("a");
    link.href = img.convertedUrl ?? "";
    link.download = getConvertedImageFileName(img);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getConvertedImageFileName = (img: ImageItem) => {
    return `${img.file.name.split(".")[0]}.${getImageFileExtension(outputFormat)}`;
  };

  // Effect to reprocess images when format or quality changes
  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);
  useEffect(() => {
    // Only trigger reprocessing if there are images and we're not already processing
    if (imagesRef.current.length > 0 && !isProcessingRef.current) {
      // Use a debounce to prevent continuous reprocessing while slider is moving
      const debounceTimer = setTimeout(() => {
        // Mark all completed images as needing reprocessing
        setImages((prev) =>
          prev.map((img) => ({
            ...img,
            status: img.status === "done" ? "processing" : img.status,
          })),
        );

        // Process all images with the new settings
        processAllImages();
      }, 300); // 300ms debounce

      return () => clearTimeout(debounceTimer);
    }
  }, [processAllImages]);

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
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {t("uploadImage")}
                {images.length > 0 && (
                  <Badge variant="outline" className="ml-2">
                    {`${images.length} ${t("images")}`}
                  </Badge>
                )}
              </span>
              {images.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllImages}
                  disabled={isProcessing}
                >
                  <Trash2 className="h-4 w-4" />
                  {t("clearAll")}
                </Button>
              )}
            </div>
            <UploadFiles
              onFilesSelected={handleFileChange}
              multiple={true}
              disabled={isProcessing}
              accept={"image/*"}
            />

            {/* Display uploaded images */}
            {images && images.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="border rounded-lg p-3 space-y-2 space-x-2 flex items-center"
                  >
                    {/* Left: Image preview */}
                    <div className="w-24 flex-shrink-0 rounded overflow-hidden border bg-muted flex items-center justify-center">
                      <Image
                        width={96}
                        height={96}
                        src={img.convertedUrl || URL.createObjectURL(img.file)}
                        alt={img.file.name}
                        className="object-contain w-full h-full"
                      />
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
                          onClick={() => removeImage(img.id)}
                          disabled={isProcessing}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex justify-between">
                          <span>{t("originalFormat")}:</span>
                          <span className="uppercase">
                            {img.originalFormat}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("originalSize")}:</span>
                          <span>{formatBytes(img.originalSize)}</span>
                        </div>
                        {img.status === "done" && img.convertedSize && (
                          <>
                            <div className="flex justify-between">
                              <span>{t("convertedSize")}:</span>
                              <span>{formatBytes(img.convertedSize)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>{t("sizeChange")}:</span>
                              <span
                                className={
                                  img.convertedSize < img.originalSize
                                    ? "text-green-600"
                                    : img.convertedSize > img.originalSize
                                      ? "text-red-600"
                                      : ""
                                }
                              >
                                {img.convertedSize < img.originalSize
                                  ? "-"
                                  : "+"}
                                {Math.abs(
                                  ((img.convertedSize - img.originalSize) /
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
                            <Badge variant="outline" className="text-xs">
                              <BadgeCheckIcon />
                              {t("ready")}
                            </Badge>
                            <Button
                              onClick={() => downloadSingleFile(img)}
                              disabled={!img.convertedUrl}
                              variant="outline"
                              size="sm"
                              className="ml-auto"
                            >
                              <Download className="h-4 w-4" />
                              {t("download")}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Conversion Settings */}
          <div className="flex flex-col space-y-4 border-t pt-4">
            {/*<h3 className="text-sm font-medium">*/}
            {/*    {t("conversionSettings")}*/}
            {/*</h3>*/}

            {/* Output Format Selection */}
            <div className="flex flex-col space-y-2">
              <span className="text-sm font-medium">{t("outputFormat")}</span>
              <Select
                disabled={isProcessing}
                value={outputFormat}
                onValueChange={(value: SupportedFormat) =>
                  setOutputFormat(value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jpeg">JPEG (.jpg)</SelectItem>
                  <SelectItem value="png">PNG (.png)</SelectItem>
                  <SelectItem value="webp">WebP (.webp)</SelectItem>
                </SelectContent>
              </Select>
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
                  (images.filter((img) => img.status === "done").length /
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
                <h3 className="font-medium">{t("conversionSummary")}</h3>
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

              <Button
                disabled={isProcessing}
                className="w-full"
                onClick={downloadAll}
              >
                <Download className="h-4 w-4" />
                {t("downloadAll")}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageConverter;
