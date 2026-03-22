import.meta.glob(['../images/**', '../fonts/**']);

window.__twstThemeReady = false;

const heroAnimationCleanups = new WeakMap();
const heroAnimationStates = new WeakMap();
const HERO_INTERACTION_IDLE_MS = 1400;

let threeLoader = null;
let tubesLoader = null;

const loadThree = async () => {
  if (!threeLoader) {
    threeLoader = import('three')
      .then((module) => module)
      .catch((error) => {
        threeLoader = null;
        throw error;
      });
  }

  return threeLoader;
};

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isLiteHeroDevice = () =>
  window.matchMedia('(max-width: 920px)').matches ||
  window.matchMedia('(pointer: coarse)').matches;

const getHeroPerformanceMode = () => {
  if (prefersReducedMotion()) {
    return 'off';
  }

  return isLiteHeroDevice() ? 'lite' : 'full';
};

const clearHeroAnimation = (hero, canvasHost) => {
  const cleanup = heroAnimationCleanups.get(hero);
  if (typeof cleanup === 'function') {
    cleanup();
  }

  heroAnimationCleanups.delete(hero);
  hero.classList.remove('is-shader', 'is-tubes');
  canvasHost.innerHTML = '';
};

const getHeroAnimationState = (hero) => {
  let state = heroAnimationStates.get(hero);
  if (!state) {
    state = { version: 0, visible: false };
    heroAnimationStates.set(hero, state);
  }
  return state;
};

const loadTubesEngine = async () => {
  if (!tubesLoader) {
    tubesLoader = import('./hex-tubes.js')
      .then((module) => module.default)
      .catch((error) => {
        tubesLoader = null;
        throw error;
      });
  }

  return tubesLoader;
};

const mountShaderHero = async (hero, canvasHost, performanceMode = 'full') => {
  const THREE = await loadThree();
  const scene = new THREE.Scene();
  const clock = new THREE.Clock();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 1;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  canvasHost.appendChild(renderer.domElement);
  hero.classList.add('is-shader');

  const uniforms = {
    t: { value: 0 },
    r: { value: new THREE.Vector2(1, 1) },
    mouse: { value: new THREE.Vector2(0.5, 0.5) },
  };

  const geometry = new THREE.PlaneGeometry(2, 2);
  const material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec2 r;
      uniform float t;
      uniform vec2 mouse;
      varying vec2 vUv;

      mat2 rot(float a) {
        float s = sin(a);
        float c = cos(a);
        return mat2(c, -s, s, c);
      }

      float wave(vec2 p, float phase, float freq) {
        return sin(p.x * freq + phase) * 0.3 * sin(p.y * freq * 0.5 + phase * 0.7);
      }

      float glowLine(float dist, float thickness, float intensity) {
        return intensity * thickness / (abs(dist) + thickness * 0.5);
      }

      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m * m;
        m = m * m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= (1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h));
        vec3 g;
        g.x = a0.x * x0.x + h.x * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 uv = (vUv - 0.5) * 2.0;
        uv.x *= r.x / r.y;
        vec2 uv0 = uv;
        vec3 col = vec3(0.0);
        float time = t * 0.4;

        float noise = (snoise(uv * 0.5 + time * 0.02) + 1.0) * 0.5;
        col += noise * vec3(0.05, 0.0, 0.1) * 0.3;

        vec2 mouseUv = (mouse - 0.5) * 2.0;
        mouseUv.x *= r.x / r.y;
        float mouseDist = length(uv - mouseUv);
        uv += (mouseUv - uv) * (0.3 / (mouseDist + 0.5));
        float mouseGlow = 0.1 / (mouseDist + 0.1);
        mouseGlow *= (sin(t * 1.5) * 0.5 + 0.5) * 0.7 + 0.3;
        col += mouseGlow * vec3(1.0, 0.8, 1.0) * 0.15;

        uv *= rot(time * 0.05);
        float waveNoise = snoise(uv * 2.0 + time * 0.2) * 0.1;
        float c1 = sin(time * 0.3 + 0.0) * 0.5 + 0.5;
        float c2 = sin(time * 0.3 + 2.0) * 0.5 + 0.5;
        float c3 = sin(time * 0.3 + 4.0) * 0.5 + 0.5;

        float y1 = uv.y - wave(uv, time * 1.5, 2.0) + waveNoise;
        float y2 = uv.y + 0.4 - wave(uv + vec2(1.0, 0.5), time * 1.2, 2.5) + waveNoise * 0.8;
        float y3 = uv.y - 0.4 - wave(uv + vec2(-0.5, 1.0), time * 1.8, 1.8) + waveNoise * 1.2;

        col += vec3(1.0, c1 * 0.5 + 0.1, c2 * 0.7 + 0.3) * glowLine(y1, 0.03, 0.8);
        col += vec3(c2 * 0.3 + 0.1, c3 * 0.7 + 0.3, 1.0) * glowLine(y2, 0.03, 0.8);
        col += vec3(c1 * 0.7 + 0.3, c3 * 0.5 + 0.1, 1.0) * glowLine(y3, 0.03, 0.8);

        float dist = length(uv0);
        float circle = abs(sin(dist * 4.0 - time * 2.0)) * exp(-dist * 0.5);
        col += vec3(0.45, 0.65, 1.0) * circle * 0.25;

        float centerGlow = exp(-dist * 1.0) * 0.25;
        col += centerGlow * vec3(0.35, 0.45, 0.75);

        float vignette = smoothstep(0.0, 1.0, 1.0 - dist * 0.5);
        col *= vignette;
        col = pow(col, vec3(0.95));

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  });

  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  const mouse = new THREE.Vector2(0.5, 0.5);
  const targetMouse = new THREE.Vector2(0.5, 0.5);
  let frameId = 0;
  let lastRenderMs = 0;
  let interactionTimeout = 0;
  let isInteracting = false;

  const getTargetFps = () => {
    if (performanceMode === 'lite') {
      return isInteracting ? 24 : 16;
    }

    return isInteracting ? 30 : 20;
  };

  const markInteraction = () => {
    isInteracting = true;
    window.clearTimeout(interactionTimeout);
    interactionTimeout = window.setTimeout(() => {
      isInteracting = false;
    }, HERO_INTERACTION_IDLE_MS);
  };

  const onPointerMove = (clientX, clientY) => {
    const rect = hero.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    targetMouse.x = (clientX - rect.left) / rect.width;
    targetMouse.y = 1 - (clientY - rect.top) / rect.height;
    markInteraction();
  };

  const onMouseMove = (event) => onPointerMove(event.clientX, event.clientY);
  const onTouchMove = (event) => {
    if (event.touches.length > 0) {
      onPointerMove(event.touches[0].clientX, event.touches[0].clientY);
    }
  };

  const setSize = () => {
    const width = Math.max(1, hero.clientWidth || window.innerWidth);
    const height = Math.max(1, hero.clientHeight || window.innerHeight);
    renderer.setSize(width, height, false);
    uniforms.r.value.set(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  };

  const animate = (now = 0) => {
    frameId = requestAnimationFrame(animate);
    if (document.hidden) {
      return;
    }

    const minFrameDuration = 1000 / getTargetFps();
    if (now - lastRenderMs < minFrameDuration) {
      return;
    }
    lastRenderMs = now;

    uniforms.t.value = clock.getElapsedTime();
    mouse.lerp(targetMouse, 0.06);
    uniforms.mouse.value.copy(mouse);
    renderer.render(scene, camera);
  };

  hero.addEventListener('mousemove', onMouseMove, { passive: true });
  hero.addEventListener('touchmove', onTouchMove, { passive: true });
  window.addEventListener('resize', setSize);

  setSize();
  animate();

  return () => {
    cancelAnimationFrame(frameId);
    window.clearTimeout(interactionTimeout);
    hero.removeEventListener('mousemove', onMouseMove);
    hero.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('resize', setSize);
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
};

const mountTubesHero = async (hero, canvasHost, performanceMode = 'full') => {
  const createTubes = await loadTubesEngine();
  if (typeof createTubes !== 'function') {
    throw new Error('Invalid tubes engine export');
  }

  const canvas = document.createElement('canvas');
  canvas.className = 'twst-hero-tubes-canvas';
  canvasHost.appendChild(canvas);
  hero.classList.add('is-tubes');

  const isLiteMode = performanceMode === 'lite';
  const app = createTubes(canvas, {
    interactionTarget: hero,
    colors: ['#f967fb', '#53bc28', '#6958d5'],
    lights: {
      intensity: isLiteMode ? 140 : 200,
      colors: ['#83f36e', '#fe8a2e', '#ff008a', '#60aed5'],
    },
    hexSize: isLiteMode ? 11 : 13,
    chainCount: isLiteMode ? 2 : 3,
    chainLength: isLiteMode ? 18 : 32,
    pointStep: isLiteMode ? 8 : 6,
    orbitRadius: isLiteMode ? 72 : 96,
    follow: 0.08,
    wobble: isLiteMode ? 34 : 52,
    blobScale: isLiteMode ? 0.34 : 0.42,
    fadeAlpha: 0.135,
    gridHexSize: isLiteMode ? 42 : 32,
    gridGlowAlpha: isLiteMode ? 0.34 : 0.5,
    gridInfluenceRadius: isLiteMode ? 56 : 68,
    sleepRadiusX: 300,
    sleepRadiusY: 150,
    sleepTimeScale1: 1,
    sleepTimeScale2: 2,
    fps: isLiteMode ? 24 : 30,
    idleFps: isLiteMode ? 16 : 20,
  });

  return () => {
    if (app && typeof app.dispose === 'function') {
      app.dispose();
    }
    canvas.remove();
  };
};
const mountHeroAnimation = async (hero, expectedVersion = null) => {
  const state = getHeroAnimationState(hero);
  let canvasHost = hero.querySelector('[data-hero-shader-canvas]');
  if (!canvasHost) {
    canvasHost = document.createElement('div');
    canvasHost.className = 'twst-hero-canvas';
    canvasHost.setAttribute('data-hero-shader-canvas', '');
    canvasHost.setAttribute('aria-hidden', 'true');
    hero.prepend(canvasHost);
  }

  clearHeroAnimation(hero, canvasHost);

  const type = (hero.dataset.heroAnimationType || 'shader').toLowerCase();
  const performanceMode = getHeroPerformanceMode();
  let cleanup = null;

  if (performanceMode === 'off') {
    return;
  }

  try {
    cleanup =
      type === 'tubes'
        ? await mountTubesHero(hero, canvasHost, performanceMode)
        : await mountShaderHero(hero, canvasHost, performanceMode);
  } catch (error) {
    console.error(
      '[TWST Hero] animation mount failed, falling back to shader',
      error,
    );
    cleanup = await mountShaderHero(hero, canvasHost, performanceMode);
  }

  const staleMount =
    expectedVersion !== null &&
    (state.version !== expectedVersion || !state.visible);

  if (staleMount) {
    if (typeof cleanup === 'function') {
      cleanup();
    }
    hero.classList.remove('is-shader', 'is-tubes');
    canvasHost.innerHTML = '';
    return;
  }

  if (typeof cleanup === 'function') {
    heroAnimationCleanups.set(hero, cleanup);
  }
};

const initHeroShader = () => {
  const heroSections = Array.from(
    document.querySelectorAll('[data-hero-shader="true"]'),
  );

  heroSections.forEach((hero) => {
    const state = getHeroAnimationState(hero);
    let canvasHost = hero.querySelector('[data-hero-shader-canvas]');
    if (!canvasHost) {
      canvasHost = document.createElement('div');
      canvasHost.className = 'twst-hero-canvas';
      canvasHost.setAttribute('data-hero-shader-canvas', '');
      canvasHost.setAttribute('aria-hidden', 'true');
      hero.prepend(canvasHost);
    }

    if (!('IntersectionObserver' in window)) {
      state.visible = true;
      state.version += 1;
      void mountHeroAnimation(hero, state.version);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target !== hero) return;

          if (entry.isIntersecting) {
            state.visible = true;
            state.version += 1;
            void mountHeroAnimation(hero, state.version);
          } else {
            state.visible = false;
            state.version += 1;
            clearHeroAnimation(hero, canvasHost);
          }
        });
      },
      {
        root: null,
        threshold: 0.01,
      },
    );

    observer.observe(hero);
  });
};

const initThemeAndLanguage = () => {
  const root = document.documentElement;
  const body = document.body;
  let storedTheme = null;
  try {
    storedTheme = localStorage.getItem('twst-theme');
  } catch (error) {
    storedTheme = null;
  }

  const applyTheme = (theme) => {
    const isDark = theme === 'dark';

    root.classList.toggle('dark', isDark);
    body.classList.toggle('dark', isDark);
    try {
      localStorage.setItem('twst-theme', isDark ? 'dark' : 'light');
    } catch (error) {
      // ignore storage errors (private mode / strict browser settings)
    }
  };

  applyTheme(storedTheme === 'light' ? 'light' : 'dark');

  document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      applyTheme(root.classList.contains('dark') ? 'light' : 'dark');
    });
  });

  const menuToggle = document.querySelector('[data-mobile-menu-toggle]');
  const mobilePanel = document.querySelector('[data-mobile-menu-panel]');

  if (menuToggle && mobilePanel) {
    menuToggle.addEventListener('click', () => {
      const isOpen = mobilePanel.classList.contains('hidden');

      mobilePanel.classList.toggle('hidden', !isOpen);
      menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }

  window.__twstThemeReady = true;
};

const initShowcaseCarousels = () => {
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

    track.addEventListener('scroll', () => {
      setActiveDot();
    }, { passive: true });

    track.addEventListener('pointerenter', clearAutoplay);
    track.addEventListener('pointerleave', startAutoplay);
    track.addEventListener('touchstart', clearAutoplay, { passive: true });
    track.addEventListener('touchend', startAutoplay, { passive: true });

    setActiveDot();
    startAutoplay();
  });
};

const initWordRotators = () => {
  document.querySelectorAll('[data-words-rotator="true"]').forEach((rotator) => {
    const items = Array.from(rotator.querySelectorAll('[data-word-item="true"]'));
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
      item.classList.toggle('is-active', index === 0);
      item.classList.remove('is-before');
    });
    setActive(0);
    startRotation();
  });
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    try {
      initThemeAndLanguage();
    } catch (error) {
      console.error('[TWST] theme/language init failed', error);
    }

    try {
      initHeroShader();
    } catch (error) {
      console.error('[TWST Hero] init failed', error);
    }

    try {
      initShowcaseCarousels();
    } catch (error) {
      console.error('[TWST Showcase] init failed', error);
    }

    try {
      initWordRotators();
    } catch (error) {
      console.error('[TWST Words] init failed', error);
    }
  });
} else {
  try {
    initThemeAndLanguage();
  } catch (error) {
    console.error('[TWST] theme/language init failed', error);
  }

  try {
    initHeroShader();
  } catch (error) {
    console.error('[TWST Hero] init failed', error);
  }

  try {
    initShowcaseCarousels();
  } catch (error) {
    console.error('[TWST Showcase] init failed', error);
  }

  try {
    initWordRotators();
  } catch (error) {
    console.error('[TWST Words] init failed', error);
  }
}
