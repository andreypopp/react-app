BIN = ./node_modules/.bin

example:
	./react-app serve --debug ./specs/fixtures/app.jsx

install link:
	@npm $@

test: test-middleware test-browser-headless

test-middleware:
	@$(BIN)/mocha -b -R spec ./specs/*.js

test-browser-headless:
	@$(MAKE) -C specs/browser/
	@$(BIN)/mocha-phantomjs ./specs/index.html

test-browser:
	@$(MAKE) -C specs/browser/
	@open ./specs/index.html

lint:
	@$(BIN)/jshint *.js

release-patch: test
	@$(call release,patch)

release-minor: test
	@$(call release,minor)

release-major: test
	@$(call release,major)

publish:
	git push --tags origin HEAD:master
	npm publish

%.js: %.coffee
	$(BIN)/coffee -bcp $< > $@

define release
	VERSION=`node -pe "require('./package.json').version"` && \
	NEXT_VERSION=`node -pe "require('semver').inc(\"$$VERSION\", '$(1)')"` && \
  node -e "\
  	var j = require('./package.json');\
  	j.version = \"$$NEXT_VERSION\";\
  	var s = JSON.stringify(j, null, 2);\
  	require('fs').writeFileSync('./package.json', s);" && \
  git commit -m "release $$NEXT_VERSION" -- package.json && \
  git tag "$$NEXT_VERSION" -m "release $$NEXT_VERSION"
endef
