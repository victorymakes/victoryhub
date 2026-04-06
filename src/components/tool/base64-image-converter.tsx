"use client";

import { AlertTriangle, Copy, Download } from "lucide-react";
import NextImage from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import UploadFiles, {
  type UploadFilesRef,
} from "@/components/tool/upload-files";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { trackToolUsage } from "@/lib/analytics";

export default function Base64ImageConverter() {
  const t = useTranslations("Base64ImageConverter");
  const [base64Input, setBase64Input] = useState("");
  const [base64Output, setBase64Output] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"toImage" | "toBase64">("toImage");
  const uploadFilesRef = useRef<UploadFilesRef>(null);

  // Convert base64 to image
  const convertBase64ToImage = useCallback(() => {
    setError(null);
    if (!base64Input.trim()) {
      setImagePreview(null);
      return;
    }

    try {
      // Clean the base64 string if it contains data URL prefix
      let cleanBase64 = base64Input.trim();
      if (cleanBase64.startsWith("data:")) {
        cleanBase64 = cleanBase64.split(",")[1];
      }

      // Create data URL
      const dataUrl = `data:image/png;base64,${cleanBase64}`;

      // Test if it's a valid image by loading it
      const img = new window.Image();
      img.onload = () => {
        setImagePreview(dataUrl);
        trackToolUsage("base64-image-converter", "convert-to-image");
      };
      img.onerror = () => {
        setError(t("errors.invalidBase64Image"));
        setImagePreview(null);
      };
      img.src = dataUrl;
    } catch (error) {
      console.error("Base64 to image conversion error:", error);
      setError(t("errors.conversionFailed"));
      setImagePreview(null);
    }
  }, [base64Input, t]);

  // Convert image to base64
  const convertImageToBase64 = useCallback(
    (file: File) => {
      setError(null);

      if (!file) {
        setBase64Output("");
        return;
      }

      // Check if file is an image
      if (!file.type.startsWith("image/")) {
        setError(t("errors.notAnImage"));
        return;
      }

      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(t("errors.fileTooLarge"));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const result = e.target.result as string;
          // Extract the base64 part if it's a data URL
          const base64 = result.split(",")[1];
          setBase64Output(base64);
          trackToolUsage("base64-image-converter", "convert-to-base64");
        }
      };
      reader.onerror = () => {
        setError(t("errors.readingFileFailed"));
      };
      reader.readAsDataURL(file);
    },
    [t],
  );

  // Handle file selection
  const handleFileChange = (files: FileList | File[]) => {
    if (files && files.length > 0) {
      const file = files[0];
      convertImageToBase64(file);
    }
  };

  // Copy base64 to clipboard
  const copyBase64ToClipboard = async () => {
    if (base64Output) {
      await navigator.clipboard.writeText(base64Output);
      toast.success(t("copied"));
    }
  };

  // Download image from base64
  const downloadImage = () => {
    if (imagePreview) {
      const link = document.createElement("a");
      link.href = imagePreview;
      link.download = "image.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      trackToolUsage("base64-image-converter", "download-image");
    }
  };

  // Clear all inputs and outputs
  const clearAll = () => {
    if (mode === "toImage") {
      setBase64Input("");
      setImagePreview(null);
    } else {
      setBase64Output("");
      uploadFilesRef.current?.clear();
    }
    setError(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          {/* Mode Toggle */}
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center rounded-lg bg-muted p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("toImage");
                  clearAll();
                }}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  mode === "toImage"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("base64ToImage")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("toBase64");
                  clearAll();
                }}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  mode === "toBase64"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t("imageToBase64")}
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {mode === "toImage" ? (
            /* Base64 to Image Mode */
            <>
              {/* Input Section */}
              <div className="space-y-3">
                <label
                  htmlFor="base64-to-image-input"
                  className="text-sm font-medium"
                >
                  {t("base64Input")}
                </label>
                <textarea
                  id="base64-to-image-input"
                  value={base64Input}
                  onChange={(e) => setBase64Input(e.target.value)}
                  placeholder={t("enterBase64")}
                  className="w-full min-h-[150px] p-3 border rounded-lg resize-y font-mono text-sm"
                />
                <div className="flex justify-end">
                  <Button
                    onClick={convertBase64ToImage}
                    disabled={!base64Input.trim()}
                  >
                    {t("convert")}
                  </Button>
                </div>
              </div>

              {/* Output Section - Image Preview */}
              {imagePreview && (
                <div className="space-y-3">
                  <label
                    htmlFor="image-preview-label"
                    className="text-sm font-medium"
                  >
                    {t("imagePreview")}
                  </label>
                  <div
                    id="image-preview-label"
                    className="border rounded-lg p-4 flex justify-center"
                  >
                    <div className="relative">
                      <NextImage
                        src={imagePreview}
                        alt="Converted image"
                        width={300}
                        height={300}
                        className="max-w-full object-contain max-h-[300px]"
                        style={{ height: "auto" }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={downloadImage}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>{t("download")}</span>
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Image to Base64 Mode */
            <>
              {/* File Upload Section */}
              <UploadFiles
                onFilesSelected={handleFileChange}
                onFilesCleared={() => setBase64Output("")}
                accept={"image/*"}
              />

              {/* Output Section - Base64 */}
              {base64Output && (
                <div className="space-y-3">
                  <label
                    htmlFor="base64-output-text"
                    className="text-sm font-medium"
                  >
                    {t("base64Output")}
                  </label>
                  <textarea
                    id="base64-output-text"
                    value={base64Output}
                    readOnly
                    className="w-full min-h-[150px] p-3 border rounded-lg resize-y font-mono text-sm bg-muted/50"
                  />
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={copyBase64ToClipboard}
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      <span>{t("copy")}</span>
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearAll} className="flex-1">
              {t("clear")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
