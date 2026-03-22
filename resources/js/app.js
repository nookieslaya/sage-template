import.meta.glob(['../images/**', '../fonts/**']);

import { initHeroShader } from './features/hero';
import { initSitePreloader } from './features/preloader';
import { initRevealOnScroll } from './features/reveal';
import { initShowcaseHeadlineMasks } from './features/showcase-headline';
import { initShowcaseCarousels, initWordRotators } from './features/showcase';
import { initThemeAndLanguage } from './features/theme';

window.__twstThemeReady = false;

const safeInit = (label, init) => {
  try {
    init();
  } catch (error) {
    console.error(`${label} init failed`, error);
  }
};

const boot = () => {
  safeInit('[TWST Preloader]', initSitePreloader);
  safeInit('[TWST Showcase Headline]', initShowcaseHeadlineMasks);
  safeInit('[TWST]', initThemeAndLanguage);
  safeInit('[TWST Hero]', initHeroShader);
  safeInit('[TWST Showcase]', initShowcaseCarousels);
  safeInit('[TWST Words]', initWordRotators);
  safeInit('[TWST Reveal]', initRevealOnScroll);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
