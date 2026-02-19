import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { Notice, PanelBody, TextControl, TextareaControl } from '@wordpress/components';
import { useState } from '@wordpress/element';
import metadata from './block.json';
import {
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

  return (
    <footer className="border-t border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-3">
        <section>
          <h3 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{attributes.brand || ''}</h3>
          <p className="mt-4 text-xl text-zinc-500 dark:text-zinc-400">{tagline}</p>
        </section>
        <nav aria-label="Footer links">
          <h4 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{__('Quick Links', 'sage')}</h4>
          <ul className="mt-4 space-y-3 text-xl text-zinc-500 dark:text-zinc-400">
            {normalizeLinks(attributes.links).map((link, index) => (
              <li key={`quick-link-${index}`}>
                <a className="transition hover:text-zinc-900 dark:hover:text-zinc-100" href={link.url}>{link.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <section>
          <h4 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{__('Connect', 'sage')}</h4>
          <div className="mt-4 flex flex-wrap gap-3">
            {(attributes.socials || []).map((social, index) => (
              <a key={`social-${index}`} className="inline-flex rounded-xl bg-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700" href={social.url || '#'}>{social.label || ''}</a>
            ))}
          </div>
        </section>
      </div>
      <div className="border-t border-zinc-200 px-6 py-8 text-center text-lg text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">© {year} {attributes.brand || ''}. {copyright}</div>
    </footer>
  );
};

registerBlockType(metadata.name, {
  ...metadata,
  edit({ attributes, setAttributes }) {
    const [jsonError, setJsonError] = useState('');
    const blockProps = useBlockProps({ className: 'bg-zinc-100 dark:bg-zinc-950' });

    return (
      <>
        <InspectorControls>
          <PanelBody title={__('Content', 'sage')} initialOpen>
            <TextControl
              label={__('Brand name', 'sage')}
              value={attributes.brand}
              onChange={(brand) => setAttributes({ brand })}
            />
            <TextControl
              label={__('Tagline', 'sage')}
              value={getLegacyLocalized(attributes, 'tagline')}
              onChange={(tagline) => setAttributes({ tagline })}
            />
            <TextControl
              label={__('Copyright', 'sage')}
              value={getLegacyLocalized(attributes, 'copyright')}
              onChange={(copyright) => setAttributes({ copyright })}
            />
            <TextareaControl
              label={__('Quick links JSON', 'sage')}
              help={__('Array format: label, url.', 'sage')}
              value={serializeArrayInput(normalizeLinks(attributes.links))}
              onChange={(rawValue) => {
                const parsedValue = parseArrayInput(rawValue, null);
                if (!parsedValue) {
                  setJsonError(__('Invalid JSON. Changes were not applied.', 'sage'));
                  return;
                }
                setJsonError('');
                setAttributes({ links: parsedValue });
              }}
            />
            <TextareaControl
              label={__('Social links JSON', 'sage')}
              help={__('Array format: label, url.', 'sage')}
              value={serializeArrayInput(attributes.socials)}
              onChange={(rawValue) => {
                const parsedValue = parseArrayInput(rawValue, null);
                if (!parsedValue) {
                  setJsonError(__('Invalid JSON. Changes were not applied.', 'sage'));
                  return;
                }
                setJsonError('');
                setAttributes({ socials: parsedValue });
              }}
            />
            {jsonError ? <Notice status="error" isDismissible={false}>{jsonError}</Notice> : null}
          </PanelBody>
        </InspectorControls>

        <div {...blockProps}>
          <FooterContent attributes={attributes} />
        </div>
      </>
    );
  },
  save({ attributes }) {
    const blockProps = useBlockProps.save({ className: 'bg-zinc-100 dark:bg-zinc-950' });

    return (
      <div {...blockProps}>
        <FooterContent attributes={attributes} />
      </div>
    );
  },
});
