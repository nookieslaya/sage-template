<!doctype html>
@php
  $twstShowPreloader = ! is_admin();
@endphp
<html {!! get_language_attributes() !!}>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <script>
      (function () {
        try {
          var root = document.documentElement;
          var stored = localStorage.getItem('twst-theme');
          var isDark = stored ? stored === 'dark' : true;
          root.classList.toggle('dark', isDark);
        } catch (e) {}
      })();
    </script>
    @if ($twstShowPreloader)
      <script>
        document.documentElement.classList.add('twst-preload-enabled');
      </script>
    @endif
    @php do_action('get_header'); @endphp
    @php wp_head(); @endphp
  </head>

  <body class="{{ esc_attr(implode(' ', array_merge(get_body_class(), $twstShowPreloader ? ['twst-preload-active'] : []))) }}">
    @php wp_body_open(); @endphp

    @if ($twstShowPreloader)
      <div class="twst-site-preloader" data-site-preloader aria-hidden="true">
        <div class="twst-site-preloader__curtain"></div>
        <div class="twst-site-preloader__brand" aria-label="rdev.">
          @foreach (['r', 'd', 'e', 'v', '.'] as $letter)
            <span class="twst-site-preloader__letter" data-preload-letter>{{ $letter }}</span>
          @endforeach
        </div>
      </div>
    @endif

    <div id="app" data-preload-app>
      <a class="sr-only focus:not-sr-only" href="#main">
        {{ __('Skip to content', 'sage') }}
      </a>

      @include('sections.header')

      <main id="main" class="main bg-zinc-100 dark:bg-zinc-950">
        @yield('content')
      </main>

      @hasSection('sidebar')
        <aside class="sidebar">
          @yield('sidebar')
        </aside>
      @endif

      @include('sections.footer')
    </div>

    @php do_action('get_footer'); @endphp
    @php wp_footer(); @endphp
    <script>
      (function () {
        var applyTheme = function (isDark) {
          var root = document.documentElement;
          root.classList.toggle('dark', isDark);
          if (document.body) {
            document.body.classList.toggle('dark', isDark);
          }
          try {
            localStorage.setItem('twst-theme', isDark ? 'dark' : 'light');
          } catch (e) {}
        };

        document.addEventListener('click', function (event) {
          if (window.__twstThemeReady) return;
          var button = event.target.closest('[data-theme-toggle]');
          if (!button) return;
          event.preventDefault();
          applyTheme(!document.documentElement.classList.contains('dark'));
        });

        document.addEventListener('DOMContentLoaded', function () {
          applyTheme(document.documentElement.classList.contains('dark'));
        });
      })();
    </script>
  </body>
</html>
