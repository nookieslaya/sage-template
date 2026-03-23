import.meta.glob(['../images/**', '../fonts/**']);

import { initHeroShader } from './features/hero';
import { initHowItWorks } from './features/how-it-works';
import { initFeaturedWork } from './features/featured-work';
import { initSitePreloader } from './features/preloader';
import { initRevealOnScroll } from './features/reveal';
import { initShowcaseHeadlineMasks } from './features/showcase-headline';
import { initShowcaseCarousels, initWordRotators } from './features/showcase';
import { initSmoothScroll } from './features/smooth-scroll';
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
  safeInit('[TWST Smooth Scroll]', initSmoothScroll);
  safeInit('[TWST Showcase Headline]', initShowcaseHeadlineMasks);
  safeInit('[TWST]', initThemeAndLanguage);
  safeInit('[TWST Hero]', initHeroShader);
  safeInit('[TWST How It Works]', initHowItWorks);
  safeInit('[TWST Featured Work]', initFeaturedWork);
  safeInit('[TWST Showcase]', initShowcaseCarousels);
  safeInit('[TWST Words]', initWordRotators);
  safeInit('[TWST Reveal]', initRevealOnScroll);
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
