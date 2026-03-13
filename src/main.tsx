import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Apply theme before first render to prevent flash
const savedTheme = localStorage.getItem('ro-tracker-theme');
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}

// Apply accent color before first render to prevent flash
const ACCENT_COLORS: Record<string, { light: string; dark: string }> = {
  blue:   { light: '214 95% 53%', dark: '214 90% 65%' },
  green:  { light: '142 65% 42%', dark: '142 60% 52%' },
  purple: { light: '263 75% 58%', dark: '263 70% 68%' },
  orange: { light:  '24 90% 50%', dark:  '24 85% 62%' },
  rose:   { light: '346 80% 52%', dark: '346 75% 65%' },
  teal:   { light: '175 75% 40%', dark: '175 70% 52%' },
};
const savedAccent = localStorage.getItem('ro-tracker-accent') || 'blue';
const isDark = savedTheme === 'dark';
const accentHsl = ACCENT_COLORS[savedAccent]?.[isDark ? 'dark' : 'light'] ?? '214 95% 53%';
document.documentElement.style.setProperty('--primary', accentHsl);
document.documentElement.style.setProperty('--ring', accentHsl);

createRoot(document.getElementById("root")!).render(<App />);
