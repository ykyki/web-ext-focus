import solidLogo from '@/assets/solid.svg';
import { createSignal } from 'solid-js';
import wxtLogo from '/wxt.svg';
import './App.css';

function App() {
    const [count, setCount] = createSignal(0);

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
            <h1>WXT + Solid</h1>
            <div class="card">
                <button type="button" onClick={() => setCount((count) => count + 1)}>
                    count is {count()}
                </button>
                <p>
                    Edit <code>popup/App.tsx</code> and save to test HMR
                </p>
            </div>
            <p class="read-the-docs">Click on the WXT and Solid logos to learn more</p>
        </>
    );
}

export default App;
