export const initRevealOnScroll = () => {
  const roots = Array.from(document.querySelectorAll('[data-reveal-root]'));

  if (roots.length === 0) {
    return;
  }

  if (!('IntersectionObserver' in window)) {
    roots.forEach((root) => {
      root.querySelectorAll('[data-reveal-item]').forEach((item) => {
        item.classList.add('is-visible');
      });
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.querySelectorAll('[data-reveal-item]').forEach((item) => {
          const delay = Number.parseInt(item.dataset.revealDelay || '0', 10) || 0;
          item.style.transitionDelay = `${delay}ms`;
          item.classList.add('is-visible');
        });

        observer.unobserve(entry.target);
      });
    },
    {
      root: null,
      threshold: 0.16,
      rootMargin: '0px 0px -8% 0px',
    },
  );

  roots.forEach((root) => observer.observe(root));
};
