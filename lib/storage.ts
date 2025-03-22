/**
 * Storage module for unified browser storage access
 */

// Define the storage key as a constant to avoid duplication
export const STORAGE_KEY = 'wxt-ext-focus';

// Define the storage structure
interface BlackoutSettingsDto {
    sites: string[];
    timerEndTime: number | null;
}

// Public interface
export interface BlackoutSettings extends BlackoutSettingsDto {
    _marker: null; // just used to distinguish this type from the DTO.
}

const fromDto = (dto: BlackoutSettingsDto): BlackoutSettings => ({
    ...dto,
    _marker: null,
});

// Default settings
export const DEFAULT_SETTINGS: BlackoutSettings = {
    sites: ['example.com'],
    timerEndTime: null,
    _marker: null,
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
        const dto = result[STORAGE_KEY] as BlackoutSettingsDto;
        return dto ? fromDto(dto) : DEFAULT_SETTINGS;
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
