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

  const sprites = [];
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
      const material = new THREE.SpriteMaterial({
        map: getTexture(letter),
        transparent: true,
        opacity: 0.08,
        depthWrite: false,
        color: new THREE.Color(0xcbd5e1),
      });

      const sprite = new THREE.Sprite(material);
      sprite.position.set(
        startX + column * stepX,
        startY - row * stepY,
        0,
      );

      const scale = 13.5;
      sprite.scale.set(scale, scale, 1);
      sprite.userData = {
        baseScale: scale,
        phase: Math.random() * Math.PI * 2,
      };

      sprites.push(sprite);
      scene.add(sprite);
    }
  }

  const pointer = new THREE.Vector2(10_000, 10_000);
  const targetPointer = new THREE.Vector2(10_000, 10_000);
  const baseColor = new THREE.Color(0x52525b);
  const glowColor = new THREE.Color(0xf9735b);
  let frameId = 0;
  let isPinned = false;

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
    setPointer(event.clientX, event.clientY);
  };

  const onPointerLeave = () => {
    if (isPinned) {
      return;
    }
    targetPointer.set(10_000, 10_000);
  };

  const onClick = () => {
    isPinned = !isPinned;

    if (isPinned) {
      targetPointer.set(0, 0);
    } else {
      targetPointer.set(10_000, 10_000);
    }
  };

  const animate = (time = 0) => {
    frameId = window.requestAnimationFrame(animate);
    pointer.lerp(targetPointer, 0.12);

    sprites.forEach((sprite) => {
      const dx = sprite.position.x - pointer.x;
      const dy = sprite.position.y - pointer.y;
      const distance = Math.hypot(dx, dy);
      const hoverInfluence = Math.max(0, 1 - distance / 90);
      const influence = isPinned ? 1 : hoverInfluence;
      const pulse = (Math.sin(time * 0.0014 + sprite.userData.phase) + 1) * 0.5;
      const scale = sprite.userData.baseScale * (1 + influence * 0.16 + pulse * 0.02);

      sprite.scale.set(scale, scale, 1);
      sprite.material.opacity = 0.18 + influence * 0.68 + pulse * 0.03;
      sprite.material.color.copy(baseColor).lerp(glowColor, influence * 0.9);
    });

    renderer.render(scene, camera);
  };

  host.addEventListener('pointermove', onPointerMove, { passive: true });
  host.addEventListener('pointerleave', onPointerLeave);
  host.addEventListener('click', onClick);
  window.addEventListener('resize', updateSize);

  animate();

  return () => {
    window.cancelAnimationFrame(frameId);
    host.removeEventListener('pointermove', onPointerMove);
    host.removeEventListener('pointerleave', onPointerLeave);
    host.removeEventListener('click', onClick);
    window.removeEventListener('resize', updateSize);
    sprites.forEach((sprite) => {
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
