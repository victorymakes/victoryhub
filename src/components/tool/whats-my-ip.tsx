"use client";

import {
  AlertCircle,
  AlertTriangle,
  Copy,
  Globe,
  Loader2,
  RefreshCw,
  User,
  Wifi,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface IPInfo {
  ip: string;
  version: string;
  city: string;
  region: string;
  country: string;
  isp: string;
  loading: boolean;
  error: string | null;
}

export default function WhatsMyIP() {
  const t = useTranslations("WhatsMyIp");
  const [ipInfo, setIpInfo] = useState<IPInfo>({
    ip: "",
    version: "",
    city: "",
    region: "",
    country: "",
    isp: "",
    loading: true,
    error: null,
  });

  const fetchIPInfo = useCallback(async () => {
    setIpInfo((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetch("https://ipapi.co/json/");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();

      if (data.error) {
        throw new Error(data.reason || "API returned an error");
      }

      setIpInfo({
        ip: data.ip || "Unknown",
        version: data.version === "IPv4" ? "4" : "6",
        city: data.city || "Unknown",
        region: data.region || "Unknown",
        country: data.country_name || "Unknown",
        isp: data.org || "Unknown",
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("IP fetch error:", error);
      setIpInfo((prev) => ({
        ...prev,
        loading: false,
        error: t("errors.fetchFailed"),
      }));
    }
  }, [t]);

  useEffect(() => {
    fetchIPInfo();
  }, [fetchIPInfo]);

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(t("copied"));
  };

  const InfoRow = ({
    icon: Icon,
    label,
    value,
    copyable = true,
  }: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    copyable?: boolean;
  }) => (
    <div className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <div>
          <div className="text-sm font-medium">{label}</div>
          <div className="text-sm text-muted-foreground font-mono">{value}</div>
        </div>
      </div>
      {copyable && value !== "Unknown" && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => copyToClipboard(value)}
          className="flex items-center gap-2"
        >
          <Copy className="h-4 w-4" />
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-6">
          {ipInfo.loading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  {t("loading")}
                </span>
              </div>
            </div>
          )}

          {ipInfo.error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{ipInfo.error}</AlertDescription>
            </Alert>
          )}

          {!ipInfo.loading && !ipInfo.error && (
            <div className="space-y-4">
              <div className="text-center p-6 border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <div className="text-sm text-muted-foreground mb-2">
                  {t("yourIpAddress")}
                </div>
                <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
                  {ipInfo.ip}
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  IPv{ipInfo.version}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(ipInfo.ip)}
                  className="mt-4 flex items-center gap-2"
                  disabled={!ipInfo.ip || ipInfo.ip === "Unknown"}
                >
                  <Copy className="h-4 w-4" />
                  <span className="text-sm">{t("copyIpAddress")}</span>
                </Button>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium">{t("locationInfo")}</h3>

                <InfoRow
                  icon={Globe}
                  label={t("country")}
                  value={ipInfo.country}
                />

                <InfoRow
                  icon={User}
                  label={t("region")}
                  value={ipInfo.region}
                />

                <InfoRow icon={User} label={t("city")} value={ipInfo.city} />

                <InfoRow icon={Wifi} label={t("isp")} value={ipInfo.isp} />
              </div>
            </div>
          )}

          {/* Refresh Button */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={fetchIPInfo}
              disabled={ipInfo.loading}
              className="flex-1 flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${ipInfo.loading ? "animate-spin" : ""}`}
              />
              {t("refresh")}
            </Button>
          </div>

          {/* Privacy Notice */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {t("privacyNotice")}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
