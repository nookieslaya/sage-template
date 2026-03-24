<?php

/**
 * Theme filters.
 */

namespace App;

/**
 * Strip leaked empty admin edit links from rendered HTML.
 *
 * @param string $html
 * @return string
 */
function twst_strip_leaked_admin_links(string $html): string
{
    if ($html === '') {
        return $html;
    }

    $patterns = [
        // <p><a href=".../edit.php?post_type=page"></a></p>
        '#<p(?:\s+[^>]*)?>\s*<a[^>]*href=["\'][^"\']*/(?:panel-logowania/)?edit\.php\?post_type=page(?:[^"\']*)["\'][^>]*>\s*(?:&nbsp;|\x{00A0}|\s)*</a>\s*</p>#iu',
        // Any empty anchor that points to edit.php?post_type=page
        '#<a[^>]*href=["\'][^"\']*/(?:panel-logowania/)?edit\.php\?post_type=page(?:[^"\']*)["\'][^>]*>\s*(?:&nbsp;|\x{00A0}|\s)*</a>#iu',
    ];

    return (string) preg_replace($patterns, '', $html);
}

/**
 * Add a simple ellipsis to the excerpt.
 *
 * @return string
 */
add_filter('excerpt_more', function () {
    return ' &hellip;';
});

/**
 * Remove leaked empty admin links from post content.
 *
 * Sometimes Gutenberg can persist an empty paragraph with an admin edit URL.
 * This strips only that specific artifact and leaves normal links untouched.
 *
 * @param string $content
 * @return string
 */
add_filter('the_content', function ($content) {
    if (! is_string($content) || $content === '') {
        return $content;
    }

    return twst_strip_leaked_admin_links($content);
}, 20);

/**
 * Also sanitize rendered blocks, which covers cases where content is
 * assembled through block rendering pipeline on production.
 *
 * @param string $block_content
 * @return string
 */
add_filter('render_block', function ($block_content) {
    if (! is_string($block_content) || $block_content === '') {
        return $block_content;
    }

    return twst_strip_leaked_admin_links($block_content);
}, 20);
