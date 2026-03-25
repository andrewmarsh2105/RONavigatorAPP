import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// When a new service worker takes control (after a deploy), reload the page so
// React Router's lazy chunks resolve against the new asset hashes instead of the
// old ones that the previous SW had cached.  Guard against reload loops with a
// short cooldown flag stored in sessionStorage.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (sessionStorage.getItem('sw-reload-pending')) return;
    sessionStorage.setItem('sw-reload-pending', '1');
    window.location.reload();
  });
}

// Recover from dynamic-import failures that happen when a deploy invalidates
// old chunk hashes.  One reload is enough; the new SW will serve fresh assets.
window.addEventListener('unhandledrejection', (event) => {
  const msg = (event?.reason as Error | undefined)?.message ?? '';
  if (msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('Importing a module script failed') ||
      msg.includes('Unable to preload CSS for')) {
    if (sessionStorage.getItem('sw-reload-pending')) return;
    sessionStorage.setItem('sw-reload-pending', '1');
    window.location.reload();
  }
});

// Apply theme before first render to prevent flash
const savedTheme = localStorage.getItem('ro-tracker-theme');
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

// Apply fixed blue accent before first render to prevent flash
const isDark = savedTheme === 'dark';
const blueHsl = isDark ? '214 90% 65%' : '214 95% 53%';
document.documentElement.style.setProperty('--primary', blueHsl);
document.documentElement.style.setProperty('--ring', blueHsl);

createRoot(document.getElementById("root")!).render(<App />);
