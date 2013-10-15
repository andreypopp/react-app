---
title: Node.js middleware
---

ReactApp provides a set of Node.js Connect/Express middlewares which helps you
serve your app to a browser with pre-rendered UI and bundled assets:

    var ReactApp = require('react-app');

    ReactApp('./index.jsx', {debug: true}).listen(3000);

This effectively creates an Express applcation so you can mount it along with
other Express routes in your app.

It setups the following routes:

    GET /assets/bundle.js
    GET /assets/bundle.css
    GET /assets/*
    GET /*

The first two `/assets/bundle.js` and `/assets/bundle.css` serves bundles with
browser code and stylesheets.

The `/assets/*` just serves static resources found in a `assets` directory which
is resolved relative to application entry point.

The last one wildcard route `/*` delegates to browser code to render a view
matched a current request and returns renderd HTML to a browser. It is also
injects code which starts application in a browser so you don't have to do that.

## Pre-rendering UI

    var serveUI = require('react-app/middleware/ui');

## Serving assets

    var serveAssets = require('react-app/middleware/assets');
