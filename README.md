# react-app

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
(and the only) way is to use npm:

    % npm install react-app react-tools

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
    })

then you can serve your app using `react-app` command line utility:

    % react-app --debug ./ui.jsx

[React]: https://facebook.github.io/react
