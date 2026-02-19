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

const ContactContent = ({ attributes }) => {
  const headline = getLegacyLocalized(attributes, 'headline', 'Ready to build your next product?');
  const description = getLegacyLocalized(attributes, 'description', 'Tell me about your goals and timeline. I will reply with a practical implementation plan.');
  const ctaLabel = getLegacyLocalized(attributes, 'ctaLabel', 'Start a Project');

  return el('section', {
    className: 'mx-auto max-w-7xl scroll-mt-32 px-6 py-20 md:py-24',
    id: 'contact',
  },
  el('div', { className: 'rounded-3xl bg-zinc-900 p-10 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 md:p-16' },
    el('h2', { className: 'text-balance text-4xl font-semibold tracking-tight md:text-6xl' }, headline),
    el('p', { className: 'mt-6 max-w-3xl text-xl leading-relaxed opacity-80' }, description),
    el('div', { className: 'mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between' },
      el('a', { className: 'twst-btn-accent w-fit', href: esc(attributes.ctaUrl || '#') }, ctaLabel),
      el('div', { className: 'text-sm opacity-80' },
        el('p', {}, attributes.email || ''),
        el('p', {}, attributes.phone || ''),
      ),
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
            label: __('CTA label', 'sage'),
            value: getLegacyLocalized(attributes, 'ctaLabel'),
            onChange: (ctaLabel) => setAttributes({ ctaLabel }),
          }),
          el('p', { className: 'components-base-control__label' }, __('CTA URL', 'sage')),
          el(URLInputButton, {
            url: attributes.ctaUrl,
            onChange: (ctaUrl) => setAttributes({ ctaUrl }),
          }),
          el(TextControl, {
            label: __('Email', 'sage'),
            value: attributes.email,
            onChange: (email) => setAttributes({ email }),
          }),
          el(TextControl, {
            label: __('Phone', 'sage'),
            value: attributes.phone,
            onChange: (phone) => setAttributes({ phone }),
          }),
        ),
      ),
      el('section', blockProps, el(ContactContent, { attributes })),
    );
  },
  save({ attributes }) {
    const blockProps = useBlockProps.save({ className: 'bg-zinc-100 dark:bg-zinc-950' });
    return el('section', blockProps, el(ContactContent, { attributes }));
  },
});
