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
  const imagesOnly = Boolean(attributes.imagesOnly);
  const sectionClassName = isEditor
    ? 'twst-hero-showcase relative overflow-hidden px-6 py-12 md:px-8'
    : 'twst-hero-showcase relative overflow-hidden px-6 pb-20 pt-36 md:pb-28 md:pt-44';
  const mediaHeightClass = imagesOnly ? 'h-[26rem] md:h-[30rem]' : 'h-56';

  return (
    <section className={sectionClassName}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute left-1/2 top-24 h-72 w-72 -translate-x-[118%] rounded-full bg-orange-400/18 blur-3xl dark:bg-orange-500/18" />
        <div className="absolute right-0 top-0 h-[26rem] w-[26rem] translate-x-1/3 -translate-y-1/4 rounded-full bg-sky-400/18 blur-3xl dark:bg-sky-500/18" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:items-stretch">
          <div className="flex h-full flex-col justify-center">
            <h2 className="max-w-4xl text-balance text-5xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-7xl">
              {headline}
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-2xl">
              {description}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <a href={attributes.primaryUrl || '#'} className="twst-hero-btn-primary">
                {getLegacyLocalized(attributes, 'primaryLabel', 'Start a Project')}
              </a>
              <a
                href={attributes.secondaryUrl || '#'}
                className="twst-hero-btn-secondary !border-zinc-300 !text-zinc-900 dark:!border-zinc-700 dark:!text-zinc-100"
              >
                {getLegacyLocalized(attributes, 'secondaryLabel', 'See My Work')}
              </a>
            </div>
          </div>

          <aside className="flex h-full flex-col bg-transparent p-0 md:pt-2">
            <div
              className="twst-showcase-track flex gap-4 overflow-x-auto rounded-[1.75rem] bg-transparent"
              data-showcase-track={!isEditor ? 'true' : undefined}
              data-autoplay={!isEditor && attributes.autoplay ? 'true' : undefined}
              data-autoplay-speed={!isEditor ? String(Number(attributes.autoplaySpeed || 4500)) : undefined}
            >
              {items.map((item, index) => (
                <article
                  key={`hero-showcase-${index}`}
                  className="twst-showcase-card relative min-w-full shrink-0 overflow-hidden rounded-[1.75rem] bg-zinc-950 text-zinc-100 dark:bg-black"
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
                    <div className="p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-zinc-400">
                        {item.eyebrow}
                      </p>
                      <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white/95">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-base leading-relaxed text-zinc-400">
                        {item.description}
                      </p>
                      <a
                        href={item.linkUrl}
                        className="mt-5 inline-flex items-center text-sm font-semibold uppercase tracking-[0.18em] text-orange-300 no-underline hover:no-underline focus:no-underline visited:text-orange-300"
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
          </aside>
        </div>
      </div>
    </section>
  );
};

registerBlockType(metadata.name, {
  ...metadata,
  edit({ attributes, setAttributes }) {
    const blockProps = useBlockProps({
      className: 'bg-zinc-100 dark:bg-zinc-950',
    });
    const items = normalizeItems(attributes.items);

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
              <TextControl
                label={__('Headline', 'sage')}
                value={getLegacyLocalized(attributes, 'headline')}
                onChange={(headline) => setAttributes({ headline })}
              />
              <TextareaControl
                label={__('Description', 'sage')}
                value={getLegacyLocalized(attributes, 'description')}
                onChange={(description) => setAttributes({ description })}
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
              <ToggleControl
                label={__('Images only in carousel', 'sage')}
                checked={Boolean(attributes.imagesOnly)}
                onChange={(imagesOnly) => setAttributes({ imagesOnly })}
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

            {items.map((item, index) => (
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
            ))}

            <div className="mt-4">
              <Button variant="primary" onClick={addItem}>
                {__('Add slide', 'sage')}
              </Button>
            </div>
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
      className: 'bg-zinc-100 dark:bg-zinc-950',
    });

    return (
      <section {...blockProps}>
        <HeroShowcaseContent attributes={attributes} />
      </section>
    );
  },
});
