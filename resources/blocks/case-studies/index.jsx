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

const normalizeItems = (items = []) => items.map((item) => ({
  imageUrl: item.imageUrl || '',
  tags: getItemLegacyLocalized(item, 'tags'),
  title: getItemLegacyLocalized(item, 'title'),
  desc: getItemLegacyLocalized(item, 'desc'),
  linkLabel: getItemLegacyLocalized(item, 'linkLabel') || 'View Case Study',
  linkUrl: item.linkUrl || '#',
}));

const CaseStudiesContent = ({ attributes }) => {
  const eyebrow = getLegacyLocalized(attributes, 'eyebrow', 'CASE STUDIES');
  const headline = getLegacyLocalized(attributes, 'headline', 'Featured Projects');

  return (
    <section className="mx-auto max-w-7xl scroll-mt-32 px-6 py-20 md:py-24" id="work">
      <header className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">{eyebrow}</p>
        <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-6xl">{headline}</h2>
      </header>

      <div className="mt-12 grid gap-6 xl:grid-cols-3">
        {normalizeItems(attributes.items).map((item, index) => {
          const tags = (item.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean);

          return (
            <article key={`case-study-${index}`} className="overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              {item.imageUrl ? (
                <img className="h-64 w-full object-cover" src={item.imageUrl} alt={item.title} />
              ) : (
                <div className="flex h-64 items-center justify-center bg-zinc-200 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">{__('Project image', 'sage')}</div>
              )}

              <div className="p-8">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, tagIndex) => (
                    <span key={`tag-${index}-${tagIndex}`} className="rounded-full bg-zinc-200 px-3 py-1 text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">{tag}</span>
                  ))}
                </div>
                <h3 className="mt-6 text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{item.title}</h3>
                <p className="mt-4 text-xl leading-relaxed text-zinc-500 dark:text-zinc-400">{item.desc}</p>
                <a className="twst-link-accent mt-6 inline-flex items-center text-lg font-semibold no-underline" href={item.linkUrl}>{item.linkLabel} ↗</a>
              </div>
            </article>
          );
        })}
      </div>
    </section>
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
              label={__('Eyebrow', 'sage')}
              value={getLegacyLocalized(attributes, 'eyebrow')}
              onChange={(eyebrow) => setAttributes({ eyebrow })}
            />
            <TextControl
              label={__('Headline', 'sage')}
              value={getLegacyLocalized(attributes, 'headline')}
              onChange={(headline) => setAttributes({ headline })}
            />
            <TextareaControl
              label={__('Projects JSON', 'sage')}
              help={__('Array format: imageUrl, tags, title, desc, linkLabel, linkUrl.', 'sage')}
              value={serializeArrayInput(normalizeItems(attributes.items))}
              onChange={(rawValue) => {
                const parsedValue = parseArrayInput(rawValue, null);
                if (!parsedValue) {
                  setJsonError(__('Invalid JSON. Changes were not applied.', 'sage'));
                  return;
                }
                setJsonError('');
                setAttributes({ items: parsedValue });
              }}
            />
            {jsonError ? <Notice status="error" isDismissible={false}>{jsonError}</Notice> : null}
          </PanelBody>
        </InspectorControls>

        <section {...blockProps}>
          <CaseStudiesContent attributes={attributes} />
        </section>
      </>
    );
  },
  save({ attributes }) {
    const blockProps = useBlockProps.save({ className: 'bg-zinc-100 dark:bg-zinc-950' });

    return (
      <section {...blockProps}>
        <CaseStudiesContent attributes={attributes} />
      </section>
    );
  },
});
