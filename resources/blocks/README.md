# Custom Gutenberg Blocks (Sage 10 + Tailwind)

## Included blocks

- `twst/hero`
- `twst/hero-showcase`
- `twst/about`
- `twst/services-grid`
- `twst/case-studies`
- `twst/blog-preview`
- `twst/contact`
- `twst/footer`

## File structure

- `resources/blocks/<block-name>/block.json`
- `resources/blocks/<block-name>/index.js`
- `app/blocks.php` (server registration with `register_block_type_from_metadata`)
- `resources/js/editor.js` (imports and executes block `registerBlockType`)

## Enqueue/build flow in this theme

1. Block metadata is registered in PHP on `init`:
   - `app/blocks.php`
2. Block editor bundle is enqueued through existing Sage setup:
   - `app/setup.php` (`resources/js/editor.js`)
3. Build assets with Vite:

```bash
cd wordpress/wp-content/themes/test-theme
npm run build
```

4. During development:

```bash
cd wordpress/wp-content/themes/test-theme
npm run dev
```

## Multilingual placeholders (PL/EN)

Each block includes:

- `language`: default output language (`en` / `pl`)
- paired attributes like `headlineEn` and `headlinePl`

For list blocks (`services-grid`, `case-studies`, `blog-preview`, `footer`) arrays are editable as JSON in block inspector.
