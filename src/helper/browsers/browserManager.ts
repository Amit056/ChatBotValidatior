import { chromium, firefox, LaunchOptions, webkit } from "@playwright/test";

const options: LaunchOptions = {
    headless: false,
    args: ['--start-maximized']
};



export const invokeBrowser = () => {
    const browserType = process.env.BROWSER

    switch (browserType?.toLowerCase()) {
        case 'chrome':
            options.channel = 'chrome';
            return chromium.launch(options);

        case 'firefox':
            return firefox.launch(options);

        case 'EDGE':
            options.channel = 'msedge';
            return chromium.launch(options);

        case 'webkit':
            return webkit.launch(options);
            
        default:
            throw new Error(`Unsupported browser: ${browserType}`);
    }
}
