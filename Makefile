.DEFAULT_GOAL := push-gh-pages

push-gh-pages:
	git subtree push --prefix public origin gh-pages
