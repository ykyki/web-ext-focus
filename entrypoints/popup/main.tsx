import { render } from 'solid-js/web';

import './style.css';
import App from './App';

const rootElement = document.getElementById('root');
if (rootElement) {
    render(() => <App />, rootElement);
} else {
    console.error('Root element not found');
}
