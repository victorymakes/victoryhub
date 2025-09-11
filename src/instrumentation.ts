import { config } from "./lib/config";
import { getMessages } from "./service/message-service";
import { getToolDB } from "./service/tool-service";

export async function register() {
    await initCache();
}

const initCache = async () => {
    for (const locale of config.locales) {
        console.log(`Initializing tool db cache for locale: ${locale}`);
        await getToolDB(locale);

        console.log(`Initializing message cache for locale: ${locale}`);
        await getMessages(locale);
    }
};
