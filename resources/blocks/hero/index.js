import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
  InspectorControls,
  URLInputButton,
  useBlockProps,
} from '@wordpress/block-editor';
import { PanelBody, TextControl, TextareaControl } from '@wordpress/components';
import { createElement as el, Fragment } from '@wordpress/element';
import metadata from './block.json';
import { esc, getLegacyLocalized } from '../shared';

const HeroContent = ({ attributes }) => {
  const headline = getLegacyLocalized(attributes, 'headline', 'Building Enterprise Solutions That Scale');
  const description = getLegacyLocalized(attributes, 'description', 'I partner with B2B companies to design and develop robust technology solutions that drive business growth.');
  const primaryLabel = getLegacyLocalized(attributes, 'primaryLabel', 'Start a Project');
  const secondaryLabel = getLegacyLocalized(attributes, 'secondaryLabel', 'View My Work');

  return el('header', {
    id: 'home',
    className: 'twst-hero relative w-full scroll-mt-32 overflow-hidden px-6 py-20 md:py-28',
  },
  el('div', { className: 'twst-hero-bg', 'aria-hidden': 'true' },
    el('span', { className: 'twst-hero-blob twst-hero-blob-a' }),
    el('span', { className: 'twst-hero-blob twst-hero-blob-b' }),
    el('span', { className: 'twst-hero-blob twst-hero-blob-c' }),
    el('span', { className: 'twst-hero-grid' }),
  ),
  el('div', { className: 'relative z-10 mx-auto max-w-6xl text-center' },
    el('h1', { className: 'mx-auto max-w-5xl text-balance text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-7xl' }, headline),
    el('p', { className: 'mx-auto mt-8 max-w-4xl text-pretty text-lg leading-relaxed text-zinc-500 dark:text-zinc-400 md:text-2xl' }, description),
    el('div', { className: 'mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row' },
      el('a', { className: 'twst-btn-accent', href: esc(attributes.primaryUrl || '#') }, primaryLabel),
      el('a', {
        className: 'inline-flex items-center justify-center rounded-2xl bg-zinc-200 px-8 py-4 text-base font-semibold text-zinc-900 transition hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700',
        href: esc(attributes.secondaryUrl || '#'),
      }, secondaryLabel),
    ),
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
            label: __('Headline', 'sage'),
            value: getLegacyLocalized(attributes, 'headline'),
            onChange: (headline) => setAttributes({ headline }),
          }),
          el(TextareaControl, {
            label: __('Description', 'sage'),
            value: getLegacyLocalized(attributes, 'description'),
            onChange: (description) => setAttributes({ description }),
          }),
          el(TextControl, {
            label: __('Primary CTA label', 'sage'),
            value: getLegacyLocalized(attributes, 'primaryLabel'),
            onChange: (primaryLabel) => setAttributes({ primaryLabel }),
          }),
          el('p', { className: 'components-base-control__label' }, __('Primary CTA URL', 'sage')),
          el(URLInputButton, {
            url: attributes.primaryUrl,
            onChange: (primaryUrl) => setAttributes({ primaryUrl }),
          }),
          el(TextControl, {
            label: __('Secondary CTA label', 'sage'),
            value: getLegacyLocalized(attributes, 'secondaryLabel'),
            onChange: (secondaryLabel) => setAttributes({ secondaryLabel }),
          }),
          el('p', { className: 'components-base-control__label' }, __('Secondary CTA URL', 'sage')),
          el(URLInputButton, {
            url: attributes.secondaryUrl,
            onChange: (secondaryUrl) => setAttributes({ secondaryUrl }),
          }),
        ),
      ),
      el('section', blockProps, el(HeroContent, { attributes })),
    );
  },
  save({ attributes }) {
    const blockProps = useBlockProps.save({ className: 'bg-zinc-100 dark:bg-zinc-950' });
    return el('section', blockProps, el(HeroContent, { attributes }));
  },
});
