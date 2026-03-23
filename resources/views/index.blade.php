@extends('layouts.app')

@section('content')
  @php
    $blogArchiveHeadline = function_exists('\App\twst_get_translated_string')
        ? \App\twst_get_translated_string('blog_archive_headline')
        : 'Latest Insights';
  @endphp
  <section id="blog" class="twst-blog-preview">
    <div class="twst-blog-preview__inner">
      <header class="twst-blog-preview__header">
        <h1 class="twst-blog-preview__headline twst-showcase-headline" data-showcase-headline-trigger="inview">
          <span class="twst-showcase-headline__base" data-showcase-headline-base>{{ esc_html($blogArchiveHeadline) }}</span>
          <span class="twst-showcase-headline__masks" data-showcase-headline-masks aria-hidden="true"></span>
        </h1>
      </header>

      @if (! have_posts())
        <p class="twst-blog-preview__empty">{!! __('Sorry, no results were found.', 'sage') !!}</p>
      @else
        <div class="twst-blog-preview__grid">
          @while(have_posts()) @php(the_post())
            @include('partials.content')
          @endwhile
        </div>
        <div class="twst-blog-preview__pagination">
          {!! get_the_posts_navigation() !!}
        </div>
      @endif
    </div>
  </section>
@endsection
