"use client";

import React, { useState, useCallback, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { AlertTriangle, Download, Copy, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import JSZip from "jszip";
import { FontPicker } from "@/components/ui/font-picker";

type FaviconShape = "square" | "circle" | "rounded";
type FontWeight = "normal" | "bold";
type FaviconSize = 16 | 32 | 48 | 64;
type FaviconFormat = "png" | "ico" | "svg";

const TextFaviconGenerator = () => {
    const t = useTranslations("TextFaviconGenerator");

    const [text, setText] = useState<string>("V");
    const [backgroundColor, setBackgroundColor] = useState<string>("#000000");
    const [textColor, setTextColor] = useState<string>("#FFFFFF");
    const [shape, setShape] = useState<FaviconShape>("rounded");
    const [fontSize, setFontSize] = useState<number>(48);
    const [fontWeight, setFontWeight] = useState<FontWeight>("bold");
    const [fontFamily, setFontFamily] = useState<string>("Roboto");
    const [error, setError] = useState<string | null>(null);
    const [warning, setWarning] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [generatedFavicons, setGeneratedFavicons] = useState<
        Map<string, Map<FaviconSize, Map<FaviconFormat, string>>>
    >(new Map());

    // Store all batch texts for download processing
    const [allBatchTexts, setAllBatchTexts] = useState<string[]>([]);
    const [batchTexts, setBatchTexts] = useState<string>("");
    const [isBatchMode, setIsBatchMode] = useState<boolean>(false);
    const [htmlCode] =
        useState<string>(`<link rel="icon" type="image/x-icon" href="favicon.ico">
<link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
<link rel="icon" type="image/png" sizes="48x48" href="favicon-48x48.png">
<link rel="icon" type="image/png" sizes="64x64" href="favicon-64x64.png">
<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">
`);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const generateFavicon = useCallback(
        (inputText: string, size: FaviconSize): Map<FaviconFormat, string> => {
            if (!canvasRef.current) {
                canvasRef.current = document.createElement("canvas");
            }

            const canvas = canvasRef.current;
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext("2d");

            if (!ctx) {
                throw new Error("Could not get canvas context");
            }

            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw background
            ctx.fillStyle = backgroundColor;

            if (shape === "square") {
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            } else if (shape === "circle") {
                ctx.beginPath();
                ctx.arc(
                    canvas.width / 2,
                    canvas.height / 2,
                    canvas.width / 2,
                    0,
                    Math.PI * 2,
                );
                ctx.fill();
            } else if (shape === "rounded") {
                const radius = canvas.width / 8;
                ctx.beginPath();
                ctx.moveTo(radius, 0);
                ctx.lineTo(canvas.width - radius, 0);
                ctx.quadraticCurveTo(canvas.width, 0, canvas.width, radius);
                ctx.lineTo(canvas.width, canvas.height - radius);
                ctx.quadraticCurveTo(
                    canvas.width,
                    canvas.height,
                    canvas.width - radius,
                    canvas.height,
                );
                ctx.lineTo(radius, canvas.height);
                ctx.quadraticCurveTo(
                    0,
                    canvas.height,
                    0,
                    canvas.height - radius,
                );
                ctx.lineTo(0, radius);
                ctx.quadraticCurveTo(0, 0, radius, 0);
                ctx.closePath();
                ctx.fill();
            }

            // Calculate font size based on icon size
            const scaledFontSize = Math.max(
                8,
                Math.floor(fontSize * (size / 64)),
            );

            // Draw text
            ctx.fillStyle = textColor;
            ctx.font = `${fontWeight} ${scaledFontSize}px ${fontFamily}`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // 测量实际文本尺寸
            const metrics = ctx.measureText(inputText);

            const offset =
                (metrics.actualBoundingBoxAscent -
                    metrics.actualBoundingBoxDescent) /
                2;

            // 绘制文本：往下移一点
            ctx.fillText(
                inputText,
                canvas.width / 2,
                canvas.height / 2 + offset,
            );

            // Generate different formats
            const formats = new Map<FaviconFormat, string>();

            // PNG format
            formats.set("png", canvas.toDataURL("image/png"));

            // SVG format (simplified conversion)
            const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
                <foreignObject width="100%" height="100%">
                    <div xmlns="http://www.w3.org/1999/xhtml" style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;background-color:${backgroundColor};border-radius:${shape === "circle" ? "50%" : shape === "rounded" ? "12.5%" : "0"}">
                        <span style="color:${textColor};font-family:${fontFamily};font-weight:${fontWeight};font-size:${scaledFontSize}px;">${inputText}</span>
                    </div>
                </foreignObject>
            </svg>`;
            const svgBlob = new Blob([svgContent], { type: "image/svg+xml" });
            formats.set("svg", URL.createObjectURL(svgBlob));

            // For ICO format, we'll use PNG as a placeholder since true ICO requires additional libraries
            // In a production environment, you would use a proper ICO conversion library
            formats.set("ico", canvas.toDataURL("image/png"));

            return formats;
        },
        [backgroundColor, textColor, shape, fontSize, fontWeight, fontFamily],
    );

    // Auto generate favicons when settings change
    const generateFavicons = useCallback(() => {
        setError(null);
        setWarning(null);
        setGeneratedFavicons(new Map());

        const sizes: FaviconSize[] = [16, 32, 48, 64];
        const textsToProcess: string[] = [];
        let allTexts: string[] = [];

        if (isBatchMode) {
            // Split by newlines and filter out empty lines
            const lines = batchTexts
                .split("\n")
                .map((line) => line.trim())
                .filter((line) => line.length > 0);

            if (lines.length === 0) {
                setError(t("errors.noBatchTexts"));
                return;
            }

            // Store all texts for reference
            allTexts = [...lines];

            // In batch mode, only process the first text for preview
            textsToProcess.push(lines[0]);

            // Set a warning that only the first text is being previewed
            if (lines.length > 1) {
                setWarning(
                    t("batchModePreviewWarning", { count: lines.length }),
                );
            }
        } else {
            if (!text.trim()) {
                setError(t("errors.noText"));
                return;
            }

            textsToProcess.push(text);
            allTexts = [text];
        }

        try {
            setIsLoading(true);

            // For single mode or batch mode, we'll store all generated favicons
            // In batch mode, we'll organize by text first, then by size
            const newFavicons = new Map<
                string, // text as key
                Map<FaviconSize, Map<FaviconFormat, string>>
            >();

            // Process only the first text for preview in batch mode
            for (const currentText of textsToProcess) {
                const textFavicons = new Map<
                    FaviconSize,
                    Map<FaviconFormat, string>
                >();

                // Generate favicons for each size
                for (const size of sizes) {
                    const formats = generateFavicon(currentText, size);
                    textFavicons.set(size, formats);
                }

                newFavicons.set(currentText, textFavicons);
            }

            // Store all texts in the component state for download later
            // This way we don't need to regenerate the list when downloading
            setAllBatchTexts(allTexts);
            setGeneratedFavicons(newFavicons);
        } catch (err) {
            setError(t("errors.generationFailed"));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [text, batchTexts, generateFavicon, isBatchMode, t]);

    // Effect to auto-generate favicons when settings change
    React.useEffect(() => {
        generateFavicons();
    }, [
        generateFavicons,
        text,
        batchTexts,
        backgroundColor,
        textColor,
        shape,
        fontSize,
        fontWeight,
        fontFamily,
        isBatchMode,
    ]);

    const handleDownloadAll = useCallback(() => {
        if (generatedFavicons.size === 0) return;

        // Show loading state for download
        setIsLoading(true);
        toast.info(t("preparingDownload"));

        const zip = new JSZip();

        // Add HTML code file
        zip.file("favicon-code.html", htmlCode);

        // In batch mode, we need to generate favicons for all texts before downloading
        const processAllTexts = async () => {
            const sizes: FaviconSize[] = [16, 32, 48, 64];
            const textsToProcess = isBatchMode ? allBatchTexts : [text];

            // Process each text
            for (const currentText of textsToProcess) {
                // Skip if this text already has generated favicons
                if (generatedFavicons.has(currentText)) {
                    const folder = zip.folder(currentText || `icon`);
                    if (!folder) continue;

                    // Get existing favicons
                    const textFavicons = generatedFavicons.get(currentText);
                    if (!textFavicons) continue;

                    // Add all sizes and formats
                    for (const [size, formats] of textFavicons.entries()) {
                        // Add PNG
                        const pngUrl = formats.get("png");
                        if (pngUrl) {
                            const pngRes = await fetch(pngUrl);
                            const pngBlob = await pngRes.blob();
                            folder.file(`favicon-${size}x${size}.png`, pngBlob);
                            if (size === 32) {
                                folder.file(`favicon.ico`, pngBlob); // Use PNG as ICO for simplicity
                            }
                            if (size === 64) {
                                folder.file(`apple-touch-icon.png`, pngBlob);
                            }
                        }

                        // Add SVG
                        const svgUrl = formats.get("svg");
                        if (svgUrl) {
                            const svgRes = await fetch(svgUrl);
                            const svgBlob = await svgRes.blob();
                            folder.file(`favicon-${size}x${size}.svg`, svgBlob);
                        }
                    }
                } else {
                    // Generate new favicons for this text
                    const folder = zip.folder(currentText || `icon`);
                    if (!folder) continue;

                    // Generate favicons for each size
                    for (const size of sizes) {
                        try {
                            const formats = generateFavicon(currentText, size);

                            // Add PNG
                            const pngUrl = formats.get("png");
                            if (pngUrl) {
                                const pngRes = await fetch(pngUrl);
                                const pngBlob = await pngRes.blob();
                                folder.file(
                                    `favicon-${size}x${size}.png`,
                                    pngBlob,
                                );
                                if (size === 32) {
                                    folder.file(`favicon.ico`, pngBlob);
                                }
                                if (size === 64) {
                                    folder.file(
                                        `apple-touch-icon.png`,
                                        pngBlob,
                                    );
                                }
                            }

                            // Add SVG
                            const svgUrl = formats.get("svg");
                            if (svgUrl) {
                                const svgRes = await fetch(svgUrl);
                                const svgBlob = await svgRes.blob();
                                folder.file(
                                    `favicon-${size}x${size}.svg`,
                                    svgBlob,
                                );
                            }
                        } catch (err) {
                            console.error(
                                `Error generating favicon for "${currentText}" at size ${size}:`,
                                err,
                            );
                        }
                    }
                }

                // Add manifest file with static content
                const manifest = {
                    name: "Favicon",
                    short_name: "Favicon",
                    icons: [
                        {
                            src: "favicon-16x16.png",
                            sizes: "16x16",
                            type: "image/png",
                        },
                        {
                            src: "favicon-32x32.png",
                            sizes: "32x32",
                            type: "image/png",
                        },
                        {
                            src: "favicon-48x48.png",
                            sizes: "48x48",
                            type: "image/png",
                        },
                        {
                            src: "favicon-64x64.png",
                            sizes: "64x64",
                            type: "image/png",
                        },
                        {
                            src: "apple-touch-icon.png",
                            sizes: "180x180",
                            type: "image/png",
                        },
                    ],
                    theme_color: "#ffffff",
                    background_color: "#ffffff",
                    display: "standalone",
                };

                const folder = zip.folder(currentText || `icon`);
                if (folder) {
                    folder.file(
                        "site.webmanifest",
                        JSON.stringify(manifest, null, 2),
                    );
                }
            }

            // Generate and download the zip file
            try {
                const content = await zip.generateAsync({ type: "blob" });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(content);
                link.download = "favicons.zip";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success(t("downloadStarted"));
            } catch (err) {
                console.error("Error generating zip file:", err);
                toast.error(t("downloadFailed"));
            } finally {
                setIsLoading(false);
            }
        };

        // Start processing
        processAllTexts();
    }, [
        generatedFavicons,
        text,
        allBatchTexts,
        isBatchMode,
        htmlCode,
        generateFavicon,
        t,
    ]);

    const handleBatchModeToggle = (enabled: boolean) => {
        setIsBatchMode(enabled);
        if (enabled && batchTexts === "") {
            // Initialize batch texts with current text
            if (text) {
                setBatchTexts(text);
            }
        }
    };

    // Copy HTML code to clipboard
    const copyHtmlCode = () => {
        if (!htmlCode) return;

        navigator.clipboard
            .writeText(htmlCode)
            .then(() => toast.success(t("copied")))
            .catch(() => toast.error(t("errors.copyFailed")));
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="space-y-6">
                    {/* Batch Mode Toggle */}
                    <div className="flex items-center justify-between pt-6">
                        <div className="space-y-0.5">
                            <Label htmlFor="batch-mode">{t("batchMode")}</Label>
                            <p className="text-sm text-muted-foreground">
                                {t("batchModeDescription")}
                            </p>
                        </div>
                        <Switch
                            id="batch-mode"
                            checked={isBatchMode}
                            onCheckedChange={handleBatchModeToggle}
                        />
                    </div>

                    {/* Single Text Input or Batch Inputs */}
                    {!isBatchMode ? (
                        <div className="space-y-2">
                            <Label htmlFor="favicon-text">{t("text")}</Label>
                            <Input
                                id="favicon-text"
                                placeholder={t("textPlaceholder")}
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                maxLength={4} // Limit to 4 characters for better display
                            />
                            {text.length > 2 && (
                                <p className="text-sm text-muted-foreground">
                                    {t("textLengthWarning")}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="batch-texts">
                                {t("batchTexts")}
                            </Label>
                            <Textarea
                                id="batch-texts"
                                placeholder={t("batchTextsPlaceholder")}
                                value={batchTexts}
                                onChange={(e) => setBatchTexts(e.target.value)}
                                className="min-h-[100px]"
                            />
                            <p className="text-sm text-muted-foreground">
                                {t("batchTextDescription")}
                            </p>
                        </div>
                    )}

                    {/* Customization Options */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Background Color */}
                        <div className="space-y-2">
                            <Label htmlFor="bg-color">
                                {t("backgroundColor")}
                            </Label>
                            <div className="flex gap-2 items-center">
                                <Input
                                    id="bg-color"
                                    type="color"
                                    value={backgroundColor}
                                    onChange={(e) =>
                                        setBackgroundColor(e.target.value)
                                    }
                                    className="w-12"
                                />
                                <Input
                                    type="text"
                                    value={backgroundColor}
                                    onChange={(e) =>
                                        setBackgroundColor(e.target.value)
                                    }
                                    className="flex-1"
                                />
                            </div>
                        </div>

                        {/* Text Color */}
                        <div className="space-y-2">
                            <Label htmlFor="text-color">{t("textColor")}</Label>
                            <div className="flex gap-2 items-center">
                                <Input
                                    id="text-color"
                                    type="color"
                                    value={textColor}
                                    onChange={(e) =>
                                        setTextColor(e.target.value)
                                    }
                                    className="w-12"
                                />
                                <Input
                                    type="text"
                                    value={backgroundColor}
                                    onChange={(e) =>
                                        setTextColor(e.target.value)
                                    }
                                    className="flex-1"
                                />
                            </div>
                        </div>

                        {/* Shape */}
                        <div className="space-y-2">
                            <Label htmlFor="shape">{t("shape")}</Label>
                            <select
                                id="shape"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={shape}
                                onChange={(e) =>
                                    setShape(e.target.value as FaviconShape)
                                }
                            >
                                <option value="square">
                                    {t("shapeSquare")}
                                </option>
                                <option value="circle">
                                    {t("shapeCircle")}
                                </option>
                                <option value="rounded">
                                    {t("shapeRounded")}
                                </option>
                            </select>
                        </div>

                        {/* Font Size */}
                        <div className="space-y-2">
                            <Label htmlFor="font-size">{t("fontSize")}</Label>
                            <Input
                                id="font-size"
                                type="number"
                                min="8"
                                max="64"
                                value={fontSize}
                                onChange={(e) =>
                                    setFontSize(Number(e.target.value))
                                }
                            />
                        </div>

                        {/* Font Family */}
                        <div className="space-y-2">
                            <Label htmlFor="font-family">
                                {t("fontFamily")}
                            </Label>
                            <FontPicker
                                // id="font-family"
                                onChange={(font) => setFontFamily(font)}
                                value={fontFamily}
                            />
                        </div>

                        {/* Font Weight */}
                        <div className="space-y-2">
                            <Label htmlFor="font-weight">
                                {t("fontWeight")}
                            </Label>
                            <select
                                id="font-weight"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={fontWeight}
                                onChange={(e) =>
                                    setFontWeight(e.target.value as FontWeight)
                                }
                            >
                                <option value="normal">
                                    {t("fontWeightNormal")}
                                </option>
                                <option value="bold">
                                    {t("fontWeightBold")}
                                </option>
                            </select>
                        </div>
                    </div>

                    {/* Error/Warning Display */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {warning && (
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{warning}</AlertDescription>
                        </Alert>
                    )}

                    {/* Loading indicator */}
                    {isLoading && (
                        <div className="flex justify-center py-2">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    )}

                    {/* Generated Favicons */}
                    {generatedFavicons.size > 0 && (
                        <div className="space-y-4">
                            {/*/!* Batch mode info *!/*/}
                            {/*{isBatchMode && (*/}
                            {/*    <Alert>*/}
                            {/*        <AlertDescription>*/}
                            {/*            {allBatchTexts.length > 1*/}
                            {/*                ? t("batchModePreviewWarning", {*/}
                            {/*                      count: allBatchTexts.length,*/}
                            {/*                  })*/}
                            {/*                : t("batchModeGeneratedInfo", {*/}
                            {/*                      count: generatedFavicons.size,*/}
                            {/*                  })}*/}
                            {/*        </AlertDescription>*/}
                            {/*    </Alert>*/}
                            {/*)}*/}

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-h-80 overflow-y-auto p-2">
                                {Array.from(generatedFavicons.entries())
                                    .map(([text, textFavicons], textIndex) => {
                                        // 如果是批量模式，只显示第一个文本的所有尺寸
                                        // 如果不是批量模式，显示当前文本的所有尺寸
                                        if (isBatchMode && textIndex > 0) {
                                            // 对于批量模式中的其他文本，只显示16px尺寸作为预览
                                            const sizeFormats =
                                                textFavicons.get(16);
                                            if (!sizeFormats) return null;

                                            const pngUrl =
                                                sizeFormats.get("png");
                                            if (!pngUrl) return null;

                                            return (
                                                <div
                                                    key={text}
                                                    className="flex flex-col items-center gap-2 p-3 border rounded-lg bg-muted/30 justify-center"
                                                >
                                                    <div className="flex items-center justify-center h-16">
                                                        <img
                                                            src={pngUrl}
                                                            alt={`Favicon for "${text}"`}
                                                            className="object-contain"
                                                            style={{
                                                                width: "16px",
                                                                height: "16px",
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="text-xs text-center text-muted-foreground truncate w-full">
                                                        {`"${text}"`}
                                                    </div>
                                                </div>
                                            );
                                        }

                                        // 显示所有尺寸（对于单一模式或批量模式的第一个文本）
                                        return Array.from(
                                            textFavicons.entries(),
                                        ).map(([size, formats]) => {
                                            const pngUrl = formats.get("png");
                                            if (!pngUrl) return null;

                                            return (
                                                <div
                                                    key={`${text}-${size}`}
                                                    className="flex flex-col items-center gap-2 p-3 border rounded-lg bg-muted/30 justify-center"
                                                >
                                                    <div className="flex items-center justify-center h-16">
                                                        <img
                                                            src={pngUrl}
                                                            alt={`Favicon ${size}x${size} for "${text}"`}
                                                            className="object-contain"
                                                            style={{
                                                                width: `${size}px`,
                                                                height: `${size}px`,
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="text-xs text-center text-muted-foreground truncate w-full">
                                                        {textIndex === 0 &&
                                                        isBatchMode
                                                            ? `${size}x${size} (${t("previewStyle")})`
                                                            : `${size}x${size}`}
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })
                                    .flat()}
                            </div>

                            {/* Download Button */}
                            <Button
                                onClick={handleDownloadAll}
                                className="w-full flex items-center gap-2"
                            >
                                <Download className="h-4 w-4" />
                                {t("downloadAll")}
                            </Button>
                        </div>
                    )}

                    {/* HTML Code - Always visible */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>{t("htmlCodeTitle")}</Label>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={copyHtmlCode}
                                className="flex items-center gap-2"
                            >
                                <Copy className="h-4 w-4" />
                                <span>{t("copy")}</span>
                            </Button>
                        </div>

                        <div className="relative">
                            <pre className="p-4 rounded-md bg-muted overflow-x-auto">
                                <code>{htmlCode}</code>
                            </pre>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default TextFaviconGenerator;
