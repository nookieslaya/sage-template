import { prefersReducedMotion } from '../lib/media';

export const initSitePreloader = () => {
  const preloader = document.querySelector('[data-site-preloader]');

  if (!preloader) {
    return;
  }

  const letters = Array.from(preloader.querySelectorAll('[data-preload-letter]'));
  const reducedMotion = prefersReducedMotion();
  const body = document.body;
  const letterDelay = reducedMotion ? 0 : 140;
  const curtainDelay = reducedMotion ? 120 : 980;
  const minDuration = reducedMotion ? 320 : 1880;
  let isPageReady = document.readyState === 'complete';
  let canFinish = false;
  let hasFinished = false;

  const finish = () => {
    if (hasFinished) {
      return;
    }

    hasFinished = true;
    document.documentElement.classList.add('twst-preload-complete');
    body.classList.add('twst-preload-complete');
    document.dispatchEvent(new CustomEvent('twst:preload-complete'));
    preloader.classList.add('is-complete');
    body.classList.remove('twst-preload-active');
    window.setTimeout(() => {
      preloader.remove();
    }, 900);
  };

  letters.forEach((letter, index) => {
    window.setTimeout(() => {
      letter.classList.add('is-visible');
    }, 120 + index * letterDelay);
  });

  window.setTimeout(() => {
    preloader.classList.add('is-curtain');
  }, curtainDelay);

  window.setTimeout(() => {
    canFinish = true;
    if (isPageReady) {
      finish();
    }
  }, minDuration);

  window.addEventListener(
    'load',
    () => {
      isPageReady = true;
      if (canFinish) {
        finish();
      }
    },
    { once: true },
  );

  window.setTimeout(() => {
    isPageReady = true;
    canFinish = true;
    finish();
  }, 5200);
};
