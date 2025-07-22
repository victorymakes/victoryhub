import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
    pageExtensions: ["ts", "tsx", "mdx"],
    experimental: {
        mdxRs: true,
    },
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "images.unsplash.com",
                port: "",
                pathname: "/**",
            },
        ],
    },
};

const withMDX = createMDX();
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(withMDX(nextConfig));
