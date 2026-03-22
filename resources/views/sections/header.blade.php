

<header class="twst-site-header fixed inset-x-0 top-0 z-50 border-b backdrop-blur">
  @php
    $twstThemeSettings = function_exists('\App\twst_get_theme_options')
        ? \App\twst_get_theme_options()
        : [];
    $hideLanguageSwitcher = ! empty($twstThemeSettings['hide_language_switcher']);
    $navbarLogoMarkup = function_exists('\App\twst_get_logo_markup')
        ? \App\twst_get_logo_markup('navbar', $siteName, [
            'image_class' => 'h-10 w-auto object-contain',
            'text_class' => 'font-semibold tracking-tight text-zinc-900 dark:text-zinc-100',
          ])
        : e($siteName);

    $pll_languages = function_exists('pll_the_languages')
        ? pll_the_languages([
            'raw' => 1,
            'hide_if_empty' => 0,
            'hide_if_no_translation' => 0,
          ])
        : [];
  @endphp

  <div class="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-5">
    <a href="{{ home_url('/') }}" class="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
      {!! $navbarLogoMarkup !!}
    </a>

    <button
      type="button"
      class="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-300 text-zinc-700 dark:border-zinc-700 dark:text-zinc-200 lg:hidden"
      aria-expanded="false"
      aria-controls="site-nav"
      data-mobile-menu-toggle
    >
      <span class="sr-only">{{ __('Toggle menu', 'sage') }}</span>
      <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 7h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        <path d="M4 12h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
        <path d="M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
    </button>

    <div id="site-nav" class="hidden w-full items-center justify-between gap-6 lg:flex lg:w-auto" data-mobile-menu>
      <nav aria-label="{{ __('Primary navigation', 'sage') }}">
        {!! wp_nav_menu([
            'theme_location' => 'primary_navigation',
            'menu_class' => 'twst-nav-desktop',
            'container' => false,
            'echo' => false,
            'fallback_cb' => 'wp_page_menu',
        ]) !!}
      </nav>

      <div class="flex items-center gap-3">
        @if (! $hideLanguageSwitcher && ! empty($pll_languages))
          <div class="twst-lang-switcher" role="group" aria-label="Language switcher">
            @foreach ($pll_languages as $lang)
              <a href="{{ esc_url($lang['url']) }}" class="twst-lang-link {{ ! empty($lang['current_lang']) ? 'is-active' : '' }}">
                {{ strtoupper($lang['slug']) }}
              </a>
            @endforeach
          </div>
        @endif

        <button
          type="button"
          class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-300 text-zinc-700 transition hover:bg-zinc-200 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          aria-label="{{ __('Toggle dark mode', 'sage') }}"
          data-theme-toggle
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="7.5" stroke="currentColor" stroke-width="1.8" />
            <path d="M12 4.5a7.5 7.5 0 0 1 0 15V4.5Z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  </div>

  <div class="border-t border-zinc-200 px-6 py-4 dark:border-zinc-800 lg:hidden hidden" data-mobile-menu-panel>
    <nav aria-label="{{ __('Mobile navigation', 'sage') }}">
      {!! wp_nav_menu([
          'theme_location' => 'primary_navigation',
          'menu_class' => 'twst-nav-mobile',
          'container' => false,
          'echo' => false,
          'fallback_cb' => 'wp_page_menu',
      ]) !!}
    </nav>

    <div class="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
      @if (! $hideLanguageSwitcher && ! empty($pll_languages))
        <div class="twst-lang-switcher" role="group" aria-label="Language switcher mobile">
          @foreach ($pll_languages as $lang)
            <a href="{{ esc_url($lang['url']) }}" class="twst-lang-link {{ ! empty($lang['current_lang']) ? 'is-active' : '' }}">
              {{ strtoupper($lang['slug']) }}
            </a>
          @endforeach
        </div>
      @endif

      <button
        type="button"
        class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-zinc-300 text-zinc-700 transition hover:bg-zinc-200 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        aria-label="{{ __('Toggle dark mode', 'sage') }}"
        data-theme-toggle
      >
        <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="7.5" stroke="currentColor" stroke-width="1.8" />
          <path d="M12 4.5a7.5 7.5 0 0 1 0 15V4.5Z" fill="currentColor" />
        </svg>
      </button>
    </div>
  </div>
</header>
