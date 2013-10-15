require('./styles.styl');

var SiteGen = require('sitegen'),
    React   = require('react-tools/build/modules/React');

var Content = React.createClass({
  render: function() {
    return <article
      className="Content"
      dangerouslySetInnerHTML={{__html: this.props.content}} />
  }
});

var Boilerplate = React.createClass({
  siteName: 'ReactApp',

  heading: function() {
    return this.props.title
      ? <h1>{this.props.title}<a href="/" className="subtitle">{'/' + this.siteName}</a></h1>
      : <h1>{this.siteName}</h1>;
  },

  title: function() {
    var text = this.props.title ? this.siteName + ': ' + this.props.title : this.siteName;
    return <title>{text}</title>;
  },

  render: function() {
    return (
      <html>
        <head>
          <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
          {this.title()}
        </head>
        <body>
          <header className="Header">{this.heading()}</header>
          {this.props.children}
        </body>
      </html>
    );
  }
});

var MainPage = SiteGen.createPage({
  pageOrder: [
    '/getting-started',
    '/node-js-middleware',
    '/asset-management',
    '/cli'
  ],
  pageList: function() {
    var pages = new Array(this.pageOrder.length);
    this.props.data.pages.forEach(function(page) {
      var idx = this.pageOrder.indexOf(page.id);
      if (idx === -1) return;
      pages[idx] = <li><a href={page.id + '.html'}>{page.metadata.title}</a></li>;
    }.bind(this));
    return <ul className="PageList">{pages}</ul>;
  },
  render: function() {
    return (
      <Boilerplate>
        <Content content={this.props.data.content} />
        {this.pageList()}
      </Boilerplate>
    );
  }
})

var Page = SiteGen.createPage({
  render: function() {
    return (
      <Boilerplate title={this.props.data.metadata.title}>
        <Content content={this.props.data.content} />
      </Boilerplate>
    );
  }
})

module.exports = SiteGen.createSite({
  routes: {
    '/': MainPage,
    '*/': Page,
    '*.html': Page
  }
});
