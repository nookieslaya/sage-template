@extends('layouts.app')

@section('content')
  <section class="twst-blog-single">
    <div class="twst-blog-single__inner">
      @while(have_posts()) @php(the_post())
        @includeFirst(['partials.content-single-' . get_post_type(), 'partials.content-single'])
      @endwhile
    </div>
  </section>
@endsection
