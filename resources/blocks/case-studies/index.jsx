import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
  InspectorControls,
  MediaUpload,
  MediaUploadCheck,
  URLInputButton,
  useBlockProps,
} from '@wordpress/block-editor';
import {
  Button,
  PanelBody,
  TextControl,
  TextareaControl,
} from '@wordpress/components';
import metadata from './block.json';
import { getLegacyLocalized, getItemLegacyLocalized } from '../shared';

const normalizeItems = (items = []) =>
  items.map((item) => ({
    imageUrl: item.imageUrl || '',
    tags: getItemLegacyLocalized(item, 'tags'),
    title: getItemLegacyLocalized(item, 'title'),
    desc: getItemLegacyLocalized(item, 'desc'),
    linkLabel: getItemLegacyLocalized(item, 'linkLabel') || 'View Case Study',
    linkUrl: item.linkUrl || '#',
  }));

const CaseStudiesContent = ({ attributes }) => {
  const eyebrow = getLegacyLocalized(attributes, 'eyebrow', 'CASE STUDIES');
  const headline = getLegacyLocalized(
    attributes,
    'headline',
    'Featured Projects',
  );

  return (
    <section
      className="mx-auto max-w-7xl scroll-mt-32 px-6 py-20 md:py-24"
      id="work"
    >
      <header className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">
          {eyebrow}
        </p>
        <h2 className="mt-4 text-balance text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-6xl">
          {headline}
        </h2>
      </header>

      <div className="mt-12 grid gap-6 xl:grid-cols-3">
        {normalizeItems(attributes.items).map((item, index) => {
          const tags = (item.tags || '')
            .split(',')
            .map((tag) => tag.trim())
            .filter(Boolean);

          return (
            <article
              key={`case-study-${index}`}
              className="twst-elevated-card overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"
            >
              {item.imageUrl ? (
                <img
                  className="h-64 w-full object-contain"
                  src={item.imageUrl}
                  alt={item.title}
                />
              ) : (
                <div className="flex h-64 items-center justify-center bg-zinc-200 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  {__('Project image', 'sage')}
                </div>
              )}

              <div className="p-8">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, tagIndex) => (
                    <span
                      key={`tag-${index}-${tagIndex}`}
                      className="rounded-full bg-zinc-200 px-3 py-1 text-sm text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="mt-6 text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {item.title}
                </h3>
                <p className="mt-4 text-xl leading-relaxed text-zinc-500 dark:text-zinc-400">
                  {item.desc}
                </p>
                <a
                  className="twst-arrow-link twst-link-accent mt-6 inline-flex items-center text-lg font-semibold no-underline"
                  href={item.linkUrl}
                >
                  <span>{item.linkLabel}</span>
                  <span className="twst-arrow" aria-hidden="true">
                    <svg viewBox="0 0 16 16" fill="none">
                      <path d="M2 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      <path d="M8 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </a>
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
    const blockProps = useBlockProps({
      className: 'bg-zinc-100 dark:bg-zinc-950',
    });
    const items = normalizeItems(attributes.items);

    const setItems = (nextItems) => {
      setAttributes({ items: nextItems });
    };

    const updateItem = (index, key, value) => {
      const nextItems = items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      );
      setItems(nextItems);
    };

    const addItem = () => {
      setItems([
        ...items,
        {
          imageUrl: '',
          tags: '',
          title: '',
          desc: '',
          linkLabel: 'View Case Study',
          linkUrl: '#',
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
              label={__('Eyebrow', 'sage')}
              value={getLegacyLocalized(attributes, 'eyebrow')}
              onChange={(eyebrow) => setAttributes({ eyebrow })}
            />
            <TextControl
              label={__('Headline', 'sage')}
              value={getLegacyLocalized(attributes, 'headline')}
              onChange={(headline) => setAttributes({ headline })}
            />

            {items.map((item, index) => (
              <div
                key={`case-study-control-${index}`}
                className="mt-6 rounded border border-zinc-300 p-4"
              >
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {`${__('Project', 'sage')} ${index + 1}`}
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

                <TextControl
                  label={__('Tags (comma separated)', 'sage')}
                  value={item.tags}
                  onChange={(value) => updateItem(index, 'tags', value)}
                />

                <TextControl
                  label={__('Image URL', 'sage')}
                  value={item.imageUrl}
                  onChange={(value) => updateItem(index, 'imageUrl', value)}
                />
                <MediaUploadCheck>
                  <MediaUpload
                    onSelect={(media) =>
                      updateItem(index, 'imageUrl', media?.url || '')
                    }
                    allowedTypes={['image']}
                    value={item.imageUrl}
                    render={({ open }) => (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button variant="secondary" onClick={open}>
                          {item.imageUrl
                            ? __('Replace image', 'sage')
                            : __('Select image', 'sage')}
                        </Button>
                        {item.imageUrl ? (
                          <Button
                            variant="secondary"
                            isDestructive
                            onClick={() => updateItem(index, 'imageUrl', '')}
                          >
                            {__('Remove image', 'sage')}
                          </Button>
                        ) : null}
                      </div>
                    )}
                  />
                </MediaUploadCheck>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="mt-3 h-24 w-full rounded object-cover"
                  />
                ) : null}

                <TextControl
                  label={__('Link label', 'sage')}
                  value={item.linkLabel}
                  onChange={(value) => updateItem(index, 'linkLabel', value)}
                />

                <p className="components-base-control__label">
                  {__('Link URL', 'sage')}
                </p>
                <URLInputButton
                  url={item.linkUrl}
                  onChange={(value) => updateItem(index, 'linkUrl', value)}
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
                {__('Add project', 'sage')}
              </Button>
            </div>
          </PanelBody>
        </InspectorControls>

        <section {...blockProps}>
          <CaseStudiesContent attributes={attributes} />
        </section>
      </>
    );
  },
  save({ attributes }) {
    const blockProps = useBlockProps.save({
      className: 'bg-zinc-100 dark:bg-zinc-950',
    });

    return (
      <section {...blockProps}>
        <CaseStudiesContent attributes={attributes} />
      </section>
    );
  },
});
