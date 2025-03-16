import { For, createSignal, onMount } from 'solid-js';
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

    onMount(async () => {
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

    const handleKeyPress = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            addSite();
        }
    };

    return (
        <>
            <h1>Focus Mode</h1>
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

                <div class="site-input-container">
                    <input
                        type="text"
                        value={newSite()}
                        onInput={(e) => setNewSite(e.currentTarget.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Enter domain (e.g., example.com)"
                    />
                    <button type="button" onClick={addSite}>
                        Add Site
                    </button>
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

                <p>Toggle the switch to enable or disable the blackout on all sites in the list.</p>
            </div>
        </>
    );
}

export default App;
