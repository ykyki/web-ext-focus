import { initializeStorage } from '../lib/storage';

export default defineBackground(() => {
    console.log('Hello background!', { id: browser.runtime.id });

    // Initialize the blackout settings if they don't exist
    initializeStorage();
});
