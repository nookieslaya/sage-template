@php
  $postClasses = implode(' ', get_post_class('twst-blog-preview__card'));
  $readMoreLabel = function_exists('\App\twst_get_translated_string')
      ? \App\twst_get_translated_string('read_more')
      : 'Read more';
  $minReadLabel = function_exists('\App\twst_get_translated_string')
      ? \App\twst_get_translated_string('min_read')
      : 'min read';
@endphp
<article class="{{ esc_attr($postClasses) }}">
  <a href="{{ get_permalink() }}" class="twst-blog-preview__image-link">
    @if (has_post_thumbnail())
      {!! get_the_post_thumbnail(get_the_ID(), 'large', ['class' => 'twst-blog-preview__image']) !!}
    @else
      <div class="twst-blog-preview__image twst-blog-preview__image--placeholder">
        {{ __('Post image', 'sage') }}
      </div>
    @endif
  </a>

  <div class="twst-blog-preview__body">
    <p class="twst-blog-preview__meta">
      <time datetime="{{ get_post_time('c', true) }}">{{ get_the_date() }}</time>
      ·
      {{ ceil(str_word_count(strip_tags(get_the_content())) / 180) }} {{ $minReadLabel }}
    </p>

    <h2 class="twst-blog-preview__title">
      <span class="twst-blog-preview__title-wrap">
        <a href="{{ get_permalink() }}" class="twst-blog-preview__title-link">{!! $title !!}</a>
      </span>
    </h2>

    <div class="twst-blog-preview__excerpt">
      @php(the_excerpt())
    </div>

    <a href="{{ get_permalink() }}" class="twst-showcase-cta-secondary twst-blog-preview__read">{{ esc_html($readMoreLabel) }}</a>
  </div>
</article>
