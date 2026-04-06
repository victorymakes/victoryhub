"use client";

import { useTranslations } from "next-intl";
import Container from "@/components/common/container";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default function ErrorPage() {
  const t = useTranslations("NotFound");

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
