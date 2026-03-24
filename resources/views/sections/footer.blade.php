<footer class="twst-site-footer">
  @php
    $twstThemeSettings = function_exists('\App\twst_get_theme_options')
        ? \App\twst_get_theme_options()
        : [];
    $customFooterCopyright = trim((string) ($twstThemeSettings['footer_copyright_text'] ?? ''));
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
    $footerCopyrightLine = $customFooterCopyright !== ''
        ? $customFooterCopyright
        : sprintf('© %s %s. %s', $footerCopyrightYear, $siteName, $footerCopyrightSuffix);
  @endphp

  <div class="twst-site-footer__inner">
    <div class="twst-site-footer__top">
      <section>
        <div class="twst-site-footer__brand">{!! $footerLogoMarkup !!}</div>
        <p class="twst-site-footer__tagline">
          {{ esc_html($footerTagline) }}
        </p>
      </section>

      <nav aria-label="{{ __('Footer quick links', 'sage') }}">
        <h3 class="twst-site-footer__heading">
          {{ esc_html($footerQuickLinksLabel) }}
        </h3>

        {!! wp_nav_menu([
            'theme_location' => 'primary_navigation',
            'menu_class' => 'twst-site-footer__links',
            'container' => false,
            'echo' => false,
            'fallback_cb' => 'wp_page_menu',
        ]) !!}
      </nav>

      <section>
        <h3 class="twst-site-footer__heading">
          {{ esc_html($footerConnectLabel) }}
        </h3>
        <div class="twst-site-footer__socials">
          @foreach ($socialLinks as $social)
            @php
              $socialName = trim((string) ($social['name'] ?? ''));
              $socialIconUrl = (string) ($social['icon_url'] ?? '');
              $socialFallback = $socialName !== '' ? strtoupper(mb_substr($socialName, 0, 2)) : '?';
            @endphp
            <a href="{{ esc_url($social['url']) }}" aria-label="{{ esc_attr($socialName ?: __('Social media', 'sage')) }}" class="twst-site-footer__social-link twst-social-link">
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

    <div class="twst-site-footer__rdev">
      <div class="twst-site-footer__rdev-bg twst-words-three-bg" data-words-three-bg="true" data-words-three-shape="rdev" aria-hidden="true"></div>
      <span class="twst-site-footer__rdev-word">rdev.</span>
    </div>

    <div class="twst-site-footer__bottom">
      {{ esc_html($footerCopyrightLine) }}
    </div>
  </div>
</footer>
