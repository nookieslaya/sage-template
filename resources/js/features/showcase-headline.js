const showcaseHeadlineTimers = new WeakMap();

export const initShowcaseHeadlineMasks = () => {
  const headlines = Array.from(document.querySelectorAll('.twst-showcase-headline'));

  if (headlines.length === 0) {
    return;
  }

  const scheduleHeroTitleComplete = (headline) => {
    const section = headline.closest('.twst-hero-showcase');

    if (!section) {
      return;
    }

    const duration = Number.parseInt(section.dataset.showcaseTitleDuration || '0', 10) || 0;
    const previousTimer = showcaseHeadlineTimers.get(section);

    if (previousTimer) {
      window.clearTimeout(previousTimer);
    }

    const timer = window.setTimeout(() => {
      section.dispatchEvent(
        new CustomEvent('twst:showcase-title-complete', {
          bubbles: true,
        }),
      );
    }, duration + 80);

    showcaseHeadlineTimers.set(section, timer);
  };

  const startHeadlineAnimation = (headline) => {
    if (headline.dataset.showcaseHeadlineAnimated === 'true') {
      return;
    }

    headline.dataset.showcaseHeadlineAnimated = 'true';
    headline.classList.add('is-showcase-animated');
    scheduleHeroTitleComplete(headline);
  };

  const buildMasks = (headline) => {
    const base = headline.querySelector('[data-showcase-headline-base]');
    const masks = headline.querySelector('[data-showcase-headline-masks]');

    if (!base || !masks) {
      return;
    }

    const originalText = base.dataset.originalText || base.textContent || '';
    const normalizedOriginal = originalText.replace(/\r\n?/g, '\n').trim();
    const normalizedText = normalizedOriginal.replace(/\s+/g, ' ').trim();

    if (normalizedText === '') {
      return;
    }

    if (!base.dataset.originalText) {
      base.dataset.originalText = normalizedOriginal;
    }

    headline.setAttribute('aria-label', normalizedText);
    base.setAttribute('aria-hidden', 'true');

    base.textContent = '';
    masks.innerHTML = '';

    const manualLines = normalizedOriginal
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const lines = [];

    if (manualLines.length > 1) {
      manualLines.forEach((lineText, index) => {
        lines.push({
          top: index,
          words: lineText.split(/\s+/).filter(Boolean),
        });
      });
    } else {
      const words = normalizedText.split(' ');
      const fragments = [];

      words.forEach((word, index) => {
        const span = document.createElement('span');
        span.className = 'twst-showcase-headline__word';
        span.textContent = word;
        base.appendChild(span);
        fragments.push(span);

        if (index < words.length - 1) {
          const space = document.createTextNode(' ');
          base.appendChild(space);
        }
      });

      fragments.forEach((fragment) => {
        const top = Math.round(fragment.offsetTop);
        const currentLine = lines[lines.length - 1];

        if (!currentLine || currentLine.top !== top) {
          lines.push({
            top,
            words: [fragment.textContent || ''],
          });
        } else {
          currentLine.words.push(fragment.textContent || '');
        }
      });
    }

    const animationDurationMs = lines.reduce((maxDuration, line, index) => {
      const lineDelay = index * 140;
      const charDelay = Math.max(0, line.words.join(' ').length - 1) * 22;
      const maskEnd = 1400 + lineDelay;
      const textEnd = 1090 + lineDelay + charDelay + 220;
      return Math.max(maxDuration, maskEnd, textEnd);
    }, 0);

    const section = headline.closest('.twst-hero-showcase');
    if (section) {
      section.dataset.showcaseTitleDuration = String(animationDurationMs);
    }

    base.textContent = '';

    lines.forEach((line, index) => {
      const lineText = line.words.join(' ');
      const lineElement = document.createElement('span');
      lineElement.className = 'twst-showcase-headline__line';
      lineElement.dataset.lineIndex = String(index);
      lineElement.style.setProperty('--twst-line-delay', `${index * 140}ms`);
      lineElement.setAttribute('aria-hidden', 'true');

      Array.from(lineText).forEach((character, characterIndex) => {
        const charElement = document.createElement('span');
        charElement.className =
          character === ' '
            ? 'twst-showcase-headline__char twst-showcase-headline__char--space'
            : 'twst-showcase-headline__char';
        charElement.textContent = character === ' ' ? '\u00A0' : character;
        charElement.style.setProperty('--twst-char-delay', `${characterIndex * 22}ms`);
        lineElement.appendChild(charElement);
      });

      base.appendChild(lineElement);
    });

    const lineElements = Array.from(base.querySelectorAll('.twst-showcase-headline__line'));

    lineElements.forEach((lineElement, index) => {
      const top = lineElement.offsetTop;
      const height = lineElement.offsetHeight;
      const width = lineElement.offsetWidth;

      ['white', 'accent'].forEach((variant) => {
        const mask = document.createElement('span');
        mask.className = `twst-showcase-headline__fill twst-showcase-headline__fill--${variant}`;
        mask.style.setProperty('--twst-line-top', `${top}px`);
        mask.style.setProperty('--twst-line-height', `${height}px`);
        mask.style.setProperty('--twst-line-width', `${width}px`);
        mask.style.setProperty('--twst-line-delay', `${index * 140}ms`);
        masks.appendChild(mask);
      });
    });

    if (headline.dataset.showcaseHeadlineAnimated === 'true') {
      scheduleHeroTitleComplete(headline);
    }
  };

  headlines.forEach((headline) => {
    buildMasks(headline);
  });

  const preloadHeadlines = [];
  const inViewHeadlines = [];

  headlines.forEach((headline) => {
    const trigger = String(headline.dataset.showcaseHeadlineTrigger || 'preload').toLowerCase();

    if (trigger === 'inview') {
      inViewHeadlines.push(headline);
      return;
    }

    preloadHeadlines.push(headline);
  });

  if (inViewHeadlines.length > 0) {
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          startHeadlineAnimation(entry.target);
          currentObserver.unobserve(entry.target);
        });
      },
      {
        root: null,
        threshold: 0.45,
        rootMargin: '0px 0px -8% 0px',
      },
    );

    inViewHeadlines.forEach((headline) => observer.observe(headline));
  }

  if (preloadHeadlines.length > 0) {
    const startPreloadHeadlines = () => {
      preloadHeadlines.forEach((headline) => startHeadlineAnimation(headline));
    };

    if (document.documentElement.classList.contains('twst-preload-complete')) {
      startPreloadHeadlines();
    } else {
      document.addEventListener('twst:preload-complete', startPreloadHeadlines, { once: true });
    }
  }

  let resizeFrame = 0;
  window.addEventListener('resize', () => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(() => {
      headlines.forEach((headline) => buildMasks(headline));
    });
  });
};
