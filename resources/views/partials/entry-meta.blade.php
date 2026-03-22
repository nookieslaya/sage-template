@php
  $twstThemeSettings = function_exists('\App\twst_get_theme_options')
      ? \App\twst_get_theme_options()
      : [];
  $hidePostAuthor = ! empty($twstThemeSettings['hide_post_author']);
@endphp

<time class="dt-published" datetime="{{ get_post_time('c', true) }}">
  {{ get_the_date() }}
</time>

@if (! $hidePostAuthor)
  <p>
    <span>{{ __('By', 'sage') }}</span>
    <a href="{{ get_author_posts_url(get_the_author_meta('ID')) }}" class="p-author h-card">
      {{ get_the_author() }}
    </a>
  </p>
@endif
