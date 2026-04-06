import { generateRobotsTxt } from "./generate-robots";
import { generateSitemap } from "./generate-sitemap";
import { generateMetadata } from "./page-metadata-generator";

// Run the script
if (require.main === module) {
  generateMetadata();
  generateRobotsTxt();
  generateSitemap();
}
