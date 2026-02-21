import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { Button, PanelBody, TextControl, TextareaControl } from '@wordpress/components';
import metadata from './block.json';
import {
  getLegacyLocalized,
  getItemLegacyLocalized,
} from '../shared';

const normalizeItems = (items = []) => items.map((item) => ({
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
            <h3 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</h3>
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
    const blockProps = useBlockProps({ className: 'bg-zinc-100 dark:bg-zinc-950' });
    const items = normalizeItems(attributes.items);

    const setItems = (nextItems) => {
      setAttributes({ items: nextItems });
    };

    const updateItem = (index, key, value) => {
      const nextItems = items.map((item, itemIndex) => (
        itemIndex === index ? { ...item, [key]: value } : item
      ));
      setItems(nextItems);
    };

    const addItem = () => {
      setItems([
        ...items,
        {
          title: '',
          desc: '',
        },
      ]);
    };

    const removeItem = (index) => {
      if (items.length <= 1) {
        return;
      }

      setItems(items.filter((_, itemIndex) => itemIndex !== index));
    };

    const moveItem = (index, direction) => {
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= items.length) {
        return;
      }

      const nextItems = [...items];
      const currentItem = nextItems[index];
      nextItems[index] = nextItems[targetIndex];
      nextItems[targetIndex] = currentItem;
      setItems(nextItems);
    };

    return (
      <>
        <InspectorControls>
          <PanelBody title={__('Content', 'sage')} initialOpen>
            <TextControl
              label={__('Headline', 'sage')}
              value={getLegacyLocalized(attributes, 'headline')}
              onChange={(headline) => setAttributes({ headline })}
            />

            {items.map((item, index) => (
              <div key={`service-control-${index}`} className="mt-6 rounded border border-zinc-300 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {`${__('Card', 'sage')} ${index + 1}`}
                </p>

                <TextControl
                  label={__('Title', 'sage')}
                  value={item.title}
                  onChange={(value) => updateItem(index, 'title', value)}
                />

                <TextareaControl
                  label={__('Description', 'sage')}
                  value={item.desc}
                  onChange={(value) => updateItem(index, 'desc', value)}
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => moveItem(index, -1)}
                    disabled={index === 0}
                  >
                    {__('Move up', 'sage')}
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={() => moveItem(index, 1)}
                    disabled={index === items.length - 1}
                  >
                    {__('Move down', 'sage')}
                  </Button>

                  <Button
                    variant="secondary"
                    isDestructive
                    onClick={() => removeItem(index)}
                    disabled={items.length <= 1}
                  >
                    {__('Remove', 'sage')}
                  </Button>
                </div>
              </div>
            ))}

            <div className="mt-4">
              <Button variant="primary" onClick={addItem}>
                {__('Add card', 'sage')}
              </Button>
            </div>
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
