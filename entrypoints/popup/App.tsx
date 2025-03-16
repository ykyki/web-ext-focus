import solidLogo from '@/assets/solid.svg';
import { createSignal, onMount } from 'solid-js';
import wxtLogo from '/wxt.svg';
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
            <div>
                <a href="https://wxt.dev" target="_blank" rel="noreferrer">
                    <img src={wxtLogo} class="logo" alt="WXT logo" />
                </a>
                <a href="https://solidjs.com" target="_blank" rel="noreferrer">
                    <img src={solidLogo} class="logo solid" alt="Solid logo" />
                </a>
            </div>
            <h1>Focus Mode</h1>
            <div class="card">
                <div
                    style={{
                        display: 'flex',
                        'align-items': 'center',
                        'justify-content': 'center',
                        gap: '10px',
                        margin: '20px 0',
                    }}
                >
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
