@extends('layouts.app')

@section('content')
  @php
    $blogArchiveEyebrow = function_exists('\App\twst_get_translated_string')
        ? \App\twst_get_translated_string('blog_archive_eyebrow')
        : 'Blog';
    $blogArchiveHeadline = function_exists('\App\twst_get_translated_string')
        ? \App\twst_get_translated_string('blog_archive_headline')
        : 'Latest Insights';
  @endphp
  <section id="blog" class="mx-auto max-w-7xl px-6 py-20 md:py-24">
    <header class="text-center">
      <p class="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400">{{ esc_html($blogArchiveEyebrow) }}</p>
      <h1 class="mt-4 text-balance text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-6xl">
        {{ esc_html($blogArchiveHeadline) }}
      </h1>
    </header>

    @if (! have_posts())
      <x-alert type="warning" class="mx-auto mt-12 max-w-3xl">
        {!! __('Sorry, no results were found.', 'sage') !!}
      </x-alert>
      {!! get_search_form(false) !!}
    @else
      <div class="mt-12 grid gap-6 lg:grid-cols-3">
        @while(have_posts()) @php(the_post())
          @include('partials.content')
        @endwhile
      </div>
      <div class="mt-10 text-center [&_.nav-links]:inline-flex [&_.nav-links]:gap-3 [&_.nav-links_a]:rounded-xl [&_.nav-links_a]:border [&_.nav-links_a]:border-zinc-300 [&_.nav-links_a]:px-4 [&_.nav-links_a]:py-2 [&_.nav-links_a]:text-zinc-600 dark:[&_.nav-links_a]:border-zinc-700 dark:[&_.nav-links_a]:text-zinc-300">
        {!! get_the_posts_navigation() !!}
      </div>
    @endif
  </section>
@endsection
