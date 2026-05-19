import { getUser, setUser } from './auth';

const THEME_KEY = 'fod_theme';
const DARK_CLASS = 'dark';

export function getStoredTheme() {
  const user = getUser();
  return user?.theme || localStorage.getItem(THEME_KEY) || 'light';
}

export function applyTheme(theme = 'light') {
  const normalized = theme === 'dark' ? 'dark' : 'light';
  localStorage.setItem(THEME_KEY, normalized);
  document.documentElement.classList.toggle(DARK_CLASS, normalized === 'dark');
  const user = getUser();
  if (user) setUser({ ...user, theme: normalized });
  return normalized;
}

export function initTheme() {
  applyTheme(getStoredTheme());
}
