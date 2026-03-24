import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
  InspectorControls,
  MediaUpload,
  MediaUploadCheck,
  URLInputButton,
  useBlockProps,
} from '@wordpress/block-editor';
import {
  Button,
  PanelBody,
  RangeControl,
  SelectControl,
  TextControl,
  TextareaControl,
  ToggleControl,
} from '@wordpress/components';
import metadata from './block.json';
import { getLegacyLocalized, getItemLegacyLocalized } from '../shared';

const normalizeItems = (items = []) =>
  items.map((item) => ({
    eyebrow: getItemLegacyLocalized(item, 'eyebrow'),
    title: getItemLegacyLocalized(item, 'title'),
    description: getItemLegacyLocalized(item, 'description'),
    imageUrl: item.imageUrl || '',
    imageFit: item.imageFit || 'cover',
    imagePositionX: Number.isFinite(Number(item.imagePositionX)) ? Number(item.imagePositionX) : 50,
    imagePositionY: Number.isFinite(Number(item.imagePositionY)) ? Number(item.imagePositionY) : 50,
    linkLabel: getItemLegacyLocalized(item, 'linkLabel') || 'View project',
    linkUrl: item.linkUrl || '#',
  }));

const parseWords = (value = '') =>
  String(value)
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);

const HeroShowcaseContent = ({ attributes, isEditor = false }) => {
  const headline = getLegacyLocalized(
    attributes,
    'headline',
    'A hero that feels more editorial and more alive.',
  );
  const description = getLegacyLocalized(
    attributes,
    'description',
    'Use this block when you want the page to open with a stronger story: a bold message on the left and a compact visual showcase on the right.',
  );
  const items = normalizeItems(attributes.items);
  const showcaseMode = attributes.showcaseMode || 'images';
  const isWordsMode = showcaseMode === 'words';
  const words = parseWords(
    attributes.wordsText ||
      'Websites\nWordPress\nCustom Code\nPerformance\nSEO\nConversions\nAutomation\nE-commerce\nSpeed\nScalability',
  );
  const imagesOnly = Boolean(attributes.imagesOnly);
  const wordsBackgroundMode = attributes.wordsBackgroundMode ||
    (attributes.animateWordBlob === false ? 'none' : 'blob');
  const showWordBlob = wordsBackgroundMode === 'blob';
  const showWordsThreeBackground = wordsBackgroundMode === 'letters';
  const mediaHeightClass = imagesOnly ? 'h-[18rem] md:h-[30rem]' : 'h-44 md:h-56';
  const headlineMaxWidth = Number(attributes.headlineMaxWidthCh || 18);
  const headlineLineHeight = Number(attributes.headlineLineHeight || 1.28);
  const descriptionMaxWidth = Number(attributes.descriptionMaxWidthCh || 42);

  return (
    <>
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-24 h-72 w-72 -translate-x-[118%] rounded-full bg-orange-400/18 blur-3xl dark:bg-orange-500/18" />
      </div>

      <div className="relative mx-auto flex w-full max-w-[1920px] flex-1">
        <div className="grid w-full gap-8 md:gap-10 lg:min-h-[calc(100vh-13rem)] lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch">
          <div className="flex h-full flex-col justify-center">
            <h2
              className="twst-showcase-headline whitespace-pre-line text-balance text-4xl font-medium tracking-tight leading-[1.24] text-zinc-900 dark:text-zinc-100 md:text-7xl"
              style={{
                maxWidth: `${headlineMaxWidth}ch`,
                lineHeight: headlineLineHeight,
              }}
            >
              {isEditor ? (
                headline
              ) : (
                <>
                  <span className="twst-showcase-headline__base" data-showcase-headline-base>{headline}</span>
                  <span className="twst-showcase-headline__masks" data-showcase-headline-masks aria-hidden="true" />
                </>
              )}
            </h2>
            <p
              className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 md:mt-6 md:text-xl"
              style={{ maxWidth: `${descriptionMaxWidth}ch` }}
            >
              {description}
            </p>

            <div
              className={`mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap md:mt-10 md:gap-4 ${isWordsMode ? 'hidden md:flex' : ''}`}
            >
              <a href={attributes.primaryUrl || '#'} className="twst-showcase-cta-primary">
                {getLegacyLocalized(attributes, 'primaryLabel', 'Start a Project')}
              </a>
              <a
                href={attributes.secondaryUrl || '#'}
                className="twst-showcase-cta-secondary"
              >
                {getLegacyLocalized(attributes, 'secondaryLabel', 'See My Work')}
              </a>
            </div>
          </div>

          <aside className="flex h-full flex-col bg-transparent p-0 md:min-h-full md:pt-2 lg:h-full">
            {isWordsMode ? (
              <div
                className="twst-words-rotator relative flex min-h-[14rem] items-center justify-center rounded-[1.75rem] bg-transparent text-zinc-100 md:h-full md:min-h-0 md:flex-1 lg:min-h-full"
                data-words-rotator={!isEditor ? 'true' : undefined}
                data-autoplay={!isEditor && attributes.autoplay ? 'true' : undefined}
                data-autoplay-speed={!isEditor ? String(Number(attributes.autoplaySpeed || 4500)) : undefined}
              >
                {showWordsThreeBackground ? (
                  <div className="twst-words-three-bg absolute inset-0" data-words-three-bg={!isEditor ? 'true' : undefined} aria-hidden="true" />
                ) : null}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,91,0.12),transparent_55%)]" aria-hidden="true" />
                {showWordBlob ? (
                  <div className="twst-word-blob absolute inset-0 flex items-center justify-center" aria-hidden="true">
                    <div className="twst-word-blob-inner relative h-[44rem] w-[250%] md:h-[80rem] md:w-[320%]">
                      <span className="twst-word-blob-shape twst-word-blob-shape--primary" />
                      <span className="twst-word-blob-shape twst-word-blob-shape--secondary" />
                    </div>
                  </div>
                ) : null}
                <div className="twst-word-viewport relative z-[1] h-20 w-full overflow-hidden md:h-28">
                  {words.map((word, index) => (
                    <span
                      key={`hero-word-${index}`}
                      className={`twst-word-item ${index === 0 ? 'is-active' : ''}`}
                      data-word-item={!isEditor ? 'true' : undefined}
                    >
                      <span className="twst-word-item__backdrop twst-word-item__backdrop--accent" aria-hidden="true" />
                      <span className="twst-word-item__backdrop twst-word-item__backdrop--white" aria-hidden="true" />
                      <span className="twst-word-item__label">{word}</span>
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div
                  className="twst-showcase-track flex gap-4 overflow-x-auto rounded-[1.75rem] bg-transparent"
                  data-showcase-track={!isEditor ? 'true' : undefined}
                  data-autoplay={!isEditor && attributes.autoplay ? 'true' : undefined}
                  data-autoplay-speed={!isEditor ? String(Number(attributes.autoplaySpeed || 4500)) : undefined}
                >
                  {items.map((item, index) => (
                    <article
                      key={`hero-showcase-${index}`}
                      className="twst-showcase-card relative min-w-full shrink-0 overflow-hidden rounded-[1.75rem] bg-[#141314] text-zinc-100 dark:bg-[#141314]"
                      data-showcase-slide={!isEditor ? 'true' : undefined}
                    >
                      <div className={`overflow-hidden bg-zinc-900 ${mediaHeightClass}`}>
                        {item.imageUrl ? (
                          <div
                            key={`hero-showcase-image-${index}-${item.imageFit}-${item.imagePositionX}-${item.imagePositionY}`}
                            role="img"
                            aria-label={item.title || ''}
                            className="h-full w-full bg-zinc-900"
                            style={{
                              backgroundImage: `url(${item.imageUrl})`,
                              backgroundSize: item.imageFit || 'cover',
                              backgroundPosition: `${item.imagePositionX}% ${item.imagePositionY}%`,
                              backgroundRepeat: 'no-repeat',
                            }}
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-sm uppercase tracking-[0.18em] text-zinc-500">
                            {__('Add image', 'sage')}
                          </div>
                        )}
                      </div>

                      {!imagesOnly ? (
                        <div className="p-4 md:p-5">
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
                            {item.eyebrow}
                          </p>
                          <h3 className="mt-2 text-xl font-semibold tracking-tight text-white/95 md:mt-3 md:text-2xl">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-sm leading-relaxed text-zinc-400 md:mt-3 md:text-base">
                            {item.description}
                          </p>
                          <a
                            href={item.linkUrl}
                            className="mt-4 inline-flex items-center text-xs font-semibold uppercase tracking-[0.18em] text-orange-300 no-underline hover:no-underline focus:no-underline visited:text-orange-300 md:mt-5 md:text-sm"
                          >
                            {item.linkLabel}
                          </a>
                        </div>
                      ) : null}
                    </article>
                  ))}
                </div>
                {!isEditor ? (
                  <div className="mt-5 flex items-center justify-center gap-2" data-showcase-dots="true">
                    {items.map((item, index) => (
                      <button
                        key={`hero-showcase-dot-${index}`}
                        type="button"
                        className="twst-showcase-dot"
                        data-showcase-dot={String(index)}
                        aria-label={`${__('Go to slide', 'sage')} ${index + 1}`}
                      >
                        <span className="sr-only">
                          {item.title || `${__('Slide', 'sage')} ${index + 1}`}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 flex items-center justify-center gap-2">
                    {items.map((_, index) => (
                      <span
                        key={`hero-showcase-dot-preview-${index}`}
                        className={`twst-showcase-dot ${index === 0 ? 'is-active' : ''}`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </aside>

          {isWordsMode ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap md:hidden">
              <a href={attributes.primaryUrl || '#'} className="twst-showcase-cta-primary">
                {getLegacyLocalized(attributes, 'primaryLabel', 'Start a Project')}
              </a>
              <a
                href={attributes.secondaryUrl || '#'}
                className="twst-showcase-cta-secondary"
              >
                {getLegacyLocalized(attributes, 'secondaryLabel', 'See My Work')}
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

registerBlockType(metadata.name, {
  ...metadata,
  edit({ attributes, setAttributes }) {
    const blockProps = useBlockProps({
      className: 'twst-hero-showcase relative overflow-hidden bg-zinc-100 px-6 py-12 dark:bg-[#141314] md:px-8',
      style: {
        '--twst-showcase-light-color': attributes.lightModeColor || '#18181b',
      },
    });
    const items = normalizeItems(attributes.items);
    const wordsBackgroundMode = attributes.wordsBackgroundMode ||
      (attributes.animateWordBlob === false ? 'none' : 'blob');

    const setItems = (nextItems) => {
      setAttributes({ items: nextItems });
    };

    const updateItem = (index, key, value) => {
      const nextItems = items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      );
      setItems(nextItems);
    };

    const addItem = () => {
      setItems([
        ...items,
        {
          eyebrow: '',
          title: '',
          description: '',
          imageUrl: '',
          imageFit: 'cover',
          imagePositionX: 50,
          imagePositionY: 50,
          linkLabel: 'View project',
          linkUrl: '#',
        },
      ]);
    };

    const removeItem = (index) => {
      if (items.length <= 1) return;
      setItems(items.filter((_, itemIndex) => itemIndex !== index));
    };

    const moveItem = (index, direction) => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= items.length) return;

      const nextItems = [...items];
      [nextItems[index], nextItems[targetIndex]] = [nextItems[targetIndex], nextItems[index]];
      setItems(nextItems);
    };

    return (
      <>
        <InspectorControls>
          <PanelBody title={__('Content', 'sage')} initialOpen>
            <div className="space-y-5">
              <TextControl
                label={__('Eyebrow', 'sage')}
                value={getLegacyLocalized(attributes, 'eyebrow')}
                onChange={(eyebrow) => setAttributes({ eyebrow })}
              />
              <TextareaControl
                label={__('Headline', 'sage')}
                help={__('Use Enter to force a new line in the title.', 'sage')}
                value={getLegacyLocalized(attributes, 'headline')}
                onChange={(headline) => setAttributes({ headline })}
              />
              <TextareaControl
                label={__('Description', 'sage')}
                value={getLegacyLocalized(attributes, 'description')}
                onChange={(description) => setAttributes({ description })}
              />
              <RangeControl
                label={__('Headline width (ch)', 'sage')}
                value={Number(attributes.headlineMaxWidthCh || 18)}
                onChange={(headlineMaxWidthCh) =>
                  setAttributes({ headlineMaxWidthCh: Number(headlineMaxWidthCh || 18) })}
                min={12}
                max={40}
                step={1}
              />
              <RangeControl
                label={__('Headline line-height', 'sage')}
                value={Number(attributes.headlineLineHeight || 1.28)}
                onChange={(headlineLineHeight) =>
                  setAttributes({ headlineLineHeight: Number(headlineLineHeight || 1.28) })}
                min={1.05}
                max={1.6}
                step={0.01}
              />
              <RangeControl
                label={__('Description width (ch)', 'sage')}
                value={Number(attributes.descriptionMaxWidthCh || 42)}
                onChange={(descriptionMaxWidthCh) =>
                  setAttributes({ descriptionMaxWidthCh: Number(descriptionMaxWidthCh || 42) })}
                min={24}
                max={80}
                step={1}
              />
              <TextControl
                label={__('Primary CTA label', 'sage')}
                value={getLegacyLocalized(attributes, 'primaryLabel')}
                onChange={(primaryLabel) => setAttributes({ primaryLabel })}
              />
              <div className="space-y-2">
                <p className="components-base-control__label !mb-0">
                  {__('Primary CTA URL', 'sage')}
                </p>
                <URLInputButton
                  url={attributes.primaryUrl}
                  onChange={(primaryUrl) => setAttributes({ primaryUrl })}
                />
              </div>
              <TextControl
                label={__('Secondary CTA label', 'sage')}
                value={getLegacyLocalized(attributes, 'secondaryLabel')}
                onChange={(secondaryLabel) => setAttributes({ secondaryLabel })}
              />
              <div className="space-y-2">
                <p className="components-base-control__label !mb-0">
                  {__('Secondary CTA URL', 'sage')}
                </p>
                <URLInputButton
                  url={attributes.secondaryUrl}
                  onChange={(secondaryUrl) => setAttributes({ secondaryUrl })}
                />
              </div>
              <SelectControl
                label={__('Showcase mode', 'sage')}
                value={attributes.showcaseMode || 'images'}
                options={[
                  { label: __('Images', 'sage'), value: 'images' },
                  { label: __('Words', 'sage'), value: 'words' },
                ]}
                onChange={(showcaseMode) => setAttributes({ showcaseMode })}
              />
              <TextControl
                label={__('Light mode color', 'sage')}
                help={__('Hex color used by the showcase in light mode, for example #18181b.', 'sage')}
                value={attributes.lightModeColor || '#18181b'}
                onChange={(lightModeColor) => setAttributes({ lightModeColor })}
              />
              {(attributes.showcaseMode || 'images') === 'words' ? (
                <>
                  <TextareaControl
                    label={__('Words list', 'sage')}
                    help={__('Enter one word per line.', 'sage')}
                    value={attributes.wordsText || ''}
                    onChange={(wordsText) => setAttributes({ wordsText })}
                  />
                  <SelectControl
                    label={__('Words background', 'sage')}
                    value={wordsBackgroundMode}
                    options={[
                      { label: __('Blob', 'sage'), value: 'blob' },
                      { label: __('Letters background', 'sage'), value: 'letters' },
                      { label: __('None', 'sage'), value: 'none' },
                    ]}
                    onChange={(nextWordsBackgroundMode) =>
                      setAttributes({
                        wordsBackgroundMode: nextWordsBackgroundMode,
                        animateWordBlob: nextWordsBackgroundMode === 'blob',
                      })}
                  />
                </>
              ) : null}
              <ToggleControl
                label={__('Images only in carousel', 'sage')}
                checked={Boolean(attributes.imagesOnly)}
                onChange={(imagesOnly) => setAttributes({ imagesOnly })}
                disabled={(attributes.showcaseMode || 'images') !== 'images'}
              />
              <ToggleControl
                label={__('Autoplay carousel', 'sage')}
                checked={Boolean(attributes.autoplay)}
                onChange={(autoplay) => setAttributes({ autoplay })}
              />
              <RangeControl
                label={__('Rotation speed (ms)', 'sage')}
                value={Number(attributes.autoplaySpeed || 4500)}
                onChange={(autoplaySpeed) => setAttributes({ autoplaySpeed })}
                min={2000}
                max={9000}
                step={500}
                disabled={!attributes.autoplay}
              />
            </div>

            {(attributes.showcaseMode || 'images') === 'images' ? items.map((item, index) => (
              <div key={`hero-showcase-item-${index}`} className="mt-6 rounded border border-zinc-300 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {`${__('Slide', 'sage')} ${index + 1}`}
                </p>

                {!attributes.imagesOnly ? (
                  <>
                    <TextControl
                      label={__('Eyebrow', 'sage')}
                      value={item.eyebrow}
                      onChange={(value) => updateItem(index, 'eyebrow', value)}
                    />
                    <TextControl
                      label={__('Title', 'sage')}
                      value={item.title}
                      onChange={(value) => updateItem(index, 'title', value)}
                    />
                    <TextareaControl
                      label={__('Description', 'sage')}
                      value={item.description}
                      onChange={(value) => updateItem(index, 'description', value)}
                    />
                  </>
                ) : null}
                <MediaUploadCheck>
                  <MediaUpload
                    onSelect={(media) => updateItem(index, 'imageUrl', media?.url || '')}
                    allowedTypes={['image']}
                    value={item.imageUrl}
                    render={({ open }) => (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button variant="secondary" onClick={open}>
                          {item.imageUrl ? __('Replace image', 'sage') : __('Select image', 'sage')}
                        </Button>
                        {item.imageUrl ? (
                          <Button
                            variant="secondary"
                            isDestructive
                            onClick={() => updateItem(index, 'imageUrl', '')}
                          >
                            {__('Remove image', 'sage')}
                          </Button>
                        ) : null}
                      </div>
                    )}
                  />
                </MediaUploadCheck>
                {item.imageUrl ? (
                  <div
                    className="mt-3 h-24 w-full rounded bg-zinc-900"
                    style={{
                      backgroundImage: `url(${item.imageUrl})`,
                      backgroundSize: item.imageFit || 'cover',
                      backgroundPosition: `${item.imagePositionX}% ${item.imagePositionY}%`,
                      backgroundRepeat: 'no-repeat',
                    }}
                  />
                ) : null}
                <SelectControl
                  label={__('Image fit', 'sage')}
                  value={item.imageFit || 'cover'}
                  options={[
                    { label: __('Cover', 'sage'), value: 'cover' },
                    { label: __('Contain', 'sage'), value: 'contain' },
                  ]}
                  onChange={(value) => updateItem(index, 'imageFit', value)}
                />
                <RangeControl
                  label={__('Image position X', 'sage')}
                  value={Number(item.imagePositionX ?? 50)}
                  onChange={(value) => updateItem(index, 'imagePositionX', value ?? 50)}
                  min={0}
                  max={100}
                />
                <RangeControl
                  label={__('Image position Y', 'sage')}
                  value={Number(item.imagePositionY ?? 50)}
                  onChange={(value) => updateItem(index, 'imagePositionY', value ?? 50)}
                  min={0}
                  max={100}
                />
                {!attributes.imagesOnly ? (
                  <>
                    <TextControl
                      label={__('Link label', 'sage')}
                      value={item.linkLabel}
                      onChange={(value) => updateItem(index, 'linkLabel', value)}
                    />
                    <div className="space-y-2">
                      <p className="components-base-control__label !mb-0">
                        {__('Link URL', 'sage')}
                      </p>
                      <URLInputButton
                        url={item.linkUrl}
                        onChange={(value) => updateItem(index, 'linkUrl', value)}
                      />
                    </div>
                  </>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => moveItem(index, -1)}
                    disabled={index === 0}
                  >
                    {__('Move up', 'sage')}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => moveItem(index, 1)}
                    disabled={index === items.length - 1}
                  >
                    {__('Move down', 'sage')}
                  </Button>
                  <Button
                    variant="secondary"
                    isDestructive
                    onClick={() => removeItem(index)}
                    disabled={items.length <= 1}
                  >
                    {__('Remove', 'sage')}
                  </Button>
                </div>
              </div>
            )) : null}

            {(attributes.showcaseMode || 'images') === 'images' ? (
              <div className="mt-4">
                <Button variant="primary" onClick={addItem}>
                  {__('Add slide', 'sage')}
                </Button>
              </div>
            ) : null}
          </PanelBody>
        </InspectorControls>

        <section {...blockProps}>
          <HeroShowcaseContent attributes={attributes} isEditor />
        </section>
      </>
    );
  },
  save({ attributes }) {
    const blockProps = useBlockProps.save({
      className: 'twst-hero-showcase relative overflow-hidden bg-zinc-100 px-6 pb-14 pt-24 dark:bg-[#141314] md:flex md:h-screen md:min-h-screen md:items-center md:pb-20 md:pt-32',
      style: {
        '--twst-showcase-light-color': attributes.lightModeColor || '#18181b',
      },
    });

    return (
      <section {...blockProps}>
        <HeroShowcaseContent attributes={attributes} />
      </section>
    );
  },
});
