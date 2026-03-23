let threeLoader = null;
const wordsBgControllers = new WeakMap();

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

const LETTERS = ['r', 'd', 'e', 'v', '.'];

const createShapeSampler = (host, width, height) => {
  const shape = String(host.dataset.wordsThreeShape || '').toLowerCase().trim();

  if (shape !== 'rdev') {
    return null;
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');

  if (!context) {
    return null;
  }

  const label = 'rdev.';
  const isNarrow = width < 768;
  const maxWidth = width * (isNarrow ? 0.94 : 0.985);
  let fontSize = Math.floor(Math.min(height * (isNarrow ? 0.84 : 0.94), width * (isNarrow ? 0.56 : 0.42)));
  fontSize = Math.max(fontSize, 42);

  context.textAlign = 'center';
  context.textBaseline = 'middle';

  for (let step = 0; step < 18; step += 1) {
    context.font = `700 ${fontSize}px Lato, sans-serif`;
    if (context.measureText(label).width <= maxWidth) {
      break;
    }
    fontSize = Math.max(42, Math.floor(fontSize * 0.92));
  }

  context.clearRect(0, 0, width, height);
  context.fillStyle = '#ffffff';
  context.font = `700 ${fontSize}px Lato, sans-serif`;
  context.fillText(label, width * 0.5, height * 0.52);
  const data = context.getImageData(0, 0, width, height).data;

  return (worldX, worldY) => {
    const pixelX = Math.round(worldX + (width * 0.5));
    const pixelY = Math.round((height * 0.5) - worldY);

    if (pixelX < 0 || pixelX >= width || pixelY < 0 || pixelY >= height) {
      return false;
    }

    const alpha = data[(pixelY * width + pixelX) * 4 + 3];
    return alpha > 12;
  };
};

const createLetterTexture = (THREE, letter) => {
  const canvas = document.createElement('canvas');
  const size = 128;
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');

  if (!context) {
    return null;
  }

  context.clearRect(0, 0, size, size);
  context.font = '700 72px Lato, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = 'rgba(255,255,255,0.9)';
  context.fillText(letter, size / 2, size / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
};

const mountWordsBackground = async (host, rotator = null) => {
  const THREE = await loadThree();
  const shapeMode = String(host.dataset.wordsThreeShape || '').toLowerCase().trim();
  const isRdevShape = shapeMode === 'rdev';
  const enablePointerInteraction = !isRdevShape;
  const enableNeonClick = isRdevShape;
  const isMobile = window.matchMedia('(max-width: 767px)').matches;
  const width = Math.max(host.clientWidth, 320);
  const height = Math.max(host.clientHeight, 320);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 1, 2000);
  camera.position.z = 1000;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isRdevShape ? (isMobile ? 1.1 : 1.5) : 1.75));
  renderer.setSize(width, height, false);
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  const textureCache = new Map();
  const getTexture = (letter) => {
    if (!textureCache.has(letter)) {
      textureCache.set(letter, createLetterTexture(THREE, letter));
    }
    return textureCache.get(letter);
  };

  const backgroundSprites = [];
  const foregroundSprites = [];
  let cellSize = isRdevShape ? (isMobile ? 10 : 9) : 15;
  let columns = Math.max(18, Math.ceil(width / cellSize));
  let rows = Math.max(18, Math.ceil(height / cellSize));

  if (isRdevShape) {
    const maxCells = isMobile ? 3200 : 5200;
    let totalCells = columns * rows;

    while (totalCells > maxCells && cellSize < 18) {
      cellSize += 1;
      columns = Math.max(18, Math.ceil(width / cellSize));
      rows = Math.max(18, Math.ceil(height / cellSize));
      totalCells = columns * rows;
    }
  }

  const stepX = width / columns;
  const stepY = height / rows;
  const startX = -width / 2 + stepX / 2;
  const startY = height / 2 - stepY / 2;
  const shapeSampler = createShapeSampler(host, width, height);

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const letter = LETTERS[(row * columns + column) % LETTERS.length];
      const baseX = startX + column * stepX;
      const baseY = startY - row * stepY;
      const inShape = shapeSampler ? shapeSampler(baseX, baseY) : false;

      if (isRdevShape && !inShape) {
        continue;
      }

      const foregroundMaterial = new THREE.SpriteMaterial({
        map: getTexture(letter),
        transparent: true,
        opacity: inShape ? (isRdevShape ? 0.74 : 0.82) : 0.15,
        depthWrite: false,
        color: new THREE.Color(inShape ? (isRdevShape ? 0xf1f5f9 : 0xf8fafc) : 0x52525b),
      });

      const foregroundSprite = new THREE.Sprite(foregroundMaterial);
      foregroundSprite.position.set(baseX, baseY, 0);

      const backgroundScale = inShape ? 6.2 : 11.5;
      const foregroundScale = inShape ? (isRdevShape ? 9.8 : 7.2) : 13.5;
      foregroundSprite.scale.set(foregroundScale, foregroundScale, 1);

      foregroundSprite.userData = {
        baseScale: foregroundScale,
        baseX,
        baseY,
        phase: Math.random() * Math.PI * 2,
        depth: 'foreground',
        inShape,
      };

      foregroundSprites.push(foregroundSprite);
      if (!isRdevShape) {
        const backgroundMaterial = new THREE.SpriteMaterial({
          map: getTexture(letter),
          transparent: true,
          opacity: inShape ? 0.2 : 0.11,
          depthWrite: false,
          color: new THREE.Color(inShape ? 0x6a7386 : 0x3f3f46),
        });
        const backgroundSprite = new THREE.Sprite(backgroundMaterial);
        backgroundSprite.position.set(baseX, baseY, -20);
        backgroundSprite.scale.set(backgroundScale, backgroundScale, 1);
        backgroundSprite.userData = {
          baseScale: backgroundScale,
          baseX,
          baseY,
          phase: Math.random() * Math.PI * 2,
          depth: 'background',
          inShape,
        };
        backgroundSprites.push(backgroundSprite);
        scene.add(backgroundSprite);
      }
      scene.add(foregroundSprite);
    }
  }

  const pointer = new THREE.Vector2(10_000, 10_000);
  const targetPointer = new THREE.Vector2(10_000, 10_000);
  const baseColor = new THREE.Color(0x52525b);
  const shapeColor = new THREE.Color(0xf4f4f6);
  const glowColor = new THREE.Color(0xf9735b);
  let frameId = 0;
  let isPinned = false;
  let isPointerActive = false;
  let isActive = true;
  let repairedUntil = 0;
  let impactStrength = 0;
  const impactPoint = new THREE.Vector2(0, 0);
  let impactRadius = 170;

  const updateSize = () => {
    const nextWidth = Math.max(host.clientWidth, 320);
    const nextHeight = Math.max(host.clientHeight, 320);
    renderer.setSize(nextWidth, nextHeight, false);
    camera.left = -nextWidth / 2;
    camera.right = nextWidth / 2;
    camera.top = nextHeight / 2;
    camera.bottom = -nextHeight / 2;
    camera.updateProjectionMatrix();
  };

  const setPointer = (clientX, clientY) => {
    const rect = host.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    targetPointer.set(x - rect.width / 2, rect.height / 2 - y);
  };

  const onPointerMove = (event) => {
    if (!enablePointerInteraction) {
      return;
    }
    isPointerActive = true;
    setPointer(event.clientX, event.clientY);
  };

  const onPointerLeave = () => {
    if (!enablePointerInteraction) {
      return;
    }
    if (isPinned) {
      return;
    }
    isPointerActive = false;
    pointer.set(10_000, 10_000);
    targetPointer.set(10_000, 10_000);
  };

  const onClick = () => {
    if (!enablePointerInteraction) {
      return;
    }
    isPinned = !isPinned;

    if (isPinned) {
      isPointerActive = true;
      pointer.set(0, 0);
      targetPointer.set(0, 0);
    } else {
      isPointerActive = false;
      pointer.set(10_000, 10_000);
      targetPointer.set(10_000, 10_000);
    }
  };

  const onNeonClick = () => {
    repairedUntil = performance.now() + 3600;
  };

  const onWordChange = (event) => {
    const rect = host.getBoundingClientRect();
    const x = (event.detail?.x ?? rect.left + rect.width / 2) - rect.left;
    const y = (event.detail?.y ?? rect.top + rect.height / 2) - rect.top;
    impactPoint.set(x - rect.width / 2, rect.height / 2 - y);
    impactRadius = Math.max(
      170,
      ((Number(event.detail?.width) || 0) * 0.7) + ((Number(event.detail?.height) || 0) * 1.4),
    );
    impactStrength = 1;
  };

  let globalFlickerValue = 0.82;
  let globalFlickerNextUpdate = 0;
  const getBrokenNeonStrength = (time) => {
    if (time >= globalFlickerNextUpdate) {
      const bucket = Math.floor(time / 37);
      const hash = Math.sin(bucket * 12.9898) * 43758.5453;
      const random = hash - Math.floor(hash);
      const envelope = 0.62 + (Math.sin(time * 0.009) * 0.28);
      const pulse = 0.35 + (random * 0.65);

      globalFlickerValue = Math.max(0.08, Math.min(1, pulse * envelope));
      if (random > 0.91) {
        globalFlickerValue *= 0.08;
      } else if (random < 0.08) {
        globalFlickerValue = Math.min(1, globalFlickerValue + 0.32);
      }

      globalFlickerNextUpdate = time + (34 + (random * 118));
    }

    return globalFlickerValue;
  };

  const animate = (time = 0) => {
    if (!isActive) {
      frameId = 0;
      return;
    }

    frameId = window.requestAnimationFrame(animate);
    if (document.hidden) {
      return;
    }

    pointer.lerp(targetPointer, 0.12);
    impactStrength += (0 - impactStrength) * 0.07;
    const nowMs = performance.now();

    if (!isRdevShape) {
      backgroundSprites.forEach((sprite) => {
      const { baseX, baseY } = sprite.userData;
      const inShape = Boolean(sprite.userData.inShape);
      const parallaxFactor = isRdevShape ? 0 : 0.04;
      const parallaxX = baseX + (pointer.x * parallaxFactor);
      const parallaxY = baseY + (pointer.y * parallaxFactor);
      const pulse = (Math.sin(time * 0.0011 + sprite.userData.phase) + 1) * 0.5;
      const scale = sprite.userData.baseScale * (1 + pulse * 0.015);
      const isRepaired = isRdevShape && nowMs < repairedUntil;
      const brokenFlicker = getBrokenNeonStrength(time);
      const neonStrength = isRdevShape ? (isRepaired ? 1 : brokenFlicker) : 1;

      sprite.position.x += (parallaxX - sprite.position.x) * 0.06;
      sprite.position.y += (parallaxY - sprite.position.y) * 0.06;
      sprite.scale.set(scale, scale, 1);
      sprite.material.opacity = ((inShape ? 0.2 : 0.12) + pulse * (inShape ? 0.03 : 0.02)) * neonStrength;
      sprite.material.color.copy(inShape ? shapeColor : baseColor);
      });
    }

    foregroundSprites.forEach((sprite) => {
      const { baseX, baseY } = sprite.userData;
      const inShape = Boolean(sprite.userData.inShape);
      const dx = baseX - pointer.x;
      const dy = baseY - pointer.y;
      const distance = Math.hypot(dx, dy);
      const hoverInfluence = (enablePointerInteraction && isPointerActive) ? Math.max(0, 1 - distance / 90) : 0;
      const influence = isPinned ? 1 : hoverInfluence;
      const impactDx = baseX - impactPoint.x;
      const impactDy = baseY - impactPoint.y;
      const impactDistance = Math.hypot(impactDx, impactDy);
      const impactInfluence = Math.max(0, 1 - impactDistance / impactRadius) * impactStrength;
      const pulse = (Math.sin(time * 0.0014 + sprite.userData.phase) + 1) * 0.5;
      const angle = Math.atan2(dy, dx);
      const magneticOffset = isRdevShape ? 0 : (influence * 16);
      const impactTargetX = baseX + (impactPoint.x - baseX) * impactInfluence * 0.22;
      const impactTargetY = baseY + (impactPoint.y - baseY) * impactInfluence * 0.22;
      const targetX = impactTargetX + Math.cos(angle) * magneticOffset;
      const targetY = impactTargetY + Math.sin(angle) * magneticOffset;
      const scale = sprite.userData.baseScale * (1 + (isRdevShape ? 0 : influence * 0.16) + impactInfluence * 0.28 + pulse * 0.02);
      const shapeBoost = inShape ? (isRdevShape ? 0.58 : 0.34) : 0;
      const isRepaired = isRdevShape && nowMs < repairedUntil;
      const brokenFlicker = getBrokenNeonStrength(time);
      const neonStrength = isRdevShape ? (isRepaired ? 1 : brokenFlicker) : 1;
      const repairGlow = isRdevShape ? (isRepaired ? 1 : 0.07) : 0;
      const finalInfluence = Math.max(influence * 0.9, impactInfluence * 0.72, repairGlow);
      const targetColor = inShape ? shapeColor : baseColor;
      const baseOpacity = isRdevShape ? (isRepaired ? 1 : 0.72) : 0.24;
      const pulseOpacity = isRdevShape ? 0.08 : 0.04;
      const glowOpacity = isRdevShape ? 0.22 : 0;

      sprite.position.x += (targetX - sprite.position.x) * (isRdevShape ? 0.22 : 0.14);
      sprite.position.y += (targetY - sprite.position.y) * (isRdevShape ? 0.22 : 0.14);
      sprite.scale.set(scale, scale, 1);
      sprite.material.opacity = Math.min(
        1,
        (baseOpacity + shapeBoost + glowOpacity + (influence * 0.62) + (impactInfluence * 0.2) + (pulse * pulseOpacity)) * neonStrength,
      );
      sprite.material.color.copy(targetColor).lerp(glowColor, finalInfluence);
    });

    renderer.render(scene, camera);
  };

  if (enablePointerInteraction) {
    host.addEventListener('pointermove', onPointerMove, { passive: true });
    host.addEventListener('pointerleave', onPointerLeave);
    host.addEventListener('click', onClick);
  }
  if (enableNeonClick) {
    host.addEventListener('click', onNeonClick);
  }
  if (!isRdevShape && rotator) {
    rotator.addEventListener('twst:word-change', onWordChange);
  }
  window.addEventListener('resize', updateSize);

  frameId = window.requestAnimationFrame(animate);

  const setVisible = (visible) => {
    const nextVisible = Boolean(visible);
    if (isActive === nextVisible) {
      return;
    }

    isActive = nextVisible;

    if (isActive) {
      if (!frameId) {
        frameId = window.requestAnimationFrame(animate);
      }
    } else if (frameId) {
      window.cancelAnimationFrame(frameId);
      frameId = 0;
    }
  };

  return {
    setVisible,
    destroy: () => {
      setVisible(false);
      window.cancelAnimationFrame(frameId);
      frameId = 0;
      if (enablePointerInteraction) {
        host.removeEventListener('pointermove', onPointerMove);
        host.removeEventListener('pointerleave', onPointerLeave);
        host.removeEventListener('click', onClick);
      }
      if (enableNeonClick) {
        host.removeEventListener('click', onNeonClick);
      }
      if (!isRdevShape && rotator) {
        rotator.removeEventListener('twst:word-change', onWordChange);
      }
      window.removeEventListener('resize', updateSize);
      [...backgroundSprites, ...foregroundSprites].forEach((sprite) => {
        sprite.material.dispose();
      });
      textureCache.forEach((texture) => texture?.dispose?.());
      textureCache.clear();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
};

const mountOrResumeWordsBackground = (host, rotator = null) => {
  const existing = wordsBgControllers.get(host);
  if (existing) {
    existing.setVisible?.(true);
    return;
  }

  mountWordsBackground(host, rotator)
    .then((controller) => {
      if (controller && typeof controller.destroy === 'function') {
        wordsBgControllers.set(host, controller);
      }
    })
    .catch((error) => {
      console.error('[TWST Words BG] init failed', error);
    });
};

const pauseWordsBackground = (host) => {
  const controller = wordsBgControllers.get(host);
  controller?.setVisible?.(false);
};

export const initWordsThreeBackgrounds = () => {
  const setupHost = (host, { requireRotator = true } = {}) => {
    if (!host || !host.isConnected) {
      return;
    }

    const rotator = host.closest('[data-words-rotator="true"]');
    if (requireRotator && !rotator) {
      return;
    }

    if (!('IntersectionObserver' in window)) {
      mountOrResumeWordsBackground(host, rotator);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target !== host) {
            return;
          }

          if (entry.isIntersecting) {
            mountOrResumeWordsBackground(host, rotator);
          } else {
            pauseWordsBackground(host);
          }
        });
      },
      {
        root: null,
        threshold: 0.01,
      },
    );

    observer.observe(host);
  };

  document.querySelectorAll('[data-words-three-bg="true"]').forEach((host) => {
    const shapeMode = String(host.dataset.wordsThreeShape || '').toLowerCase().trim();
    const isFooterRdev = shapeMode === 'rdev' && Boolean(host.closest('.twst-site-footer__rdev'));

    if (!isFooterRdev) {
      setupHost(host, { requireRotator: true });
      return;
    }

    const bootFooter = () => setupHost(host, { requireRotator: false });
    if (document.documentElement.classList.contains('twst-preload-complete')) {
      bootFooter();
      return;
    }

    document.addEventListener('twst:preload-complete', bootFooter, { once: true });
  });
};
