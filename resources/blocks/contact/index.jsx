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

const ContactContent = ({ attributes }) => {
  const headline = getLegacyLocalized(attributes, 'headline', 'Ready to build your next product?');
  const description = getLegacyLocalized(attributes, 'description', 'Tell me about your goals and timeline. I will reply with a practical implementation plan.');
  const ctaLabel = getLegacyLocalized(attributes, 'ctaLabel', 'Start a Project');

  return (
    <section className="mx-auto max-w-7xl scroll-mt-32 px-6 py-20 md:py-24" id="contact" data-reveal-root>
      <div className="twst-contact-panel rounded-3xl p-10 text-zinc-900 dark:text-zinc-100 md:p-16">
        <h2 className="twst-reveal-up text-balance text-4xl font-semibold tracking-tight md:text-6xl" data-reveal-item data-reveal-delay="0">{headline}</h2>
        <p className="twst-reveal-up mt-6 max-w-3xl text-xl leading-relaxed opacity-80" data-reveal-item data-reveal-delay="110">{description}</p>
        <div className="twst-reveal-up mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" data-reveal-item data-reveal-delay="220">
          <a className="twst-hero-btn-primary w-fit" href={attributes.ctaUrl || '#'}>{ctaLabel}</a>
          <div className="text-sm opacity-80">
            <p>{attributes.email || ''}</p>
            <p>{attributes.phone || ''}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

registerBlockType(metadata.name, {
  ...metadata,
  edit({ attributes, setAttributes }) {
    const blockProps = useBlockProps({ className: 'bg-zinc-100 dark:bg-zinc-950' });

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
              label={__('CTA label', 'sage')}
              value={getLegacyLocalized(attributes, 'ctaLabel')}
              onChange={(ctaLabel) => setAttributes({ ctaLabel })}
            />
            <p className="components-base-control__label">{__('CTA URL', 'sage')}</p>
            <URLInputButton
              url={attributes.ctaUrl}
              onChange={(ctaUrl) => setAttributes({ ctaUrl })}
            />
            <TextControl
              label={__('Email', 'sage')}
              value={attributes.email}
              onChange={(email) => setAttributes({ email })}
            />
            <TextControl
              label={__('Phone', 'sage')}
              value={attributes.phone}
              onChange={(phone) => setAttributes({ phone })}
            />
          </PanelBody>
        </InspectorControls>

        <section {...blockProps}>
          <ContactContent attributes={attributes} />
        </section>
      </>
    );
  },
  save({ attributes }) {
    const blockProps = useBlockProps.save({ className: 'bg-zinc-100 dark:bg-zinc-950' });

    return (
      <section {...blockProps}>
        <ContactContent attributes={attributes} />
      </section>
    );
  },
});
