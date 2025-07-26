"use client";

import React, { useRef, useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Alert, AlertDescription } from "../ui/alert";
import { AlertTriangle, Upload, Download } from "lucide-react";

function formatBytes(bytes: number) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

const ImageCompressor: React.FC = () => {
    const [compressedUrl, setCompressedUrl] = useState<string | null>(null);
    const [quality, setQuality] = useState<number>(0.7);
    const [fileName, setFileName] = useState<string>("");
    const [originalSize, setOriginalSize] = useState<number | null>(null);
    const [compressedSize, setCompressedSize] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        setCompressedUrl(null);
        setCompressedSize(null);
        const file = e.target.files?.[0];
        if (!file) return;
        setFileName(file.name);
        setOriginalSize(file.size);
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new window.Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext("2d");
                if (!ctx) return setError("Failed to get canvas context.");
                ctx.drawImage(img, 0, 0);
                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            setCompressedUrl(URL.createObjectURL(blob));
                            setCompressedSize(blob.size);
                        } else {
                            setError(
                                "Compression failed. Try a different image or quality setting.",
                            );
                        }
                    },
                    "image/jpeg",
                    quality,
                );
            };
            if (typeof event.target?.result === "string") {
                img.src = event.target.result;
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Image Compressor</CardTitle>
                    <CardDescription>
                        Compress and optimize your images for web and sharing.
                        Upload an image, adjust the quality, and download the
                        compressed result.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* File Upload Section */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium">
                            Upload Image
                        </label>
                        <div className="flex items-center gap-3">
                            <Input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="max-w-xs"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2"
                            >
                                <Upload className="h-4 w-4" />
                                Choose File
                            </Button>
                        </div>
                        {fileName && (
                            <div className="text-muted-foreground text-xs mt-1">
                                <span className="font-medium">{fileName}</span>
                                {originalSize !== null && (
                                    <> &middot; {formatBytes(originalSize)}</>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Quality Slider */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            Quality
                            <input
                                type="range"
                                min={0.1}
                                max={1}
                                step={0.01}
                                value={quality}
                                onChange={(e) =>
                                    setQuality(Number(e.target.value))
                                }
                                className="w-40 accent-primary"
                            />
                            <span>{Math.round(quality * 100)}%</span>
                        </label>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Preview and Download Section */}
                    {compressedUrl && (
                        <div className="space-y-4">
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <img
                                    src={compressedUrl}
                                    alt="Compressed Preview"
                                    className="rounded-lg border max-w-[300px] max-h-[300px] bg-muted"
                                />
                                <div className="space-y-2 text-sm">
                                    <div>
                                        <span className="font-medium">
                                            Original size:
                                        </span>{" "}
                                        {originalSize !== null
                                            ? formatBytes(originalSize)
                                            : "-"}
                                    </div>
                                    <div>
                                        <span className="font-medium">
                                            Compressed size:
                                        </span>{" "}
                                        {compressedSize !== null
                                            ? formatBytes(compressedSize)
                                            : "-"}
                                    </div>
                                    {originalSize && compressedSize && (
                                        <div>
                                            <span className="font-medium">
                                                Reduction:
                                            </span>{" "}
                                            {(
                                                (1 -
                                                    compressedSize /
                                                        originalSize) *
                                                100
                                            ).toFixed(1)}
                                            %
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Button asChild className="w-full md:w-auto">
                                <a
                                    href={compressedUrl}
                                    download="compressed.jpg"
                                >
                                    <Download className="h-4 w-4" />
                                    Download Compressed Image
                                </a>
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ImageCompressor;
