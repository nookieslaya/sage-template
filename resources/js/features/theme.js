export const initThemeAndLanguage = () => {
  const root = document.documentElement;
  const body = document.body;
  let storedTheme = null;
  try {
    storedTheme = localStorage.getItem('twst-theme');
  } catch (error) {
    storedTheme = null;
  }

  const applyTheme = (theme) => {
    const isDark = theme === 'dark';

    root.classList.toggle('dark', isDark);
    body.classList.toggle('dark', isDark);
    try {
      localStorage.setItem('twst-theme', isDark ? 'dark' : 'light');
    } catch (error) {
      // ignore storage errors
    }
  };

  applyTheme(storedTheme === 'light' ? 'light' : 'dark');

  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      applyTheme(root.classList.contains('dark') ? 'light' : 'dark');
    });
  });

  const menuToggle = document.querySelector('[data-mobile-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-menu-panel]');

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobilePanel.classList.contains('hidden');

      mobilePanel.classList.toggle('hidden', !isOpen);
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  window.__twstThemeReady = true;
};
