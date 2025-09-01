import { generateRobotsTxt } from "./generate-robots";
import { generateMetadata } from "./page-metadata-generator";
import { generateSitemap } from "./generate-sitemap";

// Run the script
if (require.main === module) {
    generateMetadata();
    generateRobotsTxt();
    generateSitemap();
}
