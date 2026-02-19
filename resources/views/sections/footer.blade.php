<footer class="border-t border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-950">
  @php
    $twstSocialSettings = function_exists('\App\twst_get_social_options')
        ? \App\twst_get_social_options()
        : [];

    $socialLinks = array_filter([
        [
            'label' => $twstSocialSettings['github_label'] ?? 'GH',
            'url' => $twstSocialSettings['github_url'] ?? 'https://github.com',
            'name' => 'GitHub',
        ],
        [
            'label' => $twstSocialSettings['linkedin_label'] ?? 'IN',
            'url' => $twstSocialSettings['linkedin_url'] ?? 'https://linkedin.com',
            'name' => 'LinkedIn',
        ],
        [
            'label' => $twstSocialSettings['x_label'] ?? 'X',
            'url' => $twstSocialSettings['x_url'] ?? 'https://x.com',
            'name' => 'X',
        ],
        [
            'label' => $twstSocialSettings['email_label'] ?? '@',
            'url' => $twstSocialSettings['email_url'] ?? 'mailto:hello@example.com',
            'name' => 'Email',
        ],
    ], fn ($item) => ! empty($item['url']));
  @endphp

  <div class="mx-auto max-w-[1700px] px-6 py-16 lg:px-12 lg:py-20">
    <div class="grid gap-14 md:grid-cols-3">
      <section>
        <h2 class="text-5xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{{ $siteName }}</h2>
        <p class="mt-4 text-3xl text-zinc-500 dark:text-zinc-400">
          <span data-lang="en">Building the future of B2B technology</span>
          <span data-lang="pl" class="hidden">Buduje przyszlosc technologii B2B</span>
        </p>
      </section>

      <nav aria-label="{{ __('Footer quick links', 'sage') }}">
        <h3 class="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Quick Links</h3>

        {!! wp_nav_menu([
            'theme_location' => 'primary_navigation',
            'menu_class' => 'twst-footer-menu mt-5 space-y-3 text-3xl font-semibold text-zinc-500 dark:text-zinc-400',
            'container' => false,
            'echo' => false,
            'fallback_cb' => 'wp_page_menu',
        ]) !!}
      </nav>

      <section>
        <h3 class="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Connect</h3>
        <div class="mt-5 flex flex-wrap gap-3">
          @foreach ($socialLinks as $social)
            <a href="{{ esc_url($social['url']) }}" aria-label="{{ esc_attr($social['name']) }}" class="twst-social-link inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-200 text-lg font-semibold text-zinc-800 transition dark:bg-zinc-800 dark:text-zinc-200">{{ esc_html($social['label']) }}</a>
          @endforeach
        </div>
      </section>
    </div>

    <div class="mt-14 border-t border-zinc-200 pt-8 text-center text-2xl text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
      <span data-lang="en">© 2026 {{ $siteName }}. All rights reserved.</span>
      <span data-lang="pl" class="hidden">© 2026 {{ $siteName }}. Wszelkie prawa zastrzezone.</span>
    </div>
  </div>
</footer>
