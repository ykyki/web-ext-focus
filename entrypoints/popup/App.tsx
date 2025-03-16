import { For, createResource, createSignal, onMount } from 'solid-js';
import './App.css';

interface BlackoutSettings {
    enabled: boolean;
    sites: string[];
}

function App() {
    const [blackoutSettings, setBlackoutSettings] = createSignal<BlackoutSettings>({
        enabled: true,
        sites: ['example.com'],
    });
    const [newSite, setNewSite] = createSignal('');
    const [currentSite, setCurrentSite] = createSignal('');

    // Function to get the current tab's domain
    const getCurrentTabDomain = async () => {
        try {
            const tabs = await browser.tabs.query({ active: true, currentWindow: true });
            if (tabs[0]?.url) {
                const url = new URL(tabs[0].url);
                return url.hostname;
            }
        } catch (error) {
            console.error('Error getting current tab:', error);
        }
        return '';
    };

    onMount(async () => {
        // Get the current domain
        const domain = await getCurrentTabDomain();
        setCurrentSite(domain);

        // Get the current settings from storage
        const result = await browser.storage.local.get('blackout');
        if (result.blackout) {
            setBlackoutSettings(result.blackout);
        }
    });

    const toggleBlackout = async () => {
        const currentSettings = blackoutSettings();
        const newSettings = {
            ...currentSettings,
            enabled: !currentSettings.enabled,
        };

        setBlackoutSettings(newSettings);

        // Save to storage
        await browser.storage.local.set({ blackout: newSettings });
    };

    const addSite = async () => {
        const site = newSite().trim();
        if (!site) return;

        // Don't add if already in the list
        if (blackoutSettings().sites.includes(site)) {
            setNewSite('');
            return;
        }

        const currentSettings = blackoutSettings();
        const newSettings = {
            ...currentSettings,
            sites: [...currentSettings.sites, site],
        };

        setBlackoutSettings(newSettings);
        setNewSite(''); // Clear the input

        // Save to storage
        await browser.storage.local.set({ blackout: newSettings });
    };

    const removeSite = async (siteToRemove: string) => {
        const currentSettings = blackoutSettings();
        const newSettings = {
            ...currentSettings,
            sites: currentSettings.sites.filter((site) => site !== siteToRemove),
        };

        setBlackoutSettings(newSettings);

        // Save to storage
        await browser.storage.local.set({ blackout: newSettings });
    };

    return (
        <>
            <h1>Focus</h1>
            <div class="card">
                <div class="toggle-container">
                    <span>Enable Blackout:</span>
                    <label class="switch">
                        <input
                            type="checkbox"
                            checked={blackoutSettings().enabled}
                            onChange={toggleBlackout}
                        />
                        <span class="slider round" />
                    </label>
                </div>

                <div class="current-site-container">
                    {currentSite() && (
                        <button
                            type="button"
                            class="add-current-site-btn"
                            onClick={() => {
                                setNewSite(currentSite());
                                addSite();
                            }}
                        >
                            Add Current Site ({currentSite()})
                        </button>
                    )}
                </div>

                <div class="sites-list">
                    <h3>Blackout Sites:</h3>
                    <ul>
                        <For each={blackoutSettings().sites}>
                            {(site) => (
                                <li>
                                    {site}
                                    <button
                                        type="button"
                                        class="remove-btn"
                                        onClick={() => removeSite(site)}
                                    >
                                        ✕
                                    </button>
                                </li>
                            )}
                        </For>
                    </ul>
                </div>
            </div>
        </>
    );
}

export default App;
