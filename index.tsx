import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// --- LIMPEZA DE PWA (KILL SWITCH) ---
// Este código roda ao iniciar e força a desinstalação de qualquer Service Worker
// que esteja rodando no navegador do usuário, resolvendo o problema de cache antigo.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (let registration of registrations) {
        registration.unregister().then(() => {
          console.log('Service Worker desinstalado com sucesso (Limpeza de Cache).');
          // Opcional: Recarregar a página uma vez se detectar que tinha SW antigo
          // window.location.reload(); 
        });
      }
    }).catch(err => {
      console.log('Erro ao limpar Service Worker:', err);
    });
  });
}