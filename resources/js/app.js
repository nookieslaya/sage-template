import.meta.glob([
  '../images/**',
  '../fonts/**',
]);

const initThemeAndLanguage = () => {
  const root = document.documentElement;
  const body = document.body;
  const storedTheme = localStorage.getItem('twst-theme');
  const detectedLang = root.lang && root.lang.toLowerCase().startsWith('pl') ? 'pl' : 'en';

  const applyTheme = (theme) => {
    const isDark = theme === 'dark';

    root.classList.toggle('dark', isDark);
    body.classList.toggle('dark', isDark);
    localStorage.setItem('twst-theme', isDark ? 'dark' : 'light');
  };

  const applyLanguage = (lang) => {
    const nextLang = lang === 'pl' ? 'pl' : 'en';

    root.setAttribute('lang', nextLang);
    root.setAttribute('data-language', nextLang);

    document.querySelectorAll('[data-lang]').forEach((node) => {
      node.classList.toggle('hidden', node.dataset.lang !== nextLang);
    });

  };

  if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    applyTheme('dark');
  } else {
    applyTheme('light');
  }

  applyLanguage(detectedLang);

  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
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

  const sideNav = document.querySelector('[data-side-nav]');

  if (sideNav) {
    const sideNavToggle = sideNav.querySelector('[data-side-nav-toggle]');
    const sideNavArrow = sideNav.querySelector('[data-side-arrow]');
    const sideNavLinksWrapper = sideNav.querySelector('[data-side-nav-links]');
    const links = Array.from(sideNav.querySelectorAll('[data-side-link]'));
    const sections = links
      .map((link) => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);
    const navStateKey = 'twst-side-nav-collapsed';

    const setCollapsed = (collapsed) => {
      sideNav.dataset.collapsed = collapsed ? 'true' : 'false';
      sideNavToggle?.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      sideNavLinksWrapper?.classList.toggle('hidden', collapsed);
      if (sideNavArrow) {
        sideNavArrow.textContent = collapsed ? '›' : '‹';
      }
      localStorage.setItem(navStateKey, collapsed ? '1' : '0');
    };

    const isCollapsed = localStorage.getItem(navStateKey) === '1';
    setCollapsed(isCollapsed);

    if (sideNavToggle) {
      sideNavToggle.addEventListener('click', () => {
        const collapsed = sideNav.dataset.collapsed === 'true';
        setCollapsed(!collapsed);
      });
    }

    const setActive = (id) => {
      links.forEach((link) => {
        const isActive = link.getAttribute('href') === `#${id}`;
        link.dataset.active = isActive ? 'true' : 'false';
      });
    };

    if (sections.length) {
      const updateActiveByScroll = () => {
        const offsetY = window.scrollY + 180;
        let currentId = sections[0].id;

        sections.forEach((section) => {
          if (section.offsetTop <= offsetY) {
            currentId = section.id;
          }
        });

        setActive(currentId);
      };

      updateActiveByScroll();
      window.addEventListener('scroll', updateActiveByScroll, { passive: true });
      window.addEventListener('resize', updateActiveByScroll);
    }

    links.forEach((link) => {
      link.addEventListener('click', () => {
        const targetId = (link.getAttribute('href') || '').replace('#', '');
        if (targetId) {
          setActive(targetId);
        }
      });
    });
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initThemeAndLanguage);
} else {
  initThemeAndLanguage();
}
