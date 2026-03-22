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
    let cleanupTimer = 0;
    let lastScrollY = window.scrollY || window.pageYOffset || 0;

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

    const activate = (nextIndex, scrollDirection = 'down') => {
      const bounded = Math.max(0, Math.min(steps.length - 1, nextIndex));
      let direction = 'none';

      if (bounded !== activeIndex) {
        direction = scrollDirection === 'up' ? 'up' : 'down';
      }

      steps.forEach((step, index) => {
        step.classList.toggle('is-active', index === bounded);
      });

      if (direction === 'none') {
        images.forEach((image, index) => {
          image.classList.remove(
            'is-enter-from-top',
            'is-enter-from-bottom',
            'is-leave-to-top',
            'is-leave-to-bottom',
          );
          image.classList.toggle('is-active', index === bounded);
        });
      } else {
        const previousImage = images[activeIndex];
        const nextImage = images[bounded];

        images.forEach((image) => {
          image.classList.remove(
            'is-enter-from-top',
            'is-enter-from-bottom',
            'is-leave-to-top',
            'is-leave-to-bottom',
          );
        });

        if (previousImage) {
          previousImage.classList.add('is-active');
          previousImage.classList.add(direction === 'down' ? 'is-leave-to-top' : 'is-leave-to-bottom');
        }

        if (nextImage) {
          nextImage.classList.remove('is-active');
          nextImage.classList.add(direction === 'down' ? 'is-enter-from-bottom' : 'is-enter-from-top');
          nextImage.getBoundingClientRect();
        }

        window.requestAnimationFrame(() => {
          if (previousImage) {
            previousImage.classList.remove('is-active');
          }
          if (nextImage) {
            nextImage.classList.add('is-active');
          }
        });

        window.clearTimeout(cleanupTimer);
        cleanupTimer = window.setTimeout(() => {
          images.forEach((image) => {
            image.classList.remove(
              'is-enter-from-top',
              'is-enter-from-bottom',
              'is-leave-to-top',
              'is-leave-to-bottom',
            );
          });
        }, 480);
      }

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
      const currentScrollY = window.scrollY || window.pageYOffset || 0;
      const scrollDirection = currentScrollY < lastScrollY ? 'up' : 'down';
      lastScrollY = currentScrollY;

      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
      const rect = scrollArea.getBoundingClientRect();
      const travel = Math.max(rect.height - viewportHeight, 1);
      const progress = Math.max(0, Math.min(1, -rect.top / travel));
      const nextIndex = Math.min(steps.length - 1, Math.round(progress * (steps.length - 1)));
      activate(nextIndex, scrollDirection);
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
