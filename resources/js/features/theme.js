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
  const header = document.querySelector('.twst-site-header');

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobilePanel.classList.contains('hidden');

      mobilePanel.classList.toggle('hidden', !isOpen);
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    const flashTapState = (link) => {
      if (!link) {
        return;
      }

      link.classList.add('is-tapped');
      window.setTimeout(() => {
        link.classList.remove('is-tapped');
      }, 260);
    };

    mobilePanel.querySelectorAll('a').forEach((link) => {
      link.addEventListener('touchstart', () => flashTapState(link), { passive: true });
      link.addEventListener('mousedown', () => flashTapState(link));
    });
  }

  if (header) {
    let ticking = false;
    let lastScrollY = window.scrollY;
    const condensedOffset = 40;
    const directionThreshold = 6;

    const getHideActivationOffset = () => {
      const firstSection = document.querySelector('#main > section, main > section, [data-first-section]');
      if (!firstSection) {
        return 420;
      }

      const sectionTop = firstSection.offsetTop || 0;
      const sectionHeight = firstSection.offsetHeight || 0;
      return Math.max(320, sectionTop + sectionHeight - header.offsetHeight);
    };

    const syncHeaderState = () => {
      const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
      const currentY = window.scrollY;
      const shouldCondense = isDesktop && currentY > condensedOffset;
      header.classList.toggle('is-condensed', shouldCondense);

      if (!isDesktop) {
        header.classList.remove('is-scroll-hidden');
        lastScrollY = currentY;
        ticking = false;
        return;
      }

      const hideActivationOffset = getHideActivationOffset();
      const hasPassedFirstSection = currentY > hideActivationOffset;
      const delta = currentY - lastScrollY;

      if (!hasPassedFirstSection || !shouldCondense) {
        header.classList.remove('is-scroll-hidden');
      } else if (delta > directionThreshold) {
        header.classList.add('is-scroll-hidden');
      } else if (delta < -directionThreshold) {
        header.classList.remove('is-scroll-hidden');
      }

      lastScrollY = currentY;
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) {
        return;
      }
      ticking = true;
      window.requestAnimationFrame(syncHeaderState);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', syncHeaderState, { passive: true });
    syncHeaderState();
  }

  window.__twstThemeReady = true;
};
