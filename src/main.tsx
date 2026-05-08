import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PreferencesProvider } from './context/PreferencesContext';
import { ToastProvider } from './context/ToastContext';
import './assets/styles.css';

const migrateLegacyKeys = () => {
  try {
    const OLD_PREFIX = 'md-editor-';
    const NEW_PREFIX = 'instantmd-';
    const oldKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(OLD_PREFIX)) oldKeys.push(k);
    }
    for (const oldKey of oldKeys) {
      const newKey = NEW_PREFIX + oldKey.slice(OLD_PREFIX.length);
      if (localStorage.getItem(newKey) === null) {
        const val = localStorage.getItem(oldKey);
        if (val !== null) localStorage.setItem(newKey, val);
      }
      localStorage.removeItem(oldKey);
    }
  } catch (err) {
    console.error('Failed to migrate localStorage keys:', err);
  }
};

const initTheme = () => {
  const saved = localStorage.getItem('instantmd-theme');
  if (saved === 'dark') {
    document.documentElement.classList.add('dark');
  } else if (saved === 'light') {
    document.documentElement.classList.remove('dark');
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
  }
};

const migrateLocalStorage = () => {
  try {
    const NOTE_PREFIX = 'instantmd-note-';
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith(NOTE_PREFIX)) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && 'images' in parsed) {
        delete parsed.images;
        localStorage.setItem(key, JSON.stringify(parsed));
      }
    }
  } catch (err) {
    console.error('Failed to migrate legacy notes:', err);
  }
};

migrateLegacyKeys();
initTheme();
migrateLocalStorage();

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  const saved = localStorage.getItem('instantmd-theme');
  if (!saved) {
    if (e.matches) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <PreferencesProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </PreferencesProvider>
    </ErrorBoundary>
  </StrictMode>,
);
