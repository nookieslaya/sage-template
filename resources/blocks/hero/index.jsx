import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
  InspectorControls,
  URLInputButton,
  useBlockProps,
} from '@wordpress/block-editor';
import { PanelBody, TextControl, TextareaControl } from '@wordpress/components';
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
      className="twst-hero relative w-full scroll-mt-32 overflow-hidden px-6 py-20 md:py-60"
    >
      <div className="twst-hero-bg" aria-hidden="true">
        <span className="twst-hero-blob twst-hero-blob-a" />
        <span className="twst-hero-blob twst-hero-blob-b" />
        <span className="twst-hero-blob twst-hero-blob-c" />
        <span className="twst-hero-grid" />
      </div>
      <div className="relative z-10 mx-auto max-w-6xl text-center">
        <h1 className="mx-auto max-w-5xl text-balance text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-7xl">
          {headline}
        </h1>
        <p className="mx-auto mt-8 max-w-4xl text-pretty text-lg leading-relaxed text-zinc-500 dark:text-zinc-400 md:text-2xl">
          {description}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a className="twst-btn-accent" href={attributes.primaryUrl || '#'}>
            {primaryLabel}
          </a>
          <a
            className="inline-flex items-center justify-center rounded-2xl bg-zinc-200 px-8 py-4 text-base font-semibold text-zinc-900 transition hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            href={attributes.secondaryUrl || '#'}
          >
            {secondaryLabel}
          </a>
        </div>
      </div>
    </header>
  );
};

registerBlockType(metadata.name, {
  ...metadata,
  edit({ attributes, setAttributes }) {
    const blockProps = useBlockProps({
      className: 'bg-zinc-100 dark:bg-zinc-950',
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
      className: 'bg-zinc-100 dark:bg-zinc-950',
    });

    return (
      <section {...blockProps}>
        <HeroContent attributes={attributes} />
      </section>
    );
  },
});
