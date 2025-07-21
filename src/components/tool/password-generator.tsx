"use client";

import { useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, RefreshCw, Check, Shield, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslations } from "next-intl";

interface PasswordOptions {
    length: number;
    includeUppercase: boolean;
    includeLowercase: boolean;
    includeNumbers: boolean;
    includeSymbols: boolean;
}

export default function PasswordGenerator() {
    const t = useTranslations("Tools.passwordGenerator");
    const [password, setPassword] = useState("");
    const [copied, setCopied] = useState(false);
    const [showPassword, setShowPassword] = useState(true);
    const [options, setOptions] = useState<PasswordOptions>({
        length: 16,
        includeUppercase: true,
        includeLowercase: true,
        includeNumbers: true,
        includeSymbols: true,
    });

    const generatePassword = () => {
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
            return;
        }

        let result = "";
        const array = new Uint32Array(options.length);
        crypto.getRandomValues(array);

        for (let i = 0; i < options.length; i++) {
            result += charset[array[i] % charset.length];
        }

        setPassword(result);
        setCopied(false);
    };

    const copyToClipboard = async () => {
        if (password) {
            await navigator.clipboard.writeText(password);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const getPasswordStrength = () => {
        if (!password)
            return {
                score: 0,
                text: "Generate a password",
                color: "text-muted-foreground",
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

        if (score <= 2) return { score, text: "Weak", color: "text-red-500" };
        if (score <= 4)
            return { score, text: "Fair", color: "text-orange-500" };
        if (score <= 6) return { score, text: "Good", color: "text-blue-500" };
        return { score, text: "Strong", color: "text-green-500" };
    };

    const hasValidOptions = () => {
        return (
            options.includeUppercase ||
            options.includeLowercase ||
            options.includeNumbers ||
            options.includeSymbols
        );
    };

    const strength = getPasswordStrength();

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        {t("title")}
                    </CardTitle>
                    <CardDescription>{t("description")}</CardDescription>
                </CardHeader>

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

                    {/* Password Options */}
                    <div className="space-y-4">
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
                                className="rounded"
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
                                className="rounded"
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
                                className="rounded"
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
                                className="rounded"
                            />
                            <label htmlFor="symbols" className="text-sm">
                                {t("includeSymbols")}
                            </label>
                        </div>
                    </div>

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
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Input
                                    value={password}
                                    type={showPassword ? "text" : "password"}
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
                                    variant="outline"
                                    size="sm"
                                    onClick={copyToClipboard}
                                >
                                    {copied ? (
                                        <Check className="h-4 w-4 text-green-500" />
                                    ) : (
                                        <Copy className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                            {copied && (
                                <Alert>
                                    <AlertDescription>
                                        {t("copied")}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
