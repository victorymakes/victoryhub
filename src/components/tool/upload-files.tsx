"use client";

import { Upload, X } from "lucide-react";
import NextImage from "next/image";
import { useTranslations } from "next-intl";
import type React from "react";
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { formatBytes } from "@/lib/file";
import { cn } from "@/lib/utils";

export interface UploadFilesRef {
  /**
   * Clear all selected files
   */
  clear: (e?: React.MouseEvent<HTMLButtonElement>) => void;

  /**
   * Trigger file selection dialog
   */
  select: (e?: React.MouseEvent<HTMLButtonElement>) => void;
}

interface UploadFilesProps {
  /**
   * Function to handle the selected files
   */
  onFilesSelected: (files: FileList | File[]) => void;

  /**
   * Function to handle the clear files
   */
  onFilesCleared?: () => void;

  /**
   * Whether to allow multiple file selection
   * @default false
   */
  multiple?: boolean;

  /**
   * Accepted file types (e.g., "image/*", ".pdf,.doc")
   * @default "*"
   */
  accept?: string;

  /**
   * Text to display when dragging files
   * @default "Drop files here"
   */
  dragActiveText?: string;

  /**
   * Text to display when not dragging files
   * @default "Drag & drop files here or click to browse"
   */
  dragInactiveText?: string;

  /**
   * Text for the select button
   * @default "Select Files"
   */
  selectButtonText?: string;

  /**
   * Whether the component is disabled
   * @default false
   */
  disabled?: boolean;

  /**
   * Additional class name for the dropzone container
   */
  className?: string;
}

/**
 * A reusable file upload component with drag and drop functionality
 */
const UploadFiles = forwardRef<UploadFilesRef, UploadFilesProps>(
  (
    {
      onFilesSelected,
      onFilesCleared,
      multiple = false,
      accept = "*",
      dragActiveText,
      dragInactiveText,
      selectButtonText,
      disabled = false,
      className,
    },
    ref,
  ) => {
    const t = useTranslations("UploadFiles");
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewImage, setPreviewImage] = useState<File | null>(null);

    // Use translations or fallback to provided props
    const dropText = dragActiveText || t("dropFiles");
    const dragText = dragInactiveText || t("dragAndDrop");
    const browseText = selectButtonText || t("chooseFiles");

    // Handle file input change
    const handleFileChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
          onFilesSelected(e.target.files);
          if (
            !multiple &&
            e.target.files[0] &&
            (accept?.startsWith("image/") ||
              e.target.files[0].type.startsWith("image/"))
          ) {
            setPreviewImage(e.target.files[0]);
          }
          // Reset the input value so the same file can be selected again
          e.target.value = "";
        }
      },
      [accept, multiple, onFilesSelected],
    );

    // Handle drag events
    const handleDragOver = useCallback(
      (e: React.DragEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!disabled) {
          setIsDragging(true);
        }
      },
      [disabled],
    );

    const handleDragLeave = useCallback(
      (e: React.DragEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsDragging(false);
      },
      [],
    );

    const handleDrop = useCallback(
      (e: React.DragEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setIsDragging(false);

        if (
          !disabled &&
          e.dataTransfer.files &&
          e.dataTransfer.files.length > 0
        ) {
          onFilesSelected(e.dataTransfer.files);
        }
      },
      [disabled, onFilesSelected],
    );

    // Handle click on the dropzone
    const handleClick = useCallback(() => {
      if (!disabled && fileInputRef.current) {
        fileInputRef.current.click();
      }
    }, [disabled]);

    const clearFiles = useCallback(() => {
      setPreviewImage(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (onFilesCleared) {
        onFilesCleared();
      }
    }, [onFilesCleared]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      clear: (e) => {
        e?.stopPropagation();
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
      select: (e) => {
        e?.stopPropagation();
        if (!disabled && fileInputRef.current) {
          fileInputRef.current.click();
        }
      },
    }));

    return (
      <button
        type="button"
        disabled={disabled}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/20 hover:border-primary/50",
          "flex flex-col items-center justify-center gap-2 text-center w-full",
          disabled && "opacity-50 cursor-not-allowed",
          className,
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />

        {previewImage ? (
          <div className="space-y-3">
            <div className="flex justify-center">
              <NextImage
                src={URL.createObjectURL(previewImage)}
                alt="Preview"
                width={300}
                height={200}
                className="object-contain rounded-md"
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium truncate">
                {previewImage.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatBytes(previewImage.size)}
              </p>
            </div>
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFiles();
                }}
              >
                <X className="h-4 w-4" />
                {t("clearFiles")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (fileInputRef.current) {
                    fileInputRef.current.click();
                  }
                }}
              >
                <Upload className="h-4 w-4" />
                {t("changeFiles")}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-medium mb-1">
              {isDragging ? dropText : dragText}
            </p>
            <Button
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation();
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
            >
              {browseText}
            </Button>
          </>
        )}
      </button>
    );
  },
);

UploadFiles.displayName = "UploadFiles";

export default UploadFiles;
