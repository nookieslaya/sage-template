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
  icon: item.icon || '',
  title: getItemLegacyLocalized(item, 'title'),
  desc: getItemLegacyLocalized(item, 'desc'),
}));

const ServicesContent = ({ attributes }) => {
  const headline = getLegacyLocalized(attributes, 'headline', 'Comprehensive Technology Solutions');

  return (
    <section className="mx-auto max-w-7xl scroll-mt-32 px-6 py-20 md:py-24" id="services">
      <header className="text-center">
        <h2 className="text-balance text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-6xl">{headline}</h2>
      </header>
      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {normalizeItems(attributes.items).map((item, index) => (
          <article key={`service-${index}`} className="rounded-3xl border border-zinc-200 bg-zinc-50 p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <div className="inline-flex rounded-2xl bg-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">{item.icon}</div>
            <h3 className="mt-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</h3>
            <p className="mt-4 text-lg leading-relaxed text-zinc-500 dark:text-zinc-400">{item.desc}</p>
          </article>
        ))}
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
              label={__('Headline', 'sage')}
              value={getLegacyLocalized(attributes, 'headline')}
              onChange={(headline) => setAttributes({ headline })}
            />
            <TextareaControl
              label={__('Cards JSON', 'sage')}
              help={__('Array format: icon, title, desc.', 'sage')}
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
          <ServicesContent attributes={attributes} />
        </section>
      </>
    );
  },
  save({ attributes }) {
    const blockProps = useBlockProps.save({ className: 'bg-zinc-100 dark:bg-zinc-950' });

    return (
      <section {...blockProps}>
        <ServicesContent attributes={attributes} />
      </section>
    );
  },
});
