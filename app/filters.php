<?php

/**
 * Theme filters.
 */

namespace App;

/**
 * Add a simple ellipsis to the excerpt.
 *
 * @return string
 */
add_filter('excerpt_more', function () {
    return ' &hellip;';
});
