<!doctype html>
<html {!! get_language_attributes() !!}>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    @php do_action('get_header'); @endphp
    @php wp_head(); @endphp

    @vite(['resources/css/app.css', 'resources/js/app.js'])
  </head>

  <body class="{{ esc_attr(implode(' ', get_body_class())) }}">
    @php wp_body_open(); @endphp

    <div id="app">
      <a class="sr-only focus:not-sr-only" href="#main">
        {{ __('Skip to content', 'sage') }}
      </a>

      @include('sections.header')

      @php
        $twstThemeSettings = function_exists('\App\twst_get_theme_options')
            ? \App\twst_get_theme_options()
            : ['show_side_nav_frontpage' => 1];
        $showSideNav = ! empty($twstThemeSettings['show_side_nav_frontpage']);
      @endphp

      @if ($showSideNav && (is_front_page() || is_page_template('template-landing.php')))
        @include('sections.side-nav')
      @endif

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
  </body>
</html>
