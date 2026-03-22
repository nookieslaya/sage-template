import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
  InspectorControls,
  MediaUpload,
  MediaUploadCheck,
  useBlockProps,
} from '@wordpress/block-editor';
import { Button, PanelBody, TextControl } from '@wordpress/components';
import metadata from './block.json';
import { currentEditorLang, getLegacyLocalized } from '../shared';

const getAboutText = (attributes, key, fallback = '') => {
  const lang = currentEditorLang();
  const primaryLocalizedKey = `${key}${lang === 'pl' ? 'Pl' : 'En'}`;
  const secondaryLocalizedKey = `${key}${lang === 'pl' ? 'En' : 'Pl'}`;
  const baseValue = attributes?.[key];
  const primaryLocalizedValue = attributes?.[primaryLocalizedKey];
  const secondaryLocalizedValue = attributes?.[secondaryLocalizedKey];

  if (typeof baseValue === 'string') {
    return baseValue.trim();
  }

  if (typeof primaryLocalizedValue === 'string') {
    return primaryLocalizedValue.trim();
  }

  if (typeof secondaryLocalizedValue === 'string') {
    return secondaryLocalizedValue.trim();
  }

  return (fallback || '').trim();
};

const AboutContent = ({ attributes }) => {
  const eyebrow = getAboutText(attributes, 'eyebrow', 'ABOUT');
  const headline = getAboutText(attributes, 'headline', 'Selected experience, shaped into measurable outcomes.');
  const cards = [
    {
      value: (getLegacyLocalized(attributes, 'cardOneValue', '5+') || '').trim(),
      label: (getLegacyLocalized(attributes, 'cardOneLabel', 'lat doswiadczenia') || '').trim(),
      isPrimary: true,
    },
    {
      value: (getLegacyLocalized(attributes, 'cardTwoValue', '25+') || '').trim(),
      label: (getLegacyLocalized(attributes, 'cardTwoLabel', 'projektow') || '').trim(),
    },
    {
      value: (getLegacyLocalized(attributes, 'cardThreeValue', '1') || '').trim(),
      label: (getLegacyLocalized(attributes, 'cardThreeLabel', 'partner techniczny') || '').trim(),
    },
  ].filter((card) => card.value && card.label);

  return (
    <div className="twst-about-shell" data-reveal-root>
      <div className="twst-about-section mx-auto max-w-[1920px] scroll-mt-32 px-6 py-20 md:py-24">
      {(eyebrow || headline) && (
        <header className="twst-reveal-up mb-10 md:mb-12" data-reveal-item data-reveal-delay="0">
          {eyebrow ? <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500">{eyebrow}</p> : null}
          {headline ? <h2 className="mt-4 max-w-4xl text-balance text-4xl font-medium tracking-tight text-zinc-900 md:text-6xl">{headline}</h2> : null}
        </header>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <figure className="twst-about-card twst-about-card--image twst-reveal-up overflow-hidden" data-reveal-item data-reveal-delay="90">
          {attributes.imageUrl ? (
            <img className="h-full w-full object-cover" src={attributes.imageUrl} alt={attributes.imageAlt || ''} />
          ) : (
            <div className="flex h-full min-h-[22rem] items-center justify-center border border-dashed border-zinc-300 text-zinc-500">
              {__('Add portrait image', 'sage')}
            </div>
          )}
        </figure>

        {cards.map((card, index) => (
          <article
            key={`about-card-${index}`}
            className="twst-about-card twst-about-card--stat twst-reveal-up"
            data-reveal-item
            data-reveal-delay={String(150 + index * 70)}
          >
            <div className="twst-about-card__surface">
              <p className={`twst-about-card__value${card.isPrimary ? ' twst-about-card__value--primary' : ''}`}>{card.value}</p>
              <div className="twst-about-card__footer">
                <span className="twst-about-card__label-wrap">
                  <span className="twst-about-card__label">{card.label}</span>
                  <span className="twst-about-card__label-mask twst-about-card__label-mask--white" aria-hidden="true" />
                  <span className="twst-about-card__label-mask twst-about-card__label-mask--accent" aria-hidden="true" />
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
      </div>
    </div>
  );
};

registerBlockType(metadata.name, {
  ...metadata,
  edit({ attributes, setAttributes }) {
    const blockProps = useBlockProps();

    return (
      <>
        <InspectorControls>
          <PanelBody title={__('Content', 'sage')} initialOpen>
            <TextControl
              label={__('Eyebrow', 'sage')}
              value={getAboutText(attributes, 'eyebrow')}
              onChange={(eyebrow) => setAttributes({ eyebrow })}
            />
            <TextControl
              label={__('Headline', 'sage')}
              value={getAboutText(attributes, 'headline')}
              onChange={(headline) => setAttributes({ headline })}
            />
            <TextControl
              label={__('Card 1 value', 'sage')}
              value={getLegacyLocalized(attributes, 'cardOneValue')}
              onChange={(cardOneValue) => setAttributes({ cardOneValue })}
            />
            <TextControl
              label={__('Card 1 label', 'sage')}
              value={getLegacyLocalized(attributes, 'cardOneLabel')}
              onChange={(cardOneLabel) => setAttributes({ cardOneLabel })}
            />
            <TextControl
              label={__('Card 2 value', 'sage')}
              value={getLegacyLocalized(attributes, 'cardTwoValue')}
              onChange={(cardTwoValue) => setAttributes({ cardTwoValue })}
            />
            <TextControl
              label={__('Card 2 label', 'sage')}
              value={getLegacyLocalized(attributes, 'cardTwoLabel')}
              onChange={(cardTwoLabel) => setAttributes({ cardTwoLabel })}
            />
            <TextControl
              label={__('Card 3 value', 'sage')}
              value={getLegacyLocalized(attributes, 'cardThreeValue')}
              onChange={(cardThreeValue) => setAttributes({ cardThreeValue })}
            />
            <TextControl
              label={__('Card 3 label', 'sage')}
              value={getLegacyLocalized(attributes, 'cardThreeLabel')}
              onChange={(cardThreeLabel) => setAttributes({ cardThreeLabel })}
            />
            <TextControl
              label={__('Image alt', 'sage')}
              value={attributes.imageAlt}
              onChange={(imageAlt) => setAttributes({ imageAlt })}
            />
            <MediaUploadCheck>
              <MediaUpload
                onSelect={(media) =>
                  setAttributes({
                    imageUrl: media?.url || '',
                    imageAlt: media?.alt || attributes.imageAlt,
                  })
                }
                allowedTypes={['image']}
                value={attributes.imageUrl}
                render={({ open }) => (
                  <Button variant="secondary" onClick={open}>
                    {attributes.imageUrl ? __('Replace image', 'sage') : __('Select image', 'sage')}
                  </Button>
                )}
              />
            </MediaUploadCheck>
          </PanelBody>
        </InspectorControls>

        <section {...blockProps} id="about">
          <AboutContent attributes={attributes} />
        </section>
      </>
    );
  },
  save({ attributes }) {
    const blockProps = useBlockProps.save();

    return (
      <section {...blockProps} id="about">
        <AboutContent attributes={attributes} />
      </section>
    );
  },
});
