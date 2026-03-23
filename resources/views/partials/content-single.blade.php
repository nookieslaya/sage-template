@php
  $postClasses = implode(' ', get_post_class('h-entry'));
@endphp
<article class="{{ esc_attr($postClasses) }}">
  @php
    $backToBlogLabel = function_exists('\App\twst_get_translated_string')
        ? \App\twst_get_translated_string('back_to_blog')
        : 'Back to blog';
    $minReadLabel = function_exists('\App\twst_get_translated_string')
        ? \App\twst_get_translated_string('min_read')
        : 'min read';
    $twstThemeSettings = function_exists('\App\twst_get_theme_options')
        ? \App\twst_get_theme_options()
        : [];
    $hidePostAuthor = ! empty($twstThemeSettings['hide_post_author']);
    $singleMetaParts = [
        sprintf('<time datetime="%s">%s</time>', esc_attr(get_post_time('c', true)), esc_html(get_the_date())),
        esc_html(ceil(str_word_count(strip_tags(get_the_content())) / 180).' '.$minReadLabel),
    ];

    if (! $hidePostAuthor) {
        $singleMetaParts[] = esc_html(get_the_author());
    }
  @endphp
  <a href="{{ get_permalink(get_option('page_for_posts')) ?: home_url('/') }}" class="twst-arrow-link twst-arrow-link--back twst-blog-single__back inline-flex items-center no-underline transition">
    <span class="twst-arrow" aria-hidden="true">←</span>
    <span class="ml-2">{{ esc_html($backToBlogLabel) }}</span>
  </a>

  <header class="twst-blog-single__header">
    <h1 class="p-name twst-blog-single__title">
      {!! $title !!}
    </h1>

    <p class="twst-blog-single__meta">
      {!! implode(' <span aria-hidden="true">·</span> ', $singleMetaParts) !!}
    </p>
  </header>

  @if (has_post_thumbnail())
    <figure class="twst-blog-single__cover">
      {!! get_the_post_thumbnail(get_the_ID(), 'full', ['class' => 'twst-blog-single__cover-image']) !!}
    </figure>
  @endif

  <div class="e-content twst-content twst-blog-single__content">
    @php(the_content())
  </div>

  @if (! empty($pagination))
    <footer class="twst-blog-single__footer">
      <nav class="page-nav" aria-label="Page">
        {!! $pagination !!}
      </nav>
    </footer>
  @endif
</article>
