"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, Trash, Plus, Shuffle, Copy, Award } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { trackToolUsage } from "@/lib/analytics";
import dynamic from "next/dynamic";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

// Dynamically import react-confetti to avoid SSR issues
const ReactConfetti = dynamic(() => import("react-confetti"), {
    ssr: false,
});

export default function RandomPicker() {
    const t = useTranslations("RandomPicker");
    const [items, setItems] = useState<string[]>([]);
    const [newItem, setNewItem] = useState("");
    const [bulkItems, setBulkItems] = useState("");
    const [result, setResult] = useState<string | null>(null);
    const [resultIndex, setResultIndex] = useState<number | null>(null);
    const [isSpinning, setIsSpinning] = useState(false);
    const [showBulkInput, setShowBulkInput] = useState(false);
    const [showResultDialog, setShowResultDialog] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    // Copy result to clipboard
    const copyResultToClipboard = () => {
        if (result) {
            navigator.clipboard.writeText(result);
            toast.success(t("copied"));
        }
    };

    // Remove the selected item
    const removeSelectedItem = () => {
        if (
            resultIndex !== null &&
            resultIndex >= 0 &&
            resultIndex < items.length
        ) {
            const newItems = [...items];
            newItems.splice(resultIndex, 1);
            setItems(newItems);
            setShowResultDialog(false);
            setResult(null);
            setResultIndex(null);
            setShowConfetti(false);
            toast.success(t("remove") + ": " + items[resultIndex]);
        }
    };

    // Add a single item
    const addItem = () => {
        if (newItem.trim() !== "") {
            setItems([...items, newItem.trim()]);
            setNewItem("");
            trackToolUsage("random-picker", "add-item");
        }
    };

    // Add items in bulk
    const addBulkItems = () => {
        if (bulkItems.trim() !== "") {
            const newItems = bulkItems
                .split("\n")
                .map((item) => item.trim())
                .filter((item) => item !== "");

            setItems([...items, ...newItems]);
            setBulkItems("");
            setShowBulkInput(false);
            trackToolUsage("random-picker", "add-bulk-items");
        }
    };

    // Remove an item
    const removeItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    // Clear all items
    const clearItems = () => {
        setItems([]);
        setResult(null);
    };

    // Pick a random item with animation
    const pickRandomItem = () => {
        if (items.length === 0) {
            toast.error(t("errors.noItems"));
            return;
        }

        setIsSpinning(true);
        setResult(null);
        setResultIndex(null);
        setShowResultDialog(true);
        setShowConfetti(false);

        // Simulate spinning animation
        const duration = 2000; // 2 seconds of spinning
        const iterations = 20; // Number of visible iterations
        const interval = duration / iterations;
        let count = 0;

        const spin = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * items.length);
            setResult(items[randomIndex]);
            count++;

            if (count >= iterations) {
                clearInterval(spin);
                // Final selection
                const finalIndex = Math.floor(Math.random() * items.length);
                setResult(items[finalIndex]);
                setResultIndex(finalIndex);
                setIsSpinning(false);
                setShowConfetti(true);
                trackToolUsage("random-picker", "pick-random");

                // Hide confetti after 5 seconds
                setTimeout(() => {
                    setShowConfetti(false);
                }, 5000);
            }
        }, interval);
    };

    // Handle Enter key press
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            addItem();
        }
    };

    // Handle bulk input Enter key press
    const handleBulkKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && e.ctrlKey) {
            e.preventDefault();
            addBulkItems();
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="pt-6 space-y-6">
                    {/* Input Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">{t("addItems")}</h3>

                        {!showBulkInput ? (
                            <div className="flex space-x-2">
                                <Input
                                    value={newItem}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLInputElement>,
                                    ) => setNewItem(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder={t("itemPlaceholder")}
                                    className="flex-1"
                                />
                                <Button
                                    onClick={addItem}
                                    disabled={!newItem.trim()}
                                >
                                    <Plus className="h-4 w-4 " />
                                    {t("add")}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowBulkInput(true)}
                                >
                                    {t("bulkAdd")}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Textarea
                                    value={bulkItems}
                                    onChange={(
                                        e: React.ChangeEvent<HTMLTextAreaElement>,
                                    ) => setBulkItems(e.target.value)}
                                    onKeyDown={handleBulkKeyPress}
                                    placeholder={t("bulkPlaceholder")}
                                    rows={5}
                                    className="w-full"
                                />
                                <div className="flex space-x-2">
                                    <Button
                                        onClick={addBulkItems}
                                        disabled={!bulkItems.trim()}
                                    >
                                        <Plus className="h-4 w-4 " />
                                        {t("addAll")}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowBulkInput(false)}
                                    >
                                        {t("cancel")}
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {t("bulkInstructions")}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Items List with Animation */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium">
                                {t("itemsList")} ({items.length})
                            </h3>
                            {items.length > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearItems}
                                >
                                    <Trash className="h-4 w-4 " />
                                    {t("clearAll")}
                                </Button>
                            )}
                        </div>

                        <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                            {items.length === 0 ? (
                                <p className="text-center text-muted-foreground py-4">
                                    {t("noItems")}
                                </p>
                            ) : (
                                <ul className="space-y-1">
                                    {items.map((item, index) => (
                                        <li
                                            key={`${item}-${index}`}
                                            className={`flex justify-between items-center p-2 hover:bg-muted rounded-md group ${result === item ? "bg-muted" : ""}`}
                                        >
                                            <span className="truncate">
                                                {item}
                                            </span>
                                            <div className="flex gap-2 justify-center items-center">
                                                {item === result && (
                                                    <Award className="text-primary h-4 w-4" />
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() =>
                                                        removeItem(index)
                                                    }
                                                    disabled={isSpinning}
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Random Pick Button */}
                    <div className="pt-2">
                        <Button
                            onClick={pickRandomItem}
                            disabled={items.length === 0 || isSpinning}
                            className="w-full py-6 text-lg"
                        >
                            {isSpinning ? (
                                <RefreshCw className="h-5 w-5  animate-spin" />
                            ) : (
                                <Shuffle className="h-5 w-5 " />
                            )}
                            {isSpinning ? t("picking") : t("pickRandom")}
                        </Button>
                    </div>

                    {/* Result Dialog */}
                    <Dialog
                        open={showResultDialog}
                        onOpenChange={setShowResultDialog}
                    >
                        <DialogContent
                            className="sm:max-w-md"
                            aria-describedby={undefined}
                        >
                            {showConfetti && (
                                <ReactConfetti
                                    width={400}
                                    height={300}
                                    recycle={false}
                                    numberOfPieces={100}
                                    gravity={0.2}
                                    wind={Math.random() * 0.4 - 0.2}
                                    confettiSource={{
                                        x: 200,
                                        y: 150,
                                        w: 10,
                                        h: 10,
                                    }}
                                    style={{
                                        position: "absolute",
                                        top: "50%",
                                        left: "50%",
                                        transform: "translate(-50%, -50%)",
                                        zIndex: 100,
                                    }}
                                />
                            )}
                            <DialogHeader>
                                <DialogTitle>{t("result")}</DialogTitle>
                            </DialogHeader>
                            <AnimatePresence mode="wait">
                                {result && (
                                    <motion.div
                                        key={isSpinning ? "spinning" : result}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                            scale: isSpinning
                                                ? [1, 1.05, 1]
                                                : 1,
                                        }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{
                                            duration: isSpinning ? 0.2 : 0.5,
                                            scale: {
                                                repeat: isSpinning
                                                    ? Infinity
                                                    : 0,
                                                duration: 0.3,
                                            },
                                        }}
                                        className="p-4 border rounded-md bg-muted/50 shadow-sm"
                                    >
                                        <div className="flex justify-between items-center">
                                            <motion.p
                                                className="text-2xl font-bold break-all w-full text-center"
                                                animate={{
                                                    color: isSpinning
                                                        ? [
                                                              "#000000",
                                                              "#3b82f6",
                                                              "#ef4444",
                                                              "#10b981",
                                                              "#8b5cf6",
                                                              "#000000",
                                                          ]
                                                        : "#000000",
                                                    scale: isSpinning
                                                        ? [1, 1.1, 1]
                                                        : 1,
                                                }}
                                                transition={{
                                                    duration: 2,
                                                    repeat: isSpinning
                                                        ? Infinity
                                                        : 0,
                                                    ease: "easeInOut",
                                                }}
                                            >
                                                {result}
                                            </motion.p>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={
                                                        copyResultToClipboard
                                                    }
                                                    disabled={isSpinning}
                                                    title={t("copied")}
                                                >
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={removeSelectedItem}
                                                    disabled={
                                                        isSpinning ||
                                                        resultIndex === null
                                                    }
                                                    title={t("remove")}
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <DialogFooter className="justify-end">
                                <DialogClose asChild>
                                    <Button
                                        variant="outline"
                                        onClick={() =>
                                            setShowResultDialog(false)
                                        }
                                        disabled={isSpinning}
                                    >
                                        {t("close")}
                                    </Button>
                                </DialogClose>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </CardContent>
            </Card>
        </div>
    );
}
