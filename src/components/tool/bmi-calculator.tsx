"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function BMICalculator() {
    const t = useTranslations("BMICalculator");
    const [height, setHeight] = useState<string>("");
    const [weight, setWeight] = useState<string>("");
    const [unit, setUnit] = useState<"metric" | "imperial">("metric");
    const [bmi, setBMI] = useState<number | null>(null);
    const [category, setCategory] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const calculateBMI = useCallback(() => {
        setError(null);

        // Validate inputs
        if (!height || !weight) {
            setError(t("errors.emptyFields"));
            return;
        }

        const heightValue = parseFloat(height);
        const weightValue = parseFloat(weight);

        if (isNaN(heightValue) || isNaN(weightValue)) {
            setError(t("errors.invalidNumbers"));
            return;
        }

        if (heightValue <= 0 || weightValue <= 0) {
            setError(t("errors.positiveNumbers"));
            return;
        }

        let bmiValue: number;

        if (unit === "metric") {
            // BMI = weight(kg) / height(m)²
            const heightInMeters = heightValue / 100; // Convert cm to meters
            bmiValue = weightValue / (heightInMeters * heightInMeters);
        } else {
            // BMI = 703 × weight(lb) / height(in)²
            bmiValue = (703 * weightValue) / (heightValue * heightValue);
        }

        // Round to 1 decimal place
        bmiValue = Math.round(bmiValue * 10) / 10;
        setBMI(bmiValue);

        // Determine BMI category
        if (bmiValue < 18.5) {
            setCategory(t("categories.underweight"));
        } else if (bmiValue < 25) {
            setCategory(t("categories.normal"));
        } else if (bmiValue < 30) {
            setCategory(t("categories.overweight"));
        } else {
            setCategory(t("categories.obese"));
        }
    }, [height, weight, unit, t]);

    const resetCalculator = () => {
        setHeight("");
        setWeight("");
        setBMI(null);
        setCategory("");
        setError(null);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t("unitSystem")}</Label>
                            <RadioGroup
                                value={unit}
                                onValueChange={(value) =>
                                    setUnit(value as "metric" | "imperial")
                                }
                                className="flex space-x-4"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                        value="metric"
                                        id="metric"
                                    />
                                    <Label
                                        htmlFor="metric"
                                        className="cursor-pointer"
                                    >
                                        {t("metric")}
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                        value="imperial"
                                        id="imperial"
                                    />
                                    <Label
                                        htmlFor="imperial"
                                        className="cursor-pointer"
                                    >
                                        {t("imperial")}
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="height">
                                {unit === "metric"
                                    ? t("heightCm")
                                    : t("heightIn")}
                            </Label>
                            <Input
                                id="height"
                                type="number"
                                min={0}
                                value={height}
                                onChange={(e) => setHeight(e.target.value)}
                                placeholder={unit === "metric" ? "175" : "69"}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="weight">
                                {unit === "metric"
                                    ? t("weightKg")
                                    : t("weightLb")}
                            </Label>
                            <Input
                                id="weight"
                                type="number"
                                min={0}
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                placeholder={unit === "metric" ? "70" : "154"}
                            />
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="flex space-x-2">
                            <Button onClick={calculateBMI} className="flex-1">
                                {t("calculate")}
                            </Button>
                            <Button
                                onClick={resetCalculator}
                                variant="outline"
                                className="flex-1"
                            >
                                {t("reset")}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {bmi !== null && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium">
                                    {t("results")}
                                </h3>
                                <div className="mt-2 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            {t("yourBMI")}
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {bmi}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            {t("category")}
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {category}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-md font-medium">
                                    {t("whatItMeans")}
                                </h4>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {t("bmiExplanation")}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
