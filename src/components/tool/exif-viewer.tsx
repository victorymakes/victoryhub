"use client";

import React, { useRef, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Upload, Download, Shield, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { formatBytes } from "@/lib/file";
import Image from "next/image";
import ExifReader, { Tags } from "exifreader";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ExifData {
    file: {
        name: string;
        type: string;
        size: string;
        width: string;
        height: string;
        colorSpace: string;
        createdAt: string;
    };
    camera: {
        aperture: string;
        exposureTime: string;
        focalLength: string;
        fNumber: string;
        flash: string;
        iso: string;
        lens: string;
    };
    location: {
        latitude: string;
        longitude: string;
        altitude: string;
    };
    all: {
        [key: string]: string;
    };
}

const convertTagsToExifData = (file: File, tags: Tags): ExifData => {
    const exifData: ExifData = {
        file: {
            name: "",
            type: "",
            size: "",
            width: "",
            height: "",
            colorSpace: "",
            createdAt: "",
        },
        camera: {
            aperture: "",
            exposureTime: "",
            focalLength: "",
            fNumber: "",
            flash: "",
            iso: "",
            lens: "",
        },
        location: {
            latitude: "",
            longitude: "",
            altitude: "",
        },
        all: {},
    };

    Object.keys(tags).forEach((key) => {
        exifData.all[key] =
            tags[key].description || JSON.stringify(tags[key].value);

        // set file metadata
        exifData.file.name = file.name;
        exifData.file.type = file.type;
        exifData.file.size = formatBytes(file.size);
        exifData.file.width =
            tags["ImageWidth"]?.description ||
            tags["Image Width"]?.description.replace("px", "") ||
            "N/A";
        exifData.file.height =
            tags["ImageHeight"]?.description ||
            tags["Image Height"]?.description.replace("px", "") ||
            "N/A";
        exifData.file.colorSpace = tags["ColorSpace"]?.description || "N/A";
        exifData.file.createdAt =
            tags["DateTimeOriginal"]?.description ||
            tags["DateTime"]?.description ||
            "N/A";

        // set camera metadata
        exifData.camera.aperture = tags["FNumber"]?.description || "N/A";
        exifData.camera.exposureTime =
            tags["ExposureTime"]?.description || "N/A";
        exifData.camera.focalLength = tags["FocalLength"]?.description || "N/A";
        exifData.camera.fNumber = tags["FNumber"]?.description || "N/A";
        exifData.camera.flash = tags["Flash"]?.description || "N/A";
        exifData.camera.iso = tags["ISOSpeedRatings"]?.description || "N/A";
        exifData.camera.lens = tags["LensModel"]?.description || "N/A";

        // set location metadata
        exifData.location.latitude = tags["GPSLatitude"]?.description || "N/A";
        exifData.location.longitude =
            tags["GPSLongitude"]?.description || "N/A";
        exifData.location.altitude = tags["GPSAltitude"]?.description || "N/A";
    });
    return exifData;
};

const ExifViewer: React.FC = () => {
    const t = useTranslations("ExifViewer");
    const [image, setImage] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [cleanImageUrl, setCleanImageUrl] = useState<string | null>(null);
    const [exifData, setExifData] = useState<ExifData | null>(null);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isExifRemoved, setIsExifRemoved] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    };

    // Handle drag events
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
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    };

    // Process the selected file
    const processFile = async (file: File) => {
        console.log("Processing file:", file.name, file.type, file.size);
        // Check if file is an image
        if (!file.type.startsWith("image/")) {
            setError(t("errors.notAnImage"));
            return;
        }

        setExifData(null);
        setIsExifRemoved(false);
        setError(null);

        setImage(file);
        setImageUrl(URL.createObjectURL(file));

        // Extract EXIF data
        try {
            const arrayBuffer = await file.arrayBuffer();
            const tags = ExifReader.load(arrayBuffer);
            const exifData = convertTagsToExifData(file, tags);
            setExifData(exifData);
        } catch (err) {
            console.error("EXIF extraction error:", err);
            setError(t("errors.exifExtractionFailed"));
            setExifData(null);
        }
    };

    // Remove EXIF data from the image
    const removeExifData = useCallback(async () => {
        if (!image || !imageUrl) return;

        try {
            setError(null);
            const img = new window.Image();

            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;

                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    setError(t("errors.canvasContextFailed"));
                    return;
                }

                ctx.drawImage(img, 0, 0);

                canvas.toBlob(
                    async (blob) => {
                        if (!blob) {
                            setError(t("errors.exifRemovalFailed"));
                            return;
                        }

                        if (cleanImageUrl) {
                            URL.revokeObjectURL(cleanImageUrl);
                        }

                        const cleanedBlob = new Blob([blob], {
                            type: image.type,
                        });
                        const newCleanImageUrl =
                            URL.createObjectURL(cleanedBlob);
                        setCleanImageUrl(newCleanImageUrl);

                        // Extract EXIF data from cleaned image
                        try {
                            const cleanArrayBuffer =
                                await cleanedBlob.arrayBuffer();
                            const cleanTags = ExifReader.load(cleanArrayBuffer);
                            const cleanExifData = convertTagsToExifData(
                                image,
                                cleanTags,
                            );
                            setExifData(cleanExifData);
                            setIsExifRemoved(true);
                        } catch (err) {
                            console.error("Clean EXIF extraction error:", err);
                            // Even if we can't extract EXIF from cleaned image, still mark as removed
                            setIsExifRemoved(true);
                        }
                    },
                    image.type,
                    1.0,
                );
            };

            img.onerror = () => {
                setError(t("errors.fileReadFailed"));
            };

            img.src = imageUrl;
        } catch (err) {
            setError(t("errors.exifRemovalFailed"));
            console.error("Error removing EXIF data:", err);
        }
    }, [image, imageUrl, cleanImageUrl, t]);

    // Download the cleaned image
    const downloadCleanImage = () => {
        if (!cleanImageUrl) return;

        const link = document.createElement("a");
        link.href = cleanImageUrl;
        link.download = `clean-${image?.name || "image"}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Clear the current image and reset states
    const clearImage = () => {
        if (imageUrl) {
            URL.revokeObjectURL(imageUrl);
        }
        if (cleanImageUrl) {
            URL.revokeObjectURL(cleanImageUrl);
        }
        setImage(null);
        setImageUrl(null);
        setCleanImageUrl(null);
        setExifData(null);
        setIsExifRemoved(false);
        setError(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="pt-6 space-y-6">
                    {/* Upload Section */}
                    <div
                        className={cn(
                            "border-2 border-dashed rounded-lg p-6 transition-colors",
                            "flex flex-col items-center justify-center text-center",
                            isDragging
                                ? "border-primary bg-primary/5"
                                : "border-muted-foreground/25 hover:border-primary/50",
                            image ? "py-4" : "py-10",
                        )}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => !image && fileInputRef.current?.click()}
                    >
                        <Input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {!image ? (
                            <>
                                <div className="mb-4 rounded-full bg-primary/10 p-3">
                                    <Upload className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="text-lg font-medium mb-1">
                                    {t("uploadImage")}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    {t("dragAndDropImage")}
                                </p>
                                <Button size="sm" variant="secondary">
                                    {t("chooseFiles")}
                                </Button>
                            </>
                        ) : (
                            <div className="w-full flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="relative w-16 h-16 rounded-md border overflow-hidden bg-muted">
                                        {imageUrl && (
                                            <Image
                                                src={cleanImageUrl || imageUrl}
                                                alt={image.name}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="space-y-1 text-left">
                                        <p className="text-sm font-medium">
                                            {image.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatBytes(image.size)}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        clearImage();
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    {image && (
                        <div className="flex flex-wrap gap-3">
                            {!isExifRemoved ? (
                                <Button
                                    onClick={removeExifData}
                                    disabled={!image}
                                    className="flex-1"
                                >
                                    <Shield className="h-4 w-4 mr-2" />
                                    {t("removeExif")}
                                </Button>
                            ) : (
                                <Button
                                    onClick={downloadCleanImage}
                                    className="flex-1"
                                >
                                    <Download className="h-4 w-4 mr-2" />
                                    {t("download")}
                                </Button>
                            )}
                        </div>
                    )}

                    {/* Error Display */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* EXIF Removed Success Message */}
                    {isExifRemoved && (
                        <Alert className="bg-green-50 text-green-800 border-green-200">
                            <AlertDescription>
                                {t("exifRemoved")}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* EXIF Display */}
                    {exifData && (
                        <Tabs defaultValue="file" className="w-full">
                            <TabsList className="w-full h-auto grid grid-cols-2 sm:grid-cols-4 auto-rows-auto">
                                {Object.keys(exifData).map((category) => (
                                    <TabsTrigger
                                        value={category}
                                        key={category}
                                    >
                                        {t(category)}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            {Object.keys(exifData).map((category) => (
                                <TabsContent value={category} key={category}>
                                    <Table>
                                        <TableBody>
                                            {Object.keys(
                                                exifData[
                                                    category as keyof ExifData
                                                ],
                                            ).map((key) => {
                                                return (
                                                    <TableRow key={key}>
                                                        <TableCell className="font-mono">
                                                            {category !== "all"
                                                                ? t(
                                                                      `exif.${category}.${key}`,
                                                                  )
                                                                : key}
                                                        </TableCell>
                                                        <TableCell className="font-mono">
                                                            {
                                                                (
                                                                    exifData[
                                                                        category as keyof ExifData
                                                                    ] as Record<
                                                                        string,
                                                                        string
                                                                    >
                                                                )[key]
                                                            }
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </TabsContent>
                            ))}
                        </Tabs>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ExifViewer;
