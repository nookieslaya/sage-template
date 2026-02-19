@extends('layouts.app')

@section('content')
  <section class="mx-auto max-w-5xl px-6 py-16 md:py-20">
    @while(have_posts()) @php(the_post())
      @includeFirst(['partials.content-single-' . get_post_type(), 'partials.content-single'])
    @endwhile
  </section>
@endsection
