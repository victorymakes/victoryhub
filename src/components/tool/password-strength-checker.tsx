"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useTranslations } from "next-intl";
import { trackToolUsage } from "@/lib/analytics";

export default function PasswordStrengthChecker() {
    const t = useTranslations("PasswordStrengthChecker");
    const [password, setPassword] = useState("");
    const [result, setResult] = useState<{
        score: number;
        text: string;
        color: string;
        bgColor: string;
        feedback: string;
    } | null>(null);

    // improvement: try to use https://zxcvbn-ts.github.io/zxcvbn/
    const checkPasswordStrength = () => {
        if (!password.trim()) {
            setResult(null);
            return;
        }

        // Track usage
        trackToolUsage("password-strength-checker");

        // Check password strength
        let score = 0;
        const length = password.length;

        // Length checks
        if (length >= 8) score += 1;
        if (length >= 12) score += 1;
        if (length >= 16) score += 1;

        // Character variety checks
        if (/[a-z]/.test(password)) score += 1;
        if (/[A-Z]/.test(password)) score += 1;
        if (/[0-9]/.test(password)) score += 1;
        if (/[^A-Za-z0-9]/.test(password)) score += 1;

        // Common patterns and dictionary words check (simplified)
        const commonPatterns = [
            /^123456/,
            /^password/i,
            /^qwerty/i,
            /^admin/i,
            /^welcome/i,
            /^letmein/i,
            /^abc123/i,
            /^monkey/i,
            /^1234/,
            /^111111/,
            /^12345/,
            /^123123/,
            /^dragon/i,
            /^baseball/i,
            /^football/i,
            /^master/i,
            /^shadow/i,
            /^superman/i,
            /^trustno1/i,
            /^hello/i,
        ];

        // Check for common patterns
        const hasCommonPattern = commonPatterns.some((pattern) =>
            pattern.test(password),
        );
        if (hasCommonPattern) score = Math.max(0, score - 2); // Penalize common patterns

        // Check for sequential characters
        if (
            /(?:abcdef|bcdefg|cdefgh|defghi|efghij|fghijk|ghijkl|hijklm|ijklmn|jklmno|klmnop|lmnopq|mnopqr|nopqrs|opqrst|pqrstu|qrstuv|rstuvw|stuvwx|tuvwxy|uvwxyz|012345|123456|234567|345678|456789)/i.test(
                password,
            )
        ) {
            score = Math.max(0, score - 1); // Penalize sequential characters
        }

        // Check for repeated characters
        if (/(.)(\1{2,})/i.test(password)) {
            score = Math.max(0, score - 1); // Penalize repeated characters
        }

        // Determine result based on score
        let result;
        if (score <= 2) {
            result = {
                score,
                text: t("strengthWeak"),
                color: "text-red-500",
                bgColor: "bg-red-500",
                feedback: t("feedbackWeak"),
            };
        } else if (score <= 4) {
            result = {
                score,
                text: t("strengthFair"),
                color: "text-orange-500",
                bgColor: "bg-orange-500",
                feedback: t("feedbackFair"),
            };
        } else if (score <= 6) {
            result = {
                score,
                text: t("strengthGood"),
                color: "text-blue-500",
                bgColor: "bg-blue-500",
                feedback: t("feedbackGood"),
            };
        } else {
            result = {
                score,
                text: t("strengthStrong"),
                color: "text-green-500",
                bgColor: "bg-green-500",
                feedback: t("feedbackStrong"),
            };
        }

        setResult(result);
    };

    // Check password strength whenever password changes
    useEffect(() => {
        checkPasswordStrength();
    }, [password]);

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="pt-6 space-y-6">
                    {/* Password Input */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium">
                            {t("enterPassword")}
                        </label>
                        <Input
                            type="text"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t("passwordPlaceholder")}
                            className="w-full font-mono text-sm"
                        />
                    </div>

                    {/* Password Strength Result */}
                    {result && (
                        <div className="space-y-4">
                            {/* Strength Indicator */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span>{t("passwordStrength")}:</span>
                                    <span className={result.color}>
                                        {result.text}
                                    </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${result.bgColor}`}
                                        style={{
                                            width: `${(result.score / 7) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Feedback */}
                            <Alert
                                className={`border-l-4 border-${result.color.replace("text-", "")}`}
                            >
                                {result.score <= 4 ? (
                                    <AlertTriangle className="h-4 w-4" />
                                ) : (
                                    <Check className="h-4 w-4" />
                                )}
                                <AlertDescription>
                                    {result.feedback}
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setPassword("");
                                setResult(null);
                            }}
                            className="flex-1"
                        >
                            {t("clear")}
                        </Button>
                        <Button
                            onClick={checkPasswordStrength}
                            className="flex-1"
                        >
                            {t("checkButton")}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
