<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1">
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx'])
        @inertiaHead
        <link rel="icon" type="image/svg+xml" href="{{ asset('/images/logo.svg') }}" />

    </head>
    <body>
        @inertia
    </body>
</html>