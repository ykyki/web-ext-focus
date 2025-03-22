/**
 * Storage module for unified browser storage access
 */

// Define the storage key as a constant to avoid duplication
export const STORAGE_KEY = 'blackout';

// Define the storage structure
export interface BlackoutSettings {
    sites: string[];
    timerEndTime: number | null; // Timestamp when timer ends
    timerDuration: number | null; // Duration in minutes
}

// Default settings
export const DEFAULT_SETTINGS: BlackoutSettings = {
    sites: ['example.com'],
    timerEndTime: null,
    timerDuration: null,
};

export const shouldBlackout = (
    setting: BlackoutSettings,
    now: number,
    host: string,
): setting is BlackoutSettings & { timerEndTime: number } => {
    return timerActive(setting, now) && setting.sites.some((site) => host.includes(site));
};

export const timerActive = (
    setting: BlackoutSettings,
    now: number,
): setting is BlackoutSettings & { timerEndTime: number } => {
    return setting.timerEndTime !== null && setting.timerEndTime > now;
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
    const now = Date.now();

    return shouldBlackout(settings, now, host);
}
