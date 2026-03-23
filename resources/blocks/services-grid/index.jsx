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
  const description = getLegacyLocalized(attributes, 'description', '');
  const items = normalizeItems(attributes.items);

  return (
    <section className="twst-services-grid" id="services" data-reveal-root>
      <div className="twst-services-grid__inner">
        <div className="twst-services-grid__layout">
          <header className="twst-services-grid__header twst-reveal-up" data-reveal-item data-reveal-delay="0">
            {headline ? (
              <h2 className="twst-services-grid__headline twst-showcase-headline" data-showcase-headline-trigger="inview">
                <span className="twst-showcase-headline__base" data-showcase-headline-base>{headline}</span>
                <span className="twst-showcase-headline__masks" data-showcase-headline-masks aria-hidden="true" />
              </h2>
            ) : null}
            {description ? <p className="twst-services-grid__description">{description}</p> : null}
          </header>

          <div className="twst-services-grid__cards">
            {items.map((item, index) => (
              <article
                key={`service-${index}`}
                className="twst-services-grid__card twst-reveal-up"
                data-reveal-item
                data-reveal-delay={String(80 + index * 70)}
              >
                {item.title ? (
                  <h3 className="twst-services-grid__card-title">
                    <span className="twst-services-grid__card-title-wrap">
                      <span className="twst-services-grid__card-title-text">{item.title}</span>
                      <span className="twst-services-grid__card-title-mask twst-services-grid__card-title-mask--white" aria-hidden="true" />
                      <span className="twst-services-grid__card-title-mask twst-services-grid__card-title-mask--accent" aria-hidden="true" />
                    </span>
                  </h3>
                ) : null}
                {item.desc ? <p className="twst-services-grid__card-desc">{item.desc}</p> : null}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

registerBlockType(metadata.name, {
  ...metadata,
  edit({ attributes, setAttributes }) {
    const blockProps = useBlockProps();
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
            <TextareaControl
              label={__('Description', 'sage')}
              value={getLegacyLocalized(attributes, 'description')}
              onChange={(description) => setAttributes({ description })}
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

        <div {...blockProps}>
          <ServicesContent attributes={attributes} />
        </div>
      </>
    );
  },
  save({ attributes }) {
    const blockProps = useBlockProps.save();

    return (
      <div {...blockProps}>
        <ServicesContent attributes={attributes} />
      </div>
    );
  },
});
