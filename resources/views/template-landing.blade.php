@extends('layouts.app')

@section('content')
  <main class="bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
    @php
      echo do_blocks(' 
        <!-- wp:twst/hero /-->
        <!-- wp:twst/about /-->
        <!-- wp:twst/services-grid /-->
        <!-- wp:twst/case-studies /-->
        <!-- wp:twst/blog-preview /-->
        <!-- wp:twst/contact /-->
        <!-- wp:twst/footer /-->
      ');
    @endphp
  </main>
@endsection
