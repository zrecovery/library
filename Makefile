.PHONY: test

clean:
	rm -rf tmp
	mkdir tmp
	rm ./bin/library

bin/library: build

build:
	go build -o bin/library cmd/library/*.go

run: build
	./bin/library

mock:
	rm -rf test/mocks

	sh ./scripts/mock.sh

test: mock
	go test ./pkg/...

cover: mock
	go test -coverprofile=cover.out -gcflags=-l ./pkg/... && go tool cover -html=cover.out && rm cover.out