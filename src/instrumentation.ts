import { config } from "./lib/config";
import { getMessages } from "./service/message-service";
import { getToolDB } from "./service/tool-service";

export function register() {
  initCache();
}

const initCache = async () => {
  for (const locale of config.locales) {
    console.log(`Initializing tool db cache for locale: ${locale}`);
    await getToolDB(locale);

    console.log(`Initializing message cache for locale: ${locale}`);
    await getMessages(locale);
  }
};
