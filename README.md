# ReactApp

Convenience for [React][1] to develop applications which

  * use HTML5 History API to navigate between pages
  * can pre-render UI on a server to reduce "time to first tweet"
  * use CommonJS to manage code (js/coffee/...) and stylesheet
    (css/stylus/less/sass/...) dependencies in the browser

[1]: https://facebook.github.io/react

## Installation

You need both `react-app` and `react-tools` packages to be installed, the best
way is to use npm:

    % npm install react-app react-tools

## Usage

ReactApp is designed to be scalable from basic applications needs to large-scale
application development where you need high degree of freedom and want to make
your own choices. ReactApp is neither a framework nor a library, it's is just a
set of conveniences which you can accepts, reject or even replace by your
following your decisions.

### Basic usage

The next option is to bootstrap your application with your own code:

    var ReactApp = require('react-app'),
        React = require('react-core');

    var Page = React.createClass({
      render: function() {
        return (
          <html>
            <head>
              <title>{this.props.title}</title>
            </head>
            <body>
              {this.props.children}
            </body>
          </html>
        );
      }
    });

    module.exports = ReactApp.createApp({
      routes: {
        '/': ReactApp.createPage({
          render: function() {
            return (
              <Page title={this.props.options.appName}>
                <h1>Main Page</h1>
              </Page>
            );
          }
        }),

        '/about': './pages/about.jsx',

        '/users/:username': ReactApp.createPage({
          render: function() {
            return (
              <Page title={this.props.request.params.username}>
                <h1>@{this.props.request.params.username</h1>
              </Page>
            );
          }
        })
      },

      start: function() {
        this.setOptions({
          appName: 'My App'
        });
      }
    });

Now you can produce code for your application with the following command:

    % react-app bundle ./index.jsx

And create a host page:

    <!doctype html>
    <link rel="stylesheet" href="index.bundle.css" />
    <script src="index.bundle.js"></script>
    <script>
      app = require('./index');
      app.start();
    </script>

Or serve your app directly:

    % react-app serve ./index.jsx

### Node.js middleware

ReactApp provides with a Node.js middleware which helps you serving your app to
a browser with pre-rendered UI and bundled assets:

    var serveApp = require('react-app/middleware');
    var app = serveApp(
      './index.jsx', {
        options: {
          appName: 'My App',
          debug: true
        }
      });
    app.listen(3000);

Alternatively you can use separate middleware for assets and UI pre-rendering.

    var serveAssets = require('react-app/middleware/assets'),
        serveUI = require('react-app/middleware/ui'),
        createBundler = require('react-app/bundler'),
        express = require('express');

    var bundler = createBundler('./index.jsx', {debug: true}),
        app = express();

    app.use(serveAssets(bundler));
    app.use(serveUI(bundler));
    app.listen(3000);

### Advanced asset management

### Command line interface reference

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
