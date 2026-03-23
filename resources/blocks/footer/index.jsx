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
    <footer className="twst-site-footer">
      <div className="twst-site-footer__inner">
        <div className="twst-site-footer__top">
          <section>
            <h3 className="twst-site-footer__brand">{attributes.brand || ''}</h3>
            <p className="twst-site-footer__tagline">{tagline}</p>
          </section>
          <nav aria-label="Footer links">
            <h4 className="twst-site-footer__heading">{__('Quick Links', 'sage')}</h4>
            <ul className="twst-site-footer__links">
            {normalizeLinks(attributes.links).map((link, index) => (
              <li key={`quick-link-${index}`}>
                <a href={link.url}>{link.label}</a>
              </li>
            ))}
            </ul>
          </nav>
          <section>
            <h4 className="twst-site-footer__heading">{__('Connect', 'sage')}</h4>
            <div className="twst-site-footer__socials">
              {(attributes.socials || []).map((social, index) => (
                <a key={`social-${index}`} className="twst-site-footer__social-link" href={social.url || '#'}>{social.label || ''}</a>
              ))}
            </div>
          </section>
        </div>
        <div className="twst-site-footer__rdev">
          <div className="twst-site-footer__rdev-bg twst-words-three-bg" data-words-three-bg="true" data-words-three-shape="rdev" aria-hidden="true" />
          <span className="twst-site-footer__rdev-word">rdev.</span>
        </div>
        <div className="twst-site-footer__bottom">© {year} {attributes.brand || ''}. {copyright}</div>
      </div>
    </footer>
  );
};

registerBlockType(metadata.name, {
  ...metadata,
  edit({ attributes, setAttributes }) {
    const [jsonError, setJsonError] = useState('');
    const blockProps = useBlockProps();

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
    const blockProps = useBlockProps.save();

    return (
      <div {...blockProps}>
        <FooterContent attributes={attributes} />
      </div>
    );
  },
});
