import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
  InspectorControls,
  MediaUpload,
  MediaUploadCheck,
  useBlockProps,
} from '@wordpress/block-editor';
import { Button, PanelBody, TextControl, TextareaControl } from '@wordpress/components';
import { createElement as el, Fragment } from '@wordpress/element';
import metadata from './block.json';
import { esc, getLegacyLocalized } from '../shared';

const AboutContent = ({ attributes }) => {
  const eyebrow = getLegacyLocalized(attributes, 'eyebrow', 'ABOUT');
  const headline = getLegacyLocalized(attributes, 'headline', 'Technology Partner for Modern Businesses');
  const body = getLegacyLocalized(attributes, 'body', 'With over 10 years of experience in enterprise software development, I specialize in building scalable solutions for B2B companies.');

  return el('section', {
    id: 'about',
    className: 'mx-auto max-w-7xl scroll-mt-32 px-6 py-20 md:py-24',
  },
  el('header', { className: 'text-center' },
    el('p', { className: 'text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400' }, eyebrow),
    el('h2', { className: 'mt-4 text-balance text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-6xl' }, headline),
  ),
  el('div', { className: 'mt-12 grid gap-10 md:grid-cols-2 md:items-center' },
    el('figure', { className: 'overflow-hidden rounded-3xl' },
      attributes.imageUrl
        ? el('img', {
          className: 'h-full w-full rounded-3xl object-cover',
          src: esc(attributes.imageUrl),
          alt: attributes.imageAlt || '',
        })
        : el('div', {
          className: 'flex h-full min-h-80 items-center justify-center rounded-3xl border border-dashed border-zinc-300 bg-zinc-200 text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300',
        }, __('Add portrait image', 'sage')),
    ),
    el('p', { className: 'text-pretty text-xl leading-relaxed text-zinc-500 dark:text-zinc-400 md:text-3xl' }, body),
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
          el(TextareaControl, {
            label: __('Body', 'sage'),
            value: getLegacyLocalized(attributes, 'body'),
            onChange: (body) => setAttributes({ body }),
          }),
          el(TextControl, {
            label: __('Image alt', 'sage'),
            value: attributes.imageAlt,
            onChange: (imageAlt) => setAttributes({ imageAlt }),
          }),
          el(MediaUploadCheck, {},
            el(MediaUpload, {
              onSelect: (media) => setAttributes({ imageUrl: media?.url || '' }),
              allowedTypes: ['image'],
              value: attributes.imageUrl,
              render: ({ open }) => el(Button, {
                variant: 'secondary',
                onClick: open,
              }, attributes.imageUrl ? __('Replace image', 'sage') : __('Select image', 'sage')),
            }),
          ),
        ),
      ),
      el('section', blockProps, el(AboutContent, { attributes })),
    );
  },
  save({ attributes }) {
    const blockProps = useBlockProps.save({ className: 'bg-zinc-100 dark:bg-zinc-950' });
    return el('section', blockProps, el(AboutContent, { attributes }));
  },
});
