# react-app

See [react-app-demo][] for an example of a minimal setup to start working with
`react-app` right away.

A set of conveniences for [React][] to develop applications which

  * use HTML5 History API to navigate between pages
  * can pre-render UI on a server to reduce "time to first tweet"
  * use CommonJS to manage code (js/coffee/...) and stylesheet
    (css/stylus/less/sass/...) dependencies in the browser

`react-app` is designed to be scalable from basic applications needs to
large-scale application development where you need high degree of freedom and
want to make your own choices. ReactApp is neither a framework nor a library,
it's is just a set of conveniences which you can accepts, reject or even replace
by your following your decisions.

## Installation

You need both `react-app` and `react-tools` packages to be installed, the best
(and the only) way is to use npm.

The latest version of `react-app` is unreleased yet, you should do

    % npm install andreypopp/react-app react-tools

If you want to experiment with it.

## Basic usage

Define your application in `ui.jsx`:

    var React = require('react-tools/build/modules/React');
    var ReactApp = require('react-app');

    var Main = React.createClass({
      render: function() {
        return (
          <div className="Main">
            Hello!
            <a href="/about">About</a>
          </div>
        )
      }
    });

    var About = React.createClass({
      render: function() {
        return (
          <div className="About">
            About
            <a href="/">index</a>
          </div>
        )
      }
    });

    module.exports = ReactApp({
      '/': Main,
      '/about': About
    }, {
      started: function() {
        window.addEventListener('click', function(e) {
          if (e.target.tagName === 'A' && e.target.attributes.href) {
            e.preventDefault();
            app.navigate(e.target.attributes.href.value);
          }
        });
      }
    });

then you can serve your app using `react-app` command line utility:

    % ./node_modules/.bin/react-app --render --debug ./ui.jsx

Note the `--debug` flag which will result in watching your code for changes and
generating source maps for a bundle. The `--render` flag instructs `react-app`
to pre-render UI on server.

For other options see `react-app --help`:

    react-app [options] <module id>

    Options:
      -h, --help       Show this message and exit
      -v, --version    Show version
      -q, --quiet      Operate in quiet mode          [default: false]
      --colors         Color logging output           [default: true]
      -d, --debug      Run in debug mode              [default: false]
      -p, --port       Port to use                    [default: 3000]
      --host           Host to use                    [default: "localhost"]
      -a, --assets     Serve assets from a directory
      -s, --styles     Serve styles
      --render         Render UI on server            [default: false]
      -t, --transform  Apply source transform
      --css-transform  Apply CSS source transform

[React]: https://facebook.github.io/react
[react-app-demo]: https://github.com/andreypopp/react-app-demo
