<?php
/**
 * Dynamic render callback for blog preview block.
 *
 * @var array $attributes
 */

$language = function_exists('pll_current_language')
    ? pll_current_language('slug')
    : (str_starts_with(get_locale(), 'pl') ? 'pl' : 'en');
$language = $language === 'pl' ? 'pl' : 'en';

$localized = static function (string $singleKey, string $fallback = '') use ($attributes, $language): string {
    if (! empty($attributes[$singleKey])) {
        return (string) $attributes[$singleKey];
    }

    $legacy_pl = $attributes["{$singleKey}Pl"] ?? '';
    $legacy_en = $attributes["{$singleKey}En"] ?? '';

    if ($language === 'pl') {
        return (string) ($legacy_pl ?: $legacy_en ?: $fallback);
    }

    return (string) ($legacy_en ?: $legacy_pl ?: $fallback);
};

$headline = $localized('headline', 'Latest Insights');
$post_link_label = $localized('postLinkLabel', 'Read more');
$view_more_label = $localized('viewMoreLabel', 'View more');

$posts_page_id = (int) get_option('page_for_posts');
$blog_url = $posts_page_id ? get_permalink($posts_page_id) : get_post_type_archive_link('post');
if (! $blog_url) {
    $blog_url = home_url('/blog/');
}

$query = new WP_Query([
    'post_type' => 'post',
    'post_status' => 'publish',
    'posts_per_page' => 3,
    'ignore_sticky_posts' => true,
]);
?>
<section id="blog" class="twst-blog-preview" data-reveal-root>
  <div class="twst-blog-preview__inner">
    <header class="twst-blog-preview__header twst-reveal-up" data-reveal-item data-reveal-delay="0">
      <?php if ($headline !== '') : ?>
        <h2 class="twst-blog-preview__headline twst-showcase-headline" data-showcase-headline-trigger="inview">
          <span class="twst-showcase-headline__base" data-showcase-headline-base><?php echo esc_html($headline); ?></span>
          <span class="twst-showcase-headline__masks" data-showcase-headline-masks aria-hidden="true"></span>
        </h2>
      <?php endif; ?>
    </header>

    <?php if ($query->have_posts()) : ?>
      <div class="twst-blog-preview__grid">
      <?php $card_index = 0; ?>
      <?php while ($query->have_posts()) : $query->the_post(); ?>
        <?php
          $word_count = str_word_count(wp_strip_all_tags((string) get_the_content()));
          $minutes = max(1, (int) ceil($word_count / 180));
          $read_time = $language === 'pl'
            ? sprintf('%d min czytania', $minutes)
            : sprintf('%d min read', $minutes);
          $delay = 90 + ($card_index * 80);
        ?>
        <article <?php post_class('twst-blog-preview__card twst-reveal-up'); ?> data-reveal-item data-reveal-delay="<?php echo esc_attr((string) $delay); ?>">
          <a href="<?php the_permalink(); ?>" class="twst-blog-preview__image-link">
            <?php if (has_post_thumbnail()) : ?>
              <?php the_post_thumbnail('large', ['class' => 'twst-blog-preview__image']); ?>
            <?php else : ?>
              <div class="twst-blog-preview__image twst-blog-preview__image--placeholder"><?php esc_html_e('Post image', 'sage'); ?></div>
            <?php endif; ?>
          </a>

          <div class="twst-blog-preview__body">
            <p class="twst-blog-preview__meta"><?php echo esc_html(get_the_date()); ?> · <?php echo esc_html($read_time); ?></p>
            <h3 class="twst-blog-preview__title">
              <span class="twst-blog-preview__title-wrap">
                <a href="<?php the_permalink(); ?>" class="twst-blog-preview__title-link"><?php the_title(); ?></a>
              </span>
            </h3>
            <p class="twst-blog-preview__excerpt"><?php echo esc_html(get_the_excerpt()); ?></p>
            <a class="twst-showcase-cta-secondary twst-blog-preview__read" href="<?php the_permalink(); ?>">
              <?php echo esc_html($post_link_label); ?>
            </a>
          </div>
        </article>
        <?php $card_index++; ?>
      <?php endwhile; ?>
      </div>

      <?php if ($view_more_label !== '') : ?>
        <div class="twst-blog-preview__cta twst-reveal-up" data-reveal-item data-reveal-delay="340">
          <a href="<?php echo esc_url($blog_url); ?>" class="twst-showcase-cta-primary twst-blog-preview__cta-btn"><?php echo esc_html($view_more_label); ?></a>
        </div>
      <?php endif; ?>
    <?php else : ?>
      <p class="twst-blog-preview__empty"><?php esc_html_e('No posts found yet.', 'sage'); ?></p>
    <?php endif; ?>
  </div>
</section>
<?php wp_reset_postdata(); ?>
