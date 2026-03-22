<?php

/**
 * Theme setup.
 */

namespace App;

/**
 * Get Vite manifest as array.
 *
 * @return array<string, array<string, mixed>>
 */
function twst_get_manifest(): array
{
    static $manifest = null;

    if ($manifest !== null) {
        return $manifest;
    }

    $manifest_path = get_theme_file_path('public/build/manifest.json');
    if (! file_exists($manifest_path)) {
        $manifest = [];

        return $manifest;
    }

    $decoded = json_decode((string) file_get_contents($manifest_path), true);
    $manifest = is_array($decoded) ? $decoded : [];

    return $manifest;
}

/**
 * Resolve manifest file path for an entry.
 *
 * @param string $entry
 * @return string
 */
function twst_manifest_file(string $entry): string
{
    $manifest = twst_get_manifest();
    $file = $manifest[$entry]['file'] ?? '';

    return is_string($file) ? $file : '';
}

/**
 * Inject styles into the block editor.
 *
 * @return array
 */
add_filter('block_editor_settings_all', function ($settings) {
    $editor_css = twst_manifest_file('resources/css/editor.css');
    if ($editor_css === '') {
        return $settings;
    }

    $settings['styles'][] = [
        'css' => "@import url('".esc_url(get_theme_file_uri('public/build/'.$editor_css))."')",
    ];

    return $settings;
});

/**
 * Enqueue frontend assets from manifest.
 *
 * @return void
 */
add_action('wp_enqueue_scripts', function () {
    $app_css = twst_manifest_file('resources/css/app.css');
    if ($app_css !== '') {
        wp_enqueue_style(
            'test-theme-app',
            get_theme_file_uri('public/build/'.$app_css),
            [],
            null
        );
    }

    $app_js = twst_manifest_file('resources/js/app.js');
    if ($app_js !== '') {
        wp_enqueue_script(
            'test-theme-app',
            get_theme_file_uri('public/build/'.$app_js),
            [],
            null,
            true
        );

        wp_script_add_data('test-theme-app', 'type', 'module');
    }
});

/**
 * Enqueue block editor script.
 *
 * @return void
 */
add_action('enqueue_block_editor_assets', function () {
    $editor_file = twst_manifest_file('resources/js/editor.js');
    if ($editor_file === '') {
        return;
    }

    $dependencies = [];
    $manifest = twst_get_manifest();
    $deps_file = $manifest['editor.deps.json']['file'] ?? null;
    if (is_string($deps_file) && $deps_file !== '') {
        $deps_path = get_theme_file_path('public/build/'.$deps_file);
        if (file_exists($deps_path)) {
            $decoded_deps = json_decode((string) file_get_contents($deps_path), true);
            if (is_array($decoded_deps)) {
                $dependencies = $decoded_deps;
            }
        }
    }

    $dependencies = array_values(array_filter($dependencies, static fn ($dependency) => is_string($dependency) && wp_script_is($dependency, 'registered')));

    wp_enqueue_script(
        'test-theme-editor',
        get_theme_file_uri('public/build/'.$editor_file),
        $dependencies,
        null,
        true
    );

    wp_script_add_data('test-theme-editor', 'type', 'module');
});

/**
 * Force module type for editor bundle (some optimizers strip script data).
 *
 * @param string $tag
 * @param string $handle
 * @param string $src
 * @return string
 */
add_filter('script_loader_tag', function ($tag, $handle, $src) {
    $module_handles = ['test-theme-app', 'test-theme-editor'];

    if (! in_array($handle, $module_handles, true)) {
        return $tag;
    }

    return sprintf(
        '<script type="module" src="%s" id="%s-js"></script>',
        esc_url($src),
        esc_attr($handle)
    );
}, 10, 3);

/**
 * Use the generated theme.json file.
 *
 * @return string
 */
add_filter('theme_file_path', function ($path, $file) {
    return $file === 'theme.json'
        ? public_path('build/assets/theme.json')
        : $path;
}, 10, 2);

/**
 * Default strings managed by Polylang.
 *
 * @return array<string, string>
 */
function twst_polylang_strings(): array
{
    return [
        'footer_tagline' => 'Building the future of B2B technology',
        'footer_copyright_suffix' => 'All rights reserved.',
        'back_to_blog' => 'Back to blog',
        'min_read' => 'min read',
        'footer_quick_links' => 'Quick Links',
        'footer_connect' => 'Connect',
        'blog_archive_eyebrow' => 'Blog',
        'blog_archive_headline' => 'Latest Insights',
        'read_more' => 'Read more',
        '404_badge' => 'Error 404',
        '404_title' => 'This page took a wrong turn.',
        '404_description' => 'The link may be outdated, the page may have moved, or the URL may have a typo. Let’s get you back to something useful.',
        '404_back_home' => 'Back to homepage',
        '404_start_project' => 'Start a project',
        '404_portfolio' => 'Portfolio',
        '404_about' => 'About',
        '404_insights' => 'Insights',
        '404_panel_title' => 'Page not found',
        '404_panel_description' => 'Jump back to the homepage or use one of the quick links to continue browsing.',
        '404_quick_recovery' => 'Quick recovery',
        '404_tip_check_url' => 'Check the URL for typos',
        '404_tip_use_navigation' => 'Use the navigation to jump back into the site',
        '404_tip_contact' => 'Reach out if you expected something to be here',
    ];
}

/**
 * Get translated theme string with Polylang fallback.
 *
 * @param string $key
 * @return string
 */
function twst_get_translated_string(string $key): string
{
    $strings = twst_polylang_strings();
    $default = $strings[$key] ?? '';

    if ($default === '') {
        return '';
    }

    if (function_exists('pll__')) {
        return (string) pll__($default);
    }

    return $default;
}

add_action('init', function () {
    if (! function_exists('pll_register_string')) {
        return;
    }

    foreach (twst_polylang_strings() as $key => $value) {
        pll_register_string($key, $value, 'Theme');
    }
});

/**
 * Register the initial theme setup.
 *
 * @return void
 */
add_action('after_setup_theme', function () {
    /**
     * Disable full-site editing support.
     *
     * @link https://wptavern.com/gutenberg-10-5-embeds-pdfs-adds-verse-block-color-options-and-introduces-new-patterns
     */
    remove_theme_support('block-templates');

    /**
     * Register the navigation menus.
     *
     * @link https://developer.wordpress.org/reference/functions/register_nav_menus/
     */
    register_nav_menus([
        'primary_navigation' => __('Primary Navigation', 'sage'),
    ]);

    /**
     * Disable the default block patterns.
     *
     * @link https://developer.wordpress.org/block-editor/developers/themes/theme-support/#disabling-the-default-block-patterns
     */
    remove_theme_support('core-block-patterns');

    /**
     * Enable plugins to manage the document title.
     *
     * @link https://developer.wordpress.org/reference/functions/add_theme_support/#title-tag
     */
    add_theme_support('title-tag');

    /**
     * Enable post thumbnail support.
     *
     * @link https://developer.wordpress.org/themes/functionality/featured-images-post-thumbnails/
     */
    add_theme_support('post-thumbnails');

    /**
     * Enable responsive embed support.
     *
     * @link https://developer.wordpress.org/block-editor/how-to-guides/themes/theme-support/#responsive-embedded-content
     */
    add_theme_support('responsive-embeds');

    /**
     * Enable HTML5 markup support.
     *
     * @link https://developer.wordpress.org/reference/functions/add_theme_support/#html5
     */
    add_theme_support('html5', [
        'caption',
        'comment-form',
        'comment-list',
        'gallery',
        'search-form',
        'script',
        'style',
    ]);

    /**
     * Enable selective refresh for widgets in customizer.
     *
     * @link https://developer.wordpress.org/reference/functions/add_theme_support/#customize-selective-refresh-widgets
     */
    add_theme_support('customize-selective-refresh-widgets');
}, 20);

/**
 * Register the theme sidebars.
 *
 * @return void
 */
add_action('widgets_init', function () {
    $config = [
        'before_widget' => '<section class="widget %1$s %2$s">',
        'after_widget' => '</section>',
        'before_title' => '<h3>',
        'after_title' => '</h3>',
    ];

    register_sidebar([
        'name' => __('Primary', 'sage'),
        'id' => 'sidebar-primary',
    ] + $config);

    register_sidebar([
        'name' => __('Footer', 'sage'),
        'id' => 'sidebar-footer',
    ] + $config);
});

/**
 * Get global theme settings.
 */
function twst_get_theme_options(): array
{
    $defaults = [
        'navbar_logo_mode' => 'image',
        'navbar_logo_url' => '',
        'navbar_logo_text' => '',
        'navbar_logo_text_size' => 32,
        'footer_logo_mode' => 'image',
        'footer_logo_url' => '',
        'footer_logo_text' => '',
        'footer_logo_text_size' => 48,
        'hide_language_switcher' => 0,
        'hide_post_author' => 1,
    ];

    $options = get_option('twst_theme_settings', []);

    if (! is_array($options)) {
        $options = [];
    }

    return wp_parse_args($options, $defaults);
}

/**
 * Normalize logo mode setting.
 */
function twst_normalize_logo_mode($value): string
{
    $value = is_string($value) ? $value : '';

    return in_array($value, ['image', 'text', 'site_name'], true) ? $value : 'image';
}

/**
 * Sanitize plain logo text while preserving visible characters like < and >.
 */
function twst_sanitize_logo_text($value): string
{
    $value = is_scalar($value) ? (string) $value : '';
    $value = wp_unslash($value);
    $value = preg_replace('/[\x00-\x1F\x7F]/u', '', $value) ?? '';

    return trim(mb_substr($value, 0, 24));
}

/**
 * Get social settings.
 */
function twst_get_social_options(): array
{
    $defaults = [
        'socials' => [],
    ];

    $options = get_option('twst_social_settings', []);

    if (! is_array($options)) {
        $options = [];
    }

    if (empty($options['socials']) && array_intersect_key($options, array_flip([
        'github_label',
        'github_url',
        'linkedin_label',
        'linkedin_url',
        'x_label',
        'x_url',
        'email_label',
        'email_url',
    ]))) {
        $legacy_socials = [
            [
                'name' => sanitize_text_field($options['github_label'] ?? 'GitHub'),
                'icon_url' => '',
                'url' => sanitize_text_field($options['github_url'] ?? ''),
            ],
            [
                'name' => sanitize_text_field($options['linkedin_label'] ?? 'LinkedIn'),
                'icon_url' => '',
                'url' => sanitize_text_field($options['linkedin_url'] ?? ''),
            ],
            [
                'name' => sanitize_text_field($options['x_label'] ?? 'X'),
                'icon_url' => '',
                'url' => sanitize_text_field($options['x_url'] ?? ''),
            ],
            [
                'name' => sanitize_text_field($options['email_label'] ?? 'Email'),
                'icon_url' => '',
                'url' => sanitize_text_field($options['email_url'] ?? ''),
            ],
        ];

        $options['socials'] = array_values(array_filter($legacy_socials, fn ($item) => ! empty($item['url'])));
    }

    $options = wp_parse_args($options, $defaults);
    $options['socials'] = is_array($options['socials'] ?? null) ? array_values(array_filter(array_map(function ($item) {
        if (! is_array($item)) {
            return null;
        }

        $name = sanitize_text_field($item['name'] ?? '');
        $icon_url = esc_url_raw($item['icon_url'] ?? '');
        $url = sanitize_text_field($item['url'] ?? '');

        if ($url === '') {
            return null;
        }

        return [
            'name' => $name,
            'icon_url' => $icon_url,
            'url' => $url,
        ];
    }, $options['socials']))) : [];

    return $options;
}

/**
 * Sanitize global theme settings.
 */
function twst_sanitize_theme_settings($input): array
{
    $input = is_array($input) ? $input : [];

    return [
        'navbar_logo_mode' => twst_normalize_logo_mode($input['navbar_logo_mode'] ?? 'image'),
        'navbar_logo_url' => esc_url_raw($input['navbar_logo_url'] ?? ''),
        'navbar_logo_text' => twst_sanitize_logo_text($input['navbar_logo_text'] ?? ''),
        'navbar_logo_text_size' => max(16, min(96, (int) ($input['navbar_logo_text_size'] ?? 32))),
        'footer_logo_mode' => twst_normalize_logo_mode($input['footer_logo_mode'] ?? 'image'),
        'footer_logo_url' => esc_url_raw($input['footer_logo_url'] ?? ''),
        'footer_logo_text' => twst_sanitize_logo_text($input['footer_logo_text'] ?? ''),
        'footer_logo_text_size' => max(20, min(120, (int) ($input['footer_logo_text_size'] ?? 48))),
        'hide_language_switcher' => empty($input['hide_language_switcher']) ? 0 : 1,
        'hide_post_author' => empty($input['hide_post_author']) ? 0 : 1,
    ];
}

/**
 * Sanitize social settings.
 */
function twst_sanitize_social_settings($input): array
{
    $input = is_array($input) ? $input : [];
    $socials = is_array($input['socials'] ?? null) ? $input['socials'] : [];
    $sanitized_socials = [];

    foreach ($socials as $social) {
        if (! is_array($social)) {
            continue;
        }

        $name = sanitize_text_field($social['name'] ?? '');
        $icon_url = esc_url_raw($social['icon_url'] ?? '');
        $url = sanitize_text_field($social['url'] ?? '');

        if ($url === '') {
            continue;
        }

        $sanitized_socials[] = [
            'name' => $name,
            'icon_url' => $icon_url,
            'url' => $url,
        ];
    }

    return [
        'socials' => $sanitized_socials,
    ];
}

/**
 * Render text input field.
 */
function twst_render_text_field(array $args): void
{
    $option_name = $args['option_name'] ?? '';
    $field_key = $args['field_key'] ?? '';
    $label = $args['label'] ?? '';
    $type = $args['type'] ?? 'text';
    $placeholder = $args['placeholder'] ?? '';

    $values = get_option($option_name, []);
    $value = is_array($values) ? ($values[$field_key] ?? '') : '';
    ?>
    <input
      type="<?php echo esc_attr($type); ?>"
      id="<?php echo esc_attr($field_key); ?>"
      name="<?php echo esc_attr($option_name); ?>[<?php echo esc_attr($field_key); ?>]"
      value="<?php echo esc_attr((string) $value); ?>"
      class="regular-text"
      placeholder="<?php echo esc_attr($placeholder); ?>"
    />
    <?php if (! empty($label)) : ?>
      <p class="description"><?php echo esc_html($label); ?></p>
    <?php endif; ?>
    <?php
}

/**
 * Render checkbox field.
 */
function twst_render_checkbox_field(array $args): void
{
    $option_name = $args['option_name'] ?? '';
    $field_key = $args['field_key'] ?? '';
    $label = $args['label'] ?? '';

    $values = get_option($option_name, []);
    $value = is_array($values) ? (int) ($values[$field_key] ?? 0) : 0;
    ?>
    <label for="<?php echo esc_attr($field_key); ?>">
      <input
        type="checkbox"
        id="<?php echo esc_attr($field_key); ?>"
        name="<?php echo esc_attr($option_name); ?>[<?php echo esc_attr($field_key); ?>]"
        value="1"
        <?php checked($value, 1); ?>
      />
      <?php echo esc_html($label); ?>
    </label>
    <?php
}

/**
 * Render media field (image URL + media button).
 */
function twst_render_media_field(array $args): void
{
    $option_name = $args['option_name'] ?? '';
    $field_key = $args['field_key'] ?? '';
    $label = $args['label'] ?? '';

    $values = get_option($option_name, []);
    $value = is_array($values) ? ($values[$field_key] ?? '') : '';
    ?>
    <div class="twst-media-field">
      <input
        type="text"
        id="<?php echo esc_attr($field_key); ?>"
        name="<?php echo esc_attr($option_name); ?>[<?php echo esc_attr($field_key); ?>]"
        value="<?php echo esc_attr((string) $value); ?>"
        class="regular-text twst-media-url"
        placeholder="<?php esc_attr_e('Select image from Media Library', 'sage'); ?>"
      />
      <button
        type="button"
        class="button twst-media-select-button"
        data-target-id="<?php echo esc_attr($field_key); ?>"
      >
        <?php esc_html_e('Choose image', 'sage'); ?>
      </button>
    </div>
    <?php if (! empty($label)) : ?>
      <p class="description"><?php echo esc_html($label); ?></p>
    <?php endif; ?>
    <?php
}

/**
 * Render a combined logo settings field.
 */
function twst_render_logo_settings_field(array $args): void
{
    $option_name = $args['option_name'] ?? '';
    $location = $args['location'] ?? 'navbar';
    $label = $args['label'] ?? '';

    $values = get_option($option_name, []);
    $values = is_array($values) ? $values : [];

    $mode_key = "{$location}_logo_mode";
    $url_key = "{$location}_logo_url";
    $text_key = "{$location}_logo_text";
    $size_key = "{$location}_logo_text_size";

    $mode = twst_normalize_logo_mode($values[$mode_key] ?? 'image');
    $image_url = (string) ($values[$url_key] ?? '');
    $text = (string) ($values[$text_key] ?? '');
    $size = (int) ($values[$size_key] ?? ($location === 'footer' ? 48 : 32));
    ?>
    <div style="display:grid;gap:16px;max-width:880px;">
      <div style="display:grid;gap:8px;max-width:320px;">
        <label for="<?php echo esc_attr($mode_key); ?>" style="font-weight:600;">
          <?php esc_html_e('Logo type', 'sage'); ?>
        </label>
        <select
          id="<?php echo esc_attr($mode_key); ?>"
          name="<?php echo esc_attr($option_name); ?>[<?php echo esc_attr($mode_key); ?>]"
        >
          <option value="image" <?php selected($mode, 'image'); ?>>
            <?php esc_html_e('Image', 'sage'); ?>
          </option>
          <option value="text" <?php selected($mode, 'text'); ?>>
            <?php esc_html_e('Custom text', 'sage'); ?>
          </option>
          <option value="site_name" <?php selected($mode, 'site_name'); ?>>
            <?php esc_html_e('Site name fallback', 'sage'); ?>
          </option>
        </select>
      </div>

      <div style="display:grid;gap:8px;">
        <label for="<?php echo esc_attr($url_key); ?>" style="font-weight:600;">
          <?php esc_html_e('Image logo', 'sage'); ?>
        </label>
        <div class="twst-media-field">
          <input
            type="text"
            id="<?php echo esc_attr($url_key); ?>"
            name="<?php echo esc_attr($option_name); ?>[<?php echo esc_attr($url_key); ?>]"
            value="<?php echo esc_attr($image_url); ?>"
            class="regular-text twst-media-url"
            placeholder="<?php esc_attr_e('Select image from Media Library', 'sage'); ?>"
          />
          <button
            type="button"
            class="button twst-media-select-button"
            data-target-id="<?php echo esc_attr($url_key); ?>"
          >
            <?php esc_html_e('Choose image', 'sage'); ?>
          </button>
        </div>
      </div>

      <div style="display:grid;gap:8px;max-width:420px;">
        <label for="<?php echo esc_attr($text_key); ?>" style="font-weight:600;">
          <?php esc_html_e('Text logo', 'sage'); ?>
        </label>
        <input
          type="text"
          id="<?php echo esc_attr($text_key); ?>"
          name="<?php echo esc_attr($option_name); ?>[<?php echo esc_attr($text_key); ?>]"
          value="<?php echo esc_attr($text); ?>"
          class="regular-text"
          placeholder="&lt;TWST/&gt;"
        />
        <p class="description">
          <?php esc_html_e('You can use characters like < and > here. They will be displayed as plain text in the logo.', 'sage'); ?>
        </p>
      </div>

      <div style="display:grid;gap:8px;max-width:220px;">
        <label for="<?php echo esc_attr($size_key); ?>" style="font-weight:600;">
          <?php esc_html_e('Text size (px)', 'sage'); ?>
        </label>
        <input
          type="number"
          id="<?php echo esc_attr($size_key); ?>"
          name="<?php echo esc_attr($option_name); ?>[<?php echo esc_attr($size_key); ?>]"
          value="<?php echo esc_attr((string) $size); ?>"
          min="16"
          max="120"
          step="1"
          class="small-text"
        />
      </div>

      <?php if (! empty($label)) : ?>
        <p class="description"><?php echo esc_html($label); ?></p>
      <?php endif; ?>
    </div>
    <?php
}

/**
 * Build logo markup for header/footer.
 */
function twst_get_logo_markup(string $location, string $site_name, array $args = []): string
{
    $settings = twst_get_theme_options();
    $mode = twst_normalize_logo_mode($settings["{$location}_logo_mode"] ?? 'image');
    $logo_url = (string) ($settings["{$location}_logo_url"] ?? '');
    $text_logo = twst_sanitize_logo_text($settings["{$location}_logo_text"] ?? '');
    $text_size = (int) ($settings["{$location}_logo_text_size"] ?? ($location === 'footer' ? 48 : 32));
    $image_class = (string) ($args['image_class'] ?? 'h-10 w-auto object-contain');
    $text_class = (string) ($args['text_class'] ?? 'font-semibold tracking-tight text-zinc-900 dark:text-zinc-100');

    if ($mode === 'image' && $logo_url !== '') {
        return sprintf(
            '<img src="%s" alt="%s" class="%s" />',
            esc_url($logo_url),
            esc_attr($site_name),
            esc_attr($image_class)
        );
    }

    $text_value = $mode === 'text' && $text_logo !== '' ? $text_logo : $site_name;
    $characters = preg_split('//u', $text_value, -1, PREG_SPLIT_NO_EMPTY);

    if (! is_array($characters) || $characters === []) {
        $characters = [$site_name];
    }

    $character_markup = array_map(static function ($character) {
        $content = $character === ' ' ? '&nbsp;' : esc_html($character);

        return '<span>'.$content.'</span>';
    }, $characters);

    return sprintf(
        '<span class="%s" style="font-size:%dpx;line-height:1;display:inline-flex;align-items:center;flex-wrap:wrap;gap:0.02em;">%s</span>',
        esc_attr($text_class),
        $text_size,
        implode('', $character_markup)
    );
}

/**
 * Render repeater field for social links.
 */
function twst_render_social_repeater_field(array $args): void
{
    $option_name = $args['option_name'] ?? '';
    $field_key = $args['field_key'] ?? '';
    $label = $args['label'] ?? '';

    $values = get_option($option_name, []);
    $rows = is_array($values) && is_array($values[$field_key] ?? null) ? $values[$field_key] : [];

    if ($rows === []) {
        $rows = [
            [
                'name' => '',
                'icon_url' => '',
                'url' => '',
            ],
        ];
    }
    ?>
    <div
      class="twst-social-repeater"
      data-option-name="<?php echo esc_attr($option_name); ?>"
      data-field-key="<?php echo esc_attr($field_key); ?>"
    >
      <div class="twst-social-repeater-rows">
        <?php foreach ($rows as $index => $row) : ?>
          <?php $row = is_array($row) ? $row : []; ?>
          <div class="twst-social-repeater-row" data-index="<?php echo esc_attr((string) $index); ?>">
            <div style="display:grid;gap:12px;max-width:720px;padding:16px;border:1px solid #dcdcde;border-radius:8px;margin-bottom:12px;">
              <div>
                <label style="display:block;font-weight:600;margin-bottom:4px;">
                  <?php esc_html_e('Name', 'sage'); ?>
                </label>
                <input
                  type="text"
                  name="<?php echo esc_attr($option_name); ?>[<?php echo esc_attr($field_key); ?>][<?php echo esc_attr((string) $index); ?>][name]"
                  value="<?php echo esc_attr((string) ($row['name'] ?? '')); ?>"
                  class="regular-text"
                  placeholder="<?php esc_attr_e('YouTube', 'sage'); ?>"
                />
              </div>

              <div>
                <label style="display:block;font-weight:600;margin-bottom:4px;">
                  <?php esc_html_e('Icon', 'sage'); ?>
                </label>
                <div class="twst-media-field">
                  <input
                    type="text"
                    name="<?php echo esc_attr($option_name); ?>[<?php echo esc_attr($field_key); ?>][<?php echo esc_attr((string) $index); ?>][icon_url]"
                    value="<?php echo esc_attr((string) ($row['icon_url'] ?? '')); ?>"
                    class="regular-text twst-media-url"
                    placeholder="<?php esc_attr_e('Select image from Media Library', 'sage'); ?>"
                  />
                  <button type="button" class="button twst-media-select-button">
                    <?php esc_html_e('Choose image', 'sage'); ?>
                  </button>
                </div>
              </div>

              <div>
                <label style="display:block;font-weight:600;margin-bottom:4px;">
                  <?php esc_html_e('Link', 'sage'); ?>
                </label>
                <input
                  type="text"
                  name="<?php echo esc_attr($option_name); ?>[<?php echo esc_attr($field_key); ?>][<?php echo esc_attr((string) $index); ?>][url]"
                  value="<?php echo esc_attr((string) ($row['url'] ?? '')); ?>"
                  class="regular-text"
                  placeholder="https://youtube.com/@your-channel"
                />
              </div>

              <div>
                <button type="button" class="button-link-delete twst-social-remove-row">
                  <?php esc_html_e('Remove', 'sage'); ?>
                </button>
              </div>
            </div>
          </div>
        <?php endforeach; ?>
      </div>

      <p>
        <button type="button" class="button button-secondary twst-social-add-row">
          <?php esc_html_e('Add social media', 'sage'); ?>
        </button>
      </p>

      <template class="twst-social-row-template">
        <div class="twst-social-repeater-row" data-index="__INDEX__">
          <div style="display:grid;gap:12px;max-width:720px;padding:16px;border:1px solid #dcdcde;border-radius:8px;margin-bottom:12px;">
            <div>
              <label style="display:block;font-weight:600;margin-bottom:4px;">
                <?php esc_html_e('Name', 'sage'); ?>
              </label>
              <input
                type="text"
                name="<?php echo esc_attr($option_name); ?>[<?php echo esc_attr($field_key); ?>][__INDEX__][name]"
                value=""
                class="regular-text"
                placeholder="<?php esc_attr_e('YouTube', 'sage'); ?>"
              />
            </div>

            <div>
              <label style="display:block;font-weight:600;margin-bottom:4px;">
                <?php esc_html_e('Icon', 'sage'); ?>
              </label>
              <div class="twst-media-field">
                <input
                  type="text"
                  name="<?php echo esc_attr($option_name); ?>[<?php echo esc_attr($field_key); ?>][__INDEX__][icon_url]"
                  value=""
                  class="regular-text twst-media-url"
                  placeholder="<?php esc_attr_e('Select image from Media Library', 'sage'); ?>"
                />
                <button type="button" class="button twst-media-select-button">
                  <?php esc_html_e('Choose image', 'sage'); ?>
                </button>
              </div>
            </div>

            <div>
              <label style="display:block;font-weight:600;margin-bottom:4px;">
                <?php esc_html_e('Link', 'sage'); ?>
              </label>
              <input
                type="text"
                name="<?php echo esc_attr($option_name); ?>[<?php echo esc_attr($field_key); ?>][__INDEX__][url]"
                value=""
                class="regular-text"
                placeholder="https://youtube.com/@your-channel"
              />
            </div>

            <div>
              <button type="button" class="button-link-delete twst-social-remove-row">
                <?php esc_html_e('Remove', 'sage'); ?>
              </button>
            </div>
          </div>
        </div>
      </template>
    </div>
    <?php if (! empty($label)) : ?>
      <p class="description"><?php echo esc_html($label); ?></p>
    <?php endif; ?>
    <?php
}

/**
 * Render global settings page.
 */
function twst_render_general_settings_page(): void
{
    ?>
    <div class="wrap">
      <h1><?php esc_html_e('Global Settings', 'sage'); ?></h1>
      <form method="post" action="options.php">
        <?php
        settings_fields('twst_theme_settings_group');
        do_settings_sections('twst-theme-settings');
        submit_button();
        ?>
      </form>
    </div>
    <?php
}

/**
 * Render social settings page.
 */
function twst_render_social_settings_page(): void
{
    ?>
    <div class="wrap">
      <h1><?php esc_html_e('TWST Social Media Settings', 'sage'); ?></h1>
      <form method="post" action="options.php">
        <?php
        settings_fields('twst_social_settings_group');
        do_settings_sections('twst-social-settings');
        submit_button();
        ?>
      </form>
    </div>
    <?php
}

add_action('admin_menu', function () {
    add_menu_page(
        __('Global Settings', 'sage'),
        __('Global Settings', 'sage'),
        'manage_options',
        'twst-theme-settings',
        __NAMESPACE__.'\\twst_render_general_settings_page',
        'dashicons-admin-generic',
        61
    );

    add_submenu_page(
        'twst-theme-settings',
        __('Global Settings', 'sage'),
        __('Global Settings', 'sage'),
        'manage_options',
        'twst-theme-settings',
        __NAMESPACE__.'\\twst_render_general_settings_page'
    );

    add_submenu_page(
        'twst-theme-settings',
        __('Social Media', 'sage'),
        __('Social Media', 'sage'),
        'manage_options',
        'twst-social-settings',
        __NAMESPACE__.'\\twst_render_social_settings_page'
    );
});

add_action('admin_init', function () {
    register_setting(
        'twst_theme_settings_group',
        'twst_theme_settings',
        [
            'type' => 'array',
            'sanitize_callback' => __NAMESPACE__.'\\twst_sanitize_theme_settings',
            'default' => [],
        ]
    );

    add_settings_section(
        'twst_theme_main_section',
        __('Global', 'sage'),
        '__return_null',
        'twst-theme-settings'
    );

    add_settings_field(
        'navbar_logo_settings',
        __('Navbar logo', 'sage'),
        __NAMESPACE__.'\\twst_render_logo_settings_field',
        'twst-theme-settings',
        'twst_theme_main_section',
        [
            'option_name' => 'twst_theme_settings',
            'location' => 'navbar',
            'label' => __('Choose image or custom text for the header logo.', 'sage'),
        ]
    );

    add_settings_field(
        'footer_logo_settings',
        __('Footer logo', 'sage'),
        __NAMESPACE__.'\\twst_render_logo_settings_field',
        'twst-theme-settings',
        'twst_theme_main_section',
        [
            'option_name' => 'twst_theme_settings',
            'location' => 'footer',
            'label' => __('Choose image or custom text for the footer logo.', 'sage'),
        ]
    );

    add_settings_field(
        'hide_language_switcher',
        __('Language switcher', 'sage'),
        __NAMESPACE__.'\\twst_render_checkbox_field',
        'twst-theme-settings',
        'twst_theme_main_section',
        [
            'option_name' => 'twst_theme_settings',
            'field_key' => 'hide_language_switcher',
            'label' => __('Hide language switcher in the header.', 'sage'),
        ]
    );

    add_settings_field(
        'hide_post_author',
        __('Post author', 'sage'),
        __NAMESPACE__.'\\twst_render_checkbox_field',
        'twst-theme-settings',
        'twst_theme_main_section',
        [
            'option_name' => 'twst_theme_settings',
            'field_key' => 'hide_post_author',
            'label' => __('Hide author name in post meta and single post view.', 'sage'),
        ]
    );

    register_setting(
        'twst_social_settings_group',
        'twst_social_settings',
        [
            'type' => 'array',
            'sanitize_callback' => __NAMESPACE__.'\\twst_sanitize_social_settings',
            'default' => [],
        ]
    );

    add_settings_section(
        'twst_social_main_section',
        __('Social Profiles', 'sage'),
        '__return_null',
        'twst-social-settings'
    );

    add_settings_field(
        'socials',
        __('Social media items', 'sage'),
        __NAMESPACE__.'\\twst_render_social_repeater_field',
        'twst-social-settings',
        'twst_social_main_section',
        [
            'option_name' => 'twst_social_settings',
            'field_key' => 'socials',
            'label' => __('Add any number of social profiles. Each row contains name, icon and link.', 'sage'),
        ]
    );
}, 20);

add_action('admin_enqueue_scripts', function ($hook) {
    if (! str_contains((string) $hook, 'twst-theme-settings') && ! str_contains((string) $hook, 'twst-social-settings')) {
        return;
    }

    wp_enqueue_media();
    wp_add_inline_script('media-editor', "
      (function() {
        if (typeof wp === 'undefined' || !wp.media) {
          return;
        }

        function openMediaFrame(targetInput) {
          if (!targetInput) {
            return;
          }

          var frame = wp.media({
            title: 'Select image',
            button: { text: 'Use this image' },
            multiple: false,
            library: { type: 'image' }
          });

          frame.on('select', function() {
            var attachment = frame.state().get('selection').first().toJSON();
            targetInput.value = attachment.url || '';
            targetInput.dispatchEvent(new Event('change', { bubbles: true }));
          });

          frame.open();
        }

        document.addEventListener('click', function(event) {
          var mediaButton = event.target.closest('.twst-media-select-button');
          if (mediaButton) {
            var targetId = mediaButton.getAttribute('data-target-id');
            var targetInput = targetId ? document.getElementById(targetId) : mediaButton.parentElement.querySelector('.twst-media-url');
            openMediaFrame(targetInput);
            return;
          }

          var addButton = event.target.closest('.twst-social-add-row');
          if (addButton) {
            var repeater = addButton.closest('.twst-social-repeater');
            var rowsContainer = repeater.querySelector('.twst-social-repeater-rows');
            var template = repeater.querySelector('.twst-social-row-template');
            var nextIndex = rowsContainer.querySelectorAll('.twst-social-repeater-row').length;
            var markup = template.innerHTML.replace(/__INDEX__/g, String(nextIndex));
            rowsContainer.insertAdjacentHTML('beforeend', markup);
            return;
          }

          var removeButton = event.target.closest('.twst-social-remove-row');
          if (removeButton) {
            var row = removeButton.closest('.twst-social-repeater-row');
            var repeater = removeButton.closest('.twst-social-repeater');
            var rowsContainer = repeater.querySelector('.twst-social-repeater-rows');
            if (rowsContainer.querySelectorAll('.twst-social-repeater-row').length <= 1) {
              row.querySelectorAll('input').forEach(function(input) {
                input.value = '';
              });
              return;
            }
            row.remove();
          }
        });
      })();
    ");
});
