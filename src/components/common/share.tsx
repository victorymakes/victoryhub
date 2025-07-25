"use client";

import {
    TwitterShareButton,
    LinkedinShareButton,
    FacebookShareButton,
    TwitterIcon,
    LinkedinIcon,
    FacebookIcon,
} from "react-share";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Share2, Copy, Check } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface ShareProps {
    url: string;
    title: string;
    description?: string;
    hashtags?: string[];
    size?: "sm" | "default" | "lg";
}

export default function Share({
    url,
    title,
    description,
    hashtags = ["tools", "tech"],
    size = "sm",
}: ShareProps) {
    const [copied, setCopied] = useState(false);
    const [open, setOpen] = useState(false);
    const t = useTranslations("Blog");

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            setOpen(false);
        } catch (err) {
            console.error("Failed to copy: ", err);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size={size}
                    className="flex items-center gap-2 cursor-pointer"
                >
                    <Share2 className="w-4 h-4" />
                    {t("share")}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2" align="end">
                <div className="space-y-1">
                    {/* Copy Link */}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyLink}
                        className="w-full justify-start gap-3 cursor-pointer"
                    >
                        {copied ? (
                            <>
                                <Check className="w-4 h-4 text-green-600" />
                                {t("copied")}
                            </>
                        ) : (
                            <>
                                <Copy className="w-4 h-4" />
                                {t("copyLink")}
                            </>
                        )}
                    </Button>

                    {/* Share on X (Twitter) */}
                    <TwitterShareButton
                        url={url}
                        title={title}
                        hashtags={hashtags}
                        className="w-full"
                        onClick={() => setOpen(false)}
                    >
                        <div className="flex items-center gap-3 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
                            <TwitterIcon size={16} round />
                            {t("shareOnX")}
                        </div>
                    </TwitterShareButton>

                    {/* Share on Facebook */}
                    <FacebookShareButton
                        url={url}
                        hashtag={`#${hashtags[0]}`}
                        className="w-full"
                        onClick={() => setOpen(false)}
                    >
                        <div className="flex items-center gap-3 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
                            <FacebookIcon size={16} round />
                            {t("shareOnFacebook")}
                        </div>
                    </FacebookShareButton>

                    {/* Share on LinkedIn */}
                    <LinkedinShareButton
                        url={url}
                        title={title}
                        summary={description}
                        className="w-full"
                        onClick={() => setOpen(false)}
                    >
                        <div className="flex items-center gap-3 w-full px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer">
                            <LinkedinIcon size={16} round />
                            {t("shareOnLinkedIn")}
                        </div>
                    </LinkedinShareButton>
                </div>
            </PopoverContent>
        </Popover>
    );
}
