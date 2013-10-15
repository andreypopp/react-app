---
title: Command line interface
---

Help is accessible via `react-app --help`:

    % react-app --help
    Usage:
      react-app serve [serve options] app
      react-app bundle [bundle options] app

    Common options:
      --help/-h           Show this message and exit
      --version/-v        Print ReactApp version and exit
      --quiet             Do not print information and warning messages
      --verbose           Print debug messages
      --no-color          Do not colour output

    Serve options:
      --port/-p PORT      Port to use (default: 3000)
      --host HOST         Host to use (default: localhost)
      --debug/-d          Should app be served in debug mode

    Bundle options:       options are the same as for dcompose bundler utility
      -o, --output OUT    Set output directory
      -w, --watch         Watch for changes and rebuild bundles
                          (-o/--output must be supplied)

      --debug/-d          Produce bundle with source maps
      --graph             Produce only dependency graph and pring it on stdout

      --transform/-t TR   Apply transform
      --extension EXT     File extensions to treat as modules (default: .js)

      --js                Produce bundle of JS dependency graph only
                          (this is the default behaviour)
      --css               Produce bundle of CSS dependency graph only
      --all               Produce bundle of both CSS and JS dependency graphs
