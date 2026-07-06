import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';
import './styles/theme.css';
import './styles/layout.css';
import './styles/sounds.css';
import './styles/routing.css';
import './styles/hotkeys.css';
import './styles/product.css';

createRoot(document.querySelector('#root')).render(<App />);
