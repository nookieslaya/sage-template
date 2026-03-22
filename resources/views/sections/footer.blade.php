<footer class="border-t border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950">
  @php
    $twstThemeSettings = function_exists('\App\twst_get_theme_options')
        ? \App\twst_get_theme_options()
        : [];
    $footerLogoMarkup = function_exists('\App\twst_get_logo_markup')
        ? \App\twst_get_logo_markup('footer', $siteName, [
            'image_class' => 'h-14 w-auto object-contain',
            'text_class' => 'font-semibold tracking-tight text-zinc-900 dark:text-zinc-100',
          ])
        : e($siteName);

    $twstSocialSettings = function_exists('\App\twst_get_social_options')
        ? \App\twst_get_social_options()
        : [];

    $socialLinks = array_values(array_filter($twstSocialSettings['socials'] ?? [], fn ($item) => ! empty($item['url'])));
    $footerTagline = function_exists('\App\twst_get_translated_string')
        ? \App\twst_get_translated_string('footer_tagline')
        : 'Building the future of B2B technology';
    $footerCopyrightSuffix = function_exists('\App\twst_get_translated_string')
        ? \App\twst_get_translated_string('footer_copyright_suffix')
        : 'All rights reserved.';
    $footerQuickLinksLabel = function_exists('\App\twst_get_translated_string')
        ? \App\twst_get_translated_string('footer_quick_links')
        : 'Quick Links';
    $footerConnectLabel = function_exists('\App\twst_get_translated_string')
        ? \App\twst_get_translated_string('footer_connect')
        : 'Connect';
    $footerCopyrightYear = wp_date('Y');
  @endphp

  <div class="mx-auto max-w-7xl px-6 py-16 lg:py-20">
    <div class="grid gap-14 md:grid-cols-3">
      <section>
        <div>{!! $footerLogoMarkup !!}</div>
        <p class="mt-4 text-xl text-zinc-500 dark:text-zinc-400 lg:text-2xl">
          {{ esc_html($footerTagline) }}
        </p>
      </section>

      <nav aria-label="{{ __('Footer quick links', 'sage') }}">
        <h3 class="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 lg:text-3xl">
          {{ esc_html($footerQuickLinksLabel) }}
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
          {{ esc_html($footerConnectLabel) }}
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
      {{ esc_html(sprintf('© %s %s. %s', $footerCopyrightYear, $siteName, $footerCopyrightSuffix)) }}
    </div>
  </div>
</footer>
