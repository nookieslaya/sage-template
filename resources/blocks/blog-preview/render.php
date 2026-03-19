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

$eyebrow = $localized('eyebrow', 'BLOG');
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
<section id="blog" class="mx-auto max-w-7xl scroll-mt-32 px-6 py-20 md:py-24">
  <header class="text-center">
    <p class="text-sm font-semibold uppercase tracking-[0.24em] text-zinc-500 dark:text-zinc-400"><?php echo esc_html($eyebrow); ?></p>
    <h2 class="mt-4 text-balance text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100 md:text-6xl"><?php echo esc_html($headline); ?></h2>
  </header>

  <?php if ($query->have_posts()) : ?>
    <div class="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <?php while ($query->have_posts()) : $query->the_post(); ?>
        <?php
          $word_count = str_word_count(wp_strip_all_tags((string) get_the_content()));
          $minutes = max(1, (int) ceil($word_count / 180));
          $read_time = $language === 'pl'
            ? sprintf('%d min czytania', $minutes)
            : sprintf('%d min read', $minutes);
        ?>
        <article <?php post_class('twst-elevated-card overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900'); ?>>
          <a href="<?php the_permalink(); ?>" class="block">
            <?php if (has_post_thumbnail()) : ?>
              <?php the_post_thumbnail('large', ['class' => 'h-64 w-full object-cover']); ?>
            <?php else : ?>
              <div class="flex h-64 items-center justify-center bg-zinc-200 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400"><?php esc_html_e('Post image', 'sage'); ?></div>
            <?php endif; ?>
          </a>

          <div class="p-8">
            <p class="text-lg text-zinc-500 dark:text-zinc-400"><?php echo esc_html(get_the_date()); ?> · <?php echo esc_html($read_time); ?></p>
            <h3 class="mt-4 text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              <a href="<?php the_permalink(); ?>" class="twst-link-accent no-underline transition"><?php the_title(); ?></a>
            </h3>
            <p class="mt-4 text-xl leading-relaxed text-zinc-500 dark:text-zinc-400"><?php echo esc_html(get_the_excerpt()); ?></p>
            <a class="twst-link-accent mt-6 inline-flex items-center text-lg font-semibold no-underline" href="<?php the_permalink(); ?>"><?php echo esc_html($post_link_label); ?></a>
          </div>
        </article>
      <?php endwhile; ?>
    </div>

    <div class="mt-10 text-center">
      <a href="<?php echo esc_url($blog_url); ?>" class="twst-btn-accent"><?php echo esc_html($view_more_label); ?></a>
    </div>
  <?php else : ?>
    <p class="mt-10 text-center text-zinc-500 dark:text-zinc-400"><?php esc_html_e('No posts found yet.', 'sage'); ?></p>
  <?php endif; ?>
</section>
<?php wp_reset_postdata(); ?>
