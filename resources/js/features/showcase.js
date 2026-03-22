import { initWordsThreeBackgrounds } from './words-three-bg';
import { prefersReducedMotion } from '../lib/media';

export const initShowcaseParallax = () => {
  if (prefersReducedMotion() || !window.matchMedia('(min-width: 1024px)').matches) {
    return;
  }

  const sections = Array.from(document.querySelectorAll('.twst-hero-showcase'));

  if (sections.length === 0) {
    return;
  }

  let frameId = 0;

  const update = () => {
    frameId = 0;

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 1;
      const progress = ((viewportHeight * 0.5) - (rect.top + rect.height * 0.5)) / viewportHeight;
      const clamped = Math.max(-1, Math.min(1, progress));

      const content = section.querySelector('[data-showcase-parallax-layer="content"]');
      const media = section.querySelector('[data-showcase-parallax-layer="media"]');
      const letters = section.querySelector('[data-words-three-bg="true"]');

      if (content) {
        content.style.transform = `translate3d(0, ${clamped * 18}px, 0)`;
      }

      if (media) {
        media.style.transform = `translate3d(0, ${clamped * -28}px, 0)`;
      }

      if (letters) {
        letters.style.transform = `translate3d(0, ${clamped * -42}px, 0)`;
      }
    });
  };

  const requestUpdate = () => {
    if (frameId) {
      return;
    }

    frameId = window.requestAnimationFrame(update);
  };

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  requestUpdate();
};

export const initShowcaseCarousels = () => {
  document.querySelectorAll('.twst-hero-showcase').forEach((section) => {
    const track = section.querySelector('[data-showcase-track="true"]');
    const slides = Array.from(section.querySelectorAll('[data-showcase-slide="true"]'));
    const dots = Array.from(section.querySelectorAll('[data-showcase-dot]'));
    const autoplayEnabled = track?.dataset.autoplay === 'true';
    const autoplaySpeed = Math.max(
      2000,
      Number.parseInt(track?.dataset.autoplaySpeed || '4500', 10) || 4500,
    );
    let autoplayTimer = 0;

    if (!track || !slides.length || !dots.length) {
      return;
    }

    const getStep = () => {
      const firstCard = slides[0];
      const cardRect = firstCard.getBoundingClientRect();
      const trackStyles = window.getComputedStyle(track);
      const gap = Number.parseFloat(trackStyles.columnGap || trackStyles.gap || '0') || 0;
      return cardRect.width + gap;
    };

    const setActiveDot = () => {
      const step = Math.max(getStep(), 1);
      const activeIndex = Math.min(
        dots.length - 1,
        Math.max(0, Math.round(track.scrollLeft / step)),
      );

      dots.forEach((dot, index) => {
        dot.classList.toggle('is-active', index === activeIndex);
      });
    };

    const goToSlide = (index) => {
      track.scrollTo({
        left: getStep() * index,
        behavior: 'smooth',
      });
    };

    const clearAutoplay = () => {
      window.clearInterval(autoplayTimer);
    };

    const startAutoplay = () => {
      if (!autoplayEnabled || slides.length < 2) {
        return;
      }

      clearAutoplay();
      autoplayTimer = window.setInterval(() => {
        if (document.hidden) {
          return;
        }

        const step = Math.max(getStep(), 1);
        const currentIndex = Math.min(
          slides.length - 1,
          Math.max(0, Math.round(track.scrollLeft / step)),
        );
        const nextIndex = (currentIndex + 1) % slides.length;
        goToSlide(nextIndex);
      }, autoplaySpeed);
    };

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        goToSlide(index);
        startAutoplay();
      });
    });

    track.addEventListener(
      'scroll',
      () => {
        setActiveDot();
      },
      { passive: true },
    );

    track.addEventListener('pointerenter', clearAutoplay);
    track.addEventListener('pointerleave', startAutoplay);
    track.addEventListener('touchstart', clearAutoplay, { passive: true });
    track.addEventListener('touchend', startAutoplay, { passive: true });

    setActiveDot();
    startAutoplay();
  });
};

export const initWordRotators = () => {
  initWordsThreeBackgrounds();

  document.querySelectorAll('[data-words-rotator="true"]').forEach((rotator) => {
    const items = Array.from(rotator.querySelectorAll('[data-word-item="true"]'));
    const flash = rotator.querySelector('[data-words-flash="true"]');
    const section = rotator.closest('.twst-hero-showcase');
    const autoplayEnabled = rotator.dataset.autoplay === 'true';
    const autoplaySpeed = Math.max(
      2000,
      Number.parseInt(rotator.dataset.autoplaySpeed || '4500', 10) || 4500,
    );
    let activeIndex = 0;
    let timer = 0;

    if (items.length <= 1) {
      return;
    }

    const setActive = (nextIndex) => {
      const previousIndex = activeIndex;
      activeIndex = ((nextIndex % items.length) + items.length) % items.length;

      items.forEach((item, index) => {
        item.classList.toggle('is-active', index === activeIndex);
        item.classList.toggle('is-before', index === previousIndex && previousIndex !== activeIndex);
      });

      const activeItem = items[activeIndex];
      if (activeItem) {
        if (flash) {
          flash.classList.remove('is-active');
          window.requestAnimationFrame(() => {
            flash.classList.add('is-active');
          });
        }

        const rect = activeItem.getBoundingClientRect();
        rotator.dispatchEvent(
          new CustomEvent('twst:word-change', {
            bubbles: true,
            detail: {
              index: activeIndex,
              word: activeItem.textContent?.trim() || '',
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
              width: rect.width,
              height: rect.height,
            },
          }),
        );
      }
    };

    const clearRotation = () => {
      window.clearInterval(timer);
    };

    const startRotation = () => {
      if (!autoplayEnabled) {
        return;
      }

      clearRotation();
      timer = window.setInterval(() => {
        if (document.hidden) {
          return;
        }

        setActive((activeIndex + 1) % items.length);
      }, autoplaySpeed);
    };

    rotator.addEventListener('pointerenter', clearRotation);
    rotator.addEventListener('pointerleave', startRotation);
    rotator.addEventListener('touchstart', clearRotation, { passive: true });
    rotator.addEventListener('touchend', startRotation, { passive: true });

    items.forEach((item, index) => {
      item.classList.remove('is-active', 'is-before');
      item.classList.toggle('is-pending', index === 0);
    });

    const startRotator = () => {
      items.forEach((item) => {
        item.classList.remove('is-pending');
      });
      setActive(0);
      startRotation();
    };

    if (!section) {
      startRotator();
      return;
    }

    if (section.dataset.wordsReady === 'true') {
      startRotator();
      return;
    }

    const onTitleComplete = () => {
      section.dataset.wordsReady = 'true';
      startRotator();
    };

    section.addEventListener('twst:showcase-title-complete', onTitleComplete, { once: true });

    if (!section.querySelector('.twst-showcase-headline')) {
      onTitleComplete();
      return;
    }

    if (document.documentElement.classList.contains('twst-preload-complete')) {
      const duration = Number.parseInt(section.dataset.showcaseTitleDuration || '0', 10) || 0;
      window.setTimeout(() => {
        if (section.dataset.wordsReady === 'true') {
          return;
        }
        onTitleComplete();
      }, duration + 100);
    }
  });
};
