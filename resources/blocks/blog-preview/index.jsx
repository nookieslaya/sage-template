import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import metadata from './block.json';
import { getLegacyLocalized } from '../shared';

const BlogPreviewContent = ({ attributes }) => {
  const headline = getLegacyLocalized(attributes, 'headline', 'Latest Insights');
  const postLinkLabel = getLegacyLocalized(attributes, 'postLinkLabel', 'Read more');
  const viewMoreLabel = getLegacyLocalized(attributes, 'viewMoreLabel', 'View more');

  return (
    <section className="twst-blog-preview" id="blog" data-reveal-root>
      <div className="twst-blog-preview__inner">
        <header className="twst-blog-preview__header twst-reveal-up" data-reveal-item data-reveal-delay="0">
          {headline ? (
            <h2 className="twst-blog-preview__headline twst-showcase-headline" data-showcase-headline-trigger="inview">
              <span className="twst-showcase-headline__base" data-showcase-headline-base>{headline}</span>
              <span className="twst-showcase-headline__masks" data-showcase-headline-masks aria-hidden="true" />
            </h2>
          ) : null}
        </header>

        <div className="twst-blog-preview__grid">
        {[1, 2, 3].map((index) => (
          <article
            key={`placeholder-${index}`}
            className="twst-blog-preview__card twst-reveal-up"
            data-reveal-item
            data-reveal-delay={String(90 + (index - 1) * 80)}
          >
            <div className="twst-blog-preview__image twst-blog-preview__image--placeholder">
              {__('Latest post #', 'sage')}{index}
            </div>
            <div className="twst-blog-preview__body">
              <p className="twst-blog-preview__meta">{__('will render on frontend', 'sage')}</p>
              <h3 className="twst-blog-preview__title">
                <span className="twst-blog-preview__title-wrap">{__('Post title', 'sage')}</span>
              </h3>
              <span className="twst-showcase-cta-secondary twst-blog-preview__read">{postLinkLabel}</span>
            </div>
          </article>
        ))}
        </div>

        {viewMoreLabel ? (
          <div className="twst-blog-preview__cta twst-reveal-up" data-reveal-item data-reveal-delay="340">
            <span className="twst-showcase-cta-primary twst-blog-preview__cta-btn">{viewMoreLabel}</span>
          </div>
        ) : null}
      </div>
    </section>
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
              value={getLegacyLocalized(attributes, 'eyebrow')}
              onChange={(eyebrow) => setAttributes({ eyebrow })}
            />
            <TextControl
              label={__('Headline', 'sage')}
              value={getLegacyLocalized(attributes, 'headline')}
              onChange={(headline) => setAttributes({ headline })}
            />
            <TextControl
              label={__('Post link label', 'sage')}
              value={getLegacyLocalized(attributes, 'postLinkLabel')}
              onChange={(postLinkLabel) => setAttributes({ postLinkLabel })}
            />
            <TextControl
              label={__('View more button label', 'sage')}
              value={getLegacyLocalized(attributes, 'viewMoreLabel')}
              onChange={(viewMoreLabel) => setAttributes({ viewMoreLabel })}
            />
          </PanelBody>
        </InspectorControls>

        <section {...blockProps}>
          <BlogPreviewContent attributes={attributes} />
        </section>
      </>
    );
  },
  save({ attributes }) {
    const blockProps = useBlockProps.save();
    return (
      <section {...blockProps}>
        <BlogPreviewContent attributes={attributes} />
      </section>
    );
  },
});
