import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
  InspectorControls,
  URLInputButton,
  useBlockProps,
} from '@wordpress/block-editor';
import {
  PanelBody,
  SelectControl,
  TextControl,
  TextareaControl,
} from '@wordpress/components';
import metadata from './block.json';
import { getLegacyLocalized } from '../shared';

const HeroContent = ({ attributes }) => {
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

  return (
    <header
      id="home"
      className={`twst-hero relative h-screen w-full scroll-mt-32 overflow-hidden px-6 py-12 md:py-16 ${
        (attributes.backgroundAnimation || 'shader') === 'tubes' ? 'twst-hero--tubes' : 'twst-hero--shader'
      }`}
      data-hero-shader
      data-hero-animation-type={attributes.backgroundAnimation || 'shader'}
    >
      <div className="twst-hero-canvas" data-hero-shader-canvas aria-hidden="true" />
      <div className="relative z-10 mx-auto flex h-screen max-w-6xl items-center pt-20 text-center md:pt-24">
        <div className="w-full">
          <h1 className="mx-auto max-w-5xl text-balance text-4xl font-semibold tracking-tight text-zinc-100 md:text-7xl">
          {headline}
          </h1>
          <p className="mx-auto mt-8 max-w-4xl text-pretty text-lg leading-relaxed text-zinc-300 md:text-2xl">
          {description}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
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
            <p className="components-base-control__label">
              {__('Primary CTA URL', 'sage')}
            </p>
            <URLInputButton
              url={attributes.primaryUrl}
              onChange={(primaryUrl) => setAttributes({ primaryUrl })}
            />
            <TextControl
              label={__('Secondary CTA label', 'sage')}
              value={getLegacyLocalized(attributes, 'secondaryLabel')}
              onChange={(secondaryLabel) => setAttributes({ secondaryLabel })}
            />
            <p className="components-base-control__label">
              {__('Secondary CTA URL', 'sage')}
            </p>
            <URLInputButton
              url={attributes.secondaryUrl}
              onChange={(secondaryUrl) => setAttributes({ secondaryUrl })}
            />
            <SelectControl
              label={__('Background animation', 'sage')}
              value={attributes.backgroundAnimation || 'shader'}
              options={[
                { label: __('Shader', 'sage'), value: 'shader' },
                { label: __('Tubes', 'sage'), value: 'tubes' },
              ]}
              onChange={(backgroundAnimation) => setAttributes({ backgroundAnimation })}
            />
          </PanelBody>
        </InspectorControls>

        <section {...blockProps}>
          <HeroContent attributes={attributes} />
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
