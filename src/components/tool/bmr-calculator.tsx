"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Activity level multipliers
export enum ActivityLevel {
    SEDENTARY = "SEDENTARY",
    LIGHT = "LIGHT",
    MODERATE = "MODERATE",
    ACTIVE = "ACTIVE",
    VERY_ACTIVE = "VERY_ACTIVE",
}

export default function BMRCalculator() {
    const t = useTranslations("BMRCalculator");
    const [age, setAge] = useState<string>("");
    const [height, setHeight] = useState<string>("");
    const [weight, setWeight] = useState<string>("");
    const [gender, setGender] = useState<"male" | "female">("male");
    const [unit, setUnit] = useState<"metric" | "imperial">("metric");
    const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
        ActivityLevel.MODERATE,
    );
    const [bmr, setBMR] = useState<number | null>(null);
    const [tdee, setTDEE] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const getActivityMultiplier = (level: ActivityLevel): number => {
        switch (level) {
            case ActivityLevel.SEDENTARY:
                return 1.2; // Little or no exercise
            case ActivityLevel.LIGHT:
                return 1.375; // Light exercise 1-3 days/week
            case ActivityLevel.MODERATE:
                return 1.55; // Moderate exercise 3-5 days/week
            case ActivityLevel.ACTIVE:
                return 1.725; // Hard exercise 6-7 days/week
            case ActivityLevel.VERY_ACTIVE:
                return 1.9; // Very hard exercise & physical job or 2x training
            default:
                return 1.55; // Default to moderate
        }
    };

    const calculateBMR = useCallback(() => {
        setError(null);

        // Validate inputs
        if (!age || !height || !weight) {
            setError(t("errors.emptyFields"));
            return;
        }

        const ageValue = parseFloat(age);
        const heightValue = parseFloat(height);
        const weightValue = parseFloat(weight);

        if (isNaN(ageValue) || isNaN(heightValue) || isNaN(weightValue)) {
            setError(t("errors.invalidNumbers"));
            return;
        }

        if (ageValue <= 0 || heightValue <= 0 || weightValue <= 0) {
            setError(t("errors.positiveNumbers"));
            return;
        }

        let heightInCm = heightValue;
        let weightInKg = weightValue;

        // Convert imperial to metric if needed
        if (unit === "imperial") {
            heightInCm = heightValue * 2.54; // inches to cm
            weightInKg = weightValue * 0.453592; // pounds to kg
        }

        // Calculate BMR using Mifflin-St Jeor Equation
        let bmrValue: number;
        if (gender === "male") {
            bmrValue = 10 * weightInKg + 6.25 * heightInCm - 5 * ageValue + 5;
        } else {
            bmrValue = 10 * weightInKg + 6.25 * heightInCm - 5 * ageValue - 161;
        }

        // Round to nearest whole number
        bmrValue = Math.round(bmrValue);
        setBMR(bmrValue);

        // Calculate TDEE (Total Daily Energy Expenditure)
        const activityMultiplier = getActivityMultiplier(activityLevel);
        const tdeeValue = Math.round(bmrValue * activityMultiplier);
        setTDEE(tdeeValue);
    }, [age, height, weight, gender, unit, activityLevel, t]);

    const resetCalculator = () => {
        setAge("");
        setHeight("");
        setWeight("");
        setGender("male");
        setActivityLevel(ActivityLevel.MODERATE);
        setBMR(null);
        setTDEE(null);
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
                            <Label>{t("gender")}</Label>
                            <RadioGroup
                                value={gender}
                                onValueChange={(value) =>
                                    setGender(value as "male" | "female")
                                }
                                className="flex space-x-4"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="male" id="male" />
                                    <Label
                                        htmlFor="male"
                                        className="cursor-pointer"
                                    >
                                        {t("male")}
                                    </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                        value="female"
                                        id="female"
                                    />
                                    <Label
                                        htmlFor="female"
                                        className="cursor-pointer"
                                    >
                                        {t("female")}
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="age">{t("age")}</Label>
                            <Input
                                id="age"
                                type="number"
                                min={0}
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                placeholder="25"
                            />
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

                        <div className="space-y-2">
                            <Label htmlFor="activity-level">
                                {t("activityLevel")}
                            </Label>
                            <Select
                                value={activityLevel}
                                onValueChange={(value) =>
                                    setActivityLevel(value as ActivityLevel)
                                }
                            >
                                <SelectTrigger id="activity-level">
                                    <SelectValue
                                        placeholder={t("selectActivity")}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ActivityLevel.SEDENTARY}>
                                        {t("activityLevels.sedentary")}
                                    </SelectItem>
                                    <SelectItem value={ActivityLevel.LIGHT}>
                                        {t("activityLevels.light")}
                                    </SelectItem>
                                    <SelectItem value={ActivityLevel.MODERATE}>
                                        {t("activityLevels.moderate")}
                                    </SelectItem>
                                    <SelectItem value={ActivityLevel.ACTIVE}>
                                        {t("activityLevels.active")}
                                    </SelectItem>
                                    <SelectItem
                                        value={ActivityLevel.VERY_ACTIVE}
                                    >
                                        {t("activityLevels.veryActive")}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="flex space-x-2">
                            <Button onClick={calculateBMR} className="flex-1">
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

            {bmr !== null && tdee !== null && (
                <Card className="shadow-lg border-2 border-gray-100">
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium">
                                    {t("results")}
                                </h3>
                                <div className="mt-2 grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            {t("yourBMR")}
                                        </p>
                                        <p className="text-2xl font-bold text-primary transition-colors duration-300">
                                            {bmr} {t("calories")}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {t("bmrExplanation")}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            {t("yourTDEE")}
                                        </p>
                                        <p className="text-2xl font-bold text-primary transition-colors duration-300">
                                            {tdee} {t("calories")}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {t("tdeeExplanation")}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-md font-medium">
                                    {t("whatItMeans")}
                                </h4>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {t("bmrDetailedExplanation")}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
