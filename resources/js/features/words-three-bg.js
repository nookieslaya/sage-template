let threeLoader = null;
const wordsBgCleanups = new WeakMap();

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

const clearWordsBackground = (rotator) => {
  const cleanup = wordsBgCleanups.get(rotator);
  if (typeof cleanup === 'function') {
    cleanup();
  }
  wordsBgCleanups.delete(rotator);
};

const mountWordsBackground = async (rotator, host) => {
  const THREE = await loadThree();
  const width = Math.max(host.clientWidth, 320);
  const height = Math.max(host.clientHeight, 320);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-width / 2, width / 2, height / 2, -height / 2, 1, 2000);
  camera.position.z = 1000;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
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
  const cellSize = 15;
  const columns = Math.max(18, Math.ceil(width / cellSize));
  const rows = Math.max(18, Math.ceil(height / cellSize));
  const stepX = width / columns;
  const stepY = height / rows;
  const startX = -width / 2 + stepX / 2;
  const startY = height / 2 - stepY / 2;

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const letter = LETTERS[(row * columns + column) % LETTERS.length];
      const backgroundMaterial = new THREE.SpriteMaterial({
        map: getTexture(letter),
        transparent: true,
        opacity: 0.07,
        depthWrite: false,
        color: new THREE.Color(0x3f3f46),
      });
      const foregroundMaterial = new THREE.SpriteMaterial({
        map: getTexture(letter),
        transparent: true,
        opacity: 0.1,
        depthWrite: false,
        color: new THREE.Color(0x52525b),
      });

      const baseX = startX + column * stepX;
      const baseY = startY - row * stepY;
      const backgroundSprite = new THREE.Sprite(backgroundMaterial);
      backgroundSprite.position.set(baseX, baseY, -20);

      const foregroundSprite = new THREE.Sprite(foregroundMaterial);
      foregroundSprite.position.set(baseX, baseY, 0);

      const backgroundScale = 11.5;
      const foregroundScale = 13.5;
      backgroundSprite.scale.set(backgroundScale, backgroundScale, 1);
      foregroundSprite.scale.set(foregroundScale, foregroundScale, 1);

      backgroundSprite.userData = {
        baseScale: backgroundScale,
        baseX,
        baseY,
        phase: Math.random() * Math.PI * 2,
        depth: 'background',
      };
      foregroundSprite.userData = {
        baseScale: foregroundScale,
        baseX,
        baseY,
        phase: Math.random() * Math.PI * 2,
        depth: 'foreground',
      };

      backgroundSprites.push(backgroundSprite);
      foregroundSprites.push(foregroundSprite);
      scene.add(backgroundSprite);
      scene.add(foregroundSprite);
    }
  }

  const pointer = new THREE.Vector2(10_000, 10_000);
  const targetPointer = new THREE.Vector2(10_000, 10_000);
  const baseColor = new THREE.Color(0x52525b);
  const glowColor = new THREE.Color(0xf9735b);
  let frameId = 0;
  let isPinned = false;
  let isPointerActive = false;
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
    isPointerActive = true;
    setPointer(event.clientX, event.clientY);
  };

  const onPointerLeave = () => {
    if (isPinned) {
      return;
    }
    isPointerActive = false;
    pointer.set(10_000, 10_000);
    targetPointer.set(10_000, 10_000);
  };

  const onClick = () => {
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

  const animate = (time = 0) => {
    frameId = window.requestAnimationFrame(animate);
    pointer.lerp(targetPointer, 0.12);
    impactStrength += (0 - impactStrength) * 0.07;

    backgroundSprites.forEach((sprite) => {
      const { baseX, baseY } = sprite.userData;
      const parallaxX = baseX + (pointer.x * 0.04);
      const parallaxY = baseY + (pointer.y * 0.04);
      const pulse = (Math.sin(time * 0.0011 + sprite.userData.phase) + 1) * 0.5;
      const scale = sprite.userData.baseScale * (1 + pulse * 0.015);

      sprite.position.x += (parallaxX - sprite.position.x) * 0.06;
      sprite.position.y += (parallaxY - sprite.position.y) * 0.06;
      sprite.scale.set(scale, scale, 1);
      sprite.material.opacity = 0.08 + pulse * 0.015;
      sprite.material.color.copy(baseColor);
    });

    foregroundSprites.forEach((sprite) => {
      const { baseX, baseY } = sprite.userData;
      const dx = baseX - pointer.x;
      const dy = baseY - pointer.y;
      const distance = Math.hypot(dx, dy);
      const hoverInfluence = isPointerActive ? Math.max(0, 1 - distance / 90) : 0;
      const influence = isPinned ? 1 : hoverInfluence;
      const impactDx = baseX - impactPoint.x;
      const impactDy = baseY - impactPoint.y;
      const impactDistance = Math.hypot(impactDx, impactDy);
      const impactInfluence = Math.max(0, 1 - impactDistance / impactRadius) * impactStrength;
      const pulse = (Math.sin(time * 0.0014 + sprite.userData.phase) + 1) * 0.5;
      const angle = Math.atan2(dy, dx);
      const magneticOffset = influence * 16;
      const impactTargetX = baseX + (impactPoint.x - baseX) * impactInfluence * 0.22;
      const impactTargetY = baseY + (impactPoint.y - baseY) * impactInfluence * 0.22;
      const targetX = impactTargetX + Math.cos(angle) * magneticOffset;
      const targetY = impactTargetY + Math.sin(angle) * magneticOffset;
      const scale = sprite.userData.baseScale * (1 + influence * 0.16 + impactInfluence * 0.28 + pulse * 0.02);

      sprite.position.x += (targetX - sprite.position.x) * 0.14;
      sprite.position.y += (targetY - sprite.position.y) * 0.14;
      sprite.scale.set(scale, scale, 1);
      sprite.material.opacity = 0.18 + influence * 0.68 + impactInfluence * 0.24 + pulse * 0.03;
      sprite.material.color.copy(baseColor).lerp(glowColor, Math.max(influence * 0.9, impactInfluence * 0.72));
    });

    renderer.render(scene, camera);
  };

  host.addEventListener('pointermove', onPointerMove, { passive: true });
  host.addEventListener('pointerleave', onPointerLeave);
  host.addEventListener('click', onClick);
  rotator.addEventListener('twst:word-change', onWordChange);
  window.addEventListener('resize', updateSize);

  animate();

  return () => {
    window.cancelAnimationFrame(frameId);
    host.removeEventListener('pointermove', onPointerMove);
    host.removeEventListener('pointerleave', onPointerLeave);
    host.removeEventListener('click', onClick);
    rotator.removeEventListener('twst:word-change', onWordChange);
    window.removeEventListener('resize', updateSize);
    [...backgroundSprites, ...foregroundSprites].forEach((sprite) => {
      sprite.material.map?.dispose?.();
      sprite.material.dispose();
    });
    textureCache.clear();
    renderer.dispose();
    renderer.domElement.remove();
  };
};

export const initWordsThreeBackgrounds = () => {
  document.querySelectorAll('[data-words-three-bg="true"]').forEach((host) => {
    const rotator = host.closest('[data-words-rotator="true"]');
    if (!rotator || wordsBgCleanups.has(rotator)) {
      return;
    }

    clearWordsBackground(rotator);

    mountWordsBackground(rotator, host)
      .then((cleanup) => {
        if (typeof cleanup === 'function') {
          wordsBgCleanups.set(rotator, cleanup);
        }
      })
      .catch((error) => {
        console.error('[TWST Words BG] init failed', error);
      });
  });
};
