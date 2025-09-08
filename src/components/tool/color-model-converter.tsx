"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Copy } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { trackToolUsage } from "@/lib/analytics";

// Color conversion utilities
const hexToRgb = (hex: string): [number, number, number] | null => {
    // Remove # if present
    hex = hex.replace(/^#/, "");

    // Handle shorthand hex
    if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }

    // Validate hex format
    if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
        return null;
    }

    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return [r, g, b];
};

const rgbToHex = (r: number, g: number, b: number): string => {
    return (
        "#" +
        [r, g, b]
            .map((x) => {
                const hex = Math.max(0, Math.min(255, Math.round(x))).toString(
                    16,
                );
                return hex.length === 1 ? "0" + hex : hex;
            })
            .join("")
    );
};

const rgbToHsl = (
    r: number,
    g: number,
    b: number,
): [number, number, number] => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0,
        s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }

        h /= 6;
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
};

const hslToRgb = (
    h: number,
    s: number,
    l: number,
): [number, number, number] => {
    h /= 360;
    s /= 100;
    l /= 100;

    let r, g, b;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;

        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

const rgbToHsv = (
    r: number,
    g: number,
    b: number,
): [number, number, number] => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    const v = max;
    const d = max - min;
    const s = max === 0 ? 0 : d / max;

    if (max !== min) {
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
        }
        h /= 6;
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(v * 100)];
};

const hsvToRgb = (
    h: number,
    s: number,
    v: number,
): [number, number, number] => {
    h /= 360;
    s /= 100;
    v /= 100;

    let r, g, b;

    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);

    switch (i % 6) {
        case 0:
            r = v;
            g = t;
            b = p;
            break;
        case 1:
            r = q;
            g = v;
            b = p;
            break;
        case 2:
            r = p;
            g = v;
            b = t;
            break;
        case 3:
            r = p;
            g = q;
            b = v;
            break;
        case 4:
            r = t;
            g = p;
            b = v;
            break;
        case 5:
            r = v;
            g = p;
            b = q;
            break;
        default:
            r = 0;
            g = 0;
            b = 0;
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

// Linear sRGB to OKLAB conversion
const linearRgbToOklab = (
    r: number,
    g: number,
    b: number,
): [number, number, number] => {
    // Normalize RGB values to 0-1
    r = r / 255;
    g = g / 255;
    b = b / 255;

    // Convert sRGB to linear RGB
    r = r <= 0.04045 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    g = g <= 0.04045 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    b = b <= 0.04045 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    // Convert linear RGB to OKLAB
    const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
    const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
    const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

    const l_ = Math.cbrt(l);
    const m_ = Math.cbrt(m);
    const s_ = Math.cbrt(s);

    const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
    const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
    const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

    // Scale for display
    return [L, a, b_];
};

const oklabToLinearRgb = (
    L: number,
    a: number,
    b: number,
): [number, number, number] => {
    // Convert OKLAB to linear RGB
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.291485548 * b;

    const l = l_ * l_ * l_;
    const m = m_ * m_ * m_;
    const s = s_ * s_ * s_;

    const r = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    const b_ = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

    // Convert linear RGB to sRGB
    const r_srgb =
        r <= 0.0031308 ? r * 12.92 : 1.055 * Math.pow(r, 1 / 2.4) - 0.055;
    const g_srgb =
        g <= 0.0031308 ? g * 12.92 : 1.055 * Math.pow(g, 1 / 2.4) - 0.055;
    const b_srgb =
        b_ <= 0.0031308 ? b_ * 12.92 : 1.055 * Math.pow(b_, 1 / 2.4) - 0.055;

    // Scale back to 0-255 and clamp
    return [
        Math.max(0, Math.min(255, Math.round(r_srgb * 255))),
        Math.max(0, Math.min(255, Math.round(g_srgb * 255))),
        Math.max(0, Math.min(255, Math.round(b_srgb * 255))),
    ];
};

// OKLAB to OKLCH conversion
const oklabToOklch = (
    L: number,
    a: number,
    b: number,
): [number, number, number] => {
    const C = Math.sqrt(a * a + b * b);
    let h = (Math.atan2(b, a) * 180) / Math.PI;
    if (h < 0) h += 360;

    return [L, C, h];
};

// OKLCH to OKLAB conversion
const oklchToOklab = (
    L: number,
    C: number,
    h: number,
): [number, number, number] => {
    const hRad = (h * Math.PI) / 180;
    const a = C * Math.cos(hRad);
    const b = C * Math.sin(hRad);

    return [L, a, b];
};

export const ColorModelConverter = () => {
    const t = useTranslations("ColorModelConverter");

    // State for each color model
    const [hex, setHex] = useState<string>("#3498db");
    const [rgb, setRgb] = useState<[number, number, number]>([52, 152, 219]);
    const [hsl, setHsl] = useState<[number, number, number]>([204, 70, 53]);
    const [hsv, setHsv] = useState<[number, number, number]>([204, 76, 86]);
    const [oklab, setOklab] = useState<[number, number, number]>([
        0.6, -0.1, -0.2,
    ]);
    const [oklch, setOklch] = useState<[number, number, number]>([
        0.6, 0.22, 243,
    ]);

    const [error, setError] = useState<string | null>(null);

    // Track usage
    useEffect(() => {
        trackToolUsage("color-model-converter");
    }, []);

    // Update all color models when hex changes
    const updateFromHex = (hexValue: string) => {
        if (!/^#[0-9A-Fa-f]{3}(?:[0-9A-Fa-f]{3})?$/.test(hexValue)) {
            setError(t("errors.invalidHex"));
            return;
        }

        setError(null);
        setHex(hexValue);

        const rgbValues = hexToRgb(hexValue);
        if (!rgbValues) return;

        setRgb(rgbValues);
        setHsl(rgbToHsl(...rgbValues));
        setHsv(rgbToHsv(...rgbValues));

        const oklabValues = linearRgbToOklab(...rgbValues);
        setOklab(oklabValues);
        setOklch(oklabToOklch(...oklabValues));
    };

    // Update all color models when RGB changes
    const updateFromRgb = (r: number, g: number, b: number) => {
        if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
            setError(t("errors.invalidRgb"));
            return;
        }

        setError(null);
        const rgbValues: [number, number, number] = [r, g, b];
        setRgb(rgbValues);

        setHex(rgbToHex(r, g, b));
        setHsl(rgbToHsl(r, g, b));
        setHsv(rgbToHsv(r, g, b));

        const oklabValues = linearRgbToOklab(r, g, b);
        setOklab(oklabValues);
        setOklch(oklabToOklch(...oklabValues));
    };

    // Update all color models when HSL changes
    const updateFromHsl = (h: number, s: number, l: number) => {
        if (h < 0 || h > 360 || s < 0 || s > 100 || l < 0 || l > 100) {
            setError(t("errors.invalidHsl"));
            return;
        }

        setError(null);
        setHsl([h, s, l]);

        const rgbValues = hslToRgb(h, s, l);
        setRgb(rgbValues);
        setHex(rgbToHex(...rgbValues));
        setHsv(rgbToHsv(...rgbValues));

        const oklabValues = linearRgbToOklab(...rgbValues);
        setOklab(oklabValues);
        setOklch(oklabToOklch(...oklabValues));
    };

    // Update all color models when HSV changes
    const updateFromHsv = (h: number, s: number, v: number) => {
        if (h < 0 || h > 360 || s < 0 || s > 100 || v < 0 || v > 100) {
            setError(t("errors.invalidHsv"));
            return;
        }

        setError(null);
        setHsv([h, s, v]);

        const rgbValues = hsvToRgb(h, s, v);
        setRgb(rgbValues);
        setHex(rgbToHex(...rgbValues));
        setHsl(rgbToHsl(...rgbValues));

        const oklabValues = linearRgbToOklab(...rgbValues);
        setOklab(oklabValues);
        setOklch(oklabToOklch(...oklabValues));
    };

    // Update all color models when OKLAB changes
    const updateFromOklab = (L: number, a: number, b: number) => {
        try {
            setError(null);
            setOklab([L, a, b]);

            setOklch(oklabToOklch(L, a, b));

            const rgbValues = oklabToLinearRgb(L, a, b);
            setRgb(rgbValues);
            setHex(rgbToHex(...rgbValues));
            setHsl(rgbToHsl(...rgbValues));
            setHsv(rgbToHsv(...rgbValues));
        } catch (e) {
            console.log(e);
            setError(t("errors.invalidOklab"));
        }
    };

    // Update all color models when OKLCH changes
    const updateFromOklch = (L: number, C: number, h: number) => {
        try {
            setError(null);
            setOklch([L, C, h]);

            const oklabValues = oklchToOklab(L, C, h);
            setOklab(oklabValues);

            const rgbValues = oklabToLinearRgb(...oklabValues);
            setRgb(rgbValues);
            setHex(rgbToHex(...rgbValues));
            setHsl(rgbToHsl(...rgbValues));
            setHsv(rgbToHsv(...rgbValues));
        } catch (e) {
            console.log(e);
            setError(t("errors.invalidOklch"));
        }
    };

    // Copy color value to clipboard
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success(t("copied"));
    };

    // Reset to default color
    const resetColor = () => {
        updateFromHex("#3498db");
    };

    return (
        <div className="space-y-6">
            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Color Preview */}
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <Label>{t("colorPreview")}</Label>
                        <Input
                            type="color"
                            onChange={(e) => updateFromHex(e.target.value)}
                            value={hex}
                            className="w-full h-32 rounded-md border p-0"
                        />
                        <div className="flex justify-end">
                            <Button variant="outline" onClick={resetColor}>
                                {t("reset")}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* HEX Input */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <Label htmlFor="hex-input">{t("hexColor")}</Label>
                            <div className="flex space-x-2">
                                <Input
                                    id="hex-input"
                                    value={hex}
                                    onChange={(e) =>
                                        updateFromHex(e.target.value)
                                    }
                                    placeholder={t("enterHex")}
                                />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => copyToClipboard(hex)}
                                >
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* RGB Input */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <Label>{t("rgbColor")}</Label>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="rgb-r">R(Red)</Label>
                                    <Input
                                        id="rgb-r"
                                        type="number"
                                        min="0"
                                        max="255"
                                        value={rgb[0]}
                                        onChange={(e) =>
                                            updateFromRgb(
                                                parseInt(e.target.value) || 0,
                                                rgb[1],
                                                rgb[2],
                                            )
                                        }
                                    />
                                    <Slider
                                        value={[rgb[0]]}
                                        min={0}
                                        max={255}
                                        step={1}
                                        onValueChange={(value) =>
                                            updateFromRgb(
                                                value[0],
                                                rgb[1],
                                                rgb[2],
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rgb-g">G(Green)</Label>
                                    <Input
                                        id="rgb-g"
                                        type="number"
                                        min="0"
                                        max="255"
                                        value={rgb[1]}
                                        onChange={(e) =>
                                            updateFromRgb(
                                                rgb[0],
                                                parseInt(e.target.value) || 0,
                                                rgb[2],
                                            )
                                        }
                                    />
                                    <Slider
                                        value={[rgb[1]]}
                                        min={0}
                                        max={255}
                                        step={1}
                                        onValueChange={(value) =>
                                            updateFromRgb(
                                                rgb[0],
                                                value[0],
                                                rgb[2],
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="rgb-b">B(Blue)</Label>
                                    <Input
                                        id="rgb-b"
                                        type="number"
                                        min="0"
                                        max="255"
                                        value={rgb[2]}
                                        onChange={(e) =>
                                            updateFromRgb(
                                                rgb[0],
                                                rgb[1],
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                    />
                                    <Slider
                                        value={[rgb[2]]}
                                        min={0}
                                        max={255}
                                        step={1}
                                        onValueChange={(value) =>
                                            updateFromRgb(
                                                rgb[0],
                                                rgb[1],
                                                value[0],
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() =>
                                    copyToClipboard(
                                        `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
                                    )
                                }
                            >
                                <Copy className="h-4 w-4" />
                                rgb({rgb[0]}, {rgb[1]}, {rgb[2]})
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* HSL Input */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <Label>{t("hslColor")}</Label>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="hsl-h">H</Label>
                                    <Input
                                        id="hsl-h"
                                        type="number"
                                        min="0"
                                        max="360"
                                        value={hsl[0]}
                                        onChange={(e) =>
                                            updateFromHsl(
                                                parseInt(e.target.value) || 0,
                                                hsl[1],
                                                hsl[2],
                                            )
                                        }
                                    />
                                    <Slider
                                        value={[hsl[0]]}
                                        min={0}
                                        max={360}
                                        step={1}
                                        onValueChange={(value) =>
                                            updateFromHsl(
                                                value[0],
                                                hsl[1],
                                                hsl[2],
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hsl-s">S</Label>
                                    <Input
                                        id="hsl-s"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={hsl[1]}
                                        onChange={(e) =>
                                            updateFromHsl(
                                                hsl[0],
                                                parseInt(e.target.value) || 0,
                                                hsl[2],
                                            )
                                        }
                                    />
                                    <Slider
                                        value={[hsl[1]]}
                                        min={0}
                                        max={100}
                                        step={1}
                                        onValueChange={(value) =>
                                            updateFromHsl(
                                                hsl[0],
                                                value[0],
                                                hsl[2],
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hsl-l">L</Label>
                                    <Input
                                        id="hsl-l"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={hsl[2]}
                                        onChange={(e) =>
                                            updateFromHsl(
                                                hsl[0],
                                                hsl[1],
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                    />
                                    <Slider
                                        value={[hsl[2]]}
                                        min={0}
                                        max={100}
                                        step={1}
                                        onValueChange={(value) =>
                                            updateFromHsl(
                                                hsl[0],
                                                hsl[1],
                                                value[0],
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() =>
                                    copyToClipboard(
                                        `hsl(${hsl[0]}, ${hsl[1]}%, ${hsl[2]}%)`,
                                    )
                                }
                            >
                                <Copy className="h-4 w-4" />
                                hsl({hsl[0]}, {hsl[1]}%, {hsl[2]}%)
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* HSV Input */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <Label>{t("hsvColor")}</Label>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="hsv-h">H</Label>
                                    <Input
                                        id="hsv-h"
                                        type="number"
                                        min="0"
                                        max="360"
                                        value={hsv[0]}
                                        onChange={(e) =>
                                            updateFromHsv(
                                                parseInt(e.target.value) || 0,
                                                hsv[1],
                                                hsv[2],
                                            )
                                        }
                                    />
                                    <Slider
                                        value={[hsv[0]]}
                                        min={0}
                                        max={360}
                                        step={1}
                                        onValueChange={(value) =>
                                            updateFromHsv(
                                                value[0],
                                                hsv[1],
                                                hsv[2],
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hsv-s">S</Label>
                                    <Input
                                        id="hsv-s"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={hsv[1]}
                                        onChange={(e) =>
                                            updateFromHsv(
                                                hsv[0],
                                                parseInt(e.target.value) || 0,
                                                hsv[2],
                                            )
                                        }
                                    />
                                    <Slider
                                        value={[hsv[1]]}
                                        min={0}
                                        max={100}
                                        step={1}
                                        onValueChange={(value) =>
                                            updateFromHsv(
                                                hsv[0],
                                                value[0],
                                                hsv[2],
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="hsv-v">V</Label>
                                    <Input
                                        id="hsv-v"
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={hsv[2]}
                                        onChange={(e) =>
                                            updateFromHsv(
                                                hsv[0],
                                                hsv[1],
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                    />
                                    <Slider
                                        value={[hsv[2]]}
                                        min={0}
                                        max={100}
                                        step={1}
                                        onValueChange={(value) =>
                                            updateFromHsv(
                                                hsv[0],
                                                hsv[1],
                                                value[0],
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() =>
                                    copyToClipboard(
                                        `hsv(${hsv[0]}, ${hsv[1]}%, ${hsv[2]}%)`,
                                    )
                                }
                            >
                                <Copy className="h-4 w-4" />
                                hsv({hsv[0]}, {hsv[1]}%, {hsv[2]}%)
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* OKLAB Input */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <Label>{t("oklabColor")}</Label>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="oklab-l">L</Label>
                                    <Input
                                        id="oklab-l"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="1"
                                        value={oklab[0].toFixed(2)}
                                        onChange={(e) =>
                                            updateFromOklab(
                                                parseFloat(e.target.value) || 0,
                                                oklab[1],
                                                oklab[2],
                                            )
                                        }
                                    />
                                    <Slider
                                        value={[oklab[0]]}
                                        min={0}
                                        max={1}
                                        step={0.01}
                                        onValueChange={(value) =>
                                            updateFromOklab(
                                                value[0],
                                                oklab[1],
                                                oklab[2],
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="oklab-a">A</Label>
                                    <Input
                                        id="oklab-a"
                                        type="number"
                                        step="0.01"
                                        min="-0.4"
                                        max="0.4"
                                        value={oklab[1].toFixed(2)}
                                        onChange={(e) =>
                                            updateFromOklab(
                                                oklab[0],
                                                parseFloat(e.target.value) || 0,
                                                oklab[2],
                                            )
                                        }
                                    />
                                    <Slider
                                        value={[oklab[1]]}
                                        min={-0.4}
                                        max={0.4}
                                        step={0.01}
                                        onValueChange={(value) =>
                                            updateFromOklab(
                                                oklab[0],
                                                value[0],
                                                oklab[2],
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="oklab-b">B</Label>
                                    <Input
                                        id="oklab-b"
                                        type="number"
                                        step="0.01"
                                        min="-0.4"
                                        max="0.4"
                                        value={oklab[2].toFixed(2)}
                                        onChange={(e) =>
                                            updateFromOklab(
                                                oklab[0],
                                                oklab[1],
                                                parseFloat(e.target.value) || 0,
                                            )
                                        }
                                    />
                                    <Slider
                                        value={[oklab[2]]}
                                        min={-0.4}
                                        max={0.4}
                                        step={0.01}
                                        onValueChange={(value) =>
                                            updateFromOklab(
                                                oklab[0],
                                                oklab[1],
                                                value[0],
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() =>
                                    copyToClipboard(
                                        `oklab(${oklab[0].toFixed(2)} ${oklab[1].toFixed(2)} ${oklab[2].toFixed(2)})`,
                                    )
                                }
                            >
                                <Copy className="h-4 w-4" />
                                oklab({oklab[0].toFixed(2)}{" "}
                                {oklab[1].toFixed(2)} {oklab[2].toFixed(2)})
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* OKLCH Input */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <Label>{t("oklchColor")}</Label>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="oklch-l">L</Label>
                                    <Input
                                        id="oklch-l"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="1"
                                        value={oklch[0].toFixed(2)}
                                        onChange={(e) =>
                                            updateFromOklch(
                                                parseFloat(e.target.value) || 0,
                                                oklch[1],
                                                oklch[2],
                                            )
                                        }
                                    />
                                    <Slider
                                        value={[oklch[0]]}
                                        min={0}
                                        max={1}
                                        step={0.01}
                                        onValueChange={(value) =>
                                            updateFromOklch(
                                                value[0],
                                                oklch[1],
                                                oklch[2],
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="oklch-c">C</Label>
                                    <Input
                                        id="oklch-c"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        max="0.4"
                                        value={oklch[1].toFixed(2)}
                                        onChange={(e) =>
                                            updateFromOklch(
                                                oklch[0],
                                                parseFloat(e.target.value) || 0,
                                                oklch[2],
                                            )
                                        }
                                    />
                                    <Slider
                                        value={[oklch[1]]}
                                        min={0}
                                        max={0.4}
                                        step={0.01}
                                        onValueChange={(value) =>
                                            updateFromOklch(
                                                oklch[0],
                                                value[0],
                                                oklch[2],
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="oklch-h">H</Label>
                                    <Input
                                        id="oklch-h"
                                        type="number"
                                        min="0"
                                        max="360"
                                        value={Math.round(oklch[2])}
                                        onChange={(e) =>
                                            updateFromOklch(
                                                oklch[0],
                                                oklch[1],
                                                parseInt(e.target.value) || 0,
                                            )
                                        }
                                    />
                                    <Slider
                                        value={[oklch[2]]}
                                        min={0}
                                        max={360}
                                        step={1}
                                        onValueChange={(value) =>
                                            updateFromOklch(
                                                oklch[0],
                                                oklch[1],
                                                value[0],
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() =>
                                    copyToClipboard(
                                        `oklch(${oklch[0].toFixed(2)} ${oklch[1].toFixed(2)} ${Math.round(oklch[2])})`,
                                    )
                                }
                            >
                                <Copy className="h-4 w-4" />
                                oklch({oklch[0].toFixed(2)}{" "}
                                {oklch[1].toFixed(2)} {Math.round(oklch[2])})
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
