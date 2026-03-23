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
  const email = String(attributes.email || '').trim();
  const phone = String(attributes.phone || '').trim();

  return (
    <div className="twst-contact__inner">
      <div className="twst-contact__panel">
        {headline ? (
          <h2 className="twst-contact__headline twst-showcase-headline twst-reveal-up" data-showcase-headline-trigger="inview" data-reveal-item data-reveal-delay="0">
            <span className="twst-showcase-headline__base" data-showcase-headline-base>{headline}</span>
            <span className="twst-showcase-headline__masks" data-showcase-headline-masks aria-hidden="true" />
          </h2>
        ) : null}

        {description ? (
          <p className="twst-contact__description twst-reveal-up" data-reveal-item data-reveal-delay="110">
            {description}
          </p>
        ) : null}

        <div className="twst-contact__bottom twst-reveal-up" data-reveal-item data-reveal-delay="220">
          {ctaLabel ? (
            <a className="twst-showcase-cta-primary twst-contact__cta" href={attributes.ctaUrl || '#'}>{ctaLabel}</a>
          ) : null}

          <div className="twst-contact__meta">
            {email ? <p>{email}</p> : null}
            {phone ? <p>{phone}</p> : null}
          </div>
        </div>
      </div>
    </div>
  );
};

registerBlockType(metadata.name, {
  ...metadata,
  edit({ attributes, setAttributes }) {
    const blockProps = useBlockProps({
      className: 'twst-contact',
      id: 'contact',
      'data-reveal-root': true,
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
    const blockProps = useBlockProps.save({
      className: 'twst-contact',
      id: 'contact',
      'data-reveal-root': true,
    });

    return (
      <section {...blockProps}>
        <ContactContent attributes={attributes} />
      </section>
    );
  },
});
