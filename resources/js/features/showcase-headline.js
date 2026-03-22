const showcaseHeadlineTimers = new WeakMap();

export const initShowcaseHeadlineMasks = () => {
  const headlines = Array.from(document.querySelectorAll('.twst-showcase-headline'));

  if (headlines.length === 0) {
    return;
  }

  const buildMasks = (headline) => {
    const base = headline.querySelector('[data-showcase-headline-base]');
    const masks = headline.querySelector('[data-showcase-headline-masks]');

    if (!base || !masks) {
      return;
    }

    const originalText = base.dataset.originalText || base.textContent || '';
    const normalizedText = originalText.replace(/\s+/g, ' ').trim();

    if (normalizedText === '') {
      return;
    }

    if (!base.dataset.originalText) {
      base.dataset.originalText = normalizedText;
    }

    base.textContent = '';
    masks.innerHTML = '';

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

    const lines = [];

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

      const previousTimer = showcaseHeadlineTimers.get(section);
      if (previousTimer) {
        window.clearTimeout(previousTimer);
      }

      if (document.documentElement.classList.contains('twst-preload-complete')) {
        const timer = window.setTimeout(() => {
          section.dispatchEvent(
            new CustomEvent('twst:showcase-title-complete', {
              bubbles: true,
            }),
          );
        }, animationDurationMs + 80);

        showcaseHeadlineTimers.set(section, timer);
      }
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
  };

  headlines.forEach((headline) => {
    buildMasks(headline);
  });

  document.addEventListener(
    'twst:preload-complete',
    () => {
      headlines.forEach((headline) => {
        const section = headline.closest('.twst-hero-showcase');
        const duration = Number.parseInt(section?.dataset.showcaseTitleDuration || '0', 10) || 0;

        if (!section) {
          return;
        }

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
      });
    },
    { once: true },
  );

  let resizeFrame = 0;
  window.addEventListener('resize', () => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(() => {
      headlines.forEach((headline) => buildMasks(headline));
    });
  });
};
