import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { Notice, PanelBody, TextControl, TextareaControl } from '@wordpress/components';
import { createElement as el, Fragment, useState } from '@wordpress/element';
import metadata from './block.json';
import {
  esc,
  getLegacyLocalized,
  getItemLegacyLocalized,
  parseArrayInput,
  serializeArrayInput,
} from '../shared';

const normalizeLinks = (links = []) => links.map((link) => ({
  label: getItemLegacyLocalized(link, 'label'),
  url: link.url || '#',
}));

const FooterContent = ({ attributes }) => {
  const tagline = getLegacyLocalized(attributes, 'tagline', 'Building the future of B2B technology');
  const copyright = getLegacyLocalized(attributes, 'copyright', 'All rights reserved.');
  const year = new Date().getFullYear();

  return el('footer', { className: 'border-t border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950' },
    el('div', { className: 'mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-3' },
      el('section', {},
        el('h3', { className: 'text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100' }, attributes.brand || ''),
        el('p', { className: 'mt-4 text-xl text-zinc-500 dark:text-zinc-400' }, tagline),
      ),
      el('nav', { 'aria-label': 'Footer links' },
        el('h4', { className: 'text-2xl font-semibold text-zinc-900 dark:text-zinc-100' }, __('Quick Links', 'sage')),
        el('ul', { className: 'mt-4 space-y-3 text-xl text-zinc-500 dark:text-zinc-400' },
          ...normalizeLinks(attributes.links).map((link, index) => el('li', { key: `quick-link-${index}` },
            el('a', {
              className: 'transition hover:text-zinc-900 dark:hover:text-zinc-100',
              href: esc(link.url),
            }, link.label),
          )),
        ),
      ),
      el('section', {},
        el('h4', { className: 'text-2xl font-semibold text-zinc-900 dark:text-zinc-100' }, __('Connect', 'sage')),
        el('div', { className: 'mt-4 flex flex-wrap gap-3' },
          ...(attributes.socials || []).map((social, index) => el('a', {
            key: `social-${index}`,
            className: 'inline-flex rounded-xl bg-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700',
            href: esc(social.url || '#'),
          }, social.label || '')),
        ),
      ),
    ),
    el('div', { className: 'border-t border-zinc-200 px-6 py-8 text-center text-lg text-zinc-500 dark:border-zinc-800 dark:text-zinc-400' }, `© ${year} ${attributes.brand || ''}. ${copyright}`),
  );
};

registerBlockType(metadata.name, {
  ...metadata,
  edit({ attributes, setAttributes }) {
    const [jsonError, setJsonError] = useState('');
    const blockProps = useBlockProps({ className: 'bg-zinc-100 dark:bg-zinc-950' });

    return el(Fragment, {},
      el(InspectorControls, {},
        el(PanelBody, { title: __('Content', 'sage'), initialOpen: true },
          el(TextControl, {
            label: __('Brand name', 'sage'),
            value: attributes.brand,
            onChange: (brand) => setAttributes({ brand }),
          }),
          el(TextControl, {
            label: __('Tagline', 'sage'),
            value: getLegacyLocalized(attributes, 'tagline'),
            onChange: (tagline) => setAttributes({ tagline }),
          }),
          el(TextControl, {
            label: __('Copyright', 'sage'),
            value: getLegacyLocalized(attributes, 'copyright'),
            onChange: (copyright) => setAttributes({ copyright }),
          }),
          el(TextareaControl, {
            label: __('Quick links JSON', 'sage'),
            help: __('Array format: label, url.', 'sage'),
            value: serializeArrayInput(normalizeLinks(attributes.links)),
            onChange: (rawValue) => {
              const parsedValue = parseArrayInput(rawValue, null);
              if (!parsedValue) {
                setJsonError(__('Invalid JSON. Changes were not applied.', 'sage'));
                return;
              }
              setJsonError('');
              setAttributes({ links: parsedValue });
            },
          }),
          el(TextareaControl, {
            label: __('Social links JSON', 'sage'),
            help: __('Array format: label, url.', 'sage'),
            value: serializeArrayInput(attributes.socials),
            onChange: (rawValue) => {
              const parsedValue = parseArrayInput(rawValue, null);
              if (!parsedValue) {
                setJsonError(__('Invalid JSON. Changes were not applied.', 'sage'));
                return;
              }
              setJsonError('');
              setAttributes({ socials: parsedValue });
            },
          }),
          jsonError ? el(Notice, { status: 'error', isDismissible: false }, jsonError) : null,
        ),
      ),
      el('div', blockProps, el(FooterContent, { attributes })),
    );
  },
  save({ attributes }) {
    const blockProps = useBlockProps.save({ className: 'bg-zinc-100 dark:bg-zinc-950' });
    return el('div', blockProps, el(FooterContent, { attributes }));
  },
});
