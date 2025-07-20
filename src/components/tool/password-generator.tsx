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

interface PasswordOptions {
    length: number;
    includeUppercase: boolean;
    includeLowercase: boolean;
    includeNumbers: boolean;
    includeSymbols: boolean;
}

export default function PasswordGenerator() {
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
                        Password Generator
                    </CardTitle>
                    <CardDescription>
                        Generate secure, random passwords with customizable
                        options
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                    {!hasValidOptions() && (
                        <Alert variant="destructive">
                            <AlertDescription>
                                Please select at least one character type to
                                generate a password.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Password Output */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">
                                Generated Password
                            </label>
                            <div className="flex items-center gap-2">
                                <span
                                    className={`text-xs font-medium ${strength.color}`}
                                >
                                    {strength.text}
                                </span>
                                <Button
                                    variant="ghost"
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
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Input
                                value={password}
                                readOnly
                                type={showPassword ? "text" : "password"}
                                placeholder="Click 'Generate Password' to create a secure password"
                                className="font-mono text-sm"
                            />
                            <Button
                                onClick={copyToClipboard}
                                disabled={!password}
                                variant="outline"
                                size="sm"
                            >
                                {copied ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                ) : (
                                    <Copy className="h-4 w-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Password Options */}
                    <Card>
                        <CardContent className="pt-6 space-y-4">
                            <div className="space-y-3">
                                <label className="text-sm font-medium">
                                    Password Length: {options.length}
                                </label>
                                <input
                                    type="range"
                                    min="4"
                                    max="128"
                                    value={options.length}
                                    onChange={(e) =>
                                        setOptions({
                                            ...options,
                                            length: parseInt(e.target.value),
                                        })
                                    }
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>4</span>
                                    <span>128</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={options.includeUppercase}
                                        onChange={(e) =>
                                            setOptions({
                                                ...options,
                                                includeUppercase:
                                                    e.target.checked,
                                            })
                                        }
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm">
                                        Uppercase (A-Z)
                                    </span>
                                </label>

                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={options.includeLowercase}
                                        onChange={(e) =>
                                            setOptions({
                                                ...options,
                                                includeLowercase:
                                                    e.target.checked,
                                            })
                                        }
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm">
                                        Lowercase (a-z)
                                    </span>
                                </label>

                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={options.includeNumbers}
                                        onChange={(e) =>
                                            setOptions({
                                                ...options,
                                                includeNumbers:
                                                    e.target.checked,
                                            })
                                        }
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm">
                                        Numbers (0-9)
                                    </span>
                                </label>

                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={options.includeSymbols}
                                        onChange={(e) =>
                                            setOptions({
                                                ...options,
                                                includeSymbols:
                                                    e.target.checked,
                                            })
                                        }
                                        className="rounded border-gray-300"
                                    />
                                    <span className="text-sm">
                                        Symbols (!@#$...)
                                    </span>
                                </label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Generate Button */}
                    <Button
                        onClick={generatePassword}
                        disabled={!hasValidOptions()}
                        className="w-full"
                        size="lg"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Generate Password
                    </Button>

                    {/* Security Note */}
                    <div className="rounded-lg bg-muted/50 p-4">
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            <strong>Security Note:</strong> Passwords are
                            generated locally using cryptographically secure
                            random number generation. No passwords are stored or
                            transmitted to any server. Always use unique
                            passwords for different accounts.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
