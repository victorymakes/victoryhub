"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Container from "@/components/common/container";

export default function ErrorPage() {
    const t = useTranslations("Error");

    return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Container className="text-center">
                <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
                <p className="text-lg mb-6">{t("description")}</p>
                <Button asChild>
                    <Link href="/">{t("goHome")}</Link>
                </Button>
            </Container>
        </div>
    );
}
