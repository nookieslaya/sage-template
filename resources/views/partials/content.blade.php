<article @php(post_class('overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 shadow-sm dark:border-zinc-800 dark:bg-zinc-900'))>
  <a href="{{ get_permalink() }}" class="block">
    @if (has_post_thumbnail())
      {!! get_the_post_thumbnail(get_the_ID(), 'large', ['class' => 'h-64 w-full object-cover']) !!}
    @else
      <div class="flex h-64 items-center justify-center bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-300">
        {{ __('Post image', 'sage') }}
      </div>
    @endif
  </a>

  <div class="p-8">
    <p class="text-lg text-zinc-500 dark:text-zinc-400">
      <time datetime="{{ get_post_time('c', true) }}">{{ get_the_date() }}</time>
      ·
      {{ ceil(str_word_count(strip_tags(get_the_content())) / 180) }} min read
    </p>

    <h2 class="mt-4 text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
      <a href="{{ get_permalink() }}" class="transition hover:text-zinc-600 dark:hover:text-zinc-200">
        {!! $title !!}
      </a>
    </h2>

    <div class="mt-4 text-xl leading-relaxed text-zinc-500 dark:text-zinc-400">
      @php(the_excerpt())
    </div>

    <a href="{{ get_permalink() }}" class="mt-6 inline-flex items-center text-lg font-semibold text-zinc-900 hover:underline dark:text-zinc-100">
      <span data-lang="en">Read more</span>
      <span data-lang="pl" class="hidden">Czytaj dalej</span>
      <span class="ml-2">→</span>
    </a>
  </div>
</article>
