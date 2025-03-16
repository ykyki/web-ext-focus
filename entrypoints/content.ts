export default defineContentScript({
    matches: ['*://*.example.com/*'],
    main() {
        console.log('Blacking out example.com page');

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
    },
});
