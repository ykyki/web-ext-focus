export default defineContentScript({
    matches: ['*://*/*'], // Run on all sites
    async main() {
        const currentHost = window.location.hostname;
        console.log(`Checking blackout settings for ${currentHost}`);

        // Get the current blackout settings from storage
        const result = await browser.storage.local.get('blackout');
        const blackoutSettings = result.blackout || { enabled: false, sites: [] };

        // Check if the current site should be blacked out
        const shouldBlackout =
            blackoutSettings.enabled &&
            blackoutSettings.sites.some((site: string) => currentHost.includes(site));

        console.log('Should blackout:', shouldBlackout, 'Settings:', blackoutSettings);

        if (shouldBlackout) {
            console.log(`Applying blackout to ${currentHost}`);
            applyBlackout();
        }

        // Listen for storage changes to update the blackout in real-time
        browser.storage.onChanged.addListener((changes, area) => {
            if (area === 'local' && 'blackout' in changes) {
                const newSettings = changes.blackout.newValue;
                console.log('Blackout settings changed:', newSettings);

                // Check if the current site should be blacked out with the new settings
                const shouldBlackoutNow =
                    newSettings.enabled &&
                    newSettings.sites.some((site: string) => currentHost.includes(site));

                // Get the existing overlay
                const existingOverlay = document.querySelector('div[style*="z-index: 9999"]');

                if (shouldBlackoutNow && !existingOverlay) {
                    // Create and add overlay if this site should be blacked out and not already present
                    applyBlackout();
                } else if (!shouldBlackoutNow && existingOverlay) {
                    // Remove overlay if this site should not be blacked out and overlay is present
                    existingOverlay.remove();
                }
            }
        });
    },
});

// Helper function to create and apply the blackout overlay
function applyBlackout() {
    // Create overlay element
    const overlay = document.createElement('div');

    // Style the overlay to cover the entire page
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'black';
    overlay.style.zIndex = '9999'; // High z-index to ensure it's on top

    // Add to the page
    document.body.appendChild(overlay);
}
