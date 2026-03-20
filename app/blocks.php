<?php

/**
 * Register Gutenberg custom blocks.
 */

namespace App;

add_action('init', function () {
    $blocks = [
        'hero',
        'hero-showcase',
        'about',
        'services-grid',
        'case-studies',
        'blog-preview',
        'contact',
        'footer',
    ];

    foreach ($blocks as $block) {
        register_block_type_from_metadata(get_theme_file_path("resources/blocks/{$block}"));
    }
});
