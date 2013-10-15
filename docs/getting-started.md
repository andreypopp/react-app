---
title: Getting Started
---
You need both `react-app` and `react-tools` packages to be installed, the best
way is to use npm:

    % npm install react-app react-tools

The minimal application would look like this, `index.jsx`:

    var ReactApp = require('react-app'),
        React = require('react-core');

    module.exports = ReactApp.createApp({
      routes: {
        '/': ReactApp.createPage(function() {
          return (
            <html>
              <head>
                <title>Main Page</title>
              </head>
              <body>
                <h1>Hello, world!</h1>
              </body>
            </html>
          );
        }),
      }
    });

To produce runnable bundle with source code and stylesheets you can run

    % react-app bundle ./index.jsx

which will create `bundle.js` and `bundle.css` in the directory.

And create a boot page:

    <!doctype html>
    <link rel="stylesheet" href="bundle.css" />
    <script src="bundle.js"></script>
    <script>
      app = require('./index');
      app.start();
    </script>

## Pages

ReactApp pages specify how to render a React component which occupies the whole HTML
document.

You can create a page with `ReactApp.createPage()` function which accepts a
specification of a page. The minimal page definition would look like this

    var Page = ReactApp.createPage({
      render: function() {
        return <html><body>Hello, world</body></html>;
      }
    });

There's a useful shortcut in case of a page specification consisting of a single
`render()` method &mdash; you can pass this method directly to a
`ReactApp.createPage()` function

    var Page = ReactApp.createPage(function(props) {
      return <html><body>Hello, world</body></html>;
    });
