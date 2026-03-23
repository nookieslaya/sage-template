export const initHowItWorks = () => {
  const sections = Array.from(document.querySelectorAll('[data-how-it-works="true"]'));

  if (sections.length === 0) {
    return;
  }

  sections.forEach((section) => {
    const scrollArea = section.querySelector('[data-how-scroll]');
    const stepList = section.querySelector('[data-how-step-list]');
    const marker = section.querySelector('[data-how-marker]');
    const steps = Array.from(section.querySelectorAll('[data-how-step-item]'));
    const images = Array.from(section.querySelectorAll('[data-how-image-item]'));
    const mediaStack = section.querySelector('.twst-how-media-stack');

    if (!scrollArea || !stepList || !marker || steps.length === 0) {
      return;
    }

    let activeIndex = 0;
    const syncMediaHeight = () => {
      if (!mediaStack) {
        return;
      }

      if (!window.matchMedia('(min-width: 1024px)').matches) {
        mediaStack.style.removeProperty('height');
        mediaStack.style.removeProperty('max-height');
        return;
      }

      const firstStep = steps[0];
      const lastStep = steps[steps.length - 1];

      if (!firstStep || !lastStep) {
        mediaStack.style.removeProperty('height');
        mediaStack.style.removeProperty('max-height');
        return;
      }

      const firstRect = firstStep.getBoundingClientRect();
      const lastRect = lastStep.getBoundingClientRect();
      const targetHeight = Math.ceil(lastRect.bottom - firstRect.top);

      if (targetHeight > 0) {
        mediaStack.style.height = `${targetHeight}px`;
        mediaStack.style.maxHeight = `${targetHeight}px`;
      }
    };

    const activate = (nextIndex) => {
      const bounded = Math.max(0, Math.min(steps.length - 1, nextIndex));

      steps.forEach((step, index) => {
        step.classList.toggle('is-active', index === bounded);
      });

      images.forEach((image, index) => {
        image.classList.toggle('is-active', index === bounded);
      });

      mediaStack?.style.setProperty('--twst-how-active-index', String(bounded));

      activeIndex = bounded;

      const targetStep = steps[activeIndex];
      const anchor = targetStep?.querySelector('[data-how-step-anchor]');

      if (!anchor) {
        return;
      }

      const listRect = stepList.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();
      const markerHalf = marker.offsetHeight * 0.5;
      const markerY = (anchorRect.top - listRect.top) + ((anchorRect.height * 0.5) - markerHalf);
      marker.style.transform = `translate3d(0, ${Math.max(0, markerY)}px, 0)`;
    };

    const updateByScroll = () => {
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
      const rect = scrollArea.getBoundingClientRect();
      const travel = Math.max(rect.height - viewportHeight, 1);
      const progress = Math.max(0, Math.min(1, -rect.top / travel));
      const nextIndex = Math.min(steps.length - 1, Math.round(progress * (steps.length - 1)));
      activate(nextIndex);
    };

    let frame = 0;
    const requestTick = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(() => {
        frame = 0;
        updateByScroll();
      });
    };

    window.addEventListener('scroll', requestTick, { passive: true });
    window.addEventListener('resize', () => {
      syncMediaHeight();
      requestTick();
    });

    syncMediaHeight();
    activate(0);
    requestTick();
  });
};
