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
  ColorPalette,
  PanelBody,
  RangeControl,
  SelectControl,
  TextControl,
  TextareaControl,
} from '@wordpress/components';
import metadata from './block.json';
import { getLegacyLocalized } from '../shared';

const HeroContent = ({ attributes, isEditor = false }) => {
  const headline = getLegacyLocalized(
    attributes,
    'headline',
    'Building Enterprise Solutions That Scale',
  );
  const description = getLegacyLocalized(
    attributes,
    'description',
    'I partner with B2B companies to design and develop robust technology solutions that drive business growth.',
  );
  const primaryLabel = getLegacyLocalized(
    attributes,
    'primaryLabel',
    'Start a Project',
  );
  const secondaryLabel = getLegacyLocalized(
    attributes,
    'secondaryLabel',
    'View My Work',
  );
  const backgroundType = (attributes.backgroundAnimation || 'shader').toLowerCase();
  const hasHeroImage = Boolean(attributes.heroImageUrl || attributes.heroImageMobileUrl);
  const overlayOpacity = Math.min(Math.max(Number(attributes.heroOverlayOpacity ?? 45), 0), 100);
  const overlayColor = attributes.heroOverlayColor || '#050816';
  const shellClassName = isEditor
    ? 'twst-hero relative min-h-[720px] w-full overflow-hidden px-8 py-16'
    : 'twst-hero relative h-screen w-full scroll-mt-32 overflow-hidden px-6 py-12 md:py-16';
  const contentWrapClassName = isEditor
    ? 'relative z-10 mx-auto flex min-h-[620px] max-w-5xl items-center py-20 text-center'
    : 'relative z-10 mx-auto flex h-screen max-w-6xl items-center pt-20 text-center md:pt-24';
  const headlineClassName = isEditor
    ? 'mx-auto max-w-4xl text-balance text-4xl font-semibold tracking-tight text-zinc-100 lg:text-6xl'
    : 'mx-auto max-w-5xl text-balance text-4xl font-semibold tracking-tight text-zinc-100 md:text-7xl';
  const descriptionClassName = isEditor
    ? 'mx-auto mt-8 max-w-3xl text-pretty text-lg leading-relaxed text-zinc-300 lg:text-xl'
    : 'mx-auto mt-8 max-w-4xl text-pretty text-lg leading-relaxed text-zinc-300 md:text-2xl';
  const actionsClassName = isEditor
    ? 'mt-12 flex flex-wrap items-center justify-center gap-5'
    : 'mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row';

  return (
    <header
      id="home"
      className={`${shellClassName} ${
        backgroundType === 'image' ? 'twst-hero--image' : 'twst-hero--shader'
      }`}
      data-hero-shader={backgroundType === 'shader' ? 'true' : undefined}
      data-hero-animation-type={backgroundType}
    >
      {backgroundType === 'shader' ? (
        <div className="twst-hero-canvas" data-hero-shader-canvas aria-hidden="true" />
      ) : null}
      {backgroundType === 'image' ? (
        <>
          <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
            {hasHeroImage ? (
              <picture>
                {attributes.heroImageMobileUrl ? (
                  <source media="(max-width: 767px)" srcSet={attributes.heroImageMobileUrl} />
                ) : null}
                <img
                  className="h-full w-full object-cover"
                  src={attributes.heroImageUrl || attributes.heroImageMobileUrl}
                  alt={attributes.heroImageAlt || ''}
                  fetchPriority="high"
                />
              </picture>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-sm text-zinc-400">
                {__('Add hero image', 'sage')}
              </div>
            )}
          </div>
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundColor: overlayColor,
              opacity: overlayOpacity / 100,
            }}
            aria-hidden="true"
          />
        </>
      ) : null}
      <div className={contentWrapClassName}>
        <div className="w-full">
          <h1 className={headlineClassName}>
          {headline}
          </h1>
          <p className={descriptionClassName}>
          {description}
          </p>
          <div className={actionsClassName}>
            <a className="twst-hero-btn-primary" href={attributes.primaryUrl || '#'}>
            {primaryLabel}
            </a>
            <a
              className="twst-hero-btn-secondary"
              href={attributes.secondaryUrl || '#'}
            >
            {secondaryLabel}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

registerBlockType(metadata.name, {
  ...metadata,
  edit({ attributes, setAttributes }) {
    const blockProps = useBlockProps({
      className: 'bg-zinc-950',
    });

    return (
      <>
        <InspectorControls>
          <PanelBody title={__('Content', 'sage')} initialOpen>
            <div className="space-y-5">
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
              <SelectControl
                label={__('Hero background', 'sage')}
                value={attributes.backgroundAnimation || 'shader'}
                options={[
                  { label: __('Shader animation', 'sage'), value: 'shader' },
                  { label: __('Image', 'sage'), value: 'image' },
                ]}
                onChange={(backgroundAnimation) => setAttributes({ backgroundAnimation })}
              />
            </div>
            {(attributes.backgroundAnimation || 'shader') === 'image' ? (
              <div className="mt-6 space-y-5 border-t border-zinc-200 pt-5">
                <TextControl
                  label={__('Image alt', 'sage')}
                  value={attributes.heroImageAlt}
                  onChange={(heroImageAlt) => setAttributes({ heroImageAlt })}
                />
                <div className="space-y-2">
                  <p className="components-base-control__label !mb-0">
                    {__('Desktop image', 'sage')}
                  </p>
                  <MediaUploadCheck>
                    <MediaUpload
                      onSelect={(media) => setAttributes({ heroImageUrl: media?.url || '' })}
                      allowedTypes={['image']}
                      value={attributes.heroImageUrl}
                      render={({ open }) => (
                        <Button variant="secondary" onClick={open}>
                          {attributes.heroImageUrl ? __('Replace desktop image', 'sage') : __('Select desktop image', 'sage')}
                        </Button>
                      )}
                    />
                  </MediaUploadCheck>
                </div>
                <div className="space-y-2">
                  <p className="components-base-control__label !mb-0">
                    {__('Mobile image', 'sage')}
                  </p>
                  <MediaUploadCheck>
                    <MediaUpload
                      onSelect={(media) => setAttributes({ heroImageMobileUrl: media?.url || '' })}
                      allowedTypes={['image']}
                      value={attributes.heroImageMobileUrl}
                      render={({ open }) => (
                        <Button variant="secondary" onClick={open}>
                          {attributes.heroImageMobileUrl ? __('Replace mobile image', 'sage') : __('Select mobile image', 'sage')}
                        </Button>
                      )}
                    />
                  </MediaUploadCheck>
                </div>
                <div className="space-y-3">
                  <p className="components-base-control__label !mb-0">
                    {__('Overlay color', 'sage')}
                  </p>
                  <ColorPalette
                    value={attributes.heroOverlayColor || '#050816'}
                    onChange={(heroOverlayColor) =>
                      setAttributes({ heroOverlayColor: heroOverlayColor || '#050816' })}
                    clearable={false}
                  />
                </div>
                <RangeControl
                  label={__('Overlay opacity', 'sage')}
                  value={Number(attributes.heroOverlayOpacity ?? 45)}
                  onChange={(heroOverlayOpacity) => setAttributes({ heroOverlayOpacity })}
                  min={0}
                  max={100}
                />
              </div>
            ) : null}
          </PanelBody>
        </InspectorControls>

        <section {...blockProps}>
          <HeroContent attributes={attributes} isEditor />
        </section>
      </>
    );
  },
  save({ attributes }) {
    const blockProps = useBlockProps.save({
      className: 'bg-zinc-950',
    });

    return (
      <section {...blockProps}>
        <HeroContent attributes={attributes} />
      </section>
    );
  },
});
