import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
    browser: 'chrome',
    modules: ['@wxt-dev/module-solid'],
    manifest: {
        permissions: ['storage', 'tabs'],
    },
});
