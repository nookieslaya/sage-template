import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
  InspectorControls,
  MediaUpload,
  MediaUploadCheck,
  URLInputButton,
  useBlockProps,
} from '@wordpress/block-editor';
import { Button, PanelBody, TextControl, TextareaControl } from '@wordpress/components';
import metadata from './block.json';

const normalizeItems = (items = [], { isEditor = false } = {}) => {
  const normalized = items.map((item) => ({
    title: String(item?.title || '').trim(),
    meta: String(item?.meta || '').trim(),
    imageUrl: String(item?.imageUrl || '').trim(),
    imageAlt: String(item?.imageAlt || '').trim(),
    linkUrl: String(item?.linkUrl || '').trim(),
  }));

  if (isEditor) {
    return normalized;
  }

  return normalized.filter((item) => item.imageUrl);
};

const renderProjectMedia = (item, options = {}) => {
  const { eager = false } = options;
  const image = (
    <figure className="twst-featured-work__media">
      <img
        src={item.imageUrl}
        alt={item.imageAlt || item.title || ''}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={eager ? 'high' : 'auto'}
      />
    </figure>
  );

  if (!item.linkUrl) {
    return image;
  }

  return (
    <a className="twst-featured-work__media-link" href={item.linkUrl}>
      {image}
    </a>
  );
};

const FeaturedWorkContent = ({ attributes, isEditor = false }) => {
  const headline = String(attributes.headline || '').trim();
  const description = String(attributes.description || '').trim();
  const hoverLabel = String(attributes.hoverLabel || '').trim();
  const viewAllLabel = String(attributes.viewAllLabel || '').trim();
  const viewAllUrl = String(attributes.viewAllUrl || '').trim();
  const items = normalizeItems(attributes.items, { isEditor });
  const hasHeader = Boolean(headline || description);
  const showViewAll = Boolean(viewAllLabel && viewAllUrl);
  const rootDataProps = !isEditor ? { 'data-featured-work': 'true' } : {};

  return (
    <div className="twst-featured-work" {...rootDataProps}>
      <div
        className="twst-featured-work__scroll"
        style={{ '--twst-featured-count': String(Math.max(items.length, 1)) }}
      >
        <div className="twst-featured-work__sticky">
          <div className="twst-featured-work__inner">
            <div className="twst-featured-work__desktop">
              <aside className="twst-featured-work__left">
                {hasHeader ? (
                  <header className="twst-featured-work__header">
                    {headline ? <h2 className="twst-featured-work__headline">{headline}</h2> : null}
                    {description ? <div className="twst-featured-work__description">{description}</div> : null}
                  </header>
                ) : null}

                {items.length ? (
                  <div className="twst-featured-work__thumb-grid" role="tablist" aria-label={__('Projects', 'sage')}>
                    {items.map((item, index) => (
                      <button
                        key={`featured-thumb-${index}`}
                        type="button"
                        className={`twst-featured-work__thumb ${index === 0 ? 'is-active' : ''}`}
                        data-fw-thumb={isEditor ? undefined : String(index)}
                        role="tab"
                        aria-selected={index === 0 ? 'true' : 'false'}
                        tabIndex={index === 0 ? 0 : -1}
                        aria-label={item.title || `${__('Project', 'sage')} ${index + 1}`}
                      >
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.imageAlt || item.title || ''} />
                        ) : (
                          <span className="twst-featured-work__thumb-placeholder">{__('Add image', 'sage')}</span>
                        )}
                      </button>
                    ))}
                  </div>
                ) : null}

                {showViewAll ? (
                  <a className="twst-showcase-cta-primary twst-featured-work__view-all" href={viewAllUrl}>
                    {viewAllLabel}
                  </a>
                ) : null}
              </aside>

              <div className="twst-featured-work__stage">
                {items.map((item, index) => (
                  <article
                    key={`featured-slide-${index}`}
                    className={`twst-featured-work__slide ${index === 0 ? 'is-active' : ''}`}
                    data-fw-slide={isEditor ? undefined : String(index)}
                  >
                    <div
                      className="twst-featured-work__media-wrap"
                      data-fw-cursor-surface={isEditor ? undefined : 'true'}
                    >
                      {renderProjectMedia(item, { eager: index === 0 })}
                      {hoverLabel ? (
                        <span className="twst-featured-work__cursor-badge" aria-hidden="true">
                          [{hoverLabel}]
                        </span>
                      ) : null}
                    </div>

                    {(item.title || item.meta) ? (
                      <div className="twst-featured-work__meta">
                        {item.title ? (
                          <h3 className="twst-featured-work__title">
                            <span className="twst-featured-work__title-wrap">
                              <span className="twst-featured-work__title-text">{item.title}</span>
                              <span className="twst-featured-work__title-mask twst-featured-work__title-mask--white" aria-hidden="true" />
                              <span className="twst-featured-work__title-mask twst-featured-work__title-mask--accent" aria-hidden="true" />
                            </span>
                          </h3>
                        ) : null}
                        {item.meta ? <div className="twst-featured-work__tags">{item.meta}</div> : null}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>

        {items.length > 1 ? (
          <div className="twst-featured-work__story-steps" aria-hidden="true">
            {items.map((_, index) => (
              <span
                key={`featured-step-${index}`}
                className="twst-featured-work__story-step"
                data-fw-step={isEditor ? undefined : String(index)}
              />
            ))}
          </div>
        ) : null}
      </div>

      <div className="twst-featured-work__inner">
        <div className="twst-featured-work__mobile-list">
          {hasHeader ? (
            <header className="twst-featured-work__header twst-featured-work__header--mobile">
              {headline ? <h2 className="twst-featured-work__headline">{headline}</h2> : null}
              {description ? <div className="twst-featured-work__description">{description}</div> : null}
            </header>
          ) : null}

          {items.map((item, index) => (
            <article className="twst-featured-work__mobile-item" key={`featured-mobile-${index}`}>
              {renderProjectMedia(item, { eager: index === 0 })}

              {(item.title || item.meta) ? (
                <div className="twst-featured-work__meta">
                  {item.title ? <h3 className="twst-featured-work__title">{item.title}</h3> : null}
                  {item.meta ? <div className="twst-featured-work__tags">{item.meta}</div> : null}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

registerBlockType(metadata.name, {
  ...metadata,
  edit({ attributes, setAttributes }) {
    const blockProps = useBlockProps();
    const items = normalizeItems(attributes.items, { isEditor: true });

    const setItems = (nextItems) => {
      setAttributes({ items: nextItems });
    };

    const updateItem = (index, key, value) => {
      const nextItems = items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [key]: value } : item,
      );
      setItems(nextItems);
    };

    const updateItemFields = (index, fields) => {
      const nextItems = items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...fields } : item,
      );
      setItems(nextItems);
    };

    const addItem = () => {
      setItems([
        ...items,
        {
          title: '',
          meta: '',
          imageUrl: '',
          imageAlt: '',
          linkUrl: '',
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
      [nextItems[index], nextItems[targetIndex]] = [nextItems[targetIndex], nextItems[index]];
      setItems(nextItems);
    };

    return (
      <>
        <InspectorControls>
          <PanelBody title={__('Content', 'sage')} initialOpen>
            <div className="twst-featured-work-editor-stack">
              <TextControl
                label={__('Headline', 'sage')}
                value={attributes.headline || ''}
                onChange={(headline) => setAttributes({ headline })}
              />
              <TextareaControl
                label={__('Description', 'sage')}
                value={attributes.description || ''}
                onChange={(description) => setAttributes({ description })}
              />
              <TextControl
                label={__('Hover label', 'sage')}
                value={attributes.hoverLabel || ''}
                onChange={(hoverLabel) => setAttributes({ hoverLabel })}
              />
              <TextControl
                label={__('View all label', 'sage')}
                value={attributes.viewAllLabel || ''}
                onChange={(viewAllLabel) => setAttributes({ viewAllLabel })}
              />
              <div className="twst-featured-work-editor-field">
                <p className="twst-featured-work-editor-label">{__('View all URL', 'sage')}</p>
                <URLInputButton
                  url={attributes.viewAllUrl || ''}
                  onChange={(viewAllUrl) => setAttributes({ viewAllUrl })}
                />
              </div>
            </div>
          </PanelBody>

          <PanelBody title={__('Projects', 'sage')} initialOpen>
            <div className="twst-featured-work-editor-stack">
              {items.map((item, index) => (
                <div key={`featured-project-control-${index}`} className="twst-featured-work-editor-card">
                  <p className="twst-featured-work-editor-card__title">
                    {`${__('Project', 'sage')} ${index + 1}`}
                  </p>

                  <TextControl
                    label={__('Title', 'sage')}
                    value={item.title || ''}
                    onChange={(value) => updateItem(index, 'title', value)}
                  />

                  <TextControl
                    label={__('Meta', 'sage')}
                    value={item.meta || ''}
                    onChange={(value) => updateItem(index, 'meta', value)}
                  />

                  <TextControl
                    label={__('Image alt', 'sage')}
                    value={item.imageAlt || ''}
                    onChange={(value) => updateItem(index, 'imageAlt', value)}
                  />

                  <div className="twst-featured-work-editor-field">
                    <p className="twst-featured-work-editor-label">{__('Project URL', 'sage')}</p>
                    <URLInputButton
                      url={item.linkUrl || ''}
                      onChange={(url) => updateItem(index, 'linkUrl', url)}
                    />
                  </div>

                  <MediaUploadCheck>
                    <MediaUpload
                      onSelect={(media) =>
                        updateItemFields(index, {
                          imageUrl: media?.url || '',
                          imageAlt: media?.alt || item.imageAlt || '',
                        })}
                      allowedTypes={['image']}
                      value={item.imageUrl}
                      render={({ open }) => (
                        <div className="twst-featured-work-editor-actions">
                          <Button variant="secondary" onClick={open}>
                            {item.imageUrl ? __('Replace image', 'sage') : __('Select image', 'sage')}
                          </Button>
                          {item.imageUrl ? (
                            <Button variant="secondary" isDestructive onClick={() => updateItem(index, 'imageUrl', '')}>
                              {__('Remove image', 'sage')}
                            </Button>
                          ) : null}
                        </div>
                      )}
                    />
                  </MediaUploadCheck>

                  <div className="twst-featured-work-editor-actions">
                    <Button variant="secondary" onClick={() => moveItem(index, -1)} disabled={index === 0}>
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

              <Button variant="primary" onClick={addItem}>
                {__('Add project', 'sage')}
              </Button>
            </div>
          </PanelBody>
        </InspectorControls>

        <div {...blockProps}>
          <FeaturedWorkContent attributes={attributes} isEditor />
        </div>
      </>
    );
  },
  save({ attributes }) {
    const blockProps = useBlockProps.save();
    return (
      <div {...blockProps}>
        <FeaturedWorkContent attributes={attributes} />
      </div>
    );
  },
});
