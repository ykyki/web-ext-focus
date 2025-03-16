export default defineBackground(() => {
    console.log('Hello background!', { id: browser.runtime.id });

    // Initialize the blackout settings if they don't exist
    browser.storage.local.get('blackout').then((result) => {
        if (!result.blackout) {
            // Set default settings with example.com as the default site
            browser.storage.local.set({
                blackout: {
                    enabled: true, // Default to enabled
                    sites: ['example.com'], // Default site
                },
            });
            console.log('Initialized default blackout settings');
        }
    });
});
