"use client";

import { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Slider } from "@/components/ui/slider";

// Transportation types
export enum TransportationType {
    CAR = "CAR",
    PUBLIC_TRANSPORT = "PUBLIC_TRANSPORT",
    BIKE_WALK = "BIKE_WALK",
    MIXED = "MIXED",
}

// Diet types
export enum DietType {
    MEAT_HEAVY = "MEAT_HEAVY",
    AVERAGE = "AVERAGE",
    VEGETARIAN = "VEGETARIAN",
    VEGAN = "VEGAN",
}

// Housing energy efficiency
export enum EnergyEfficiency {
    LOW = "LOW",
    AVERAGE = "AVERAGE",
    HIGH = "HIGH",
    RENEWABLE = "RENEWABLE",
}

export default function CarbonFootprintCalculator() {
    const t = useTranslations("CarbonFootprintCalculator");
    const [transportationType, setTransportationType] =
        useState<TransportationType>(TransportationType.MIXED);
    const [transportationDistance, setTransportationDistance] =
        useState<string>("20");
    const [flightsPerYear, setFlightsPerYear] = useState<string>("2");
    const [dietType, setDietType] = useState<DietType>(DietType.AVERAGE);
    const [energyEfficiency, setEnergyEfficiency] = useState<EnergyEfficiency>(
        EnergyEfficiency.AVERAGE,
    );
    const [householdSize, setHouseholdSize] = useState<string>("2");
    const [consumptionLevel, setConsumptionLevel] = useState<number>(50);
    const [recyclingLevel, setRecyclingLevel] = useState<number>(50);

    const [carbonFootprint, setCarbonFootprint] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Carbon emission factors (in tons of CO2 per year)
    const transportationFactors = {
        [TransportationType.CAR]: 0.000192, // tons per km
        [TransportationType.PUBLIC_TRANSPORT]: 0.000096, // tons per km
        [TransportationType.BIKE_WALK]: 0, // tons per km
        [TransportationType.MIXED]: 0.000144, // tons per km
    };

    const flightEmissionFactor = 0.25; // tons per flight (average)

    const dietFactors = {
        [DietType.MEAT_HEAVY]: 2.5, // tons per year
        [DietType.AVERAGE]: 1.7, // tons per year
        [DietType.VEGETARIAN]: 1.4, // tons per year
        [DietType.VEGAN]: 1.1, // tons per year
    };

    const energyFactors = {
        [EnergyEfficiency.LOW]: 3.0, // tons per household per year
        [EnergyEfficiency.AVERAGE]: 2.0, // tons per household per year
        [EnergyEfficiency.HIGH]: 1.0, // tons per household per year
        [EnergyEfficiency.RENEWABLE]: 0.5, // tons per household per year
    };

    const calculateCarbonFootprint = useCallback(() => {
        setError(null);

        // Validate inputs
        if (!transportationDistance || !flightsPerYear || !householdSize) {
            setError(t("errors.emptyFields"));
            return;
        }

        const distanceValue = parseFloat(transportationDistance);
        const flightsValue = parseFloat(flightsPerYear);
        const householdValue = parseFloat(householdSize);

        if (
            isNaN(distanceValue) ||
            isNaN(flightsValue) ||
            isNaN(householdValue)
        ) {
            setError(t("errors.invalidNumbers"));
            return;
        }

        if (distanceValue < 0 || flightsValue < 0 || householdValue <= 0) {
            setError(t("errors.positiveNumbers"));
            return;
        }

        // Calculate transportation emissions (daily commute * 365 days * emission factor)
        const transportationEmissions =
            distanceValue * 365 * transportationFactors[transportationType];

        // Calculate flight emissions
        const flightEmissions = flightsValue * flightEmissionFactor;

        // Calculate diet emissions
        const dietEmissions = dietFactors[dietType];

        // Calculate household energy emissions (divided by household size)
        const energyEmissions =
            energyFactors[energyEfficiency] / householdValue;

        // Calculate consumption and waste emissions based on sliders (0-100%)
        // Base consumption emissions: 1 ton per year at 50%
        const consumptionEmissions = consumptionLevel / 50;

        // Recycling reduces waste emissions (base: 0.5 ton per year at 50% recycling)
        const wasteEmissions = (1 - recyclingLevel / 100) * 0.5;

        // Calculate total carbon footprint
        const totalEmissions =
            transportationEmissions +
            flightEmissions +
            dietEmissions +
            energyEmissions +
            consumptionEmissions +
            wasteEmissions;

        // Round to 2 decimal places
        setCarbonFootprint(Math.round(totalEmissions * 100) / 100);
    }, [
        transportationType,
        transportationDistance,
        flightsPerYear,
        dietType,
        energyEfficiency,
        householdSize,
        consumptionLevel,
        recyclingLevel,
        t,
    ]);

    const resetCalculator = () => {
        setTransportationType(TransportationType.MIXED);
        setTransportationDistance("20");
        setFlightsPerYear("2");
        setDietType(DietType.AVERAGE);
        setEnergyEfficiency(EnergyEfficiency.AVERAGE);
        setHouseholdSize("2");
        setConsumptionLevel(50);
        setRecyclingLevel(50);
        setCarbonFootprint(null);
        setError(null);
    };

    const getCarbonFootprintCategory = (footprint: number): string => {
        if (footprint < 6) {
            return t("categories.low");
        } else if (footprint < 10) {
            return t("categories.moderate");
        } else if (footprint < 16) {
            return t("categories.high");
        } else {
            return t("categories.veryHigh");
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="pt-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="transportation-type">
                                {t("transportationType")}
                            </Label>
                            <Select
                                value={transportationType}
                                onValueChange={(value) =>
                                    setTransportationType(
                                        value as TransportationType,
                                    )
                                }
                            >
                                <SelectTrigger id="transportation-type">
                                    <SelectValue
                                        placeholder={t("selectTransportation")}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={TransportationType.CAR}>
                                        {t("transportationTypes.car")}
                                    </SelectItem>
                                    <SelectItem
                                        value={
                                            TransportationType.PUBLIC_TRANSPORT
                                        }
                                    >
                                        {t(
                                            "transportationTypes.publicTransport",
                                        )}
                                    </SelectItem>
                                    <SelectItem
                                        value={TransportationType.BIKE_WALK}
                                    >
                                        {t("transportationTypes.bikeWalk")}
                                    </SelectItem>
                                    <SelectItem
                                        value={TransportationType.MIXED}
                                    >
                                        {t("transportationTypes.mixed")}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="transportation-distance">
                                {t("transportationDistance")}
                            </Label>
                            <Input
                                id="transportation-distance"
                                type="number"
                                min={0}
                                value={transportationDistance}
                                onChange={(e) =>
                                    setTransportationDistance(e.target.value)
                                }
                                placeholder="20"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="flights-per-year">
                                {t("flightsPerYear")}
                            </Label>
                            <Input
                                id="flights-per-year"
                                type="number"
                                min={0}
                                value={flightsPerYear}
                                onChange={(e) =>
                                    setFlightsPerYear(e.target.value)
                                }
                                placeholder="2"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="diet-type">{t("dietType")}</Label>
                            <Select
                                value={dietType}
                                onValueChange={(value) =>
                                    setDietType(value as DietType)
                                }
                            >
                                <SelectTrigger id="diet-type">
                                    <SelectValue
                                        placeholder={t("selectDiet")}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={DietType.MEAT_HEAVY}>
                                        {t("dietTypes.meatHeavy")}
                                    </SelectItem>
                                    <SelectItem value={DietType.AVERAGE}>
                                        {t("dietTypes.average")}
                                    </SelectItem>
                                    <SelectItem value={DietType.VEGETARIAN}>
                                        {t("dietTypes.vegetarian")}
                                    </SelectItem>
                                    <SelectItem value={DietType.VEGAN}>
                                        {t("dietTypes.vegan")}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="energy-efficiency">
                                {t("energyEfficiency")}
                            </Label>
                            <Select
                                value={energyEfficiency}
                                onValueChange={(value) =>
                                    setEnergyEfficiency(
                                        value as EnergyEfficiency,
                                    )
                                }
                            >
                                <SelectTrigger id="energy-efficiency">
                                    <SelectValue
                                        placeholder={t(
                                            "selectEnergyEfficiency",
                                        )}
                                    />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={EnergyEfficiency.LOW}>
                                        {t("energyEfficiencyLevels.low")}
                                    </SelectItem>
                                    <SelectItem
                                        value={EnergyEfficiency.AVERAGE}
                                    >
                                        {t("energyEfficiencyLevels.average")}
                                    </SelectItem>
                                    <SelectItem value={EnergyEfficiency.HIGH}>
                                        {t("energyEfficiencyLevels.high")}
                                    </SelectItem>
                                    <SelectItem
                                        value={EnergyEfficiency.RENEWABLE}
                                    >
                                        {t("energyEfficiencyLevels.renewable")}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="household-size">
                                {t("householdSize")}
                            </Label>
                            <Input
                                id="household-size"
                                type="number"
                                min={1}
                                value={householdSize}
                                onChange={(e) =>
                                    setHouseholdSize(e.target.value)
                                }
                                placeholder="2"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label htmlFor="consumption-level">
                                    {t("consumptionLevel")}
                                </Label>
                                <span className="text-sm text-muted-foreground">
                                    {consumptionLevel}%
                                </span>
                            </div>
                            <Slider
                                id="consumption-level"
                                min={0}
                                max={100}
                                step={1}
                                value={[consumptionLevel]}
                                onValueChange={(value) =>
                                    setConsumptionLevel(value[0])
                                }
                            />
                            <p className="text-xs text-muted-foreground">
                                {t("consumptionLevelDesc")}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label htmlFor="recycling-level">
                                    {t("recyclingLevel")}
                                </Label>
                                <span className="text-sm text-muted-foreground">
                                    {recyclingLevel}%
                                </span>
                            </div>
                            <Slider
                                id="recycling-level"
                                min={0}
                                max={100}
                                step={1}
                                value={[recyclingLevel]}
                                onValueChange={(value) =>
                                    setRecyclingLevel(value[0])
                                }
                            />
                            <p className="text-xs text-muted-foreground">
                                {t("recyclingLevelDesc")}
                            </p>
                        </div>

                        {error && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="flex space-x-2">
                            <Button
                                onClick={calculateCarbonFootprint}
                                className="flex-1"
                            >
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

            {carbonFootprint !== null && (
                <Card className="shadow-lg border-2 border-gray-100">
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-medium">
                                    {t("results")}
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-muted-foreground">
                                        {t("yourCarbonFootprint")}
                                    </p>
                                    <p className="text-2xl font-bold text-primary transition-colors duration-300">
                                        {carbonFootprint} {t("tonsPerYear")}
                                    </p>
                                    <p className="text-md font-medium mt-2">
                                        {t("category")}:{" "}
                                        <span className="text-primary">
                                            {getCarbonFootprintCategory(
                                                carbonFootprint,
                                            )}
                                        </span>
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {t("footprintExplanation")}
                                    </p>
                                </div>
                            </div>
                            <div>
                                <h4 className="text-md font-medium">
                                    {t("whatItMeans")}
                                </h4>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {t("footprintDetailedExplanation")}
                                </p>
                            </div>
                            <div>
                                <h4 className="text-md font-medium">
                                    {t("reductionTips")}
                                </h4>
                                <ul className="mt-1 text-sm text-muted-foreground list-disc pl-5 space-y-1">
                                    <li>{t("tips.transportation")}</li>
                                    <li>{t("tips.diet")}</li>
                                    <li>{t("tips.energy")}</li>
                                    <li>{t("tips.consumption")}</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
