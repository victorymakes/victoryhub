import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";

const nextConfig: NextConfig = {
    pageExtensions: ["ts", "tsx", "mdx"],
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "i.postimg.cc",
                port: "",
                pathname: "/**",
            },
        ],
    },
};

const withMDX = createMDX({
    // Add markdown plugins here, as desired
    options: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [],
    },
});
const withNextIntl = createNextIntlPlugin();
export default withNextIntl(withMDX(nextConfig));
