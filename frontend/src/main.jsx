import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Garantir que modal-root existe
if (!document.getElementById('modal-root')) {
  const modalRoot = document.createElement('div');
  modalRoot.id = 'modal-root';
  document.body.appendChild(modalRoot);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
