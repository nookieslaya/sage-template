import { initWordsThreeBackgrounds } from './words-three-bg';

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
