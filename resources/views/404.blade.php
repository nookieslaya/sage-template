@extends('layouts.app')

@section('content')
  <section class="relative overflow-hidden bg-zinc-100 px-6 pb-20 pt-36 dark:bg-zinc-950 md:pb-28 md:pt-44">
    <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div class="absolute left-1/2 top-24 h-72 w-72 -translate-x-[120%] rounded-full bg-orange-400/20 blur-3xl dark:bg-orange-500/20"></div>
      <div class="absolute right-0 top-0 h-[28rem] w-[28rem] translate-x-1/3 -translate-y-1/4 rounded-full bg-sky-400/20 blur-3xl dark:bg-sky-500/20"></div>
      <div class="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 translate-y-1/3 rounded-full bg-emerald-400/10 blur-3xl dark:bg-emerald-500/10"></div>
    </div>

    <div class="relative mx-auto max-w-6xl">
      <div class="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        <div class="flex h-full flex-col justify-center">
          <p class="inline-flex w-fit self-start items-center rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-sm font-semibold uppercase tracking-[0.22em] text-orange-600 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-orange-300">
            {{ __('Error 404', 'sage') }}
          </p>
          <h1 class="mt-6 max-w-4xl text-balance text-5xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-7xl">
            {{ __('This page took a wrong turn.', 'sage') }}
          </h1>
          <p class="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-2xl">
            {{ __('The link may be outdated, the page may have moved, or the URL may have a typo. Let’s get you back to something useful.', 'sage') }}
          </p>

          <div class="mt-10 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <a href="{{ home_url('/') }}" class="twst-hero-btn-primary">
              {{ __('Back to homepage', 'sage') }}
            </a>
            <a href="{{ home_url('/#contact') }}" class="twst-hero-btn-secondary !border-zinc-300 !text-zinc-900 dark:!border-zinc-700 dark:!text-zinc-100">
              {{ __('Start a project', 'sage') }}
            </a>
          </div>

          <div class="mt-12 grid gap-4 sm:grid-cols-3">
            <a href="{{ home_url('/#work') }}" class="rounded-3xl border border-zinc-200 bg-white/85 px-5 py-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-orange-300 dark:border-zinc-800 dark:bg-zinc-900/85 dark:hover:border-orange-500/40">
              <p class="text-sm font-semibold uppercase tracking-[0.2em] text-orange-500 dark:text-orange-300">{{ __('Portfolio', 'sage') }}</p>
              <p class="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{{ __('See selected work', 'sage') }}</p>
            </a>
            <a href="{{ home_url('/#about') }}" class="rounded-3xl border border-zinc-200 bg-white/85 px-5 py-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 dark:border-zinc-800 dark:bg-zinc-900/85 dark:hover:border-sky-500/40">
              <p class="text-sm font-semibold uppercase tracking-[0.2em] text-sky-500 dark:text-sky-300">{{ __('About', 'sage') }}</p>
              <p class="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{{ __('Learn how we work', 'sage') }}</p>
            </a>
            <a href="{{ home_url('/blog') }}" class="rounded-3xl border border-zinc-200 bg-white/85 px-5 py-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-900/85 dark:hover:border-emerald-500/40">
              <p class="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-500 dark:text-emerald-300">{{ __('Insights', 'sage') }}</p>
              <p class="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">{{ __('Read latest articles', 'sage') }}</p>
            </a>
          </div>
        </div>

        <aside class="flex h-full flex-col rounded-[2rem] border border-zinc-200 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/90 md:p-8">
          <div class="rounded-[1.75rem] bg-zinc-950 px-6 py-8 text-zinc-100 dark:bg-black md:px-8">
            <p class="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-400">
              {{ __('Page not found', 'sage') }}
            </p>
            <div class="mt-5">
              <p class="text-7xl font-semibold tracking-tight text-white/95 md:text-8xl">404</p>
              <p class="mt-3 max-w-sm text-base leading-relaxed text-zinc-400 md:text-lg">
                {{ __('Jump back to the homepage or use one of the quick links to continue browsing.', 'sage') }}
              </p>
            </div>
          </div>

          <div class="mt-6 flex-1 rounded-[1.5rem] border border-dashed border-zinc-300 p-5 dark:border-zinc-700">
            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
              {{ __('Quick recovery', 'sage') }}
            </p>
            <ul class="mt-4 space-y-3 text-base text-zinc-600 dark:text-zinc-400">
              <li>{{ __('Check the URL for typos', 'sage') }}</li>
              <li>{{ __('Use the navigation to jump back into the site', 'sage') }}</li>
              <li>{{ __('Reach out if you expected something to be here', 'sage') }}</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  </section>
@endsection
