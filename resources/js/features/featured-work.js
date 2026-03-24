const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const initFeaturedWork = () => {
  const sections = Array.from(document.querySelectorAll('[data-featured-work="true"]'));

  if (sections.length === 0) {
    return;
  }

  sections.forEach((section) => {
    const thumbs = Array.from(section.querySelectorAll('[data-fw-thumb]'));
    const slides = Array.from(section.querySelectorAll('[data-fw-slide]'));
    const steps = Array.from(section.querySelectorAll('[data-fw-step]'));
    const cursorSurfaces = Array.from(section.querySelectorAll('[data-fw-cursor-surface="true"]'));
    const scrollContainer = section.querySelector('.twst-featured-work__scroll');

    if (thumbs.length === 0 || slides.length === 0) {
      return;
    }

    const maxIndex = Math.max(slides.length - 1, 0);
    const desktopMedia = window.matchMedia('(min-width: 1024px)');
    let activeIndex = 0;
    let stepObserver = null;
    let lockedIndex = null;
    let lockTimer = 0;

    const scrollToStoryStep = (index) => {
      const step = steps[index];
      if (!step) {
        return;
      }

      const rect = step.getBoundingClientRect();
      const viewportOffsetRatio = index === maxIndex ? 0.3 : 0.44;
      const desiredTop = window.scrollY + rect.top - window.innerHeight * viewportOffsetRatio;

      if (!scrollContainer) {
        window.scrollTo({
          top: Math.max(desiredTop, 0),
          behavior: 'smooth',
        });
        return;
      }

      const containerTop = window.scrollY + scrollContainer.getBoundingClientRect().top;
      const maxPinnedTop = containerTop + scrollContainer.offsetHeight - window.innerHeight - 2;
      const releaseSafeTop = index === maxIndex ? maxPinnedTop - 8 : maxPinnedTop;
      const nextTop = clamp(desiredTop, containerTop, releaseSafeTop);

      window.scrollTo({
        top: Math.max(nextTop, 0),
        behavior: 'smooth',
      });
    };

    const setActive = (index) => {
      const bounded = clamp(index, 0, maxIndex);
      activeIndex = bounded;

      thumbs.forEach((thumb, thumbIndex) => {
        const isActive = thumbIndex === bounded;
        thumb.classList.toggle('is-active', isActive);
        thumb.setAttribute('aria-selected', isActive ? 'true' : 'false');
        thumb.setAttribute('tabindex', isActive ? '0' : '-1');
      });

      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === bounded);
      });
    };

    const connectStoryObserver = () => {
      if (!desktopMedia.matches || steps.length === 0) {
        return;
      }

      stepObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              return;
            }

            const raw = Number.parseInt(entry.target.getAttribute('data-fw-step') || '0', 10);
            const index = Number.isFinite(raw) ? raw : 0;

            if (lockedIndex !== null) {
              if (index === lockedIndex) {
                window.clearTimeout(lockTimer);
                lockTimer = 0;
                lockedIndex = null;
              } else {
                return;
              }
            }

            if (index !== activeIndex) {
              setActive(index);
            }
          });
        },
        {
          root: null,
          rootMargin: '-44% 0px -44% 0px',
          threshold: 0,
        },
      );

      steps.forEach((step) => stepObserver?.observe(step));
    };

    const disconnectStoryObserver = () => {
      if (stepObserver) {
        stepObserver.disconnect();
        stepObserver = null;
      }
    };

    thumbs.forEach((thumb) => {
      thumb.addEventListener('click', () => {
        const raw = Number.parseInt(thumb.getAttribute('data-fw-thumb') || '0', 10);
        const index = Number.isFinite(raw) ? raw : 0;
        setActive(index);

        if (!desktopMedia.matches || steps.length === 0) {
          return;
        }

        lockedIndex = index;
        window.clearTimeout(lockTimer);
        lockTimer = window.setTimeout(() => {
          lockedIndex = null;
          lockTimer = 0;
        }, 900);

        scrollToStoryStep(index);
      });

      thumb.addEventListener('keydown', (event) => {
        const raw = Number.parseInt(thumb.getAttribute('data-fw-thumb') || '0', 10);
        const current = Number.isFinite(raw) ? raw : activeIndex;

        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
          event.preventDefault();
          const next = clamp(current + 1, 0, maxIndex);
          setActive(next);
          thumbs[next]?.focus();
          if (desktopMedia.matches && steps.length) {
            lockedIndex = next;
            window.clearTimeout(lockTimer);
            lockTimer = window.setTimeout(() => {
              lockedIndex = null;
              lockTimer = 0;
            }, 900);
            scrollToStoryStep(next);
          }
        }

        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
          event.preventDefault();
          const prev = clamp(current - 1, 0, maxIndex);
          setActive(prev);
          thumbs[prev]?.focus();
          if (desktopMedia.matches && steps.length) {
            lockedIndex = prev;
            window.clearTimeout(lockTimer);
            lockTimer = window.setTimeout(() => {
              lockedIndex = null;
              lockTimer = 0;
            }, 900);
            scrollToStoryStep(prev);
          }
        }
      });
    });

    cursorSurfaces.forEach((surface) => {
      surface.addEventListener('pointermove', (event) => {
        if (!desktopMedia.matches) {
          return;
        }

        const rect = surface.getBoundingClientRect();
        const nextX = clamp(event.clientX - rect.left, 0, rect.width);
        const nextY = clamp(event.clientY - rect.top, 0, rect.height);
        surface.style.setProperty('--fw-cursor-x', `${nextX}px`);
        surface.style.setProperty('--fw-cursor-y', `${nextY}px`);
        surface.classList.add('is-cursor-visible');
      }, { passive: true });

      surface.addEventListener('pointerleave', () => {
        surface.classList.remove('is-cursor-visible');
      });
    });

    if (typeof desktopMedia.addEventListener === 'function') {
      desktopMedia.addEventListener('change', () => {
        disconnectStoryObserver();
        connectStoryObserver();
      });
    }

    setActive(0);
    connectStoryObserver();
  });
};
