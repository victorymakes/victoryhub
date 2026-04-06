"use client";

import { WebsiteMonitor } from "./website-monitor";

const SITES = [
  {
    url: "https://libgen.li",
    name: "LibGen.li (Main Website)",
    isMainSite: true,
  },
  { url: "https://libgen.vg", name: "LibGen.vg" },
  { url: "https://libgen.la", name: "LibGen.la" },
  { url: "https://libgen.bz", name: "LibGen.bz" },
  { url: "https://libgen.gl", name: "LibGen.gl" },
  { url: "https://libgen.le", name: "LibGen.le" },
  { url: "https://libgen.gs", name: "LibGen.gs" },
];

export default function LibgenMonitor() {
  return <WebsiteMonitor sites={SITES} name="Libgen" />;
}
