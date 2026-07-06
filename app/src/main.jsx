import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';
import './styles/product.css';
import './styles/hotkeys.css';

createRoot(document.querySelector('#root')).render(<App />);
