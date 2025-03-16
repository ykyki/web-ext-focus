/**
 * Storage module for unified browser storage access
 */

// Define the storage key as a constant to avoid duplication
export const STORAGE_KEY = 'blackout';

// Define the storage structure
export interface BlackoutSettings {
    enabled: boolean;
    sites: string[];
    timerActive: boolean;
    timerEndTime: number | null; // Timestamp when timer ends
    timerDuration: number | null; // Duration in minutes
}

// Default settings
export const DEFAULT_SETTINGS: BlackoutSettings = {
    enabled: false, // Disabled by default, only enabled during timer sessions
    sites: ['example.com'],
    timerActive: false,
    timerEndTime: null,
    timerDuration: null,
};

/**
 * Get the current blackout settings from storage
 * @returns Promise resolving to the current settings
 */
export async function getSettings(): Promise<BlackoutSettings> {
    try {
        const result = await browser.storage.local.get(STORAGE_KEY);
        // Type assertion to handle the result properly
        return (result[STORAGE_KEY] as BlackoutSettings) || DEFAULT_SETTINGS;
    } catch (error) {
        console.error('Error getting blackout settings:', error);
        return DEFAULT_SETTINGS;
    }
}

/**
 * Save blackout settings to storage
 * @param settings The settings to save
 * @returns Promise resolving when the settings are saved
 */
export async function saveSettings(settings: BlackoutSettings): Promise<void> {
    try {
        await browser.storage.local.set({ [STORAGE_KEY]: settings });
    } catch (error) {
        console.error('Error saving blackout settings:', error);
        throw error;
    }
}

/**
 * Initialize the storage with default values if not already set
 * @returns Promise resolving when initialization is complete
 */
export async function initializeStorage(): Promise<void> {
    try {
        const result = await browser.storage.local.get(STORAGE_KEY);
        if (!result[STORAGE_KEY]) {
            await saveSettings(DEFAULT_SETTINGS);
        }
    } catch (error) {
        console.error('Error initializing storage:', error);
    }
}

/**
 * Check if a host should be blacked out based on current settings
 * @param host The hostname to check
 * @returns Promise resolving to true if the host should be blacked out
 */
export async function shouldBlackoutHost(host: string): Promise<boolean> {
    const settings = await getSettings();
    return settings.enabled && settings.sites.some((site) => host.includes(site));
}

/**
 * Subscribe to storage changes
 * @param callback Function to call when storage changes
 * @returns Function to unsubscribe
 */
export function subscribeToChanges(callback: (settings: BlackoutSettings) => void): () => void {
    // Define a type for the storage changes
    type StorageChange = {
        oldValue?: BlackoutSettings | undefined;
        newValue?: BlackoutSettings | undefined;
    };

    const listener = (changes: { [key: string]: StorageChange }, area: string) => {
        if (area === 'local' && STORAGE_KEY in changes) {
            const newSettings = changes[STORAGE_KEY].newValue as BlackoutSettings;
            callback(newSettings);
        }
    };

    browser.storage.onChanged.addListener(listener);

    // Return unsubscribe function
    return () => {
        browser.storage.onChanged.removeListener(listener);
    };
}
