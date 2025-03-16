import { getSettings, initializeStorage, saveSettings } from '../lib/storage';

export default defineBackground(() => {
    // Initialize the blackout settings if they don't exist
    initializeStorage();

    // Check for active timers on startup
    const checkActiveTimers = async () => {
        const settings = await getSettings();

        // If there's an active timer, check if it has expired
        if (settings.timerActive && settings.timerEndTime) {
            const now = Date.now();
            const timeLeft = settings.timerEndTime - now;

            // If the timer has expired, reset it and disable blackout
            if (timeLeft <= 0) {
                const newSettings = {
                    ...settings,
                    enabled: false, // Disable blackout when timer has expired
                    timerActive: false,
                    timerEndTime: null,
                    timerDuration: null,
                };
                await saveSettings(newSettings);
            }
        }
    };

    // Run the check on startup
    checkActiveTimers();
});
