// src/index.js (または index.jsx)
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // CSSファイルをインポートすることも可能
import App from './App'; // メインのAppコンポーネントをインポート

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
