.PHONY: default
default: help

.PHONY: help
help:
	@echo Usage: make <target...>

.PHONY: test
test:
	deno test

.PHONY: test/coverage
test/coverage:
	deno test --coverage=coverage

.PHONY: coverage/lcov
coverage/lcov: test/coverage
	deno coverage coverage --lcov > coverage/coverage.lcov

.PHONY: coverage/html
coverage/html: test/coverage coverage/lcov
	genhtml -o coverage/html coverage/coverage.lcov
	@echo "open coverage/html/index.html"
