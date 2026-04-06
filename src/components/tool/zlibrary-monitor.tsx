"use client";

import { WebsiteMonitor } from "./website-monitor";

const SITES = [
  {
    url: "https://z-library.sk/",
    name: "Z-Library (Main Website)",
    isMainSite: true,
  },
  { url: "https://zlib.by/", name: "Zlib.by" },
  { url: "https://1lib.sk/", name: "1lib.sk" },
  { url: "https://z-lib.gd/", name: "Z-Lib.gd" },
  { url: "https://z-lib.gl/", name: "Z-Lib.gl" },
];

export default function ZLibraryMonitor() {
  return <WebsiteMonitor sites={SITES} name="Z-Library" />;
}
