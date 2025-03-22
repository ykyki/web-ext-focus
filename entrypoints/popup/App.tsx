import { For, Show, createSignal, onCleanup, onMount } from 'solid-js';
import { type BlackoutSettings, getSettings, saveSettings, timerActive } from '../../lib/storage';
import './App.css';

function App() {
    const [blackoutSettings, setBlackoutSettings] = createSignal<BlackoutSettings>({
        sites: ['example.com'],
        timerEndTime: null,
        timerDuration: null,
    });
    const [newSite, setNewSite] = createSignal('');
    const [currentSite, setCurrentSite] = createSignal('');
    const [timeRemaining, setTimeRemaining] = createSignal<string>('');
    const [intervalId, setIntervalId] = createSignal<number | null>(null);
    const [now, setNow] = createSignal(Date.now());

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

    // Function to format time remaining in MM:SS format
    const formatTimeRemaining = (milliseconds: number): string => {
        if (milliseconds <= 0) return '00:00';

        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Function to update the countdown display
    const updateCountdown = () => {
        const settings = blackoutSettings();

        if (!timerActive(settings, now())) return;

        const timeLeft = settings.timerEndTime - now();

        if (timeLeft <= 0) {
            // Timer has ended
            const currentIntervalId = intervalId();
            if (currentIntervalId !== null) {
                clearInterval(currentIntervalId);
            }
            setIntervalId(null);

            // Reset timer state and disable blackout
            const newSettings = {
                ...settings,
                timerActive: false,
                timerEndTime: null,
                timerDuration: null,
            };
            setBlackoutSettings(newSettings);
            saveSettings(newSettings);
            return;
        }

        setTimeRemaining(formatTimeRemaining(timeLeft));
    };

    // Function to start the timer
    const startTimer = async (durationMinutes: number) => {
        // Clear any existing interval
        const currentIntervalId = intervalId();
        if (currentIntervalId !== null) {
            clearInterval(currentIntervalId);
        }

        const now = Date.now();
        const endTime = now + durationMinutes * 60 * 1000;

        const currentSettings = blackoutSettings();
        const newSettings = {
            ...currentSettings,
            timerActive: true,
            timerEndTime: endTime,
            timerDuration: durationMinutes,
        };

        setBlackoutSettings(newSettings);
        await saveSettings(newSettings);

        // Set initial time remaining
        setTimeRemaining(formatTimeRemaining(durationMinutes * 60 * 1000));

        // Start the countdown interval
        const id = window.setInterval(updateCountdown, 1000);
        setIntervalId(id);
    };

    onMount(async () => {
        // Get the current domain
        const domain = await getCurrentTabDomain();
        setCurrentSite(domain);

        // Get the current settings from storage
        const settings = await getSettings();
        setBlackoutSettings(settings);

        const nowInterval = setInterval(() => setNow(Date.now()), 1000);
        onCleanup(() => clearInterval(nowInterval));

        // Check if there's an active timer
        if (timerActive(settings, now())) {
            const timeLeft = settings.timerEndTime - now();

            if (timeLeft > 0) {
                // Timer is still active
                setTimeRemaining(formatTimeRemaining(timeLeft));
                const id = window.setInterval(updateCountdown, 1000);
                setIntervalId(id);
            } else {
                // Timer has expired, disable blackout
                const newSettings = {
                    ...settings,
                    timerActive: false,
                    timerEndTime: null,
                    timerDuration: null,
                };
                setBlackoutSettings(newSettings);
                saveSettings(newSettings);
            }
        }
    });

    // Clean up interval on component unmount
    onCleanup(() => {
        const currentIntervalId = intervalId();
        if (currentIntervalId !== null) {
            clearInterval(currentIntervalId);
        }
    });

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
        await saveSettings(newSettings);
    };

    const removeSite = async (siteToRemove: string) => {
        const currentSettings = blackoutSettings();
        const newSettings = {
            ...currentSettings,
            sites: currentSettings.sites.filter((site) => site !== siteToRemove),
        };

        setBlackoutSettings(newSettings);

        // Save to storage
        await saveSettings(newSettings);
    };

    return (
        <>
            <h1>Focus</h1>
            <div class="card">
                <Show
                    when={!timerActive(blackoutSettings(), now())}
                    fallback={
                        <div class="timer-display">
                            <div class="countdown">{timeRemaining()}</div>
                            <div class="timer-label">Time Remaining</div>
                        </div>
                    }
                >
                    <div class="timer-options">
                        <h3>Timer:</h3>
                        <div class="timer-buttons">
                            <button type="button" class="timer-btn" onClick={() => startTimer(0.1)}>
                                0min
                            </button>
                            <button type="button" class="timer-btn" onClick={() => startTimer(15)}>
                                15min
                            </button>
                            <button type="button" class="timer-btn" onClick={() => startTimer(60)}>
                                60min
                            </button>
                            <button type="button" class="timer-btn" onClick={() => startTimer(90)}>
                                90min
                            </button>
                            <button type="button" class="timer-btn" onClick={() => startTimer(180)}>
                                180min
                            </button>
                        </div>
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
                </Show>
            </div>
        </>
    );
}

export default App;
