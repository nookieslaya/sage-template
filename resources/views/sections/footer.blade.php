<footer class="border-t border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950">
  @php
    $twstThemeSettings = function_exists('\App\twst_get_theme_options')
        ? \App\twst_get_theme_options()
        : [];
    $footerLogoUrl = $twstThemeSettings['footer_logo_url'] ?? '';

    $twstSocialSettings = function_exists('\App\twst_get_social_options')
        ? \App\twst_get_social_options()
        : [];

    $socialLinks = array_values(array_filter($twstSocialSettings['socials'] ?? [], fn ($item) => ! empty($item['url'])));
  @endphp

  <div class="mx-auto max-w-[1700px] px-6 py-16 lg:px-12 lg:py-20">
    <div class="grid gap-14 md:grid-cols-3">
      <section>
        @if (! empty($footerLogoUrl))
          <img src="{{ esc_url($footerLogoUrl) }}" alt="{{ esc_attr($siteName) }}" class="h-14 w-auto object-contain" />
        @else
          <h2 class="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 lg:text-5xl">{{ $siteName }}</h2>
        @endif
        <p class="mt-4 text-xl text-zinc-500 dark:text-zinc-400 lg:text-2xl">
          <span data-lang="en">Building the future of B2B technology</span>
          <span data-lang="pl" class="hidden">Buduje przyszlosc technologii B2B</span>
        </p>
      </section>

      <nav aria-label="{{ __('Footer quick links', 'sage') }}">
        <h3 class="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 lg:text-3xl">
          <span data-lang="en">Quick Links</span>
          <span data-lang="pl" class="hidden">Szybkie linki</span>
        </h3>

        {!! wp_nav_menu([
            'theme_location' => 'primary_navigation',
            'menu_class' => 'twst-footer-menu mt-5 space-y-3 text-xl font-semibold text-zinc-500 dark:text-zinc-400 lg:text-2xl',
            'container' => false,
            'echo' => false,
            'fallback_cb' => 'wp_page_menu',
        ]) !!}
      </nav>

      <section>
        <h3 class="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 lg:text-3xl">
          <span data-lang="en">Connect</span>
          <span data-lang="pl" class="hidden">Kontakt</span>
        </h3>
        <div class="mt-5 flex flex-row flex-wrap items-center gap-3">
          @foreach ($socialLinks as $social)
            @php
              $socialName = trim((string) ($social['name'] ?? ''));
              $socialIconUrl = (string) ($social['icon_url'] ?? '');
              $socialFallback = $socialName !== '' ? strtoupper(mb_substr($socialName, 0, 2)) : '?';
            @endphp
            <a href="{{ esc_url($social['url']) }}" aria-label="{{ esc_attr($socialName ?: __('Social media', 'sage')) }}" class="twst-social-link inline-flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-zinc-200 text-sm font-semibold text-zinc-800 transition dark:bg-zinc-800 dark:text-zinc-200 lg:h-16 lg:w-16 lg:text-base">
              @if ($socialIconUrl !== '')
                <img src="{{ esc_url($socialIconUrl) }}" alt="" class="twst-social-icon h-8 w-8 object-contain lg:h-10 lg:w-10" />
              @else
                {{ esc_html($socialFallback) }}
              @endif
            </a>
          @endforeach
        </div>
      </section>
    </div>

    <div class="mt-14 border-t border-zinc-200 pt-8 text-center text-base text-zinc-500 dark:border-zinc-800 dark:text-zinc-400 lg:text-lg">
      <span data-lang="en">© 2026 {{ $siteName }}. All rights reserved.</span>
      <span data-lang="pl" class="hidden">© 2026 {{ $siteName }}. Wszelkie prawa zastrzezone.</span>
    </div>
  </div>
</footer>
