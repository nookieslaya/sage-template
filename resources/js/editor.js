import domReady from '@wordpress/dom-ready';
import '../blocks/hero/index.jsx';
import '../blocks/hero-showcase/index.jsx';
import '../blocks/about/index.jsx';
import '../blocks/services-grid/index.jsx';
import '../blocks/case-studies/index.jsx';
import '../blocks/blog-preview/index.jsx';
import '../blocks/contact/index.jsx';
import '../blocks/footer/index.jsx';

domReady(() => {
  document.body.classList.add('twst-block-editor');
});
