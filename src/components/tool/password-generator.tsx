"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, RefreshCw, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface PasswordOptions {
    length: number;
    includeUppercase: boolean;
    includeLowercase: boolean;
    includeNumbers: boolean;
    includeSymbols: boolean;
}

export default function PasswordGenerator() {
    const t = useTranslations("PasswordGenerator");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(true);
    const [warning, setWarning] = useState<string | null>(null);
    const [options, setOptions] = useState<PasswordOptions>({
        length: 16,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
    });

    const generatePassword = useCallback(() => {
        setWarning(null);

        const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lowercase = "abcdefghijklmnopqrstuvwxyz";
        const numbers = "0123456789";
        const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";

        let charset = "";
        if (options.includeUppercase) charset += uppercase;
        if (options.includeLowercase) charset += lowercase;
        if (options.includeNumbers) charset += numbers;
        if (options.includeSymbols) charset += symbols;

        if (charset === "") {
            setPassword("");
            setWarning(t("warnings.noCharacterSet"));
            return;
        }

        // Show warning for weak passwords
        if (options.length < 8) {
            setWarning(t("warnings.shortPassword"));
        } else if (
            options.length < 12 &&
            (!options.includeSymbols || !options.includeNumbers)
        ) {
            setWarning(t("warnings.weakPassword"));
        }

        let result = "";
        const array = new Uint32Array(options.length);
        crypto.getRandomValues(array);

        for (let i = 0; i < options.length; i++) {
            result += charset[array[i] % charset.length];
        }

        setPassword(result);
    }, [options, t]);

    const copyToClipboard = async () => {
        if (password) {
            await navigator.clipboard.writeText(password);
            toast.success(t("copied"));
        }
    };

    const getPasswordStrength = () => {
        if (!password)
            return {
                score: 0,
                text: t("strengthGenerate"),
                color: "text-muted-foreground",
                bgColor: "bg-muted",
            };

        let score = 0;
        const length = password.length;

        if (length >= 8) score += 1;
        if (length >= 12) score += 1;
        if (length >= 16) score += 1;
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        if (score <= 2)
            return {
                score,
                text: t("strengthWeak"),
                color: "text-red-500",
                bgColor: "bg-red-500",
            };
        if (score <= 4)
            return {
                score,
                text: t("strengthFair"),
                color: "text-orange-500",
                bgColor: "bg-orange-500",
            };
        if (score <= 6)
            return {
                score,
                text: t("strengthGood"),
                color: "text-blue-500",
                bgColor: "bg-blue-500",
            };
        return {
            score,
            text: t("strengthStrong"),
            color: "text-green-500",
            bgColor: "bg-green-500",
        };
    };

    const strength = getPasswordStrength();

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="space-y-6">
                    {/* Password Length */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium">
                            {t("length")}: {options.length}
                        </label>
                        <Input
                            type="range"
                            min="4"
                            max="100"
                            value={options.length}
                            onChange={(e) =>
                                setOptions({
                                    ...options,
                                    length: parseInt(e.target.value),
                                })
                            }
                            className="w-full"
                        />
                    </div>

                    {/* Password Options - Improved responsive styling */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium">
                            {t("characterSets")}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="uppercase"
                                    checked={options.includeUppercase}
                                    onChange={(e) =>
                                        setOptions({
                                            ...options,
                                            includeUppercase: e.target.checked,
                                        })
                                    }
                                    className="rounded border-gray-300"
                                />
                                <label htmlFor="uppercase" className="text-sm">
                                    {t("includeUppercase")}
                                </label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="lowercase"
                                    checked={options.includeLowercase}
                                    onChange={(e) =>
                                        setOptions({
                                            ...options,
                                            includeLowercase: e.target.checked,
                                        })
                                    }
                                    className="rounded border-gray-300"
                                />
                                <label htmlFor="lowercase" className="text-sm">
                                    {t("includeLowercase")}
                                </label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="numbers"
                                    checked={options.includeNumbers}
                                    onChange={(e) =>
                                        setOptions({
                                            ...options,
                                            includeNumbers: e.target.checked,
                                        })
                                    }
                                    className="rounded border-gray-300"
                                />
                                <label htmlFor="numbers" className="text-sm">
                                    {t("includeNumbers")}
                                </label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="symbols"
                                    checked={options.includeSymbols}
                                    onChange={(e) =>
                                        setOptions({
                                            ...options,
                                            includeSymbols: e.target.checked,
                                        })
                                    }
                                    className="rounded border-gray-300"
                                />
                                <label htmlFor="symbols" className="text-sm">
                                    {t("includeSymbols")}
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Warning Display */}
                    {warning && (
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{warning}</AlertDescription>
                        </Alert>
                    )}

                    {/* Generate Button */}
                    <Button
                        onClick={generatePassword}
                        className="w-full flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        {t("generate")}
                    </Button>

                    {/* Generated Password */}
                    {password && (
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <label className="text-sm font-medium">
                                    {t("generatedPassword")}
                                </label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        value={password}
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        readOnly
                                        className="flex-1 font-mono"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                    <Button
                                        variant={
                                            password ? "default" : "outline"
                                        }
                                        size="sm"
                                        onClick={copyToClipboard}
                                        disabled={!password}
                                        className="flex items-center gap-2"
                                    >
                                        <Copy className="h-4 w-4" />
                                        <span className="text-sm">
                                            {t("copy")}
                                        </span>
                                    </Button>
                                </div>
                            </div>

                            {/* Password Strength Indicator */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>{t("passwordStrength")}:</span>
                                    <span className={strength.color}>
                                        {strength.text}
                                    </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${strength.bgColor}`}
                                        style={{
                                            width: `${(strength.score / 7) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
