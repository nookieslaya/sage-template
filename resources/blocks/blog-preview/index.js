import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { createElement as el, Fragment } from '@wordpress/element';
import metadata from './block.json';
import { getLegacyLocalized } from '../shared';

const BlogPreviewContent = ({ attributes }) => {
  const eyebrow = getLegacyLocalized(attributes, 'eyebrow', 'BLOG');
  const headline = getLegacyLocalized(attributes, 'headline', 'Latest Insights');
  const postLinkLabel = getLegacyLocalized(attributes, 'postLinkLabel', 'Read more');
  const viewMoreLabel = getLegacyLocalized(attributes, 'viewMoreLabel', 'View more');

  return el('section', {
    className: 'mx-auto max-w-7xl scroll-mt-32 px-6 py-20 md:py-24',
    id: 'blog',
  },
  el('header', { className: 'text-center' },
    el('p', { className: 'text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400' }, eyebrow),
    el('h2', { className: 'mt-4 text-balance text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-6xl' }, headline),
  ),
  el('div', { className: 'mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3' },
    ...[1, 2, 3].map((index) => el('article', {
      key: `placeholder-${index}`,
      className: 'rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400',
    },
    __('Latest post #', 'sage'),
    String(index),
    __(' will render on frontend', 'sage'),
    el('div', { className: 'mt-3 text-sm' }, postLinkLabel),
    )),
  ),
  el('div', { className: 'mt-10 text-center' },
    el('span', { className: 'twst-btn-accent' }, viewMoreLabel),
  ));
};

registerBlockType(metadata.name, {
  ...metadata,
  edit({ attributes, setAttributes }) {
    const blockProps = useBlockProps({ className: 'bg-zinc-100 dark:bg-zinc-950' });

    return el(Fragment, {},
      el(InspectorControls, {},
        el(PanelBody, { title: __('Content', 'sage'), initialOpen: true },
          el(TextControl, {
            label: __('Eyebrow', 'sage'),
            value: getLegacyLocalized(attributes, 'eyebrow'),
            onChange: (eyebrow) => setAttributes({ eyebrow }),
          }),
          el(TextControl, {
            label: __('Headline', 'sage'),
            value: getLegacyLocalized(attributes, 'headline'),
            onChange: (headline) => setAttributes({ headline }),
          }),
          el(TextControl, {
            label: __('Post link label', 'sage'),
            value: getLegacyLocalized(attributes, 'postLinkLabel'),
            onChange: (postLinkLabel) => setAttributes({ postLinkLabel }),
          }),
          el(TextControl, {
            label: __('View more button label', 'sage'),
            value: getLegacyLocalized(attributes, 'viewMoreLabel'),
            onChange: (viewMoreLabel) => setAttributes({ viewMoreLabel }),
          }),
        ),
      ),
      el('section', blockProps, el(BlogPreviewContent, { attributes })),
    );
  },
  save({ attributes }) {
    const blockProps = useBlockProps.save({ className: 'bg-zinc-100 dark:bg-zinc-950' });
    return el('section', blockProps, el(BlogPreviewContent, { attributes }));
  },
});
