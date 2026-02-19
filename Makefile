.PHONY: install build prod dev lint test clean

RELEASE := release

install:
	bun install

build:
	cd apps/web-client && bunx vite build
	rm -rf $(RELEASE)
	mkdir -p $(RELEASE)/data $(RELEASE)/public
	cp -r apps/web-client/dist/* $(RELEASE)/
	bun build apps/web-api/index.ts --outfile $(RELEASE)/library --target bun --compile
	cp .env.sqlite $(RELEASE)/.env

dev:
	bun run apps/web-api/index.ts

prod:
	cd $(RELEASE) && ./library

lint:
	bun run lint

test:
	bun test

clean:
	rm -rf $(RELEASE)
