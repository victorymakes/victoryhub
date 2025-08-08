"use client";

import React, { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    AlertTriangle,
    Download,
    Upload,
    Image as ImageIcon,
    Loader2,
    X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { QRCode } from "react-qrcode-logo";

const QRCodeGenerator: React.FC = () => {
    const t = useTranslations("QrcodeGenerator");
    const [value, setValue] = useState<string>("");
    const [size, setSize] = useState<number>(300);
    const [fgColor, setFgColor] = useState<string>("#000000");
    const [bgColor, setBgColor] = useState<string>("#FFFFFF");
    const [frameText, setFrameText] = useState<string>("");
    const [frameTextColor, setFrameTextColor] = useState<string>("#000000");
    const [frameColor, setFrameColor] = useState<string>("#FFFFFF");
    const [logoImage, setLogoImage] = useState<string | null>(null);
    const [logoSize, setLogoSize] = useState<number>(60);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [removeQrCodeBehindLogo, setRemoveQrCodeBehindLogo] =
        useState<boolean>(true);
    const [qrStyle, setQrStyle] = useState<"squares" | "dots">("dots");
    const [ecLevel, setEcLevel] = useState<"L" | "M" | "Q" | "H">("M");

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const qrCodeRef = useRef<QRCode>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Check if file is an image
        if (!file.type.startsWith("image/")) {
            setError(t("errors.notAnImage"));
            return;
        }

        // Check file size (limit to 2MB)
        if (file.size > 2 * 1024 * 1024) {
            setError(t("errors.fileTooLarge"));
            return;
        }

        setError(null);
        setIsLoading(true);

        const reader = new FileReader();
        reader.onload = (e) => {
            setLogoImage(e.target?.result as string);
            setIsLoading(false);
        };
        reader.onerror = () => {
            setError(t("errors.fileReadFailed"));
            setIsLoading(false);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveLogo = () => {
        setLogoImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleDownload = () => {
        if (qrCodeRef.current && value) {
            qrCodeRef.current.download();
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];

                // Check if file is an image
                if (!file.type.startsWith("image/")) {
                    setError(t("errors.notAnImage"));
                    return;
                }

                // Check file size (limit to 2MB)
                if (file.size > 2 * 1024 * 1024) {
                    setError(t("errors.fileTooLarge"));
                    return;
                }

                setError(null);
                setIsLoading(true);

                const reader = new FileReader();
                reader.onload = (e) => {
                    setLogoImage(e.target?.result as string);
                    setIsLoading(false);
                };
                reader.onerror = () => {
                    setError(t("errors.fileReadFailed"));
                    setIsLoading(false);
                };
                reader.readAsDataURL(file);
            }
        },
        [t],
    );

    return (
        <div className="space-y-6">
            <Card>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="qr-value">
                                    {t("valueLabel")}
                                </Label>
                                <Input
                                    id="qr-value"
                                    placeholder={t("valuePlaceholder")}
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                />
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">
                                    {t("styleOptions")}
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="qr-size">
                                            {t("size")}
                                        </Label>
                                        <Input
                                            id="qr-size"
                                            type="number"
                                            min="100"
                                            max="1000"
                                            value={size}
                                            onChange={(e) =>
                                                setSize(Number(e.target.value))
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="qr-style">
                                            {t("style")}
                                        </Label>
                                        <select
                                            id="qr-style"
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                            value={qrStyle}
                                            onChange={(e) =>
                                                setQrStyle(
                                                    e.target.value as
                                                        | "squares"
                                                        | "dots",
                                                )
                                            }
                                        >
                                            <option value="squares">
                                                {t("styleSquares")}
                                            </option>
                                            <option value="dots">
                                                {t("styleDots")}
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="qr-fg-color">
                                            {t("foregroundColor")}
                                        </Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="qr-fg-color"
                                                type="color"
                                                value={fgColor}
                                                onChange={(e) =>
                                                    setFgColor(e.target.value)
                                                }
                                                className="w-12"
                                            />
                                            <Input
                                                type="text"
                                                value={fgColor}
                                                onChange={(e) =>
                                                    setFgColor(e.target.value)
                                                }
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="qr-bg-color">
                                            {t("backgroundColor")}
                                        </Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="qr-bg-color"
                                                type="color"
                                                value={bgColor}
                                                onChange={(e) =>
                                                    setBgColor(e.target.value)
                                                }
                                                className="w-12"
                                            />
                                            <Input
                                                type="text"
                                                value={bgColor}
                                                onChange={(e) =>
                                                    setBgColor(e.target.value)
                                                }
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="qr-ec-level">
                                        {t("errorCorrection")}
                                    </Label>
                                    <select
                                        id="qr-ec-level"
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        value={ecLevel}
                                        onChange={(e) =>
                                            setEcLevel(
                                                e.target.value as
                                                    | "L"
                                                    | "M"
                                                    | "Q"
                                                    | "H",
                                            )
                                        }
                                    >
                                        <option value="L">
                                            {t("ecLevelL")}
                                        </option>
                                        <option value="M">
                                            {t("ecLevelM")}
                                        </option>
                                        <option value="Q">
                                            {t("ecLevelQ")}
                                        </option>
                                        <option value="H">
                                            {t("ecLevelH")}
                                        </option>
                                    </select>
                                    <p className="text-xs text-muted-foreground">
                                        {t("ecLevelDescription")}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">
                                    {t("logoOptions")}
                                </h3>

                                <div
                                    className={`border-2 border-dashed rounded-lg p-4 text-center ${isLoading ? "opacity-50" : ""}`}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                >
                                    {logoImage ? (
                                        <div className="relative inline-block">
                                            <img
                                                src={logoImage}
                                                alt="Logo"
                                                className="max-h-32 max-w-full rounded"
                                            />
                                            <button
                                                type="button"
                                                className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                onClick={handleRemoveLogo}
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="py-4">
                                            {isLoading ? (
                                                <Loader2 className="h-10 w-10 animate-spin mx-auto text-primary" />
                                            ) : (
                                                <>
                                                    <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                                                    <p className="text-sm text-muted-foreground">
                                                        {t("dragAndDropLogo")}
                                                    </p>
                                                    <Button
                                                        variant="outline"
                                                        className="mt-2"
                                                        onClick={() =>
                                                            fileInputRef.current?.click()
                                                        }
                                                    >
                                                        {t("chooseLogo")}
                                                    </Button>
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={
                                                            handleFileChange
                                                        }
                                                    />
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {logoImage && (
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="logo-size">
                                                {t("logoSize")}
                                            </Label>
                                            <Input
                                                id="logo-size"
                                                type="number"
                                                min="20"
                                                max="150"
                                                value={logoSize}
                                                onChange={(e) =>
                                                    setLogoSize(
                                                        Number(e.target.value),
                                                    )
                                                }
                                            />
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="remove-qr-behind-logo"
                                                checked={removeQrCodeBehindLogo}
                                                onCheckedChange={
                                                    setRemoveQrCodeBehindLogo
                                                }
                                            />
                                            <Label htmlFor="remove-qr-behind-logo">
                                                {t("removeQrBehindLogo")}
                                            </Label>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-lg font-medium">
                                    {t("frameOptions")}
                                </h3>

                                <div className="space-y-2">
                                    <Label htmlFor="frame-text">
                                        {t("frameText")}
                                    </Label>
                                    <Input
                                        id="frame-text"
                                        placeholder={t("frameTextPlaceholder")}
                                        value={frameText}
                                        onChange={(e) =>
                                            setFrameText(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="frame-text-color">
                                            {t("frameTextColor")}
                                        </Label>
                                        <div className="flex">
                                            <Input
                                                id="frame-text-color"
                                                type="color"
                                                value={frameTextColor}
                                                onChange={(e) =>
                                                    setFrameTextColor(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-12 p-1 h-10"
                                            />
                                            <Input
                                                type="text"
                                                value={frameTextColor}
                                                onChange={(e) =>
                                                    setFrameTextColor(
                                                        e.target.value,
                                                    )
                                                }
                                                className="flex-1 ml-2"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="frame-color">
                                            {t("frameColor")}
                                        </Label>
                                        <div className="flex">
                                            <Input
                                                id="frame-color"
                                                type="color"
                                                value={frameColor}
                                                onChange={(e) =>
                                                    setFrameColor(
                                                        e.target.value,
                                                    )
                                                }
                                                className="w-12 p-1 h-10"
                                            />
                                            <Input
                                                type="text"
                                                value={frameColor}
                                                onChange={(e) =>
                                                    setFrameColor(
                                                        e.target.value,
                                                    )
                                                }
                                                className="flex-1 ml-2"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-center justify-start space-y-6">
                            <div className="bg-muted p-4 rounded-lg w-full flex items-center justify-center">
                                {value ? (
                                    <div className="relative">
                                        {/* Frame with text */}
                                        {frameText && (
                                            <div
                                                className="absolute -top-10 left-0 right-0 text-center py-2 px-4 rounded-t-lg"
                                                style={{
                                                    backgroundColor: frameColor,
                                                    color: frameTextColor,
                                                }}
                                            >
                                                {frameText}
                                            </div>
                                        )}

                                        {/* QR Code */}
                                        <div
                                            className={frameText ? "pt-0" : ""}
                                        >
                                            <QRCode
                                                ref={qrCodeRef}
                                                value={value}
                                                size={size}
                                                fgColor={fgColor}
                                                bgColor={bgColor}
                                                logoImage={
                                                    logoImage || undefined
                                                }
                                                logoWidth={logoSize}
                                                logoHeight={logoSize}
                                                removeQrCodeBehindLogo={
                                                    removeQrCodeBehindLogo
                                                }
                                                qrStyle={qrStyle}
                                                ecLevel={ecLevel}
                                            />
                                        </div>

                                        {/* Frame bottom part */}
                                        {frameText && (
                                            <div
                                                className="absolute -bottom-10 left-0 right-0 h-10"
                                                style={{
                                                    backgroundColor: frameColor,
                                                }}
                                            ></div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-10">
                                        <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                                        <p className="text-muted-foreground">
                                            {t("previewPlaceholder")}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {error && (
                                <Alert variant="destructive" className="w-full">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleDownload}
                                disabled={!value}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                {t("download")}
                            </Button>

                            <div className="text-sm text-muted-foreground text-center w-full">
                                <p>{t("securityNote")}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default QRCodeGenerator;
