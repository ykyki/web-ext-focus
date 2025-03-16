export default defineContentScript({
    matches: ['*://*.example.com/*'],
    async main() {
        console.log('Checking blackout settings for example.com');

        // Get the current blackout state from storage
        const result = await browser.storage.local.get('blackoutEnabled');
        const isBlackoutEnabled = result.blackoutEnabled !== false; // Default to true if not set

        console.log('Blackout enabled:', isBlackoutEnabled);

        if (isBlackoutEnabled) {
            console.log('Applying blackout to example.com page');

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

        // Listen for storage changes to update the blackout in real-time
        browser.storage.onChanged.addListener((changes, area) => {
            if (area === 'local' && 'blackoutEnabled' in changes) {
                const newValue = changes.blackoutEnabled.newValue;
                console.log('Blackout setting changed to:', newValue);

                // Get the existing overlay
                const existingOverlay = document.querySelector('div[style*="z-index: 9999"]');

                if (newValue && !existingOverlay) {
                    // Create and add overlay if enabled and not already present
                    const overlay = document.createElement('div');
                    overlay.style.position = 'fixed';
                    overlay.style.top = '0';
                    overlay.style.left = '0';
                    overlay.style.width = '100%';
                    overlay.style.height = '100%';
                    overlay.style.backgroundColor = 'black';
                    overlay.style.zIndex = '9999';
                    document.body.appendChild(overlay);
                } else if (!newValue && existingOverlay) {
                    // Remove overlay if disabled and present
                    existingOverlay.remove();
                }
            }
        });
    },
});
