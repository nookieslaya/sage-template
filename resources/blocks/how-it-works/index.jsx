import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import {
  InspectorControls,
  MediaUpload,
  MediaUploadCheck,
  useBlockProps,
} from '@wordpress/block-editor';
import {
  Button,
  PanelBody,
  SelectControl,
  TextControl,
  TextareaControl,
} from '@wordpress/components';
import metadata from './block.json';

const normalizeSteps = (steps = [], { requireImage = false } = {}) =>
  steps
    .map((step) => ({
      title: String(step?.title || '').trim(),
      description: String(step?.description || '').trim(),
      imageUrl: String(step?.imageUrl || '').trim(),
      imageAlt: String(step?.imageAlt || '').trim(),
    }))
    .filter((step) => step.title && step.description && (!requireImage || step.imageUrl));

const formatStepNumber = (index) => String(index + 1).padStart(2, '0');
const formatStepSecondDigit = (index) => formatStepNumber(index).slice(-1);

const HowItWorksContent = ({ attributes, isEditor = false }) => {
  const headline = String(attributes.headline || '').trim();
  const eyebrow = String(attributes.eyebrow || '').trim();
  const visualMode = attributes.visualMode === 'numbers' ? 'numbers' : 'images';
  const steps = normalizeSteps(attributes.steps, { requireImage: visualMode === 'images' });
  const hasAnyHeader = Boolean(headline || eyebrow);
  const activeIndex = 0;
  const rootClassName = `twst-how-it-works twst-how-it-works--${visualMode}`;
  const revealRootProps = !isEditor ? { 'data-reveal-root': true } : {};
  const headerRevealProps = !isEditor
    ? { className: 'twst-how-it-works__header twst-reveal-up', 'data-reveal-item': true, 'data-reveal-delay': '0' }
    : { className: 'twst-how-it-works__header' };
  const leftRevealProps = !isEditor
    ? { className: 'twst-how-it-works__left twst-reveal-up', 'data-reveal-item': true, 'data-reveal-delay': '100' }
    : { className: 'twst-how-it-works__left' };
  const rightRevealProps = !isEditor
    ? { className: 'twst-how-it-works__right twst-reveal-up', 'data-reveal-item': true, 'data-reveal-delay': '180' }
    : { className: 'twst-how-it-works__right' };

  return (
    <div
      className={rootClassName}
      data-how-it-works={isEditor ? undefined : 'true'}
      style={{ '--twst-how-step-count': String(Math.max(steps.length, 1)) }}
      {...revealRootProps}
    >
      <div className="twst-how-it-works__scroll" data-how-scroll>
        <div className="twst-how-it-works__sticky">
          <div className="twst-how-it-works__inner">
            {hasAnyHeader ? (
              <header {...headerRevealProps}>
                {headline ? <h2 className="twst-how-it-works__headline">{headline}</h2> : null}
                {eyebrow ? <p className="twst-how-it-works__eyebrow">{eyebrow}</p> : null}
              </header>
            ) : null}

            {steps.length ? (
              <div className="twst-how-it-works__layout">
                <div {...leftRevealProps} data-how-step-list>
                  <span className="twst-how-it-works__marker" data-how-marker aria-hidden="true" />

                  {steps.map((step, index) => (
                    <article
                      key={`how-step-${index}`}
                      className={`twst-how-step ${index === activeIndex ? 'is-active' : ''}`}
                      data-how-step-item
                    >
                      <div className="twst-how-step__row">
                        <span className="twst-how-step__number">{formatStepNumber(index)}</span>
                        <h3 className="twst-how-step__title" data-how-step-anchor>
                          {step.title}
                        </h3>
                      </div>
                      <div className="twst-how-step__description">{step.description}</div>
                      {visualMode === 'images' && step.imageUrl ? (
                        <figure className="twst-how-step__media">
                          <img src={step.imageUrl} alt={step.imageAlt || step.title} />
                        </figure>
                      ) : null}
                    </article>
                  ))}
                </div>

                <div {...rightRevealProps}>
                  <div className="twst-how-media-stack">
                    {visualMode === 'numbers' ? (
                      <span className="twst-how-media-counter__fixed" aria-hidden="true">0</span>
                    ) : null}
                    {steps.map((step, index) => (
                      <figure
                        key={`how-image-${index}`}
                        className={`twst-how-media ${index === activeIndex ? 'is-active' : ''} ${visualMode === 'numbers' ? 'twst-how-media--number' : ''}`}
                        data-how-image-item
                        style={{ '--twst-how-image-index': index }}
                      >
                        {visualMode === 'images' ? (
                          <img src={step.imageUrl} alt={step.imageAlt || step.title} />
                        ) : (
                          <div className="twst-how-media-counter" aria-hidden="true">
                            <span className="twst-how-media-counter__digit">{formatStepSecondDigit(index)}</span>
                          </div>
                        )}
                      </figure>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

registerBlockType(metadata.name, {
  ...metadata,
  edit({ attributes, setAttributes }) {
    const blockProps = useBlockProps();
    const steps = Array.isArray(attributes.steps) ? attributes.steps : [];

    const setSteps = (nextSteps) => {
      setAttributes({ steps: nextSteps });
    };

    const updateStep = (index, key, value) => {
      const nextSteps = steps.map((step, stepIndex) =>
        stepIndex === index ? { ...step, [key]: value } : step,
      );
      setSteps(nextSteps);
    };

    const updateStepFields = (index, fields) => {
      const nextSteps = steps.map((step, stepIndex) =>
        stepIndex === index ? { ...step, ...fields } : step,
      );
      setSteps(nextSteps);
    };

    const addStep = () => {
      setSteps([
        ...steps,
        {
          title: '',
          description: '',
          imageUrl: '',
          imageAlt: '',
        },
      ]);
    };

    const removeStep = (index) => {
      if (steps.length <= 1) {
        return;
      }

      setSteps(steps.filter((_, stepIndex) => stepIndex !== index));
    };

    const moveStep = (index, direction) => {
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= steps.length) {
        return;
      }

      const nextSteps = [...steps];
      [nextSteps[index], nextSteps[targetIndex]] = [nextSteps[targetIndex], nextSteps[index]];
      setSteps(nextSteps);
    };

    return (
      <>
        <InspectorControls>
          <PanelBody title={__('Content', 'sage')} initialOpen>
            <TextControl
              label={__('Headline', 'sage')}
              value={attributes.headline || ''}
              onChange={(headline) => setAttributes({ headline })}
            />
            <TextControl
              label={__('Eyebrow', 'sage')}
              value={attributes.eyebrow || ''}
              onChange={(eyebrow) => setAttributes({ eyebrow })}
            />
            <SelectControl
              label={__('Right-side visual', 'sage')}
              value={attributes.visualMode || 'images'}
              options={[
                { label: __('Images', 'sage'), value: 'images' },
                { label: __('Step numbers (01, 02...)', 'sage'), value: 'numbers' },
              ]}
              onChange={(visualMode) => setAttributes({ visualMode })}
            />

            {steps.map((step, index) => (
              <div key={`how-step-control-${index}`} className="mt-6 rounded border border-zinc-300 p-4">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  {`${__('Step', 'sage')} ${index + 1}`}
                </p>

                <TextControl
                  label={__('Title', 'sage')}
                  value={step.title || ''}
                  onChange={(value) => updateStep(index, 'title', value)}
                />

                <TextareaControl
                  label={__('Description', 'sage')}
                  value={step.description || ''}
                  onChange={(value) => updateStep(index, 'description', value)}
                />

                {(attributes.visualMode || 'images') === 'images' ? (
                  <>
                    <TextControl
                      label={__('Image alt', 'sage')}
                      value={step.imageAlt || ''}
                      onChange={(value) => updateStep(index, 'imageAlt', value)}
                    />

                    <MediaUploadCheck>
                      <MediaUpload
                        onSelect={(media) =>
                          updateStepFields(index, {
                            imageUrl: media?.url || '',
                            imageAlt: media?.alt || step.imageAlt || '',
                          })}
                        allowedTypes={['image']}
                        value={step.imageUrl}
                        render={({ open }) => (
                          <div className="mt-2 flex flex-wrap gap-2">
                            <Button variant="secondary" onClick={open}>
                              {step.imageUrl ? __('Replace image', 'sage') : __('Select image', 'sage')}
                            </Button>
                            {step.imageUrl ? (
                              <Button variant="secondary" isDestructive onClick={() => updateStep(index, 'imageUrl', '')}>
                                {__('Remove image', 'sage')}
                              </Button>
                            ) : null}
                          </div>
                        )}
                      />
                    </MediaUploadCheck>
                  </>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => moveStep(index, -1)}
                    disabled={index === 0}
                  >
                    {__('Move up', 'sage')}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => moveStep(index, 1)}
                    disabled={index === steps.length - 1}
                  >
                    {__('Move down', 'sage')}
                  </Button>
                  <Button
                    variant="secondary"
                    isDestructive
                    onClick={() => removeStep(index)}
                    disabled={steps.length <= 1}
                  >
                    {__('Remove', 'sage')}
                  </Button>
                </div>
              </div>
            ))}

            <div className="mt-4">
              <Button variant="primary" onClick={addStep}>
                {__('Add step', 'sage')}
              </Button>
            </div>
          </PanelBody>
        </InspectorControls>

        <section {...blockProps}>
          <HowItWorksContent attributes={attributes} isEditor />
        </section>
      </>
    );
  },
  save({ attributes }) {
    const blockProps = useBlockProps.save();

    return (
      <section {...blockProps}>
        <HowItWorksContent attributes={attributes} />
      </section>
    );
  },
});
