import { initializeStorage } from '../lib/storage';

export default defineBackground(() => {
    // Initialize the blackout settings if they don't exist
    initializeStorage();
});
