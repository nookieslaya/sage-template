<article @php(post_class('h-entry'))>
  <a href="{{ get_permalink(get_option('page_for_posts')) ?: home_url('/') }}" class="inline-flex items-center text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
    ← <span class="ml-2" data-lang="en">Back to blog</span><span class="ml-2 hidden" data-lang="pl">Powrot do bloga</span>
  </a>

  <header class="mt-6">
    <h1 class="p-name text-balance text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-6xl">
      {!! $title !!}
    </h1>

    <p class="mt-4 text-lg text-zinc-500 dark:text-zinc-400">
      <time datetime="{{ get_post_time('c', true) }}">{{ get_the_date() }}</time>
      ·
      {{ ceil(str_word_count(strip_tags(get_the_content())) / 180) }} min read
      ·
      {{ get_the_author() }}
    </p>
  </header>

  @if (has_post_thumbnail())
    <figure class="mt-8 overflow-hidden rounded-3xl border border-zinc-200 dark:border-zinc-800">
      {!! get_the_post_thumbnail(get_the_ID(), 'full', ['class' => 'h-auto w-full object-cover']) !!}
    </figure>
  @endif

  <div class="e-content prose prose-zinc mt-10 max-w-none dark:prose-invert prose-headings:tracking-tight prose-a:text-zinc-900 dark:prose-a:text-zinc-100">
    @php(the_content())
  </div>

  @if ($pagination())
    <footer class="mt-10">
      <nav class="page-nav" aria-label="Page">
        {!! $pagination !!}
      </nav>
    </footer>
  @endif
</article>
