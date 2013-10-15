---
title: ReactApp
---

ReactApp is a set of conveniences for developing single page applications (SPA)
with [React][1] library. It features:

  * a thin API on top of React to manage UI components which occupy the whole
    page (rendered directly into `<html>` element)
  * client side routing mechanism which uses HTML5 History API
  * bundler for client side code and static assets based on CommonJS (and a
    corresponding server middleware)
  * server middleware for pre-rendering application UI on a server
  * command line utility which bootstrap development process

ReactApp is designed to be scalable from basic applications needs to large-scale
application development where you need high degree of freedom and want to make
your own choices regarding application architecture and what components you are
going to use.

ReactApp is neither a framework nor a library, it's is just a set of
conveniences which you can accept, reject or even replace following your own
decisions.

[1]: https://facebook.github.io/react
