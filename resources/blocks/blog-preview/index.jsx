import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import metadata from './block.json';
import { getLegacyLocalized } from '../shared';

const BlogPreviewContent = ({ attributes }) => {
  const eyebrow = getLegacyLocalized(attributes, 'eyebrow', 'BLOG');
  const headline = getLegacyLocalized(attributes, 'headline', 'Latest Insights');
  const postLinkLabel = getLegacyLocalized(attributes, 'postLinkLabel', 'Read more');
  const viewMoreLabel = getLegacyLocalized(attributes, 'viewMoreLabel', 'View more');

  return (
    <section className="mx-auto max-w-7xl scroll-mt-32 px-6 py-20 md:py-24" id="blog" data-reveal-root>
      <header className="text-center twst-reveal-up" data-reveal-item data-reveal-delay="0">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">{eyebrow}</p>
        <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-6xl">{headline}</h2>
      </header>
      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((index) => (
          <article
            key={`placeholder-${index}`}
            className="twst-reveal-up rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400"
            data-reveal-item
            data-reveal-delay={String(90 + (index - 1) * 80)}
          >
            {__('Latest post #', 'sage')}{index}{__(' will render on frontend', 'sage')}
            <div className="mt-3 text-sm">{postLinkLabel}</div>
          </article>
        ))}
      </div>
      <div className="mt-10 text-center twst-reveal-up" data-reveal-item data-reveal-delay="340"><span className="twst-btn-accent">{viewMoreLabel}</span></div>
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
    const blockProps = useBlockProps.save({ className: 'bg-zinc-100 dark:bg-zinc-950' });
    return (
      <section {...blockProps}>
        <BlogPreviewContent attributes={attributes} />
      </section>
    );
  },
});
