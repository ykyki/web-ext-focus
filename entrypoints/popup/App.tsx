import { createSignal, onMount } from 'solid-js';
import './App.css';

function App() {
    const [isBlackoutEnabled, setIsBlackoutEnabled] = createSignal(true);

    onMount(async () => {
        // Get the current state from storage
        const result = await browser.storage.local.get('blackoutEnabled');
        setIsBlackoutEnabled(result.blackoutEnabled !== false); // Default to true if not set
    });

    const toggleBlackout = async () => {
        const newState = !isBlackoutEnabled();
        setIsBlackoutEnabled(newState);

        // Save to storage
        await browser.storage.local.set({ blackoutEnabled: newState });
    };

    return (
        <>
            <h1>Focus Mode</h1>
            <div class="card">
                <div class="toggle-container">
                    <span>Blackout example.com:</span>
                    <label class="switch">
                        <input
                            type="checkbox"
                            checked={isBlackoutEnabled()}
                            onChange={toggleBlackout}
                        />
                        <span class="slider round" />
                    </label>
                </div>
                <p>Toggle the switch to enable or disable the blackout on example.com</p>
            </div>
        </>
    );
}

export default App;
