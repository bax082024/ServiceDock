import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import {
    ServiceDockProvider
} from './context/ServiceDockContext';

import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <ServiceDockProvider>
                <App />
            </ServiceDockProvider>
        </BrowserRouter>
    </StrictMode>
);