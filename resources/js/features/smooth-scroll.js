import Lenis from 'lenis';

export const initSmoothScroll = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  const lenis = new Lenis({
    duration: 1.12,
    easing: (t) => 1 - ((1 - t) ** 4),
    smoothWheel: true,
    smoothTouch: false,
    wheelMultiplier: 0.9,
    autoRaf: true,
  });

  window.__twstLenis = lenis;

  const preventedScrollAreas = document.querySelectorAll('.twst-showcase-track, [data-lenis-prevent-scroll]');
  preventedScrollAreas.forEach((node) => {
    node.setAttribute('data-lenis-prevent', 'true');
  });
};
